import $ from 'jquery';
import { schedule } from '@ember/runloop';
import Controller from '@ember/controller';

export default Controller.extend({
  bootstrap: function() {
    schedule('afterRender', this, () => {
      $('#loading-overlay').hide();
      $('#loading-underlay').hide();
    });
  }.on('init')
});
