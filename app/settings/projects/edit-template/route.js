import Ember from 'ember';

export default Ember.Route.extend({
  catalog: Ember.inject.service(),
  allServices: Ember.inject.service(),

  model(params) {
    return Ember.RSVP.hash({
      catalogInfo: this.get('catalog').fetchTemplates({templateBase: 'infra', category: 'all'}),
      serviceChoices: this.get('allServices').choices(),
      originalProjectTemplate: this.get('userStore').find('projecttemplate', params.template_id),
    }).then((hash) => {
      hash.projectTemplate = hash.originalProjectTemplate.clone();
      return hash;
    });
  }
});
