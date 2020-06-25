import Component from '@ember/component';
import layout from './template';
import { htmlSafe } from '@ember/string';
import { get, computed } from '@ember/object';

var Marked = null;
var DOMPurify = null;

export default Component.extend({
  layout,
  markdown:       null,
  init() {
    this._super(...arguments);


    if (!Marked) {
      import('marked').then( (module) => {
        Marked = module.default;
        import('dompurify').then( (module) => {
          DOMPurify = module.default;

          if ( this.isDestroyed || this.isDestroying ) {
            return;
          }

          this.notifyPropertyChange('parsedMarkdown');
        });
      });
    }
  },
  parsedMarkdown: computed('markdown', function() {
    if ( !Marked ) {
      return '';
    }

    const html = Marked(get(this, 'markdown'), { breaks: true });

    return htmlSafe(DOMPurify.sanitize(html));
  }),

});
