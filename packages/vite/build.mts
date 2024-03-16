import { build } from '@redwoodjs/framework-tools'

import * as esbuild from 'esbuild'

await build()

// Bundle react dependencies without poisoned imports
// so that we don't need the react-server condition at runtime.

await esbuild.build({
  entryPoints: ['prebundled/react-server-dom-webpack.server.js'],
  outdir: 'compiled',

  bundle: true,
  conditions: ['react-server'],
  platform: 'node',
  target: ['node20'],

  logLevel: 'info',
})
