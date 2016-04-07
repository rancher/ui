import Ember from 'ember';
import { isGecko } from 'ui/utils/platform';

export default Ember.TextArea.extend({
  tagName: 'textarea',
  text: null,
  classNames: [],
  paddingAndBorder: null,
  minHeight: 43,
  maxHeight: 200,

  didInsertElement() {
    this.autoSize();

    this.$().on('paste', () => {
      Ember.run.later(this, 'autoSize', 100);
    });
  },

  keyUp() {
    this.autoSize();
  },

  autoSize() {
    let el = this.element;
    let $el = $(el);

    Ember.run(() => {
      $el.css('height', '1px');

      let border = parseInt($el.css('borderTopWidth'),10)||0 + parseInt($el.css('borderBottomWidth'),10)||0;
      let magic = ( isGecko ? 1 : 2); // Sigh, but it's wrong without magic fudge
      let neu = Math.max(this.get('minHeight'), Math.min(el.scrollHeight + border + magic, this.get('maxHeight')));

      $el.css('overflowY', (el.scrollHeight > neu ? 'auto' : 'hidden'));
      $el.css('height', neu + 'px');
    });
  }
});
