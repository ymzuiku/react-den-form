module.exports = {
  lib: ['src/packages/react-den-form'], // need babel files or dirs
  dontLib: [], // dont babel files or dirs
  copy: {
    'src/packages/react-den-form': '../src',
    'src/packages/react-den-form/README.md': '../src/README.md',
    dist: '../lib',
    'dist/package.json': '../package.json',
  },
  delete: ['dist', '../lib/package.json'], // after copy builded, delete files
  package: {
    main: 'lib/index.js',
    types: 'src/index.d.ts',
    dependencies: {},
  },
  gitURL: 'github.com/ymzuiku/react-den-form',
};
