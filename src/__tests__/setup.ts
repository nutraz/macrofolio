// Minimal setup file - no imports that require Jest globals
// Just set up basic globals if needed

if (typeof window === 'undefined') {
  (global as any).window = {};
}

(global as any).ethereum = undefined;
