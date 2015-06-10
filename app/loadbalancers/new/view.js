import Ember from 'ember';
import { addAction } from 'ui/utils/add-view-action';
import SelectTab from 'ui/mixins/select-tab';

export default Ember.View.extend(SelectTab, {
  actions: {
    addHost: addAction('addHost', '.lb-host'),
    addTargetContainer: addAction('addTargetContainer', '.lb-target'),
    addTargetIp: addAction('addTargetIp', '.lb-target'),
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

  useExistingDidChange: function() {
    if ( !this.get('context.isUseExisting') )
    {
      Ember.run.scheduleOnce('afterRender', this, function() {
        if ( !this.get('isDestroying') )
        {
          this.send('selectTab','listeners');
        }
      });
    }
  }.observes('context.isUseExisting')
});
