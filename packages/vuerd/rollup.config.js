import replace from '@rollup/plugin-replace';
import strip from '@rollup/plugin-strip';
import filesize from 'rollup-plugin-filesize';

import visualizer from 'rollup-plugin-visualizer';

import pkg from './package.json';
import config from './rollup.config.common';

const { plugins, banner, onwarn } = config();

export default {
  input: 'src/index.ts',
  output: [
    {
      file: pkg.module,
      format: 'es',
      banner,
    },
    {
      name: pkg.name,
      file: pkg.main,
      format: 'umd',
      banner,
    },
    {
      name: pkg.name,
      file: pkg.browser,
      format: 'umd',
      banner,
      plugins: [],
    },
  ],
  plugins: [
    strip({
      debugger: true,
      include: '**/*.ts',
      functions: ['Logger.debug', 'Logger.log', 'console.log'],
    }),
    replace({
      preventAssignment: true,
      'process.env.NODE_ENV': JSON.stringify('production'),
      'import.meta.env.VITE_VUERD_VERSION': JSON.stringify(pkg.version),
    }),
    ...plugins,
    visualizer({
      filename: './dist/stats.html',
    }),
    filesize({
      showBrotliSize: true,
    }),
  ],
  onwarn,
};
