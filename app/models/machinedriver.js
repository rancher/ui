import Resource from 'ember-api-store/models/resource';
import PolledResource from 'ui/mixins/cattle-polled-resource';

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
    retry() {
      return this.doAction('retry');
    }
  },

  displayUrl: function() {
    return displayUrl(this.get('uri'));
  }.property('uri'),

  displayUiUrl: function() {
    return displayUrl(this.get('uiUrl'));
  }.property('uiUrl'),

  availableActions: function() {
    var a = this.get('actionLinks');

    return [
      { label: 'action.retry',         icon: 'icon icon-refresh',      action: 'retry',        enabled: !!a.retry },
      { label: 'action.remove',        icon: 'icon icon-trash',        action: 'promptDelete', enabled: !!a.remove, altAction: 'delete' },
      { divider: true },
      { label: 'action.viewInApi',   icon: 'icon icon-external-link',action: 'goToApi',      enabled: true },
      { divider: true },
    ];
  }.property('actionLinks.{update,activate,deactivate,restore,remove,purge}'),

});

machineDriver.reopenClass({
  // Drivers don't get pushed by /subscribe WS, so refresh more often
  pollTransitioningDelay: 1000,
  pollTransitioningInterval: 5000,
});

export default machineDriver;
