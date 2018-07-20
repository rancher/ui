import Component from '@ember/component';
import layout from './template';
import { inject as service } from '@ember/service'
import C from 'shared/utils/constants';
import { isAlternate } from 'shared/utils/platform';

export default Component.extend({
  resourceActions: service('resource-actions'),
  layout,
  icon:            'icon-help',
  label:           '',
  prefix:          null,
  enabled:         true,
  actionArg:       null,
  altActionArg:    null,

  tagName:           'a',
  classNameBindings: ['enabled::hide'],
  attributeBindings: ['tabindex'],
  tabindex:          0,


  willRender() {
    var icon = this.get('icon');

    if ( icon.indexOf('icon-') === -1 ) {
      this.set('prefix', 'icon icon-fw');
    }
  },


  iconChanged: function() {
    this.rerender();
  }.observes('icon'),
  click(event) {
    if ( isAlternate(event) && this.get('altActionArg')) {
      this.sendAction('action', this.get('altActionArg'));
    } else {
      this.sendAction('action', this.get('actionArg'));
    }
  },

  keyPress(event) {
    if ( [C.KEY.CR, C.KEY.LF].indexOf(event.which) >= 0 ) {
      this.click(event);
      this.get('resourceActions').hide();
    }
  },

});
