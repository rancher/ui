import Component from '@ember/component';
import { htmlSafe } from '@ember/string';
import { get, computed } from '@ember/object';
import layout from './template';

export default Component.extend({
  layout,
  markdown: null,

  cmReader: new commonmark.Parser(),
  cmWriter: new commonmark.HtmlRenderer(),

  parsedMarkdown: computed('markdown', function() {
    return htmlSafe(this.cmWriter.render(this.cmReader.parse(get(this, 'markdown'))));
  })
});
