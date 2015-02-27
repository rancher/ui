import Ember from 'ember';
import { isAlternate } from 'ui/utils/platform';

export default Ember.Component.extend({
  icon: 'ss-help',
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
    buffer.push('<i class="fa-fw '+ this.get('icon') + '"></i> ' + this.get('label'));
  },

  iconChanged: function() {
    this.rerender();
  }.observes('icon'),
});
