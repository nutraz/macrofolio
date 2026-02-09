import Principal "mo:base/Principal";

actor {
    public type DerivationOrigin = {
        canister_id : Principal;
    };

    // Simplified entry point to satisfy dfx
    public shared query func prepare_login() : async {
        canister_id : Principal;
        derivation_origin : ?DerivationOrigin;
    } {
        return {
            canister_id = Principal.fromText("rdmx6-jaaaa-aaaaa-aaaaa-cai");
            derivation_origin = null;
        };
    };
}
