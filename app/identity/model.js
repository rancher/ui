import Ember from 'ember';
import Resource from 'ember-api-store/models/resource';
import C from 'ui/utils/constants';

var Identity = Resource.extend({
  isUser: Ember.computed.equal('externalIdType', C.PROJECT.TYPE_USER),
  isTeam: Ember.computed.equal('externalIdType', C.PROJECT.TYPE_TEAM),
  isOrg: Ember.computed.equal('externalIdType', C.PROJECT.TYPE_ORG),

  isMyRancher: function() {
    return this.get('externalIdType') === C.PROJECT.TYPE_RANCHER &&
      this.get('externalId') === this.get('session').get(C.SESSION.ACCOUNT_ID);
  }.property('{externalId,externalIdType}'),

  logicalType: function() {
    switch ( this.get('externalIdType') )
    {
      case C.PROJECT.TYPE_RANCHER:
      case C.PROJECT.TYPE_GITHUB_USER:
      case C.PROJECT.TYPE_LDAP_USER:
        return C.PROJECT.PERSON;

      case C.PROJECT.TYPE_GITHUB_TEAM:
        return C.PROJECT.TEAM;

      case C.PROJECT.TYPE_GITHUB_ORG:
      case C.PROJECT.TYPE_LDAP_GROUP:
        return C.PROJECT.ORG;
    }
  }.property('externalIdType'),

  logicalTypeSort: function() {
    switch (this.get('logicalType') )
    {
      case C.PROJECT.ORG: return 1;
      case C.PROJECT.TEAM: return 2;
      case C.PROJECT.PERSON: return 3;
      default: return 4;
    }
  }.property('logicalType'),

  displayType: function() {
    switch ( this.get('externalIdType') )
    {
      case C.PROJECT.TYPE_GITHUB_USER:
      case C.PROJECT.TYPE_LDAP_USER:  return 'User';

      case C.PROJECT.TYPE_GITHUB_TEAM:return 'Team';
      case C.PROJECT.TYPE_GITHUB_ORG: return 'Organization';
      case C.PROJECT.TYPE_LDAP_GROUP: return 'Group';
      case C.PROJECT.TYPE_RANCHER:    return 'Local User';
    }

    return this.get('externalIdType')+'?';
  }.property('externalIdType'),
});

export default Identity;
