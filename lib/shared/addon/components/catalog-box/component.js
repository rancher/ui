import Component from '@ember/component';
import layout from './template';
import { inject as service } from '@ember/service'
import { set, get } from '@ember/object';

export default Component.extend({
  settings:          service(),
  router:            service(),
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
  genericIconPath:   null,

  init() {
    this._super(...arguments);

    set(this, 'genericIconPath', `${ get(this, 'app.baseAssets') }assets/images/generic-catalog.svg`);
  },

  didRender() {
    if (!get(this, 'srcSet')) {
      set(this, 'srcSet', true);

      var $icon = this.$('.catalog-icon > img');
      const $srcPath = $icon.attr('src');

      if ($srcPath === this.genericIconPath) {
        $icon.attr('src', $icon.data('src'));

        this.$('img').on('error', () => {
          if ( this.isDestroyed || this.isDestroying ) {
            if (this.$('img')) {
              this.$('img').off('error');
            }

            return;
          }

          $icon.attr('src', this.genericIconPath);
        });
      }
    }
  },
});
