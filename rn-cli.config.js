const blacklist = require('metro/src/blacklist')

module.exports = {
  getTransformModulePath() {
    return require.resolve('./scripts/transformer.js');
  },
  getSourceExts() {
    return ['js', 'ts', 'tsx', 'styl'];
  },
  getBlacklistRE() {
    return blacklist([/react-native\/local-cli\/core\/__fixtures__.*/])
  },
};
