import Ember from 'ember';
import Environment from 'ui/models/environment';
import FilteredSortedArrayProxy from 'ui/utils/filtered-sorted-array-proxy';
import C from 'ui/utils/constants';

var ComposeProject = Environment.extend({
  type: 'composeProject',

  availableActions: function() {
    var a = this.get('actionLinks');

    var out = [
      { label   : 'Edit',            icon : 'icon icon-edit',             action : 'edit',                enabled  : true },
      { label   : 'Delete',          icon : 'icon icon-trash',            action : 'promptDelete',        enabled  : !!a.remove,                altAction : 'delete', color : 'text-warning' },
      { label   : 'View in API',     icon : 'icon icon-external-link',    action : 'goToApi',             enabled  : true },
    ];

    return out;
  }.property('actionLinks.{remove}'),

  unremovedServices: function() {
    var proxy = FilteredSortedArrayProxy.create({
      sourceContent: this.get('store').reallyAll('composeservice'),
      dependentKeys: ['sourceContent.@each.state','sourceContent.@each.environmentId'],
      filterFn: function(item) {
        return Ember.get(item,'environmentId') === this.get('id') &&
               C.REMOVEDISH_STATES.indexOf((Ember.get(item,'state')||'').toLowerCase()) === -1;
      }.bind(this),
    });

    return proxy;
  }.property('services'),

  grouping: 'swarm',
});

export default ComposeProject;
