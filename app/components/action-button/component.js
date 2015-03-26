import Ember from 'ember';

export default Ember.Component.extend({
  icon: 'ss-help',
  tooltip: '',
  enabled: true,
  actionArg: null,
  altActionArg: null,

  tagName: 'button',
  type: 'button',
  classNames: ['btn','btn-link'],
  classNameBindings: ['enabled::hide'],
  attributeBindings: ['tooltip'],

  click : function(event) {
    if ( event.altKey && this.get('altActionArg'))
    {
      this.sendAction('action', this.get('altActionArg'));
    }
    else
    {
      this.sendAction('action', this.get('actionArg'));
    }
  },

  render: function(buffer) {
    buffer.push('<i class="'+ this.get('icon') + '"></i>');
  },

  iconChanged: function() {
    this.rerender();
  }.observes('icon'),
});
