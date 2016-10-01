import Ember from 'ember';
import C from 'ui/utils/constants';

export default Ember.Controller.extend({
  application : Ember.inject.controller(),
  settings    : Ember.inject.service(),
  projects    : Ember.inject.service(),
  currentPath : Ember.computed.alias('application.currentPath'),
  error       : null,

  isPopup: Ember.computed.alias('application.isPopup'),

  hasCattleSystem: function() {
    var out = false;
    (this.get('model.stacks')||[]).forEach((stack) => {
      var info = stack.get('externalIdInfo');
      if ( C.EXTERNAL_ID.SYSTEM_KINDS.indexOf(info.kind) >= 0 )
      {
        out = true;
      }
    });

    return out;
  }.property('model.stacks.@each.externalId'),

  hasHosts: function() {
    return (this.get('model.hosts.length') > 0);
  }.property('model.hosts.length'),

  isReady: function() {
    return this.get('projects.isReady') && this.get('hasHosts');
  }.property('projects.isReady','hasHosts'),
});
