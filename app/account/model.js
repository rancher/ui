import Resource from 'ember-api-store/models/resource';
import PolledResource from 'ui/mixins/cattle-polled-resource';
import C from 'ui/utils/constants';

var Account = Resource.extend(PolledResource, {
  type: 'account',

  username: function() {
    var cred = this.get('passwordCredential');
    if ( cred && cred.get('state') === 'active' )
    {
      return cred.get('publicValue');
    }
    else
    {
      return null;
    }
  }.property('passwordCredential.{state,publicValue}'),

  passwordCredential: function() {
    return (this.get('credentials')||[]).filterProperty('kind','password')[0];
  }.property('credentials.@each.kind'),

  apiKeys: function() {
    return (this.get('credentials')||[]).filterProperty('kind','apiKey');
  }.property('credentials.@each.kind')
});

Account.reopenClass({
  alwaysInclude: ['credentials'],
  pollTransitioningDelay: 1000,
  pollTransitioningInterval: 5000,

  headers: {
    [C.HEADER.PROJECT]: undefined, // Requests for projects use the user's scope, not the project
  },
});

export default Account;
