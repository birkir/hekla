module.exports = {
  getTransformModulePath() {
    return require.resolve('./scripts/transformer.js');
  },
  getSourceExts() {
    return ['js', 'ts', 'tsx', 'styl'];
  },
};
