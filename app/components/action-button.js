import Ember from 'ember';

export default Ember.Component.extend({
  icon: 'fa-square',
  tooltip: '',
  enabled: true,

  tagName: 'button',
  type: 'button',
  classNames: ['btn','btn-link'],
  classNameBindings: ['enabled::hide'],
  attributeBindings: ['tooltip'],

  click : function(event) {
    if ( event.altKey )
    {
      this.sendAction('altAction');
    }
    else
    {
      this.sendAction();
    }
  },

  render: function(buffer) {
    buffer.push('<i class="fa '+ this.get('icon') +'"></i>');
  },

  iconChanged: function() {
    this.rerender();
  }.observes('icon'),
});
