import Ember from 'ember';
import { addAction } from 'ui/utils/add-view-action';

export default Ember.View.extend({
  actions: {
    addTargetService: addAction('addTargetService', '.lb-target'),
    addListener: addAction('addListener', '.lb-listener-source-port'),

    selectTab: function(name) {
      this.set('context.tab',name);
      this.$('.tab').removeClass('active');
      this.$('.tab[data-section="'+name+'"]').addClass('active');
      this.$('.section').addClass('hide');
      this.$('.section[data-section="'+name+'"]').removeClass('hide');
    }
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
