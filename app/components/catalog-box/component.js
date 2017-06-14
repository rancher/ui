import Ember from 'ember';

export default Ember.Component.extend({
  settings: Ember.inject.service(),
  tagName: 'div',

  classNames: ['catalog-box', 'box', 'p-0'],
  classNameBindings: ['active::inactive'],

  model: null,
  showIcon: true,
  showSource: false,
  showDescription: true,
  active: true,
  srcSet: false,

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
