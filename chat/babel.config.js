module.exports = function (api) {
  api.cache(true);
  const expoPreset = (() => {
    try {
      return require.resolve('babel-preset-expo');
    } catch {
      return require.resolve('babel-preset-expo', {
        paths: [require.resolve('expo', { paths: [__dirname] })],
      });
    }
  })();

  return {
    presets: [expoPreset],
    plugins: [
      // react-native-reanimated plugin must be last
      'react-native-reanimated/plugin',
    ],
  };
};
