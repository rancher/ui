module.exports = {
  env: {
    embertest: true
  },
  parserOptions: {
    ecmaVersion: 2017,
    sourceType: "module"
  },
  extends: [
    "eslint:recommended",
    "plugin:ember/recommended"
  ],
  globals: {
    "$": true,
    "-Promise": true,
    "ALY": true,
    "AWS": true,
    "AnsiUp": true,
    "Identicon": true,
    "Prism": true,
    "ShellQuote": true,
    "Stripe": true,
    "Terminal": true,
    "Terminal": true,
    "Ui": true,
    "WebSocket": true,
    "YAML": true,
    "_": true,
    "async": true,
    "commonmark": true,
    "d3": true,
    "document": true,
    "jQuery": true,
    "jsondiffpatch": true,
    "md5": true,
    "moment": true,
    "navigator": true,
    "window": true,
  },
  rules: {
    // Overrides
    "curly": 2,
    "dot-notation": 0,
    "ember/alias-model-in-controller": 0,
    "ember/avoid-leaking-state-in-ember-objects": 0,
    "ember/closure-actions": 0,
    "ember/jquery-ember-run": 0,
    "ember/named-functions-in-promises": 0,
    "ember/no-capital-letters-in-routes": 0,
    "ember/no-function-prototype-extensions": 0,
    "ember/no-observers": 0,
    "ember/no-on-calls-in-components": 0,
    "ember/no-side-effects": 0,
    "ember/order-in-components": 0,
    "ember/order-in-controllers": 0,
    "ember/order-in-models": 0,
    "ember/order-in-routes": 0,
    "ember/use-brace-expansion": 0,
    "ember/use-ember-get-and-set": 0,
    "eqeqeq": 2,
    "generator-star-spacing": 0,
    "guard-for-in": 0,
    "linebreak-style": 0,
    "new-cap": 0,
    "no-caller": 2,
    "no-cond-assign": [ 2, "except-parens" ],
    "no-console": 1,
    "no-debugger": 1,
    "no-empty": 0,
    "no-eq-null": 2,
    "no-eval": 2,
    "no-extra-boolean-cast": 0,
    "no-new": 0,
    "no-plusplus": 0,
    "no-undef": 2,
    "no-unused-vars": 1,
    "no-useless-escape": 0,
    "strict": 0,
    "wrap-iife": 0,

    //stylistic
    "array-bracket-spacing": 2,
    "block-spacing": [ 2, "always" ],
    "brace-style": [ 2, "1tbs" ],
    "comma-spacing": 2,
    "func-call-spacing": [ 2, "never" ],
    "implicit-arrow-linebreak": 2,
    "key-spacing": [ 2, {
      "align": {
      "beforeColon": false,
      "afterColon": true,
      "on": "value",
      "mode": "minimum"
      }
    } ],
    "keyword-spacing": 2,
    "lines-between-class-members": 2,
    "newline-per-chained-call": 2,
    "no-whitespace-before-property": 2,
    "object-curly-newline": [ 2, {
      "ObjectExpression": { "multiline": true },
      "ObjectPattern": { "multiline": true },
      "ImportDeclaration": { "multiline": true, "minProperties": 3 },
      "ExportDeclaration": { "multiline": true, "minProperties": 3 }
    } ],
    "object-curly-spacing": [ 2, "always" ],
    "object-property-newline": 2,
    "padded-blocks": 2,
    "space-before-function-paren": [ 2, "never" ],
    "space-in-parens": [ 2, "always" ],
    "space-infix-ops": 2,
    "space-unary-ops": [
      2,
      { "words": true, "nonwords": false, }
    ],
    "spaced-comment": 2,
    "switch-colon-spacing": 2,

    // ECMAScript 6
    "arrow-body-style": [ 2, "as-needed" ],
    "arrow-parens": [
      2,
      "as-needed",
      { "requireForBlockBody": true }
    ],
    "arrow-spacing": [ 2, { "before": true, "after": true } ],
    "no-trailing-spaces": 2,
    "object-shorthand": 2,
    "prefer-arrow-callback": 2,
    "prefer-template": 2,
    "rest-spread-spacing": 2,
    // "sort-imports": 2,
    "template-curly-spacing": [ 2, "always" ],
    "yield-star-spacing": [ 2, "both" ],
  }
};
