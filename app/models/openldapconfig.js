import C from 'ui/utils/constants';
import Resource from 'ember-api-store/models/resource';

var OpenLdapConfig = Resource.extend({
  type: 'openLdapConfig',
});

OpenLdapConfig.reopenClass({
  headers: {
    [C.HEADER.PROJECT]: undefined, // Requests for projects use the user's scope, not the project
  }
});

export default OpenLdapConfig;
