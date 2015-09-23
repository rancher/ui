import Resource from 'ember-api-store/models/resource';
import Ember from 'ember';
import C from 'ui/utils/constants';

var Project = Resource.extend({
  session: Ember.inject.service(),
  prefs: Ember.inject.service(),

  type: 'project',
  name: null,
  description: null,

  icon: function() {
    if ( this.get('isDefault') )
    {
      return 'icon icon-home';
    }
    else if ( this.get('active') )
    {
      return 'icon icon-openfolder';
    }
    else
    {
      return 'icon icon-folder';
    }
  }.property('active','isDefault'),

  isDefault: function() {
    return this.get('prefs.' + C.PREFS.PROJECT_DEFAULT) === this.get('id');
  }.property('prefs.' + C.PREFS.PROJECT_DEFAULT, 'id'),

  active: function() {
    return this.get('session.' + C.SESSION.PROJECT) === this.get('id');
  }.property('session' + C.SESSION.PROJECT, 'id'),

  canRemove: function() {
    return !!this.get('actions.remove') && ['removing','removed','purging','purged'].indexOf(this.get('state')) === -1;
  }.property('state','actions.remove'),

  canSetDefault: function() {
    return this.get('state') === 'active' && !this.get('isDefault');
  }.property('state','isDefault'),
});

// Projects don't get pushed by /subscribe WS, so refresh more often
Project.reopenClass({
  pollTransitioningDelay: 1000,
  pollTransitioningInterval: 5000,

  headers: {
    [C.HEADER.PROJECT]: undefined, // Requests for projects use the user's scope, not the project
  },
});

export default Project;
