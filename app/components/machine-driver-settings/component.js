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
    state:    ['state',    'name', 'id'],
    name:     ['name',     'id'],
    url:      ['url',      'name', 'id'],
    uiUrl:    ['uiUrl',    'name', 'id'],
    checksum: ['checksum', 'name', 'id'],
  },

  model: null,

  actions: {
    addNewDriver: function() {
      this.set('model', this.get('userStore').createRecord({
        type        : 'machineDriver',
        name        : null,
        description : null,
        checksum    : null,
        url         : null,
      }));

      this.get('application').setProperties({
        editMachineDriver: true,
        originalModel: this.get('model'),
      });
    },

    deleteDriver: function(driver) {
      driver.doAction('remove').then(( /*response*/ ) => {}, ( /*error*/ ) => {});
    },
  },
});
