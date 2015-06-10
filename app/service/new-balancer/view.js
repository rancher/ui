import Ember from 'ember';
import { addAction } from 'ui/utils/add-view-action';
import SelectTab from 'ui/mixins/select-tab';

export default Ember.View.extend(SelectTab, {
  actions: {
    addTargetService: addAction('addTargetService', '.lb-target'),
    addListener: addAction('addListener', '.lb-listener-source-port'),
  },

  didInsertElement: function() {
    $('BODY').addClass('white');
    this._super();
    this.send('selectTab',this.get('context.tab'));

    this.$('INPUT')[0].focus();
  },

  willDestroyElement: function() {
    $('BODY').removeClass('white');
  },
});
