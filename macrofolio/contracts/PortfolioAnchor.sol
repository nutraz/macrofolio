// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title PortfolioAnchor
 * @notice Smart contract for anchoring portfolio actions to blockchain (Polygon Amoy / Base Sepolia)
 * @dev This contract stores hash proofs of portfolio actions - it does NOT hold funds
 * 
 * =============================================================================
 * ⚠️  v1 anchor schema – DO NOT BREAK
 * 
 * This contract defines the canonical event signature for all portfolio anchors.
 * Changing event parameters will break historical proof verification.
 * 
 * Event Signature: PortfolioAnchored(address,ActionType,bytes32,uint256,uint8)
 * =============================================================================
 */

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/// @notice Action types for portfolio operations
enum ActionType { ADD_ASSET, UPDATE_PORTFOLIO, DELETE_ASSET, REBALANCE }

/// @notice Anchor metadata structure for historical queries
struct AnchorMetadata {
    ActionType actionType;
    bytes32 dataHash;
    uint256 timestamp;
    uint8 schemaVersion;
}

/// @notice Anchor info returned by paginated queries
struct AnchorInfo {
    bytes32 dataHash;
    ActionType actionType;
    uint256 timestamp;
    uint8 schemaVersion;
}

contract PortfolioAnchor is ReentrancyGuard {
    using ECDSA for bytes32;

    // ============ RATE LIMITING CONSTANTS ============
    uint256 private constant RATE_LIMIT_WINDOW = 1 hours;
    uint256 private constant MAX_ANCHORS_PER_WINDOW = 10;
    uint256 private constant MIN_ANCHOR_DELAY = 1 minutes;
    uint8 private constant CURRENT_SCHEMA_VERSION = 1;

    // ============ EIP-712 DOMAIN SEPARATOR ============
    bytes32 private constant DOMAIN_SEPARATOR = keccak256(
        abi.encode(
            keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"),
            keccak256("PortfolioAnchor"),
            keccak256("1"),
            block.chainid,
            address(this)
        )
    );

    bytes32 private constant ANCHOR_TYPEHASH = keccak256(
        "Anchor(ActionType actionType,bytes32 dataHash,uint256 nonce,uint256 deadline)"
    );

    // ============ STORAGE ============
    
    /// @notice O(1) anchor verification - prevents unbounded array DoS
    mapping(address => mapping(bytes32 => bool)) private userAnchorExists;
    
    /// @notice Track anchor count per user
    mapping(address => uint256) private userAnchorCount;
    
    /// @notice Limited anchor history for pagination (last 1000 anchors)
    mapping(address => AnchorMetadata[]) private userAnchorHistory;
    
    /// @notice Nonce for signature replay protection
    mapping(address => uint256) public nonces;
    
    /// @notice Rate limiting - last anchor timestamp
    mapping(address => uint256) private lastAnchorTime;
    
    /// @notice Rate limiting - anchor count in current window
    mapping(address => uint256) private anchorCountInWindow;

    // ============ EVENTS ============
    
    /// @notice Event with indexed parameters for efficient filtering
    event PortfolioAnchored(
        address indexed user,
        ActionType indexed actionType,
        bytes32 indexed dataHash,
        uint256 timestamp,
        uint8 schemaVersion
    );

    /// @notice Emitted when anchor quota is consumed
    event AnchorRateLimited(address indexed user, uint256 remainingQuota);

    // ============ EXTERNAL FUNCTIONS ============

    /**
     * @notice Anchor a portfolio action with signature verification
     * @param actionType The type of action
     * @param dataHash Keccak256 hash of the action data (JSON string)
     * @param deadline Signature expiration timestamp
     * @param signature EIP-712 signature authorizing the anchor
     * @return The dataHash that was anchored
     */
    function anchor(
        ActionType actionType,
        bytes32 dataHash,
        uint256 deadline,
        bytes memory signature
    ) external nonReentrant returns (bytes32) {
        require(block.timestamp <= deadline, "Signature expired");
        require(dataHash != bytes32(0), "Invalid data hash");
        
        // Verify signature
        bytes32 structHash = keccak256(abi.encode(
            ANCHOR_TYPEHASH,
            actionType,
            dataHash,
            nonces[msg.sender]++,
            deadline
        ));
        
        bytes32 digest = keccak256(abi.encodePacked("\x19\x01", DOMAIN_SEPARATOR, structHash));
        address signer = digest.recover(signature);
        require(signer == msg.sender, "Invalid signature");
        
        // Rate limiting checks
        _checkRateLimit(msg.sender);
        
        // Store anchor using O(1) mapping
        userAnchorExists[msg.sender][dataHash] = true;
        userAnchorCount[msg.sender]++;
        
        // Update limited history for pagination (keep last 1000)
        _updateAnchorHistory(msg.sender, actionType, dataHash);
        
        // Emit indexed event for off-chain indexing
        emit PortfolioAnchored(
            msg.sender,
            actionType,
            dataHash,
            block.timestamp,
            CURRENT_SCHEMA_VERSION
        );

        return dataHash;
    }

    /**
     * @notice Batch anchor with signature verification
     * @param actionTypes Array of action types
     * @param dataHashes Array of data hashes
     * @param deadline Signature expiration
     * @param signature EIP-712 signature
     */
    function batchAnchor(
        ActionType[] memory actionTypes,
        bytes32[] memory dataHashes,
        uint256 deadline,
        bytes memory signature
    ) external nonReentrant {
        require(actionTypes.length == dataHashes.length, "Length mismatch");
        require(actionTypes.length > 0, "Empty arrays");
        require(actionTypes.length <= 50, "Max 50 per batch");
        
        require(block.timestamp <= deadline, "Signature expired");
        
        // Verify signature for batch
        bytes32 batchHash = keccak256(abi.encodePacked(actionTypes));
        bytes32 structHash = keccak256(abi.encode(
            ANCHOR_TYPEHASH,
            batchHash,
            dataHashes[0],
            nonces[msg.sender]++,
            deadline
        ));
        
        bytes32 digest = keccak256(abi.encodePacked("\x19\x01", DOMAIN_SEPARATOR, structHash));
        address signer = digest.recover(signature);
        require(signer == msg.sender, "Invalid signature");
        
        // Rate limiting - one anchor counts for all in batch
        _checkRateLimit(msg.sender);

        for (uint i = 0; i < actionTypes.length; i++) {
            require(dataHashes[i] != bytes32(0), "Invalid data hash");
            
            userAnchorExists[msg.sender][dataHashes[i]] = true;
            userAnchorCount[msg.sender]++;
            
            _updateAnchorHistory(msg.sender, actionTypes[i], dataHashes[i]);
            
            emit PortfolioAnchored(
                msg.sender,
                actionTypes[i],
                dataHashes[i],
                block.timestamp,
                CURRENT_SCHEMA_VERSION
            );
        }
    }

    /**
     * @notice Verify anchor in O(1) time
     * @param user The user address
     * @param dataHash The hash to verify
     * @return True if the hash exists
     */
    function verifyAnchor(address user, bytes32 dataHash) external view returns (bool) {
        return userAnchorExists[user][dataHash];
    }

    /**
     * @notice Get anchor count for a user
     * @param user The user address
     * @return The number of anchors
     */
    function getAnchorCount(address user) external view returns (uint256) {
        return userAnchorCount[user];
    }

    /**
     * @notice Get paginated anchors for a user (efficient historical queries)
     * @param user The user address
     * @param offset Starting index
     * @param limit Number of anchors to retrieve (max 100)
     * @return Array of anchor info structs
     */
    function getAnchorsPaginated(
        address user,
        uint256 offset,
        uint256 limit
    ) external view returns (AnchorInfo[] memory) {
        require(limit <= 100, "Max 100 per query");
        
        uint256 totalAnchors = userAnchorHistory[user].length;
        if (offset >= totalAnchors) return new AnchorInfo[](0);
        
        uint256 end = offset + limit;
        if (end > totalAnchors) end = totalAnchors;
        
        AnchorInfo[] memory results = new AnchorInfo[](end - offset);
        for (uint256 i = offset; i < end; i++) {
            AnchorMetadata memory metadata = userAnchorHistory[user][i];
            results[i - offset] = AnchorInfo({
                dataHash: metadata.dataHash,
                actionType: metadata.actionType,
                timestamp: metadata.timestamp,
                schemaVersion: metadata.schemaVersion
            });
        }
        return results;
    }

    /**
     * @notice Get remaining anchor quota for a user
     * @param user The user address
     * @return Remaining anchors allowed in current window
     */
    function getRemainingQuota(address user) external view returns (uint256) {
        if (block.timestamp >= lastAnchorTime[user] + RATE_LIMIT_WINDOW) {
            return MAX_ANCHORS_PER_WINDOW;
        }
        return MAX_ANCHORS_PER_WINDOW - anchorCountInWindow[user];
    }

    /**
     * @notice Get next allowed anchor timestamp
     * @param user The user address
     * @return Timestamp when next anchor can be made
     */
    function getNextAnchorTime(address user) external view returns (uint256) {
        uint256 nextTime = lastAnchorTime[user] + MIN_ANCHOR_DELAY;
        return nextTime > block.timestamp ? nextTime : block.timestamp;
    }

    /**
     * @notice Get current schema version
     * @return The current schema version
     */
    function getSchemaVersion() external pure returns (uint8) {
        return CURRENT_SCHEMA_VERSION;
    }

    /**
     * @notice Get EIP-712 domain separator for frontend signing
     * @return The domain separator hash
     */
    function getDomainSeparator() external pure returns (bytes32) {
        return DOMAIN_SEPARATOR;
    }

    // ============ INTERNAL FUNCTIONS ============

    /**
     * @notice Check and update rate limit state
     */
    function _checkRateLimit(address user) internal {
        // Check minimum delay between anchors
        require(
            block.timestamp >= lastAnchorTime[user] + MIN_ANCHOR_DELAY,
            "Must wait before next anchor"
        );
        
        // Reset counter if window has passed
        if (block.timestamp >= lastAnchorTime[user] + RATE_LIMIT_WINDOW) {
            anchorCountInWindow[user] = 0;
        }
        
        // Check rate limit
        require(
            anchorCountInWindow[user] < MAX_ANCHORS_PER_WINDOW,
            "Rate limit exceeded"
        );
        
        // Update tracking
        lastAnchorTime[user] = block.timestamp;
        anchorCountInWindow[user]++;
        
        // Emit event if quota running low
        if (anchorCountInWindow[user] == MAX_ANCHORS_PER_WINDOW - 2) {
            emit AnchorRateLimited(user, 2);
        }
    }

    /**
     * @notice Update anchor history (keeps last 1000 for pagination)
     */
    function _updateAnchorHistory(
        address user,
        ActionType actionType,
        bytes32 dataHash
    ) internal {
        AnchorMetadata memory metadata = AnchorMetadata({
            actionType: actionType,
            dataHash: dataHash,
            timestamp: block.timestamp,
            schemaVersion: CURRENT_SCHEMA_VERSION
        });
        
        AnchorMetadata[] storage history = userAnchorHistory[user];
        
        // Add new anchor
        history.push(metadata);
        
        // Keep only last 1000 anchors to prevent unbounded growth
        if (history.length > 1000) {
            // Remove oldest anchor (index 0) by shifting
            for (uint i = 0; i < history.length - 1; i++) {
                history[i] = history[i + 1];
            }
            history.pop();
        }
    }
}

