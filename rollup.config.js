import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';

export default {
  input: './src/index.tsx',
  output: [
    {
      file: './dist/index.cjs.js',
      format: 'cjs',
    },
    {
      file: './dist/index.esm.js',
      format: 'esm',
    },
  ],
  external: id => id.startsWith('@babel/runtime/') || id === 'react',
  plugins: [
    resolve({
      extensions: ['.tsx', '.ts'],
    }),
    babel({
      runtimeHelpers: true,
      include: ['src/**/*.*'],
      plugins: ['@babel/plugin-transform-runtime'],
      extensions: ['.tsx', '.ts'],
    }),
  ],
};
