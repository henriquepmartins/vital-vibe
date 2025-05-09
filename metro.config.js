// metro.config.js
const path = require("path");
const { getDefaultConfig } = require("@expo/metro-config");

const config = getDefaultConfig(__dirname);

config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,

  // ── your previous ws & core-module shims ──
  ws: path.resolve(__dirname, "shims/ws.js"),
  "ws/lib/websocket-server": path.resolve(__dirname, "shims/ws-server.js"),
  net: path.resolve(__dirname, "shims/empty.js"),
  tls: path.resolve(__dirname, "shims/empty.js"),
  http: require.resolve("stream-http"),
  https: require.resolve("https-browserify"),
  crypto: require.resolve("crypto-browserify"),
  stream: require.resolve("stream-browserify"),
  url: require.resolve("url/"),
  buffer: require.resolve("buffer/"),
  process: require.resolve("process/"),
  util: require.resolve("util/"),
  events: require.resolve("events/"),

  // ── STUB ALL OF ZLIB ──
  zlib: path.resolve(__dirname, "shims/empty.js"),
  "zlib/lib/zlib.js": path.resolve(__dirname, "shims/empty.js"),
  "zlib/lib/zlib_bindings": path.resolve(__dirname, "shims/empty.js"),
};

config.resolver.sourceExts = [...config.resolver.sourceExts, "cjs"];

module.exports = config;
