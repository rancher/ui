import Ember from 'ember';
import Resource from 'ember-api-store/models/resource';

var Registry = Resource.extend({
  type: 'registry',
  serverAddress: null,

  displayName: Ember.computed.alias('displayAddress'),

  displayAddress: function() {
    var address = this.get('serverAddress').toLowerCase();
    if ( address === 'index.docker.io' )
    {
      return 'DockerHub';
    }
    else if ( address === 'quay.io' )
    {
      return 'Quay';
    }
    else
    {
      return address;
    }
  }.property('serverAddress'),

  credential: function() {
    var credentials = this.get('credentials');
    if ( credentials )
    {
      return credentials.objectAt(credentials.get('length')-1);
    }

  }.property('credentials.@each.{publicValue,email}'),
});

Registry.reopenClass({
  alwaysInclude: ['credentials'],

  stateMap: {
    'active':     {icon: 'ss-record',     color: 'text-success'},
    'inactive':   {icon: 'fa fa-circle',  color: 'text-danger'},
    'purged':     {icon: 'ss-tornado',    color: 'text-danger'},
    'removed':    {icon: 'ss-trash',      color: 'text-danger'},
    'requested':  {icon: 'ss-tag',        color: 'text-info'},
  }
});

export default Registry;
