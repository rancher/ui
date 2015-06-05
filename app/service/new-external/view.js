import Ember from 'ember';
import { addAction } from 'ui/utils/add-view-action';

export default Ember.View.extend({
  actions: {
    addTargetIp: addAction('addTargetIp', '.lb-target'),
  },

  didInsertElement: function() {
    this._super();
    $('BODY').addClass('white');
    this.$('INPUT')[0].focus();
  },

  willDestroyElement: function() {
    $('BODY').removeClass('white');
  },
});
