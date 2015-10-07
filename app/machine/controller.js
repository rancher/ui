import Ember from 'ember';
import DownloadMachineConfig from 'ui/mixins/download-machine-config';
import CattleTransitioningController from 'ui/mixins/cattle-transitioning-controller';

export default Ember.Controller.extend(CattleTransitioningController, DownloadMachineConfig, {
  actions: {
    clone: function() {
      this.get('controllers.application').transitionToRoute('hosts.new.'+this.get('model.driver'), {queryParams: {machineId: this.get('model.id')}});
    },
  },

  availableActions: function() {
    var a = this.get('model.actionLinks')||{};

    var out = [
      { label: 'Delete', icon: 'icon icon-trash', action: 'promptDelete', enabled: !!a.remove, altAction: 'delete', color: 'text-warning' },
      { divider: true },
    ];

    if ( this.hasLink('config') )
    {
      out.push({ label: 'Machine Config', icon: 'icon icon-download', action: 'machineConfig', enabled: true});
    }

    out.push({ label: 'View in API', icon: 'icon icon-externallink', action: 'goToApi', enabled: true});

    return out;
  }.property('model.actionLinks.remove', 'model.links.config'),
});
