import Ember from 'ember';
import { isAlternate } from 'ui/utils/platform';

export default Ember.Component.extend({
  icon: 'icon-help',
  label: '',
  enabled: true,
  actionArg: null,
  altActionArg: null,

  tagName: 'a',
  classNameBindings: ['enabled::hide'],

  click : function(event) {
    if ( isAlternate(event) && this.get('altActionArg'))
    {
      this.sendAction('action', this.get('altActionArg'));
    }
    else
    {
      this.sendAction('action', this.get('actionArg'));
    }
  },

  render: function(buffer) {
    var icon = this.get('icon');
    var prefix;
    if ( icon.indexOf('fa-') === -1 )
    {
      prefix = 'icon icon-fw';
    }
    else
    {
      prefix = 'fa fa-fw';
    }
    buffer.push(`<i class="${prefix} ${icon}"></i> ${this.get('label')}`);
  },

  iconChanged: function() {
    this.rerender();
  }.observes('icon'),
});
