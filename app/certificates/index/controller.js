import Ember from 'ember';
import Sortable from 'ui/mixins/sortable';

export default Ember.Controller.extend(Sortable, {
  sortBy: 'name',
  sorts: {
    state:    ['combinedState','name','id'],
    name:     ['name','id'],
    fingerprint: ['certFingerprint','name','id'],
  },
});
