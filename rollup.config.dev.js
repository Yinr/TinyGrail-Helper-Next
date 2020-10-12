import metablock from 'rollup-plugin-userscript-metablock'
import postcss from 'rollup-plugin-postcss'

const pkg = require('./package.json')

const metab = metablock({
  file: './src/meta.json',
  override: {
    name: pkg.name + '[DEV]',
    version: pkg.version,
    description: pkg.description,
    author: pkg.author,
    homepage: pkg.homepage,
    license: pkg.license
  }
})

export default {
  input: 'src/main.js',
  output: {
    file: 'dist/TinyGrail-Helper-Next-dev.user.js',
    format: 'iife',
    sourcemap: 'inline',
    globals: {
      jquery: '$'
    }
  },
  plugins: [
    metab,
    postcss({
      inject: (css) => `GM_addStyle(${css})`,
      sourceMap: 'inline'
    })
  ],
  external: ['jquery']
}
