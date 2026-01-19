import Nat "mo:base/Nat";
import Array "mo:base/Array";

actor {
    // Define the AssetType enum based on Screen 3
    public type AssetType = {
        #StockETF;
        #GoldSilver;
        #FixedIncome;
        #RealEstate;
        #Crypto;
        #NFT;
        #Other : Text; // For custom asset types
    };

    // Define the RiskProfile enum based on Screen 2
    public type RiskProfile = {
        #Conservative;
        #Balanced;
        #Aggressive;
    };

    // Define the Asset record type based on Screen 5
    // This is a simplified version for now, will be expanded as needed.
    public type Asset = {
        id: Nat; // Unique ID for the asset
        assetType: AssetType;
        name: Text;
        quantity: Float;
        purchasePrice: Float; // price per unit at purchase
        purchaseDate: Nat; // Unix timestamp
        // Additional fields will be added based on assetType (e.g., ticker, principal, interestRate)
    };

    // Store user's portfolio data
    private var riskProfile: ?RiskProfile = null;
    private var assets: [Asset] = [];
    private var nextAssetId: Nat = 0;

    // Set the user's risk profile (Screen 2)
    public func setRiskProfile(profile: RiskProfile) : async () {
        riskProfile := ?profile;
    };

    // Add a new asset to the portfolio (Screen 4 & 5)
    public func addAsset(assetType: AssetType, name : Text, quantity: Float, purchasePrice: Float, purchaseDate: Nat) : async Asset {
        let newAsset: Asset = {
            id = nextAssetId;
            assetType = assetType;
            name = name;
            quantity = quantity;
            purchasePrice = purchasePrice;
            purchaseDate = purchaseDate;
        };
        assets := Array.append(assets, [newAsset]);
        nextAssetId += 1;
        return newAsset;
    };

    // Get the entire portfolio (Screen 6)
    public func getPortfolio() : async (?RiskProfile, [Asset]) {
        return (riskProfile, assets);
    };

    // Update an existing asset (simplified for now)
    public func updateAsset(id: Nat, assetType: AssetType, name: Text, quantity: Float, purchasePrice: Float, purchaseDate: Nat) : async ?Asset {
        var updatedAssetOpt: ?Asset = null; // Optional to store the updated asset if found

        // Create a new array with the updated asset
        let newAssets = Array.map(assets, func(asset: Asset) : Asset {
            if (asset.id == id) {
                let updated = {
                    id = id;
                    assetType = assetType;
                    name = name;
                    quantity = quantity;
                    purchasePrice = purchasePrice;
                    purchaseDate = purchaseDate;
                };
                updatedAssetOpt := ?updated; // Store the updated asset
                return updated; // Return the updated asset for the new array
            } else {
                return asset; // Return the original asset for the new array
            }
        });
        assets := newAssets; // Replace the old array with the new one
        return updatedAssetOpt; // Return the optional updated asset
    };

    // Delete an asset
    public func deleteAsset(id: Nat) : async Bool {
        let initialLength = Array.size(assets);
        assets := Array.filter(assets, func(asset: Asset) : Bool {
            return asset.id != id;
        });
        return Array.size(assets) < initialLength; // True if an asset was removed
    };
}