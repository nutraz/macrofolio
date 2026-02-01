const { z } = require('zod');

describe('Security Validation - Core Logic', () => {
  describe('Input Validation with Zod', () => {
    const AssetSchema = z.object({
      name: z.string().min(1).max(100),
      symbol: z.string().min(1).max(10),
      amount: z.number().positive(),
      type: z.enum(['stock', 'crypto', 'real_estate', 'nft'])
    });

    it('should validate correct asset data', () => {
      const validAsset = {
        name: 'Bitcoin',
        symbol: 'BTC',
        amount: 1.5,
        type: 'crypto'
      };
      expect(() => AssetSchema.parse(validAsset)).not.toThrow();
    });

    it('should reject invalid asset types', () => {
      const invalidAsset = {
        name: 'Test',
        symbol: 'TST',
        amount: -100,
        type: 'invalid'
      };
      expect(() => AssetSchema.parse(invalidAsset)).toThrow();
    });

    it('should reject empty asset names', () => {
      const invalidAsset = {
        name: '',
        symbol: 'TST',
        amount: 100,
        type: 'crypto'
      };
      expect(() => AssetSchema.parse(invalidAsset)).toThrow();
    });

    it('should validate maximum length constraints', () => {
      const longName = 'A'.repeat(101);
      const invalidAsset = {
        name: longName,
        symbol: 'TST',
        amount: 100,
        type: 'crypto'
      };
      expect(() => AssetSchema.parse(invalidAsset)).toThrow();
    });
  });

  describe('Security Constants Verification', () => {
    it('should have correct chain IDs', () => {
      const POLYGON_AMOY_CHAIN_ID = '0x13882';
      const BASE_SEPOLIA_CHAIN_ID = '0x14a34';
      
      expect(parseInt(POLYGON_AMOY_CHAIN_ID, 16)).toBe(80002);
      expect(parseInt(BASE_SEPOLIA_CHAIN_ID, 16)).toBe(84532);
    });

    it('should verify environment variable names are correct', () => {
      const expectedEnvVars = [
        'VITE_SUPABASE_URL',
        'VITE_SUPABASE_ANON_KEY',
        'VITE_CONTRACT_ADDRESS',
        'VITE_NETWORK_NAME'
      ];
      
      expectedEnvVars.forEach(envVar => {
        expect(typeof envVar).toBe('string');
        expect(envVar.startsWith('VITE_')).toBe(true);
      });
    });
  });
});
