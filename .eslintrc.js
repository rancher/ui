const propertyOrder = [
  'service',
  'controller',
  'query-params',
  'attribute',
  'relationship',
  'property',
  'single-line-function',

  'init',
  'beforeModel',
  'model',
  'afterModel',
  'redirect',
  'setupController',
  'resetController',
  ['lifecycle-hook', 'activate', 'deactivate', 'didDestroyElement',
    'didInsertElement', 'didReceiveAttrs', 'didRender', 'didUpdate',
    'didUpdateAttrs', 'renderTemplate', 'serialize', 'setupController',
    'willClearRender', 'willDestroyElement', 'willInsertElement', 'willRender', 'willUpdate'
  ],

  'actions',
  'observer',
  'multi-line-function'
];

module.exports = {
  root:          true,
  parser:        'babel-eslint',
  parserOptions: {
    ecmaVersion:                 2018,
    sourceType:                  'module',
    allowImportExportEverywhere: true
  },
  extends: [
    'eslint:recommended',
    'plugin:ember/recommended'
  ],
  globals: {
    '$':              true,
    'ALY':            true,
    'AWS':            true,
    'HW':             true,
    'Stripe':         true,
    'Ui':             true,
    'WebSocket':      true,
    'document':       true,
    'jQuery':         true,
    'navigator':      true,
    'window':         true,
  },
  env: {
    browser: true,
    es6:     true,
    node:    true
  },
  rules: {
    // Overrides
    'curly':                                      'error',
    'dot-notation':                               'off',
    'ember/alias-model-in-controller':            'off',
    'ember/avoid-leaking-state-in-ember-objects': 'off',
    'ember/closure-actions':                      'off',
    'ember/jquery-ember-run':                     'off',
    'ember/named-functions-in-promises':          'off',
    'ember/no-capital-letters-in-routes':         'off',
    'ember/no-function-prototype-extensions':     'off',
    'ember/no-observers':                         'off',
    'ember/no-on-calls-in-components':            'off',
    'ember/no-side-effects':                      'off',
    'ember/no-old-shims':                         'error',
    'ember/order-in-components':                  ['error', { order: propertyOrder }],
    'ember/order-in-controllers':                 ['error', { order: propertyOrder }],
    'ember/order-in-models':                      ['error', { order: propertyOrder }],
    'ember/order-in-routes':                      ['error', { order: propertyOrder }],
    'ember/use-brace-expansion':                  'off',
    'ember/use-ember-get-and-set':                'off',
    'ember/new-module-imports':                   'error',
    'eqeqeq':                                     'error',
    'generator-star-spacing':                     'off',
    'guard-for-in':                               'off',
    'linebreak-style':                            'off',
    'new-cap':                                    'off',
    'no-caller':                                  'error',
    'no-cond-assign':                             ['error', 'except-parens'],
    'no-console':                                 'off',
    'no-debugger':                                'warn',
    'no-empty':                                   'off',
    'no-eq-null':                                 'error',
    'no-eval':                                    'error',
    'no-extra-boolean-cast':                      'off',
    'no-new':                                     'off',
    'no-plusplus':                                'off',
    'no-undef':                                   'error',
    'no-unused-vars':                             'warn',
    'no-useless-escape':                          'off',
    'no-self-assign':                             'off',
    'strict':                                     'off',
    'wrap-iife':                                  'off',
    // stylistic
    'array-bracket-spacing':                      'error',
    'padded-blocks':                              ['error', 'never'],
    'block-spacing':                              ['error', 'always'],
    'brace-style':                                ['error', '1tbs'],
    'comma-spacing':                              'error',
    'func-call-spacing':                          ['error', 'never'],
    'implicit-arrow-linebreak':                   'error',
    'indent':                                     ['error', 2],
    'key-spacing':                                ['error', {
      'align': {
        'beforeColon': false,
        'afterColon':  true,
        'on':          'value',
        'mode':        'minimum'
      },
      'multiLine': {
        'beforeColon': false,
        'afterColon':  true
      },
    }],
    'keyword-spacing':               'error',
    'lines-between-class-members':   'error',
    'newline-per-chained-call':      ['error', { 'ignoreChainWithDepth': 4 }],
    'no-whitespace-before-property': 'error',
    'object-curly-newline':          ['error', {
      'ObjectExpression':  {
        'multiline':     true,
        'minProperties': 3
      },
      'ObjectPattern':     {
        'multiline':     true,
        'minProperties': 3
      },
      'ImportDeclaration': {
        'multiline':     true,
        'minProperties': 5
      },
      'ExportDeclaration': {
        'multiline':     true,
        'minProperties': 3
      }
    }],
    'object-curly-spacing':            ['error', 'always'],
    'object-property-newline':         'error',
    'padding-line-between-statements': [
      'error',
      {
        'blankLine': 'always',
        'prev':      '*',
        'next':      'return',
      },
      // This configuration would require blank lines after every sequence of variable declarations
      {
        blankLine: 'always',
        prev:      ['const', 'let', 'var'],
        next:      '*'
      },
      {
        blankLine: 'any',
        prev:      ['const', 'let', 'var'],
        next:      ['const', 'let', 'var']
      }
    ],
    quotes: [
      'error',
      'single',
      {
        'avoidEscape':           true,
        'allowTemplateLiterals': true
      },
    ],
    'space-before-function-paren': ['error', 'never'],
    'space-infix-ops':             'error',
    'space-unary-ops':             [
      'error',
      {
        'words':    true,
        'nonwords': false,
      }
    ],
    'spaced-comment':       'error',
    'switch-colon-spacing': 'error',

    // ECMAScript 6
    'arrow-parens':           'error',
    'arrow-spacing':          ['error', {
      'before': true,
      'after':  true
    }],
    'no-trailing-spaces':     'error',
    'object-shorthand':       'error',
    'prefer-arrow-callback':  'error',
    'prefer-template':        'error',
    'rest-spread-spacing':    'error',
    'template-curly-spacing': ['error', 'always'],
    'yield-star-spacing':     ['error', 'both'],
  },
  overrides: [
    // node files
    {
      files: [
        '.eslintrc.js',
        '.template-lintrc.js',
        'ember-cli-build.js',
        'testem.js',
        'blueprints/*/index.js',
        'config/**/*.js',
        'lib/*/index.js',
        'server/**/*.js'
      ],
      parserOptions: { sourceType: 'script' },
      env:           {
        browser: false,
        node:    true
      },
      plugins: ['node'],
      rules:   Object.assign({}, require('eslint-plugin-node').configs.recommended.rules, {
        // add your custom rules and overrides for node files here

        // this can be removed once the following is fixed
        // https://github.com/mysticatea/eslint-plugin-node/issues/77
        'node/no-unpublished-require': 'off'
      })
    }
  ]
};
