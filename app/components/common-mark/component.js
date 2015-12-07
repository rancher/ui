import Ember from 'ember';

export default Ember.Component.extend({

  markdown: null,

  cmReader: new commonmark.Parser(),
  cmWriter: new commonmark.HtmlRenderer(),

  parsedMarkdown: function() {

      var parsed = this.cmReader.parse(this.get('markdown'));

      return this.cmWriter.render(parsed);
  }.property('markdown')
});
