import Ember from 'ember';
import C from 'ui/utils/constants';
import Resource from 'ember-api-store/models/resource';

var machineDriver = Resource.extend({
  type: 'machineDriver',
  displayURI: Ember.computed('uri', function() {
    let uri    = this.get('uri');
    let uriOut = uri.split('/');
    let out    = null;

    if (uri.indexOf('github')) {
      out = `.../${uriOut[uriOut.length-2]}/${uriOut[uriOut.length-1]}`;
    } else {
      out = uri;
    }
    return out;
  }),

  displayChecksum: Ember.computed('md5checksum', function() {
    let checksum = this.get('md5checksum');

    if (!checksum) {
      checksum = 'Not Provided';
    }

    return checksum;
  }),

  availableActions: function() {
    var a = this.get('actionLinks');

    return [
      { label: 'Retry',         icon: 'icon icon-refresh',      action: 'retry',        enabled: !!a.retry },
      { label: 'Delete',        icon: 'icon icon-trash',        action: 'promptDelete', enabled: !!a.remove, altAction: 'delete' },
      { divider: true },
      { label: 'View in API',   icon: 'icon icon-external-link',action: 'goToApi',      enabled: true },
      { divider: true },
    ];
  }.property('actionLinks.{update,activate,deactivate,restore,remove,purge}'),

});

machineDriver.reopenClass({
  headers: {
    [C.HEADER.PROJECT]: undefined, // Requests for projects use the user's scope, not the project
  },
});

export default machineDriver;
