import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import replace from '@rollup/plugin-replace';
import { terser } from 'rollup-plugin-terser';

const production = process.env.NODE_ENV === 'production';

const plugins = [
    resolve(),
    commonjs(),
    replace({
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    }),
    production && terser()
];

export default [
    // browser-friendly UMD build
    {
        input: 'src/Router.js',
        output: {
            name: 'Lemonade',
            file: 'lib/lemonade-router.umd.js',
            format: 'umd'
        },
        plugins
    },
    {
        input: 'src/RouterDOM.js',
        output: {
            name: 'Lemonade',
            file: 'lib/lemonade-router-dom.umd.js',
            format: 'umd'
        },
        plugins
    }
];