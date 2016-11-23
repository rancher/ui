import Ember from 'ember';

export default Ember.Component.extend({
  currentPath : null,
  isOwner     : null,

  tagName     : '',

  projects    : Ember.inject.service(),
  project     : Ember.computed.alias('projects.current'),
  k8s         : Ember.inject.service(),
  namespace   : Ember.computed.alias('k8s.namespace'),

  projectChoices: function() {
    return this.get('projects.active').sortBy('name','id');
  }.property('projects.active.@each.{id,displayName,state}'),

  projectIsMissing: function() {
    return this.get('projectChoices').filterBy('id', this.get('project.id')).get('length') === 0;
  }.property('project.id','projectChoices.@each.id'),

  hasKubernetes : Ember.computed.alias('projects.orchestrationState.hasKubernetes'),

  actions: {
    switchProject(id) {
      this.sendAction('switchProject', id);
    },

    switchNamespace(id) {
      this.sendAction('switchNamespace', id);
    },
  }
});
