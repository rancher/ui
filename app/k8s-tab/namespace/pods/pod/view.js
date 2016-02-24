import Ember from 'ember';
import SelectTab from 'ui/mixins/select-tab';

export default Ember.View.extend(SelectTab, {
  didInsertElement() {
    this.send('selectTab', 'containers');
  },
});
