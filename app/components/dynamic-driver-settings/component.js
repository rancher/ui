import Ember from 'ember';
import Sortable from 'ui/mixins/sortable';
import FilterState from 'ui/mixins/filter-state';

export default Ember.Component.extend(FilterState, Sortable, {
  drivers         : null,
  settings        : Ember.inject.service(),
  filterableContent : Ember.computed.alias('drivers'),
  sortableContent : Ember.computed.alias('filtered'),
  sortBy          : 'name',

  classNames      : ['machine-drivers'],
  sorts: {
    name: ['name', 'id'],
  },

  model: null,

  actions: {
    addNewDriver: function() {
      this.set('model', this.get('store').createRecord({
        type        : 'machineDriver',
        name        : null,
        description : null,
        md5         : null,
        uri         : null,
      }));
      this.get('application').setProperties({
        showNewDriver: true,
        originalModel: this.get('model'),
      });
    },

    deleteDriver: function(driver) {
      driver.doAction('remove').then(( /*response*/ ) => {}, ( /*error*/ ) => {});
    },
  },



});
