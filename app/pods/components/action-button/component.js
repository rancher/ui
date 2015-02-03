import Ember from 'ember';

export default Ember.Component.extend({
  icon: 'fa-square',
  tooltip: '',
  color: '',
  colors: true,
  big: false,
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
    var color = null;
    if ( this.get('colors') )
    {
      color = this.get('color');
    }

    if ( this.get('big') )
    {
      buffer.push('<span class="fa-stack fa-lg">');
        buffer.push('<i class="fa fa-circle fa-stack-2x'+ (color ? ' ' + color : '') +'"></i>');
        buffer.push('<i class="fa fa-stack-1x fa-inverse '+ this.get('icon') +'"></i>');
      buffer.push('</span>');
    }
    else
    {
      buffer.push('<i class="fa '+ this.get('icon') + (color ? ' ' + color : '') + '"></i>');
    }
  },

  iconChanged: function() {
    this.rerender();
  }.observes('icon'),
});
