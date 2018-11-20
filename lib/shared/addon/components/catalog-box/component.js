import Component from '@ember/component';
import layout from './template';
import { inject as service } from '@ember/service'

export default Component.extend({
  settings:          service(),
  layout,
  tagName:           'div',

  classNames:        ['catalog-box', 'p-0'],
  classNameBindings: ['active::inactive', 'model.certifiedClass'],

  model:             null,
  showIcon:          true,
  showSource:        false,
  showDescription:   true,
  active:            true,
  srcSet:            false,

  didRender() {
    if (!this.get('srcSet')) {
      this.set('srcSet', true);
      var $icon = this.$('.catalog-icon > img');

      $icon.attr('src', $icon.data('src'));
      this.$('img').on('error', () => {
        $icon.attr('src', `${ this.get('app.baseAssets') }assets/images/generic-catalog.svg`);
      });
    }
  }
});
