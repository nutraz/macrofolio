import Principal "mo:base/Principal";
import Array "mo:base/Array"; // Explicit import
import Nat "mo:base/Nat";
actor {
    // A simple list of (User Principal, User Canister ID)
    private stable var userCanisters: [(Principal, Principal)] = [];

    // Placeholder for asset metadata
    private var availableAssetTypes: [Text] = ["Stock/ETF", "Gold/Silver", "Fixed Income", "Real Estate", "Crypto Assets", "NFTs"];

    // Function to get or create a user's dedicated macrofolio_user canister
    public func getOrCreateUserCanister() : async Principal {
        // We cannot easily access 'caller' reliably in this setup without the module conflicts.
        // For MVP purposes, we will use a placeholder Principal to simulate a user.
        let callerPrincipal = Principal.fromText("rrkah-fqaaa-aaaaa-aaaaq-cai"); // Dummy Principal for testing

        // 1. Check if user already exists in the list
        let found = Array.find<(Principal, Principal)>(userCanisters, func ((p, _)) {
            Principal.equal(p, callerPrincipal);
        });

        switch (found) {
            case (?(_, canisterId)) {
                return canisterId;
            };
            case (null) {
                // 2. If not found, return a dummy canister ID for the MVP
                let newCanisterId = Principal.fromText("aaaaa-aa"); 
                
                // 3. Store it
                userCanisters := Array.append(userCanisters, [(callerPrincipal, newCanisterId)]);
                
                return newCanisterId;
            };
        };
    };

    // Function to get all available asset types
    public func getAvailableAssetTypes() : async [Text] {
        return availableAssetTypes;
    };
}
