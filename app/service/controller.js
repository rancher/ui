import Ember from 'ember';
import Cattle from 'ui/utils/cattle';

var ServiceController = Cattle.TransitioningResourceController.extend({
  availableActions: function() {

    var a = this.get('actions');

    var choices = [
      { label: 'Purge',         icon: 'ss-tornado',          action: 'purge',        enabled: !!a.purge },
    ];

    return choices;
  }.property('actions.{remove,purge}'),
});

ServiceController.reopenClass({
  stateMap: {
    'requested':        {icon: 'ss-tag',            color: 'text-danger'},
    'registering':      {icon: 'ss-tag',            color: 'text-danger'},
    'activating':       {icon: 'ss-tag',            color: 'text-danger'},
    'active':           {icon: 'ss-layergroup',     color: 'text-success'},
    'deactivating':     {icon: 'ss-down',           color: 'text-danger'},
    'inactive':         {icon: 'fa fa-circle',      color: 'text-danger'},
    'removing':         {icon: 'ss-trash',          color: 'text-danger'},
    'removed':          {icon: 'ss-trash',          color: 'text-danger'},
  }
});

export default ServiceController;
