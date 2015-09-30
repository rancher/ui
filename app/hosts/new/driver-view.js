import Ember from 'ember';
import { addAction } from 'ui/utils/add-view-action';

export default Ember.View.extend({
  actions: {
    addLabel: addAction('addLabel', '.label-key'),
  },

  didInsertElement: function() {
    this._super();
    Ember.run.next(() => {
      try {
        var input = this.$('INPUT')[0];
        if ( input )
        {
          input.focus();
        }
      }
      catch(e) {
      }
    });
  },
});
