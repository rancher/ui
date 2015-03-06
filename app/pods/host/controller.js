import Ember from 'ember';
import Cattle from 'ui/utils/cattle';

var HostController = Cattle.TransitioningResourceController.extend({
  actions: {
    activate: function() {
      return this.doAction('activate');
    },

    deactivate: function() {
      return this.doAction('deactivate');
    },

    delete: function() {
      var machine = this.get('machine');
      if ( machine )
      {
        return machine.delete();
      }
      else
      {
        return this.delete();
      }
    },

    purge: function() {
      return this.doAction('purge');
    },

    promptDelete: function() {
      this.transitionToRoute('host.delete', this.get('id'));
    },

    newContainer: function() {
      this.transitionToRoute('containers.new', {queryParams: {hostId: this.get('id')}});
    },

    detail: function() {
      this.transitionToRoute('host', this.get('id'));
    },
  },

  availableActions: function() {
    var a = this.get('actions');

    return [
//      { label: 'Add Container', icon: 'ss-plus',      action: 'newContainer', enabled: true,            color: 'text-primary' },
      { label: 'View in API',   icon: 'fa fa-external-link', action: 'goToApi',      enabled: true},
      { label: 'Activate',      icon: 'ss-play',      action: 'activate',     enabled: !!a.activate,    color: 'text-success'},
      { label: 'Deactivate',    icon: 'ss-pause',     action: 'deactivate',   enabled: !!a.deactivate,  color: 'text-danger'},
      { label: 'Delete',        icon: 'ss-trash',     action: 'promptDelete', enabled: !!a.remove, altAction: 'delete', color: 'text-warning' },
      { label: 'Purge',         icon: 'ss-tornado',   action: 'purge',        enabled: !!a.purge, color: 'text-danger' },
    ];
  }.property('actions.{activate,deactivate,remove,purge}'),

  displayIp: function() {
    var obj = (this.get('ipAddresses')||[]).get('firstObject');
    if ( obj )
    {
      return obj.get('address');
    }
    else if ( this && this.hasLink && this.hasLink('ipAddresses') )
    {
      this.importLink('ipAddresses');
    }

    return null;
  }.property('ipAddresses','ipAddresses.[]'),

  arrangedInstances: function() {
    return Ember.ArrayController.create({
      content: this.get('instances'),
      sortProperties: ['name','id']
    });
  }.property('instances.[]','instances.@each.{name,id}'),

  machine: function() {
    var phid = this.get('physicalHostId');
    if ( !phid )
    {
      return null;
    }

    var machine = this.get('store').getById('machine', phid);
    return machine;
  }.property('physicalHostId'),

  osBlurb: function() {
    if ( this.get('info.osInfo') )
    {
      return this.get('info.osInfo.distribution') + ' ' + this.get('info.osInfo.version');
    }
  }.property('info.osInfo.{distribution,version}'),

  cpuBlurb: function() {
    if ( this.get('info.cpuInfo') )
    {
      var ghz = Math.round(this.get('info.cpuInfo.mhz')/10)/100;

      if ( this.get('info.cpuInfo.count') > 1 )
      {
        return this.get('info.cpuInfo.count')+'x' + ghz + ' GHz';
      }
      else
      {
        return ghz + ' GHz';
      }
    }
  }.property('info.cpuInfo.{count,mhz}'),

  memoryBlurb: function() {
    if ( this.get('info.memoryInfo') )
    {
      var gb = Math.round((this.get('info.memoryInfo.memTotal')/1024)*100)/100;

      return gb + ' GiB';
    }
  }.property('info.memoryInfo.memTotal'),

  diskBlurb: function() {
    if ( this.get('info.diskInfo') )
    {
      var totalMb = 0;
      var mounts = this.get('info.diskInfo.mountPoints');
      Object.keys(mounts).forEach((mountPoint) => {
        totalMb += mounts[mountPoint].total;
      });

      var gb = Math.round((totalMb/1024)*10)/10;
      return gb + ' GiB';
    }
  }.property('info.diskInfo.mountPoints.@each.total'),
});

HostController.reopenClass({
  stateMap: {
    'requested':        {icon: 'ss-tag',            color: 'text-danger'},
    'registering':      {icon: 'ss-tag',            color: 'text-danger'},
    'activating':       {icon: 'ss-tag',            color: 'text-danger'},
    'active':           {icon: 'ss-desktop',        color: 'text-success'},
    'reconnecting':     {icon: 'fa fa-cog fa-spin', color: 'text-danger'},
    'updating-active':  {icon: 'ss-desktop',        color: 'text-success'},
    'updating-inactive':{icon: 'ss-alert',          color: 'text-danger'},
    'deactivating':     {icon: 'ss-down',           color: 'text-danger'},
    'inactive':         {icon: 'fa fa-circle',      color: 'text-danger'},
    'removing':         {icon: 'ss-trash',          color: 'text-danger'},
    'removed':          {icon: 'ss-trash',          color: 'text-danger'},
    'purging':          {icon: 'ss-tornado',        color: 'text-danger'},
    'purged':           {icon: 'ss-tornado',        color: 'text-danger'},
    'restoring':        {icon: 'ss-medicalcross',   color: 'text-danger'},
  }
});

export default HostController;
