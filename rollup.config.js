import metablock from 'rollup-plugin-userscript-metablock'
import postcss from 'rollup-plugin-postcss'
import cleanup from 'rollup-plugin-cleanup'
import path from 'path'
import postcsssass from '@csstools/postcss-sass'
import autoprefixer from 'autoprefixer'
import postcss_assets from 'postcss-assets'

const pkg = require('./package.json')

export const config = {
  input: 'src/main.js',
  output: {
    file: 'dist/TinyGrail-Helper-Next.user.js',
    format: 'iife',
    globals: {
      jquery: '$'
    }
  },
  external: ['jquery']
}

export const metabConfig = {
  file: './src/meta.json',
  override: {
    version: pkg.version,
    description: pkg.description,
    author: pkg.author,
    homepage: pkg.homepage,
    license: pkg.license
  }
}

const metab = metablock(metabConfig)

export default [{
  ...config,
  plugins: [
    metab,
    postcss({
      inject: (css) => `GM_addStyle(${css})`,
      minimize: true,
      plugins: [
        postcsssass({
          outputStyle: 'compressed'
        }),
        autoprefixer,
        postcss_assets
      ]
    }),
    cleanup()
  ]
}, {
  ...config,
  output: {
    ...config.output,
    file: 'dist/gadgets/script.js'
  },
  plugins: [
    metab,
    postcss({
      extract: path.resolve('dist/gadgets/style.css'),
      plugins: [
        postcsssass(),
        autoprefixer,
        postcss_assets
      ]
    }),
    cleanup()
  ]
}]
