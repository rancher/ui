import Ember from 'ember';
import C from 'ui/utils/constants';

export default Ember.Controller.extend({
  filteredContent: Ember.computed('', function() {
    return this.get('model');
  }),
});
