import Ember from 'ember';

export default Ember.Component.extend({
  tagName: '',
  expand(item) {
    item.toggleProperty('expanded');
  },

});
