/// <reference types="vitest" />

import * as path from 'node:path'
import license from 'rollup-plugin-license'
import { visualizer } from 'rollup-plugin-visualizer'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import tsconfigPaths from 'vite-tsconfig-paths'
import packageJson from './package.json'
import isProduction from './src/utils/isProduction'

// banner
const banner = `/*!
  * name: ${packageJson.name}
  * version: v${packageJson.version}
  * description: ${packageJson.description}
  * author: ${packageJson.author}
  * homepage: ${packageJson.homepage}
  * Released under the ${packageJson.license} License
  *
  * This software includes dependencies licensed under MIT, ISC, BSD-3-Clause, and Apache-2.0.
  * For license information, please see LICENSE.txt
  */
 `

export default defineConfig(({ mode }) => {
  return {
    plugins: [
      dts(),
      tsconfigPaths(),
      license({
        sourcemap: true,
        thirdParty: {
          output: path.join(__dirname, 'dist/LICENSE.txt')
        }
      })
    ],
    test: {
      globals: true,
      environment: 'happy-dom',
      include: ['src/libs/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@libs': path.resolve(__dirname, './src/libs')
      }
    },
    esbuild: isProduction()
      ? {
          drop: ['debugger'],
          pure: [
            'console.log',
            'console.info',
            'console.table',
            'console.time',
            'console.timeEnd',
            'console.trace'
          ]
        }
      : {},
    build: {
      minify: false,
      lib: {
        entry: './src/index.ts',
        name: packageJson.name,
        fileName: (format) => `index.${format}.js`
      },
      rollupOptions: {
        output: [
          {
            format: 'es',
            preserveModules: true,
            preserveModulesRoot: 'src',
            entryFileNames: ({ name: fileName }) => {
              return `${fileName}.es.js`
            },
            exports: 'named',
            banner
          },
          {
            format: 'cjs',
            preserveModules: true,
            preserveModulesRoot: 'src',
            entryFileNames: ({ name: fileName }) => {
              return `${fileName}.cjs.js`
            },
            exports: 'named',
            banner
          }
        ],
        external: [],
        plugins: [
          mode === 'analyze' &&
            visualizer({
              open: true,
              filename: './analyze/stats.html',
              gzipSize: true
            })
        ]
      }
    }
  }
})
