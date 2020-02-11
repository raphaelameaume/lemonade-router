import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import replace from '@rollup/plugin-replace';
import livereload from 'rollup-plugin-livereload';
import pkg from './package.json';
import { terser } from 'rollup-plugin-terser';

const production = !process.env.ROLLUP_WATCH;

export default [
    // browser-friendly UMD build
    {
        input: 'src/Router.js',
        output: {
            name: 'LemonadeRouter',
            file: pkg.browser,
            format: 'umd'
        },
        plugins: [
            resolve(),
            commonjs(),
            replace({
                'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
            }),
            !production && serve(),
            !production && livereload('public'),
            production && terser()
        ]
    },
    {
        input: 'src/Router.js',
        external: ['history', 'path-to-regexp'],
        output: [
            { file: pkg.main, format: 'cjs' },
            { file: pkg.module, format: 'es' }
        ]
    }
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