import Ember from 'ember';
import Sortable from 'ui/mixins/sortable';

export default Ember.Component.extend(Sortable, {
  tagName: 'table',
  classNames: ['grid', 'fixed', 'table', 'table-hover'],
});
