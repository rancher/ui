import { or, equal, alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import ManageLabels from 'shared/mixins/manage-labels';
import GroupedInstances from 'shared/mixins/grouped-instances';
import layout from './template';

export default Component.extend(ManageLabels, GroupedInstances, {
  layout,
  settings: service(),
  prefs: service(),

  model: null,
  mode: null,

  classNames: ['pod','host'],
  showLabelRow: or('model.displayUserLabelStrings.length','model.requireAnyLabelStrings.length'),

  init() {
    this._super(...arguments);

    this.initLabels(this.get('model.labels'));
  },

  actions: {
    newContainer() {
      this.sendAction('newContainer', this.get('model.id'));
    },
  },

  shouldUpdateLabels: function() {
    this.initLabels(this.get('model.labels'));
  }.observes('model.labels'),

  filteredInstances: function() {
    let out = this.get('model.instances')||[];
    //out = out.filterBy('isRemoved', false);

    return out;
  }.property('model.instances.@each.isSystem'),

  arrangedInstances: function() {
    return this.get('filteredInstances').sortBy('name','id');
  }.property('filteredInstances.@each.{name,id}'),

  isActive: equal('model.state','active'),
  isProvisioning: equal('model.state','provisioning'),
  isError: equal('model.state','error'),
  showAdd: alias('isActive'),
  showOnlyMessage: or('isProvisioning','isError'),

  stateBackground: function() {
    return this.get('model.stateColor').replace("text-");
  }.property('model.stateColor'),

});
