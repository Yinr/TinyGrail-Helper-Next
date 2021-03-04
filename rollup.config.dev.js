import metablock from 'rollup-plugin-userscript-metablock'
import postcss from 'rollup-plugin-postcss'
import cleanup from 'rollup-plugin-cleanup'
import notify from 'rollup-plugin-notify'
import browsersync from 'rollup-plugin-browsersync'
import postcsssass from '@csstools/postcss-sass'
import autoprefixer from 'autoprefixer'
import postcss_assets from 'postcss-assets'

import { config, metabConfig } from './rollup.config'

const pkg = require('./package.json')

const metab = metablock({
  ...metabConfig,
  override: {
    ...metabConfig.override,
    name: pkg.name + '[DEV]'
  }
})

export default {
  ...config,
  output: {
    ...config.output,
    file: 'dist/TinyGrail-Helper-Next-dev.user.js',
    sourcemap: 'inline'
  },
  plugins: [
    metab,
    postcss({
      inject: (css) => `GM_addStyle(${css})`,
      plugins: [
        postcsssass({
          sourceMapEmbed: true,
          outputStyle: 'compressed'
        }),
        autoprefixer,
        postcss_assets
      ],
      sourceMap: 'inline'
    }),
    cleanup(),
    notify(),
    browsersync({
      server: {
        baseDir: 'dist',
        directory: true
      }
    })
  ]
}
