import Ember from 'ember';

export default Ember.Component.extend({
  language: 'javascript',
  code: '',
  hide: false,
  constrained: true,

  tagName: 'PRE',
  classNames: ['line-numbers'],
  classNameBindings: ['languageClass','hide:hide','constrained:constrained'],

  languageClass: function() {
    var lang = this.get('language');
    if ( lang )
    {
      return 'language-'+lang;
    }
  }.property('language'),

  didReceiveAttrs() {
    this.highlightedChanged();
  },

  highlighted: null,
  highlightedChanged: function() {
    var lang = this.get('language');
    this.set('highlighted', Prism.highlight(this.get('code')||'', Prism.languages[lang], lang));
  }.observes('language','code'),
});
