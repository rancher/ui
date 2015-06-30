import Resource from 'ember-api-store/models/resource';

var ApiKey = Resource.extend({
  type: 'apiKey',
  publicValue: null,
  secretValue: null,

  actions: {
    deactivate: function() {
      return this.doAction('deactivate');
    },

    activate: function() {
      return this.doAction('activate');
    },

    edit: function() {
      this.transitionToRoute('apikey.edit',this.get('model'));
    },
  },
});

ApiKey.reopenClass({
  pollTransitioningDelay: 1000,
  pollTransitioningInterval: 5000,

  stateMap: {
    'active':     {icon: 'ss-record',     color: 'text-success'},
    'inactive':   {icon: 'fa fa-circle',  color: 'text-danger'},
    'purged':     {icon: 'ss-tornado',    color: 'text-danger'},
    'removed':    {icon: 'ss-trash',      color: 'text-danger'},
    'requested':  {icon: 'ss-tag',        color: 'text-info'},
  }
});

export default ApiKey;
