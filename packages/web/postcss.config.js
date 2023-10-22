/* eslint-disable @typescript-eslint/no-var-requires */
const { colord } = require('colord')
const colors = require('tailwindcss/colors')

module.exports = {
  plugins: [
    require('postcss-nested'),
    require('tailwindcss/nesting'),
    require('tailwindcss'),
    require('autoprefixer'),
  ],
}
