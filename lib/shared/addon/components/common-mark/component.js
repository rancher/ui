import Component from '@ember/component';
import layout from './template';
import {Parser, HtmlRenderer} from 'commonmark';

export default Component.extend({
  layout,
  markdown: null,

  cmReader: new Parser(),
  cmWriter: new HtmlRenderer(),

  parsedMarkdown: function() {

      var parsed = this.cmReader.parse(this.get('markdown'));

      return this.cmWriter.render(parsed);
  }.property('markdown')
});
