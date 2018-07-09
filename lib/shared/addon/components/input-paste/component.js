import TextField from '@ember/component/text-field';
import IntlPlaceholder from 'shared/mixins/intl-placeholder';
import layout from './template';

export default TextField.extend(IntlPlaceholder, {
  layout,
  _onPaste:         null,
  didInsertElement() {

    this._super();

    this.set('_onPaste', this.handlePaste.bind(this));
    this.$().on('paste', this.get('_onPaste'));

  },

  willDestroyElement() {

    this.$().off('paste', this.get('_onPaste'));
    this._super();

  },

  handlePaste(event) {

    var e = event.originalEvent;

    if ( e && e.clipboardData && e.clipboardData.getData && e.clipboardData.types) {

      if ( e.clipboardData.types.includes('text/plain') ) {

        var text = e.clipboardData.getData('text/plain');

        if ( text ) {

          e.stopPropagation();
          e.preventDefault();
          this.sendAction('pasted', text, event.target);

          return false;

        }

      }

      return true;

    }

  }
});
