import Component from '@ember/component';
import Util from 'ui/utils/util';
import { get, set } from '@ember/object';
import layout from './template';
import $ from 'jquery';

export default Component.extend({
  layout,
  classNames: ['input-group'],
  value:      '',
  question:   null,

  actions: {
    generate() {
      let randomStr;

      if ( get(this, 'question.maxLength') !== 0 && get(this, 'question.maxLength') >= get(this, 'question.minLength') && get(this, 'question.validChars.length') > 0 ) {
        randomStr = Util.randomStr(get(this, 'question.minLength'), get(this, 'question.maxLength'), get(this, 'question.validChars'));
      } else {
        randomStr = Util.randomStr(16, 16, 'password');
      }

      set(this, 'value', randomStr);

      var $field = $(this.element).find('INPUT');

      $field.attr('type', 'text');
      setTimeout(() => {
        $field[0].focus();
        $field[0].select();
      }, 50);

      if (this.generated) {
        this.generated();
      }
    }
  }

});
