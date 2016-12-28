import Ember from 'ember';
import NewOrEdit from 'ui/mixins/new-or-edit';


export default Ember.Mixin.create(NewOrEdit, {
  service         : null,
  existing        : null,
  targetResources : null,
  targetsArray    : null,
  primaryResource : Ember.computed.alias('service'),

  init() {
    this._super(...arguments);

    this.set('targetsArray',[]);
    this.set('targetResources',[]);
  },
  actions: {
    setTargets(array, resources) {
      this.set('targetsArray', array);
      this.set('targetResources', resources);
    },
  },
  // ----------------------------------
  // Save
  // ----------------------------------

  didSave() {
    // Set balancer targets
    return this.get('service').doAction('setservicelinks', {
      serviceLinks: this.get('targetResources'),
    });
  },


});
