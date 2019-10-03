import Component from '@ember/component';
import layout from './template';
import { observer, computed } from '@ember/object'
import prismjs from 'prismjs';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-yaml';
import 'prismjs/components/prism-json';

export default Component.extend({
  layout,
  language:          'javascript',
  code:              '',
  hide:              false,
  constrained:       true,

  tagName:           'PRE',
  classNames:        ['line-numbers'],
  classNameBindings: ['languageClass', 'hide:hide', 'constrained:constrained'],

  highlighted:        null,

  didReceiveAttrs() {
    this.highlightedChanged();
  },

  highlightedChanged: observer('language', 'code', function() {
    var lang = this.get('language');

    this.set('highlighted', prismjs.highlight(this.get('code') || '', prismjs.languages[lang], lang));
  }),

  languageClass: computed('language', function() {
    var lang = this.get('language');

    if ( lang ) {
      return `language-${ lang }`;
    }
  }),

});
