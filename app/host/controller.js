import Ember from 'ember';
import Cattle from 'ui/utils/cattle';
import DownloadMachineConfig from 'ui/mixins/download-machine-config';

var HostController = Cattle.LegacyTransitioningResourceController.extend(DownloadMachineConfig, {
  actions: {
    activate: function() {
      return this.doAction('activate');
    },

    deactivate: function() {
      return this.doAction('deactivate');
    },

    purge: function() {
      return this.doAction('purge');
    },

    newContainer: function() {
      this.transitionToRoute('containers.new', {queryParams: {hostId: this.get('id')}});
    },

    detail: function() {
      this.transitionToRoute('host', this.get('id'));
    },

    clone: function() {
      var machine = this.get('machine');
      var driver = machine.get('driver');
      this.transitionToRoute('hosts.new.'+driver, {queryParams: {machineId: machine.get('id')}});
    },

    edit: function() {
      this.transitionToRoute('host.edit', this.get('id'));
    },
  },

  availableActions: function() {
    var a = this.get('actions');

    var out = [
//      { label: 'Add Container', icon: 'ss-plus',      action: 'newContainer', enabled: true,            color: 'text-primary' },
      { label: 'Activate',      icon: 'ss-play',      action: 'activate',     enabled: !!a.activate,    color: 'text-success'},
      { label: 'Deactivate',    icon: 'ss-pause',     action: 'deactivate',   enabled: !!a.deactivate,  color: 'text-danger'},
      { label: 'Delete',        icon: 'ss-trash',     action: 'promptDelete', enabled: !!a.remove, altAction: 'delete', color: 'text-warning' },
      { label: 'Purge',         icon: '',   action: 'purge',        enabled: !!a.purge, color: 'text-danger'},
      { divider: true },
      { label: 'View in API',   icon: '', action: 'goToApi',      enabled: true},
    ];

    if ( this.get('machine') )
    {
      if ( this.get('machine.links.config') )
      {
        out.push({ label: 'Machine Config',   icon: 'ss-download', action: 'machineConfig',      enabled: true});
      }

      out.push({ label: 'Clone',         icon: 'ss-copier',           action: 'clone',        enabled: true });
    }

    out.push({ label: 'Edit',          icon: 'ss-write',            action: 'edit',         enabled: !!a.update });

    return out;
  }.property('actions.{activate,deactivate,remove,purge,update}','machine','machine.links.config'),

  triedToGetIp: false,
  displayIp: function() {
    var obj = (this.get('ipAddresses')||[]).get('firstObject');
    if ( obj )
    {
      return obj.get('address');
    }
    else if ( this && this.hasLink && this.hasLink('ipAddresses') && !this.get('triedToGetIp'))
    {
      this.set('triedToGetIp',true);
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
    // @TODO this always sends back Ubuntu
    if ( false && this.get('info.osInfo') )
    {
      return this.get('info.osInfo.distribution') + ' ' + this.get('info.osInfo.version');
    }
  }.property('info.osInfo.{distribution,version}'),

  dockerBlurb: function() {
    // @TODO this always sends back Ubuntu
    if ( this.get('info.osInfo') )
    {
      return this.get('info.osInfo.dockerVersion').replace(/^Docker version\s*/i,'');
    }
  }.property('info.osInfo.{dockerVersion}'),

  cpuBlurb: function() {
    if ( this.get('info.cpuInfo.count') )
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
    if ( this.get('info.diskInfo.mountPoints') )
    {
      var totalMb = 0;
      var mounts = this.get('info.diskInfo.mountPoints')||[];
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
    'active':           {icon: 'ss-database',       color: 'text-success'},
    'reconnecting':     {icon: 'fa fa-circle-o-notch fa-spin', color: 'text-danger'},
    'updating-active':  {icon: 'ss-database',       color: 'text-success'},
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
