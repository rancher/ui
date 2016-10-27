import Ember from 'ember';

export default Ember.Route.extend({
  catalog: Ember.inject.service(),
  allServices: Ember.inject.service(),

  model() {
    return Ember.RSVP.hash({
      catalogInfo: this.get('catalog').fetchTemplates({templateBase: 'infra', category: 'all'}),
      serviceChoices: this.get('allServices').choices(),
    }).then((hash) => {
      hash.projectTemplate = this.get('userStore').createRecord({
        type: 'projectTemplate',
        stacks: [],
        isPublic: false,
      });

      hash.originalProjectTemplate = hash.projectTemplate;
      return hash;
    });
  }
});
