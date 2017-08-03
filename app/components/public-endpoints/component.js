import Ember from 'ember';

export default Ember.Component.extend({
  model: null,
  showTarget: false,

  headers: function() {
    let out = [
      {
        name: 'displayEndpoint',
        sort: ['displayEndpoint','publicPort'],
        translationKey: 'publicEndpoints.endpoint',
      },
      {
        name: 'bindIpAddress',
        sort: ['bindIpAddress','publicPort'],
        translationKey: 'publicEndpoints.bindIpAddress',
      },
      {
        name: 'publicPort',
        sort: ['publicPort','service.id','instance.id'],
        translationKey: 'publicEndpoints.publicPort',
      },
      {
        name: 'target',
        sort: ['target.displayName','target.id'],
        searchField: 'target.displayName',
        translationKey: 'publicEndpoints.target',
      },
      {
        name: 'privatePort',
        sort: ['privatePort','target.displayName'],
        translationKey: 'publicEndpoints.privatePort',
      },
    ];

    if ( !this.get('showTarget') ) {
      out = out.filter((x) => {
        return x.name !== 'target';
      });
    }

    return out;
  }.property('showTarget'),
});
