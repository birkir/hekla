const upstreamTransformer = require('metro/src/reactNativeTransformer');
const cssTransformer = require('react-native-css-transformer');
const typescriptTransformer = require('react-native-typescript-transformer');
const stylusTransformer = require('react-native-stylus-transformer');

module.exports.transform = ({ src, filename, options }) => {
  if (filename.endsWith('.styl')) {
    return stylusTransformer.transform({ src, filename, options });
  }

  if (filename.endsWith('.css')) {
    return cssTransformer.transform({ src, filename, options });
  }

  if (filename.endsWith('.ts') || filename.endsWith('.tsx')) {
    return typescriptTransformer.transform({ src, filename, options });
  }

  return upstreamTransformer.transform({ src, filename, options });
};
