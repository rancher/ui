import Cattle from 'ui/utils/cattle';

var HostController = Cattle.TransitioningResourceController.extend({
  actions: {
    activate:   function() { return this.doAction('activate'); },
    deactivate: function() { return this.doAction('deactivate'); },
    delete:     function() { return this.delete(); },
    purge:      function() { return this.doAction('purge'); },

    promptDelete: function() {
      this.transitionToRoute('host.delete', this.get('model'));
    },
  },

  displayIp: function() {
    var obj = (this.get('ipAddresses')||[]).get('firstObject');
    if ( obj )
    {
      return obj.get('address');
    }

    return null;
  }.property('ipAddresses','ipAddresses.[]')
});

HostController.reopenClass({
  stateMap: {
    'requested':        {icon: 'fa-ticket',      color: 'text-danger'},
    'registering':      {icon: 'fa-ticket',      color: 'text-danger'},
    'activating':       {icon: 'fa-ticket',      color: 'text-danger'},
    'active':           {icon: 'fa-circle-o',    color: 'text-info'},
    'reconnecting':     {icon: 'fa-cog fa-spin', color: 'text-danger'},
    'updating-active':  {icon: 'fa-circle-o',    color: 'text-info'},
    'updating-inactive':{icon: 'fa-warning',     color: 'text-danger'},
    'deactivating':     {icon: 'fa-adjust',      color: 'text-danger'},
    'inactive':         {icon: 'fa-circle',      color: 'text-danger'},
    'removing':         {icon: 'fa-trash',       color: 'text-danger'},
    'removed':          {icon: 'fa-trash',       color: 'text-danger'},
    'purging':          {icon: 'fa-fire',        color: 'text-danger'},
    'purged':           {icon: 'fa-fire',        color: 'text-danger'},
    'restoring':        {icon: 'fa-trash',       color: 'text-danger'},
  }
});

export default HostController;
