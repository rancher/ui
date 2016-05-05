import Ember from 'ember';
import { isGecko } from 'ui/utils/platform';

export default Ember.TextArea.extend({
  intl: Ember.inject.service(),

  minHeight: 0,
  maxHeight: 200,

  tagName: 'textarea',
  classNames: ['no-resize'],
  attributeBindings: ['i18nPlaceholder:placeholder'],

  i18nPlaceholder: function() {
    return this.get('intl').t(this.get('placeholder'));
  }.property('placeholder','intl._locale'),

  didInsertElement() {
    if ( this.get('minHeight') === 0 ) {
      this.set('minHeight', ( this.get('isSmall') ? 31 : 43));
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
    if ( this._state === 'destroying' ) {
      return;
    }

    return this.$().hasClass('input-sm');
  }.property(),

  autoSize() {
    if ( this._state === 'destroying' ) {
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
    });
  }
});
