'use strict';

module.exports = {
  extends: 'eslint-config-egg',
  // for experimental features support such as async function
  parser: 'babel-eslint',
  rules: {
    // see https://github.com/eslint/eslint/issues/6274
    'generator-star-spacing': 'off',
    'babel/generator-star-spacing': 'off',
    semi: [ 2, 'always' ],
    'jsdoc/check-tag-names': 0,
    'no-use-before-define': 'off',
  },
};

'use strict';
