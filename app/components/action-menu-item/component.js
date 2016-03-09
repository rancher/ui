import Ember from 'ember';
import { isAlternate } from 'ui/utils/platform';

export default Ember.Component.extend({
  icon              : 'icon-help',
  label             : '',
  prefix            : null,
  enabled           : true,
  actionArg         : null,
  altActionArg      : null,

  tagName           : 'a',
  classNameBindings : ['enabled::hide'],
  attributeBindings: ['href'],
  href: "#",

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

  willRender: function() {
    var icon = this.get('icon');

    if ( icon.indexOf('icon-') === -1 )
    {
      this.set('prefix', 'icon icon-fw');
    }
  },


  iconChanged: function() {
    this.rerender();
  }.observes('icon'),
});
