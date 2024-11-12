const webpack = require('webpack');

module.exports = function override(config) {
  const newConfig = { ...config };

  newConfig.resolve.fallback = {
    assert: require.resolve('assert'),
    buffer: require.resolve('buffer'),
    'process/browser': require.resolve('process/browser'),
    stream: require.resolve('stream-browserify'),
    url: require.resolve('url'),
    http: false,
    https: false,
    os: false,
  };

  newConfig.plugins.push(
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer'],
    })
  );

  newConfig.ignoreWarnings = [/Failed to parse source map/];

  return newConfig;
};
