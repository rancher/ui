import Component from '@ember/component';

export default Component.extend({
  actions: {
    test() {
      this.sendAction('test')
    },
  },
});
