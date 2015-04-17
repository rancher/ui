import Cattle from 'ui/utils/cattle';
import DownloadMachineConfig from 'ui/mixins/download-machine-config';

var MachineController = Cattle.TransitioningResourceController.extend(DownloadMachineConfig,{
  availableActions: function() {
    var a = this.get('actions')||{};

    var out = [
      { label: 'Delete',        icon: 'ss-trash',     action: 'promptDelete', enabled: !!a.remove, altAction: 'delete', color: 'text-warning' },
      { divider: true },
    ];

    if ( this.get('links.config') )
    {
      out.push({ label: 'Machine Config',   icon: 'ss-download', action: 'machineConfig',      enabled: true});
    }

    out.push({ label: 'View in API',   icon: '',           action: 'goToApi',      enabled: true});

    return out;
  }.property('actions.remove'),
});

MachineController.reopenClass({
  stateMap: {
    'requested':      {icon: 'ss-tag',       color: 'text-success'},
    'creating':       {icon: 'ss-tag',       color: 'text-success'},
    'created':        {icon: 'ss-tag',       color: 'text-success'},
    'bootstrapping':  {icon: 'ss-tag',       color: 'text-success'},
    'active':         {icon: 'ss-tag',       color: 'text-success'},
    'removing':       {icon: 'ss-trash',     color: 'text-danger'},
    'removed':        {icon: 'ss-trash',     color: 'text-danger'},
    'updating':       {icon: 'ss-tag',       color: 'text-success'},
  }
});

export default MachineController;
