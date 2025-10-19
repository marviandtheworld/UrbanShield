const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Disable TypeScript checking for web builds to allow the app to run
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Add web-specific resolver
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

module.exports = config;
