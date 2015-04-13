import Ember from 'ember';
import C from 'ui/utils/constants';

export default Ember.View.extend({
  classNames: ['overlay'],

  didInsertElement: function() {
    this._super();

    var input = this.$('INPUT')[0];
    if ( input )
    {
      input.focus();
    }
    else
    {
      this.$().attr('tabindex',0);
      this.$().focus();
    }
  },

  willAnimateIn: function() {
    this.$().hide();
  },

  animateIn: function(done) {
    $('#underlay').removeClass('hide').fadeIn({duration: 200, queue: false});
    this.$().slideDown({duration: 200, queue: false, easing: 'linear', complete: done});
  },

  animateOut: function(done) {
    $('#underlay').fadeOut({duration: 200, queue: false});
    this.$().slideUp({duration: 200, queue: false, easing: 'linear', complete: done});
  },

  keyDown: function(event) {
    if ( event.which === C.KEY_ESCAPE ) // Escape
    {
      this.send('overlayClose');
    }
    else if ( event.which === C.KEY_CR || event.which === C.KEY_LF ) // Enter
    {
      // Ignore enters on links and in textareas
      if ( ['A','BUTTON','TEXTAREA'].indexOf(event.target.tagName) >= 0 )
      {
        return true;
      }
      else
      {
        this.send('overlayEnter');
      }
    }
    else
    {
      return true;
    }
  },

  actions: {
    overlayClose: function() {
      // Override me
      try {
        this.get('controller').send('cancel');
      } catch(e) {
      }
    },

    overlayEnter: function() {
      // Override me
      try {
        this.get('controller').send('save');
      } catch(e) {
      }
    }
  }
});
