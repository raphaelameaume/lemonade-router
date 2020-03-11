import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import replace from '@rollup/plugin-replace';
import livereload from 'rollup-plugin-livereload';
import { terser } from 'rollup-plugin-terser';
import pkg from './package.json';

const production = process.env.NODE_ENV === 'production';

const plugins = [
    resolve(),
    commonjs(),
    replace({
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    }),
    !production && serve(),
    production && terser()
];

const external = ['history', 'path-to-regexp'];

export default [
    // browser-friendly UMD build
    {
        input: 'src/Router.js',
        output: {
            name: 'Lemonade',
            file: pkg.browser,
            format: 'umd'
        },
        plugins
    },
    {
        input: 'src/Router.js',
        external,
        output: {
            file: pkg.main,
            format: 'cjs'
        },
    },
    {
        input: 'src/RouterDOM.js',
        output: {
            name: 'Lemonade',
            file: 'lib/lemonade-router-dom.umd.js',
            format: 'umd'
        },
        plugins
    },
    {
        input: 'src/RouterDOM.js',
        external,
        output: { 
            file: 'lib/lemonade-router-dom.cjs.js',
            format: 'cjs'
        },
    },
    {
        input: 'src/index.js',
        external: ['history', 'path-to-regexp'],
        output: {
            file: pkg.module,
            format: 'es'
        },
    },
];

function serve() {
    // let started = false;

    // return {
    //     writeBundle() {
    //         if (!started) {
    //             started = true;

    //             require('child_process').spawn('npm', ['run', 'start'], {
    //                 stdio: ['ignore', 'inherit', 'inherit'],
    //                 shell: true
    //             });
    //         }
    //     }
    // };
}