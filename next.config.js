// next.config.js
const withSass = require('@zeit/next-sass')
const withCSS = require('@zeit/next-css');

module.exports = withSass(withCSS({
  webpack: function(config) {
        config.externals.push('fs');
        config.externals.push('net');
        config.externals.push('tls');
        return config;
      }
}));
