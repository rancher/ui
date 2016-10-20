import Ember from 'ember';
import ManageLabels from 'ui/mixins/manage-labels';
import GroupedInstances from 'ui/mixins/grouped-instances';
import C from 'ui/utils/constants';

export default Ember.Component.extend(ManageLabels, GroupedInstances, {
  model             : null,
  mode              : null,
  show              : null,

  classNames        : ['pod','host'],

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

    if ( this.get('show') !== 'all' ) {
      out = out.filter((inst) => {
        let labels = inst.get('labels');
        return !labels || !labels[C.LABEL.SYSTEM_TYPE];
      });
    }

    return out;
  }.property('model.instances.@each.labels','show'),

  arrangedInstances: function() {
    return this.get('filteredInstances').sortBy('name','id');
  }.property('filteredInstances.@each.{name,id}'),

  isActive: Ember.computed.equal('model.state','active'),
  isProvisioning: Ember.computed.equal('model.state','provisioning'),
  isError: Ember.computed.equal('model.state','error'),
  showAdd: Ember.computed.alias('isActive'),
  showOnlyMessage: Ember.computed.or('isProvisioning','isError'),

  stateBackground: function() {
    return this.get('model.stateColor').replace("text-","bg-");
  }.property('model.stateColor'),

});
