import Ember from "ember";
import Project from "ui/pods/project/model";

export default Ember.Component.extend({
  project: null,
  projects: null,

  tagName: 'header',
  classNames: ['clearfix'],

  defaultProject: null,
  init: function() {
    this._super();
    var project = Project.create({
      id: undefined,
      name: 'Default',
      externalId: undefined,
      externalIdType: 'default'
    });

    this.set('defaultProject', project);
  },

  projectChoices: function() {
    var out = this.get('projects').slice();
    out.unshift(this.get('defaultProject'));
    return out;
  }.property('defaultProject','projects.@each.{id,displayName}'),

  actions: {
    switchProject: function(id) {
      this.sendAction('switchProject', id);
    }
  },
});
