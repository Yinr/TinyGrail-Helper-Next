import metablock from 'rollup-plugin-userscript-metablock'
import postcss from 'rollup-plugin-postcss'
import path from 'path'

const pkg = require('./package.json')

const metab = metablock({
  file: './src/meta.json',
  override: {
    version: pkg.version,
    description: pkg.description,
    author: pkg.author,
    homepage: pkg.homepage,
    license: pkg.license
  }
})

export default [{
  input: 'src/main.js',
  output: {
    file: 'dist/TinyGrail-Helper-Next.user.js',
    format: 'iife',
    globals: {
      jquery: '$'
    }
  },
  plugins: [
    metab,
    postcss({
      inject: (css) => `GM_addStyle(${css})`
    })
  ],
  external: ['jquery']
}, {
  input: 'src/main.js',
  output: {
    file: 'dist/gadgets/script.js',
    format: 'iife',
    globals: {
      jquery: '$'
    }
  },
  plugins: [
    metab,
    postcss({
      extract: path.resolve('dist/gadgets/style.css')
    })
  ],
  external: ['jquery']
}]
