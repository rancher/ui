import { inject as service } from '@ember/service';
import Component from '@ember/component';
import layout from './template';
import { set } from '@ember/object';

export default Component.extend({
  scope:         service(),
  layout,
  classNames:    ['namespace-app'],
  srcSet:        false,
  latestVersion: null,

  didRender() {
    this.initAppIcon();
  },

  initAppIcon() {
    if (!this.get('srcSet')) {
      set(this, 'srcSet', true);

      const $icon = this.$('.catalog-icon > img');

      $icon.attr('src', $icon.data('src'));

      this.$('img').on('error', () => {
        $icon.attr('src', `${ this.get('app.baseAssets') }assets/images/generic-catalog.svg`);
      });
    }
  },
});
