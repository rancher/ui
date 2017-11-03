import Ember from 'ember';

export default Ember.Component.extend({
  projects: Ember.inject.service(),
  classNames: ['stack-app'],
  srcSet: false,

  actions: {
    toggle() {
      // this.sendAction('toggle');
    },
  },
  didRender() {
    if (!this.get('srcSet')) {
      this.set('srcSet', true);
      var $icon = this.$('.catalog-icon > img');
      $icon.attr('src', $icon.data('src'));
      this.$('img').on('error', () => {
        $icon.attr('src', `${this.get('app.baseAssets')}assets/images/generic-catalog.svg`);
      });
    }
  }
});
