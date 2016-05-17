import Resource from 'ember-api-store/models/resource';
import PolledResource from 'ui/mixins/cattle-polled-resource';

const builtInUi = ['amazonec2','azure','digitalocean','exoscale','packet','rackspace','ubiquity','vmwarevsphere'];

function displayUrl(url) {
  let parts = url.split('/');
  let out    = null;

  if ( parts.length < 2 )
  {
    return url;
  }

  if (url.indexOf('github.com') >= 0) {
    out = `.../${parts[parts.length-2]}/${parts[parts.length-1]}`;
  } else {
    out = url;
  }
  return out;
}

var machineDriver = Resource.extend(PolledResource, {
  type: 'machineDriver',

  actions: {
    activate: function() {
      return this.doAction('activate');
    },

    deactivate: function() {
      return this.doAction('deactivate');
    },

    edit: function() {
      this.get('application').setProperties({
        editMachineDriver: true,
        originalModel: this,
      });
    },
  },

  displayUrl: function() {
    return displayUrl(this.get('url'));
  }.property('url'),

  displayUiUrl: function() {
    return displayUrl(this.get('uiUrl'));
  }.property('uiUrl'),

  hasBuiltInUi: function() {
    return builtInUi.indexOf(this.get('name')) >= 0;
  }.property('name'),

  hasUi: function() {
    return this.get('hasBuiltInUi') || !!this.get('uiUrl');
  }.property('hasBuiltInUi'),

  availableActions: function() {
    var a = this.get('actionLinks');

    return [
      { label: 'action.activate',    icon: 'icon icon-play',         action: 'activate',     enabled: !!a.activate},
      { label: 'action.deactivate',  icon: 'icon icon-pause',        action: 'deactivate',   enabled: !!a.deactivate},
      { label: 'action.edit',        icon: 'icon icon-edit',         action: 'edit',         enabled: !!a.update && !this.get('builtin') },
      { label: 'action.remove',      icon: 'icon icon-trash',        action: 'promptDelete', enabled: !!a.remove, altAction: 'delete'},
      { divider: true },
      { label: 'action.viewInApi',   icon: 'icon icon-external-link',action: 'goToApi',      enabled: true },
    ];
  }.property('actionLinks.{update,activate,deactivate,remove}','builtin'),

});

machineDriver.reopenClass({
  // Drivers don't get pushed by /subscribe WS, so refresh more often
  pollTransitioningDelay: 2000,
  pollTransitioningInterval: 1000,
  pollTransitioningIntervalMax: 60000,
  pollTransitioningIntervalFactor: 1.5,
});

export default machineDriver;
