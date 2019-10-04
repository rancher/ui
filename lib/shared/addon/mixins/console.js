import $ from 'jquery';
import { inject as controller } from '@ember/controller';
import Mixin from '@ember/object/mixin';
import { on } from '@ember/object/evented';

export default Mixin.create({
  application: controller(),
  queryParams: ['podId', 'kubernetes', 'windows', 'containerName'],
  instanceId:  null,
  model:       null,

  bootstrap: on('init', function() {
    if (this.get('application.isPopup')) {
      $('body').css('overflow', 'hidden');
    }
  }),

  actions: {
    cancel() {
      window.close();
    }
  }
});
