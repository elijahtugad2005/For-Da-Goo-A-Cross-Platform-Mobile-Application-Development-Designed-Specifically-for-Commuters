// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Exclude test files from the bundle
config.resolver.sourceExts = [...config.resolver.sourceExts];
config.resolver.blockList = [
  /.*\.test\.[jt]sx?$/,
  /.*\.spec\.[jt]sx?$/,
  /__tests__\/.*/,
];

module.exports = config;
