import Ember from 'ember';
import Util from 'ui/utils/util';

export default Ember.Component.extend({
  classNames: ['input-group'],
  value: '',

  actions: {
    generate() {
      this.set('value', Util.randomStr(16,'password'));

      var $field = this.$('INPUT');
      $field.attr('type','text');
      setTimeout(function() {
        $field[0].focus();
        $field[0].select();
      }, 50);

      this.sendAction('generated');
    }
  }

});
