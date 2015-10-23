import Ember from 'ember';
import NewOrEdit from 'ui/mixins/new-or-edit';

export default Ember.Component.extend(NewOrEdit, {
  service: null,
  existing: null,
  allServices: null,

  targetResources: null,
  targetsArray: null,

  primaryResource: Ember.computed.alias('service'),

  actions: {
    setTargets(array, resources) {
      this.set('targetsArray', array);
      this.set('targetResources', resources);
    },

    done() {
      this.sendAction('done');
    },

    cancel() {
      this.sendAction('cancel');
    },
  },

  didInitAttrs() {
    this.set('targetsArray',[]);
    this.set('targetResources',[]);
  },

  didInsertElement() {
    this.$('INPUT')[0].focus();
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

  doneSaving() {
    this.send('done');
  },
});
