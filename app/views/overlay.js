import Ember from 'ember';

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
    $('#underlay').fadeIn({duration: 200, queue: false});
    this.$().slideDown({duration: 200, queue: false, easing: 'linear', complete: done});
  },

  animateOut: function(done) {
    $('#underlay').fadeOut({duration: 200, queue: false});
    this.$().slideUp({duration: 200, queue: false, easing: 'linear', complete: done});
  },

  keyDown: function(event) {
    if ( event.keyCode === 27 ) // Escape
    {
      this.send('overlayClose');
    }
    else if ( event.keyCode === 13 || event.keyCode === 10 ) // Enter
    {
      // Ignore enters on links and in textareas
      if ( event.target.tagName === 'A' || event.target.tagName === 'TEXTAREA' )
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
    },

    overlayEnter: function() {
      // Override me
    }
  }
});
