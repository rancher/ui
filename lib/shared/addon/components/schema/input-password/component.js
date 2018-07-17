import Component from '@ember/component';
import Util from 'ui/utils/util';
import layout from './template';

export default Component.extend({
  layout,
  classNames: ['input-group'],
  value:      '',

  actions: {
    generate() {
      this.set('value', Util.randomStr(16, 'password'));

      var $field = this.$('INPUT');

      $field.attr('type', 'text');
      setTimeout(() => {
        $field[0].focus();
        $field[0].select();
      }, 50);

      this.sendAction('generated');
    }
  }

});
