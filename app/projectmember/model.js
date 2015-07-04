import Ember from 'ember';
import Resource from 'ember-api-store/models/resource';
import C from 'ui/utils/constants';

var ProjectMember = Resource.extend({
  isRancher: Ember.computed.equal('externalIdType', C.PROJECT.TYPE_RANCHER),
  isUser: Ember.computed.equal('externalIdType', C.PROJECT.TYPE_USER),
  isTeam: Ember.computed.equal('externalIdType', C.PROJECT.TYPE_TEAM),
  isOrg: Ember.computed.equal('externalIdType', C.PROJECT.TYPE_ORG),

  isMyRancher: function() {
    return this.get('externalIdType') === C.PROJECT.TYPE_RANCHER && 
      this.get('externalId') === this.get('session').get(C.SESSION.ACCOUNT_ID);
  }.property('{externalId,externalIdType}'),

  githubType: function() {
    switch ( this.get('externalIdType') )
    {
      case C.PROJECT.TYPE_USER:     return 'user';
      case C.PROJECT.TYPE_TEAM:     return 'team';
      case C.PROJECT.TYPE_ORG:      return 'org';
      case C.PROJECT.TYPE_RANCHER:  return null;
    }
  }.property('externalIdType'),

  displayType: function() {
    switch ( this.get('externalIdType') )
    {
      case C.PROJECT.TYPE_USER:     return 'User';
      case C.PROJECT.TYPE_TEAM:     return 'Team';
      case C.PROJECT.TYPE_ORG:      return 'Organization';
      case C.PROJECT.TYPE_RANCHER:  return 'Rancher Account';
    }

    return '?';
  }.property('externalIdType'),
});

export default ProjectMember;
