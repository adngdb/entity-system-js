import babel from 'rollup-plugin-babel';
import uglify from 'rollup-plugin-uglify';


export default {
    entry: 'src/entity-manager.js',
    targets: [
        {
            dest: 'entity-manager.js',
            format: 'umd',
            moduleName: 'ensy',
        },
    ],
    sourceMap: 'inline',
    plugins: [
        babel({
            exclude: 'node_modules/**',
        }),
        uglify({}),
    ],
};
