const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin')

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, options) => {
    if (!config.resolve.plugins) config.resolve.plugins = []
    config.resolve.plugins.push(new TsconfigPathsPlugin())
    return config
  },
}

module.exports = nextConfig
