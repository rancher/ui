import Ember from 'ember';

export default Ember.Component.extend({
  k8s: Ember.inject.service(),

  model: null,
  tagName: '',

});
