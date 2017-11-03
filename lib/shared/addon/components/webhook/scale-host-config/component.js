import Ember from 'ember';

export default Ember.Component.extend({
  tagName: '',
  hostTemplateChoices: Ember.computed('hostTemplates', function() {
    return this.get('hostTemplates').map((tmpl) => {
      return {label: tmpl.get('name'), value: tmpl.get('id')};
    })
  })
});
