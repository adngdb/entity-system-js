import babel from 'rollup-plugin-babel';
import { terser } from 'rollup-plugin-terser';


export default {
    input: 'src/entity-manager.js',
    output: {
        file: 'entity-manager.js',
        format: 'umd',
        name: 'ensy',
        sourcemap: true,
    },
    plugins: [
        babel({
            exclude: 'node_modules/**',
        }),
        terser(),
    ],
};
