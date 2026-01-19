// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title PortfolioAnchor
 * @notice Smart contract for anchoring portfolio actions to blockchain (Polygon Amoy / Base Sepolia)
 * @dev This contract stores hash proofs of portfolio actions - it does NOT hold funds
 * 
 * =============================================================================
 * ⚠️  v0 anchor schema – DO NOT BREAK
 * 
 * This contract defines the canonical event signature for all portfolio anchors.
 * Changing event parameters will break historical proof verification.
 * 
 * Event Signature: PortfolioAnchored(address,string,bytes32,uint256)
 * =============================================================================
 */
contract PortfolioAnchor {
    // Event emitted when portfolio data is anchored
    event PortfolioAnchored(
        address indexed user,
        string actionType,
        bytes32 dataHash,
        uint256 timestamp
    );

    // Track all anchors for a user (for indexing)
    mapping(address => bytes32[]) private userAnchors;

    /**
     * @notice Anchor a portfolio action to the blockchain
     * @param actionType The type of action (e.g., "ADD_ASSET", "UPDATE_PORTFOLIO", "DELETE_ASSET")
     * @param dataHash Keccak256 hash of the action data (JSON string)
     * @return The dataHash that was anchored
     */
    function anchor(
        string memory actionType,
        bytes32 dataHash
    ) external returns (bytes32) {
        require(bytes(actionType).length > 0, "Action type required");
        require(dataHash != bytes32(0), "Invalid data hash");

        // Store anchor for user
        userAnchors[msg.sender].push(dataHash);

        // Emit event
        emit PortfolioAnchored(
            msg.sender,
            actionType,
            dataHash,
            block.timestamp
        );

        return dataHash;
    }

    /**
     * @notice Batch anchor multiple actions for efficiency
     * @param actionTypes Array of action types
     * @param dataHashes Array of data hashes (must match actionTypes length)
     */
    function batchAnchor(
        string[] memory actionTypes,
        bytes32[] memory dataHashes
    ) external {
        require(actionTypes.length == dataHashes.length, "Length mismatch");
        require(actionTypes.length > 0, "Empty arrays");
        require(actionTypes.length <= 50, "Max 50 per batch");

        for (uint i = 0; i < actionTypes.length; i++) {
            require(bytes(actionTypes[i]).length > 0, "Action type required");
            require(dataHashes[i] != bytes32(0), "Invalid data hash");

            userAnchors[msg.sender].push(dataHashes[i]);

            emit PortfolioAnchored(
                msg.sender,
                actionTypes[i],
                dataHashes[i],
                block.timestamp
            );
        }
    }

    /**
     * @notice Get all anchor hashes for a user
     * @param user The user address
     * @return Array of all anchor hashes
     */
    function getUserAnchors(address user) external view returns (bytes32[] memory) {
        return userAnchors[user];
    }

    /**
     * @notice Get the count of anchors for a user
     * @param user The user address
     * @return The number of anchors
     */
    function getAnchorCount(address user) external view returns (uint256) {
        return userAnchors[user].length;
    }

    /**
     * @notice Verify that a data hash was anchored
     * @param user The user address
     * @param dataHash The hash to verify
     * @return True if the hash exists
     */
    function verifyAnchor(address user, bytes32 dataHash) external view returns (bool) {
        bytes32[] storage anchors = userAnchors[user];
        for (uint i = 0; i < anchors.length; i++) {
            if (anchors[i] == dataHash) {
                return true;
            }
        }
        return false;
    }
}

