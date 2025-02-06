import { equal } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import Resource from 'ember-api-store/models/resource';
import C from 'ui/utils/constants';
import { computed } from '@ember/object'
import Identicon from 'identicon.js';

var Principal = Resource.extend({
  intl: service(),

  isUser: equal('parsedExternalType', C.PROJECT.TYPE_USER),
  isTeam: equal('parsedExternalType', C.PROJECT.TYPE_TEAM),
  isOrg:  equal('parsedExternalType', C.PROJECT.TYPE_ORG),

  parsedExternalType: computed('id', function() {
    return this.id.split(':')
      .get('firstObject');
  }),

  avatarSrc: computed('isGithub', 'isGoogleOauth', 'id', 'profilePicture', function() {
    if ( (this.isGithub && this.profilePicture) || (this.isGoogleOauth && this.profilePicture) ) {
      return this.profilePicture;
    } else {
      let id = this.id || 'Unknown';

      id = id.replace('local://', '');

      return `data:image/png;base64,${ new Identicon(AWS.util.crypto.md5(id, 'hex'), 80, 0.01).toString() }`;
    }
  }),

  isGithub: computed('parsedExternalType', 'provider', function() {
    // console.log('is github?', get(this, 'provider'));
    return (this.provider || '').toLowerCase() === 'github';
  }),

  isGoogleOauth: computed('parsedExternalType', 'provider', function() {
    return (this.provider || '').toLowerCase() === 'googleoauth';
  }),

  logicalType: computed('parsedExternalType', function() {
    switch ( this.parsedExternalType ) {
    case C.PROJECT.TYPE_ACTIVE_DIRECTORY_USER:
    case C.PROJECT.TYPE_ADFS_USER:
    case C.PROJECT.TYPE_AZURE_USER:
    case C.PROJECT.TYPE_FREEIPA_USER:
    case C.PROJECT.TYPE_GITHUB_USER:
    case C.PROJECT.TYPE_GOOGLE_USER:
    case C.PROJECT.TYPE_KEYCLOAK_USER:
    case C.PROJECT.TYPE_LDAP_USER:
    case C.PROJECT.TYPE_OPENLDAP_USER:
    case C.PROJECT.TYPE_PING_USER:
    case C.PROJECT.TYPE_RANCHER:
    case C.PROJECT.TYPE_SHIBBOLETH_USER:
    case C.PROJECT.TYPE_OKTA_USER:
    default:
      return C.PROJECT.PERSON;
    case C.PROJECT.TYPE_GITHUB_TEAM:
      return C.PROJECT.TEAM;
    case C.PROJECT.TYPE_ACTIVE_DIRECTORY_GROUP:
    case C.PROJECT.TYPE_ADFS_GROUP:
    case C.PROJECT.TYPE_AZURE_GROUP:
    case C.PROJECT.TYPE_FREEIPA_GROUP:
    case C.PROJECT.TYPE_GITHUB_ORG:
    case C.PROJECT.TYPE_KEYCLOAK_GROUP:
    case C.PROJECT.TYPE_LDAP_GROUP:
    case C.PROJECT.TYPE_OPENLDAP_GROUP:
    case C.PROJECT.TYPE_PING_GROUP:
    case C.PROJECT.TYPE_SHIBBOLETH_GROUP:
    case C.PROJECT.TYPE_GOOGLE_GROUP:
    case C.PROJECT.TYPE_OKTA_GROUP:
      return C.PROJECT.ORG;
    }
  }),

  logicalTypeSort: computed('logicalType', function() {
    switch (this.logicalType ) {
    case C.PROJECT.ORG: return 1;
    case C.PROJECT.TEAM: return 2;
    case C.PROJECT.PERSON: return 3;
    default: return 4;
    }
  }),

  displayType: computed('parsedExternalType', 'intl.locale', function() {
    let key = 'model.identity.displayType.unknown';
    let type = this.parsedExternalType;

    switch ( type ) {
    case C.PROJECT.TYPE_ACTIVE_DIRECTORY_USER:
    case C.PROJECT.TYPE_ADFS_USER:
    case C.PROJECT.TYPE_OKTA_USER:
    case C.PROJECT.TYPE_AZURE_USER:
    case C.PROJECT.TYPE_FREEIPA_USER:
    case C.PROJECT.TYPE_GITHUB_USER:
    case C.PROJECT.TYPE_GOOGLE_USER:
    case C.PROJECT.TYPE_KEYCLOAK_USER:
    case C.PROJECT.TYPE_LDAP_USER:
    case C.PROJECT.TYPE_OPENLDAP_USER:
    case C.PROJECT.TYPE_PING_USER:
    case C.PROJECT.TYPE_SHIBBOLETH_USER:
      key = 'model.identity.displayType.user';
      break;

    case C.PROJECT.TYPE_ACTIVE_DIRECTORY_GROUP:
    case C.PROJECT.TYPE_ADFS_GROUP:
    case C.PROJECT.TYPE_OKTA_GROUP:
    case C.PROJECT.TYPE_AZURE_GROUP:
    case C.PROJECT.TYPE_FREEIPA_GROUP:
    case C.PROJECT.TYPE_KEYCLOAK_GROUP:
    case C.PROJECT.TYPE_LDAP_GROUP:
    case C.PROJECT.TYPE_OPENLDAP_GROUP:
    case C.PROJECT.TYPE_PING_GROUP:
    case C.PROJECT.TYPE_SHIBBOLETH_GROUP:
    case C.PROJECT.TYPE_GOOGLE_GROUP:
      key = 'model.identity.displayType.group';
      break;

    case C.PROJECT.TYPE_GITHUB_TEAM:
      key = 'model.identity.displayType.team';
      break;

    case C.PROJECT.TYPE_GITHUB_ORG:
      key = 'model.identity.displayType.org';
      break;

    case C.PROJECT.TYPE_RANCHER:
      key = 'model.identity.displayType.localUser';
      break;
    }

    return this.intl.t(key, { type });
  }),
});

Principal.reopenClass({
  mangleIn(data/* , store */) {
    if ( data.displayName ) {
      // set to name then delete
      data.name = data.displayName;
      delete data.displayName;
    }

    return data;
  },
});

export default Principal;
