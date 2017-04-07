import Ember from 'ember';
import { isGecko } from 'ui/utils/platform';
import IntlPlaceholder from 'ui/mixins/intl-placeholder';

export default Ember.TextArea.extend(IntlPlaceholder, {
  intl: Ember.inject.service(),

  minHeight: 0,
  curHeight: null,
  maxHeight: 200,

  tagName: 'textarea',
  classNames: ['no-resize','no-ease'],

  didInsertElement() {
    Ember.run.scheduleOnce('afterRender', this, 'initHeights');
  },

  initHeights() {
    if ( this.get('minHeight') === 0 ) {
      this.set('minHeight', ( this.get('isSmall') ? 31 : 36));
    }

    this.autoSize();

    this.$().on('paste', () => {
      Ember.run.later(this, 'autoSize', 100);
    });
  },

  changed: function() {
    Ember.run.debounce(this,'autoSize',100);
  }.observes('value'),

  isSmall: function() {
    if ( this.isDestroyed || this.isDestroying ) {
      return;
    }

    return this.$().hasClass('input-sm');
  }.property(),

  autoSize() {
    if ( this.isDestroyed || this.isDestroying ) {
      return;
    }

    let el = this.element;
    let $el = $(el);

    Ember.run(() => {
      $el.css('height', '1px');

      let border = parseInt($el.css('borderTopWidth'),10)||0 + parseInt($el.css('borderBottomWidth'),10)||0;
      let magic = (this.get('isSmall') ? -2 : 0) + ( isGecko ? 1 : 2); // Sigh, but it's wrong without magic fudge
      let neu = Math.max(this.get('minHeight'), Math.min(el.scrollHeight + border + magic, this.get('maxHeight')));

      $el.css('overflowY', (el.scrollHeight > neu ? 'auto' : 'hidden'));
      $el.css('height', neu + 'px');
      this.set('curHeight', neu);
    });
  }
});
