import Ember from 'ember';
import SelectTab from 'ui/mixins/select-tab';

export default Ember.Component.extend(SelectTab, {
  tagName    : 'section',
  initialTab : '',
  didRender: function() {
    this.send('selectTab', this.get('initialTab'));
  }
});
