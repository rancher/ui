import Ember from 'ember';
import SelectTab from 'ui/mixins/select-tab';

export default Ember.Component.extend(SelectTab, {
  model: null,

  tagName: null,

  didInsertElement() {
    this.send('selectTab','command');
    this.$("INPUT[type='text']")[0].focus();
  },
});
