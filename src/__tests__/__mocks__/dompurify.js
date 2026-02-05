module.exports = {
  sanitize: (input) => {
    if (typeof input === 'string') {
      // Simple sanitization for tests
      return input.replace(/<[^>]*>/g, '');
    }
    return input;
  },
  addHook: () => {},
  removeHook: () => {}
};
