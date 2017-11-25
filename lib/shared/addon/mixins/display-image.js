import Mixin from '@ember/object/mixin';
import { computed, get } from '@ember/object';
import { inject as service } from "@ember/service";

export default Mixin.create({
  intl: service(),

  displayImage: computed('containers', function() {
    const containers = get(this, 'containers');
    const names = Object.keys(containers);

    if ( names.length > 1  ) {
      return get(this,'intl').t('pagination.image', {pages: 1, count: names.length});
    } else {
      return get(containers[names[0]], 'image');
    }
  }),
});
