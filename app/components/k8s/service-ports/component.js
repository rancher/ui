import Ember from 'ember';
import Sortable from 'ui/mixins/sortable';

export default Ember.Component.extend(Sortable, {
  model: null,
  sortBy: 'port',
  sorts: {
    name: ['name'],
    port: ['port'],
    targetPort: ['targetPort','port'],
    protocol: ['protocol','port'],
  },
});
