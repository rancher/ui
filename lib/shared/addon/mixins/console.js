import $ from 'jquery';
import { inject as controller } from '@ember/controller';
import Mixin from '@ember/object/mixin';

export default Mixin.create({
  application: controller(),
  queryParams: ['podId', 'kubernetes', 'windows', 'containerName'],
  instanceId:  null,
  model:       null,

  bootstrap: function() {
    if (this.get('application.isPopup')) {
      $('body').css('overflow', 'hidden');
    }
  }.on('init'),

  actions: {
    cancel() {
      window.close();
    }
  }
});
