import Checkbox from '@ember/component/checkbox';
import TextArea from '@ember/component/text-area';
import TextField from '@ember/component/text-field';
import SafeStyle from 'ui/mixins/safe-style';

export function initialize(/* application */) {
  // Allow style to be bound on inputs
  TextField.reopen(SafeStyle);
  TextArea.reopen(SafeStyle);
  Checkbox.reopen(SafeStyle);

  // Disable iOS auto-capitalization
  //
  TextField.reopen({
    attributeBindings: ['autocapitalize', 'spellcheck', 'autocomplete'],
    autocomplete:      'off',
    autocapitalize:    'none',
  });
}

export default {
  name:       'extend-ember-input',
  initialize
};
