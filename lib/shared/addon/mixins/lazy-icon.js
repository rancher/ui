import Mixin from '@ember/object/mixin';
import { set, get } from '@ember/object';
import $ from 'jquery';

export default Mixin.create({
  srcSet:            false,
  genericIconPath: null,

  init() {
    this._super(...arguments);

    set(this, 'genericIconPath', `${ get(this, 'app.baseAssets') }assets/images/generic-catalog.svg`);
  },

  initAppIcon() {
    if (!get(this, 'srcSet')) {
      set(this, 'srcSet', true);

      var $icon = $('.catalog-icon > img');
      const $srcPath = $icon.attr('src');

      if ($srcPath === this.genericIconPath) {
        $icon.attr('src', $icon.data('src'));

        $('img').on('error', () => {
          if ( this.isDestroyed || this.isDestroying ) {
            if ($('img')) {
              $('img').off('error');
            }

            return;
          }

          $icon.attr('src', this.genericIconPath);
        });
      }
    }
  },
});
