import Ember from 'ember';
import DownloadMachineConfig from 'ui/mixins/download-machine-config';
import CattleTransitioningController from 'ui/mixins/cattle-transitioning-controller';
import ReadLabels from 'ui/mixins/read-labels';

export default Ember.Controller.extend(CattleTransitioningController, DownloadMachineConfig, ReadLabels, {
  needs: ['application'],
  labelResource: Ember.computed.alias('model'),

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
      this.get('controllers.application').transitionToRoute('containers.new', {queryParams: {hostId: this.get('model.id')}});
    },

    clone: function() {
      var machine = this.get('model.machine');
      this.get('controllers.application').transitionToRoute('hosts.new.'+machine.get('driver'), {queryParams: {machineId: machine.get('id')}});
    },

    edit: function() {
      this.get('controllers.application').setProperties({
        editHost: true,
        originalModel: this.get('model'),
      });
    },
  },

  availableActions: function() {
    var a = this.get('model.actionLinks');

    var out = [
      { label: 'Activate',      icon: 'icon icon-play',         action: 'activate',     enabled: !!a.activate,    color: 'text-success'},
      { label: 'Deactivate',    icon: 'icon icon-pause',        action: 'deactivate',   enabled: !!a.deactivate,  color: 'text-danger'},
      { label: 'Delete',        icon: 'icon icon-trash',        action: 'promptDelete', enabled: !!a.remove, altAction: 'delete', color: 'text-warning' },
      { label: 'Purge',         icon: '',                       action: 'purge',        enabled: !!a.purge,       color: 'text-danger'},
      { divider: true },
      { label: 'View in API',   icon: 'icon icon-externallink', action: 'goToApi',      enabled: true},
    ];

    if ( this.get('model.machine') )
    {
      if ( this.get('model.machine.links.config') )
      {
        out.push({ label: 'Machine Config', icon: 'icon icon-download', action: 'machineConfig', enabled: true});
      }

      out.push({ label: 'Clone', icon: 'icon icon-copy', action: 'clone', enabled: true });
    }

    out.push({ label: 'Edit', icon: 'icon icon-edit', action: 'edit', enabled: !!a.update });

    return out;
  }.property('model.actionLinks.{activate,deactivate,remove,purge,update}','model.machine','model.machine.links.config'),

});
