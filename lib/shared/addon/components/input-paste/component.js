import TextField from '@ember/component/text-field';
import IntlPlaceholder from 'shared/mixins/intl-placeholder';
import { get } from '@ember/object';
import layout from './template';
import $ from 'jquery';

export default TextField.extend(IntlPlaceholder, {
  layout,

  separators: null,

  _onPaste:  null,

  didInsertElement() {
    this._super();

    this.set('_onPaste', this.handlePaste.bind(this));
    $(this.element).on('paste', get(this, '_onPaste'));
  },

  willDestroyElement() {
    $(this.element).off('paste', get(this, '_onPaste'));
    this._super();
  },

  handlePaste(event) {
    var e = event.originalEvent;
    const separators = get(this, 'separators');

    if ( e && e.clipboardData && e.clipboardData.getData && e.clipboardData.types) {
      if ( e.clipboardData.types.includes('text/plain') ) {
        var text = e.clipboardData.getData('text/plain');
        let hasSeparator = true;

        if ( text && separators ) {
          hasSeparator = separators.some((separator) => text.indexOf(separator) > -1);
        }

        if ( text && hasSeparator ) {
          e.stopPropagation();
          e.preventDefault();

          this.pasted(text, event.target);

          return false;
        }
      }

      return true;
    }
  },

  pasted() {
    throw new Error('pasted action is required!');
  }
});
