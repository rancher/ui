import NewAlias from 'ui/components/new-aliasservice/component';
import Ember from 'ember';

export default NewAlias.extend({
  existing: Ember.computed.alias('originalModel'),
  editing: true,

  service: null,

  actions: {
    done() {
      this.sendAction('dismiss');
    },

    cancel() {
      this.sendAction('dismiss');
    },
  },

  didInitAttrs() {
    var original = this.get('originalModel');
    this.set('service', original.clone());
  },
});
