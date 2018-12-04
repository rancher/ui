import Component from '@ember/component';
import layout from './template';
import { htmlSafe } from '@ember/string';
import { get, computed } from '@ember/object';

var Marked = null;

export default Component.extend({
  layout,
  markdown:       null,
  init() {
    this._super(...arguments);


    if (!Marked) {
      import('marked').then( (module) => {
        Marked = module.default;
        this.notifyPropertyChange('parsedMarkdown');
      });
    }
  },
  parsedMarkdown: computed('markdown', function() {
    let out = '';

    if (Marked) {
      out = htmlSafe(Marked(get(this, 'markdown')));
    }

    return out;
  }),

});
