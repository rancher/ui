import Ember from 'ember';

export default Ember.Component.extend({
  dockerCompose: null,
  rancherCompose: null,

  classNames: ['row'],

  didReceiveAttrs() {
    this.highlightAll();
  },

  highlightAll() {
    Ember.run.next(() => {
      this.$('CODE').each(function(idx, elem) {
        Prism.highlightElement(elem);
      });
    });
  },

  // The highlighting breaks Ember's link to the content, so it's not automatically updated
  // when the content change.. manually trigger that.
  yamlChanged: function() {
    this.$('CODE.docker-compose').html(this.get('dockerCompose'));
    this.$('CODE.rancher-compose').html(this.get('rancherCompose'));
    this.highlightAll();
  }.observes('dockerCompose','rancherCompose'),
});
