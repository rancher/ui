import TextArea from '@ember/component/text-area';
import { inject as service } from '@ember/service'
import { run } from '@ember/runloop'
import { computed, get, observer } from '@ember/object';

import { isGecko } from 'ui/utils/platform';
import IntlPlaceholder from 'shared/mixins/intl-placeholder';
import $ from 'jquery';

export default TextArea.extend(IntlPlaceholder, {
  intl: service(),

  minHeight: 0,
  curHeight: null,
  maxHeight: 200,

  tagName:           'textarea',
  classNames:        ['no-resize', 'no-ease'],
  attributeBindings: ['spellcheck'],
  classNameBindings: ['bg'],

  didInsertElement() {
    run.scheduleOnce('afterRender', this, 'initHeights');
  },

  changed: observer('value', function() {
    run.debounce(this, 'autoSize', 100);
  }),

  bg: computed('disabled', function() {
    if ( get(this, 'disabled') ) {
      return 'bg-disabled'
    }
  }),

  isSmall: computed(function() {
    if ( this.isDestroyed || this.isDestroying ) {
      return;
    }

    return $().hasClass('input-sm');
  }),

  initHeights() {
    if ( this.get('minHeight') === 0 ) {
      this.set('minHeight', ( this.get('isSmall') ? 31 : 36));
    }

    this.autoSize();

    $().on('paste', () => {
      run.later(this, 'autoSize', 100);
    });
  },

  autoSize() {
    if ( this.isDestroyed || this.isDestroying ) {
      return;
    }

    let el = this.element;
    let $el = $(el); // eslint-disable-line

    run(() => {
      $el.css('height', '1px');

      let border = parseInt($el.css('borderTopWidth'), 10) || 0 + parseInt($el.css('borderBottomWidth'), 10) || 0;
      let magic = (this.get('isSmall') ? -2 : 0) + ( isGecko ? 1 : 2); // Sigh, but it's wrong without magic fudge
      let neu = Math.max(this.get('minHeight'), Math.min(el.scrollHeight + border + magic, this.get('maxHeight')));

      $el.css('overflowY', (el.scrollHeight > neu ? 'auto' : 'hidden'));
      $el.css('height', `${ neu  }px`);
      this.set('curHeight', neu);
    });
  }
});
