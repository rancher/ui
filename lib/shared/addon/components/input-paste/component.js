import Ember from 'ember';
import IntlPlaceholder from 'ui/mixins/intl-placeholder';

export default Ember.TextField.extend(IntlPlaceholder, {
  _onPaste: null,
  didInsertElement: function() {
    this._super();

    this.set('_onPaste', this.handlePaste.bind(this));
    this.$().on('paste', this.get('_onPaste'));
  },

  willDestroyElement: function() {
    this.$().off('paste', this.get('_onPaste'));
    this._super();
  },

  handlePaste: function(event) {
    var e = event.originalEvent;
    if ( e && e.clipboardData && e.clipboardData.getData && e.clipboardData.types)
    {
      if ( e.clipboardData.types.includes('text/plain') )
      {
        var text = e.clipboardData.getData('text/plain');
        if ( text )
        {
          e.stopPropagation();
          e.preventDefault();
          this.sendAction('pasted',text, event.target);
          return false;
        }
      }

      return true;
    }
  }
});
