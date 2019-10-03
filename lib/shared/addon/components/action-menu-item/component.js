import Component from '@ember/component';
import layout from './template';
import { inject as service } from '@ember/service'
import C from 'shared/utils/constants';
import { isAlternate } from 'shared/utils/platform';
import { observer } from '@ember/object';

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


  iconChanged: observer('icon', function() {
    this.rerender();
  }),

  click(event) {
    let actionArg = null;

    if ( isAlternate(event) && this.get('altActionArg')) {
      actionArg = this.get('altActionArg');
    } else {
      actionArg = this.get('actionArg');
    }

    if (this.action) {
      this.action(actionArg);
    }
  },

  keyPress(event) {
    if ( [C.KEY.CR, C.KEY.LF].indexOf(event.which) >= 0 ) {
      this.click(event);
      this.get('resourceActions').hide();
    }
  },

});
