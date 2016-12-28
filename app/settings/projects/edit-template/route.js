import Ember from 'ember';

export default Ember.Route.extend({
  catalog: Ember.inject.service(),

  model(params) {
    return Ember.RSVP.hash({
      catalogInfo: this.get('catalog').fetchTemplates({templateBase: 'infra', category: 'all'}),
      originalProjectTemplate: this.get('userStore').find('projecttemplate', params.template_id),
    }).then((hash) => {
      hash.projectTemplate = hash.originalProjectTemplate.clone();
      return hash;
    });
  }
});
