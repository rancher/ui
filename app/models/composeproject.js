import Ember from 'ember';
import Stack from 'ui/models/stack';
import FilteredSortedArrayProxy from 'ui/utils/filtered-sorted-array-proxy';
import C from 'ui/utils/constants';

var ComposeProject = Stack.extend({
  type: 'composeProject',

  availableActions: function() {
    var a = this.get('actionLinks');

    var out = [
      { label   : 'action.edit',       icon : 'icon icon-edit',           action : 'edit',          enabled  : true },
      { label   : 'action.remove',     icon : 'icon icon-trash',          action : 'promptDelete',  enabled  : !!a.remove, altAction : 'delete'},
      { label   : 'action.viewInApi',  icon : 'icon icon-external-link',  action : 'goToApi',       enabled  : true },
    ];

    return out;
  }.property('actionLinks.{remove}'),

  unremovedServices: function() {
    var proxy = FilteredSortedArrayProxy.create({
      sourceContent: this.get('store').all('composeservice'),
      dependentKeys: ['sourceContent.@each.state','sourceContent.@each.stackId'],
      filterFn: function(item) {
        return Ember.get(item,'stackId') === this.get('id') &&
               C.REMOVEDISH_STATES.indexOf((Ember.get(item,'state')||'').toLowerCase()) === -1;
      }.bind(this),
    });

    return proxy;
  }.property('services'),

  grouping: 'swarm',
});

export default ComposeProject;
