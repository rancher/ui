import $ from 'jquery';
import Controller from '@ember/controller';
import { on } from '@ember/object/evented';
import Console from 'ui/mixins/console';

export default Controller.extend(Console, {

  bootstrap: on('init', () => {
    let body        = $('body');
    let application = $('#application');

    body.css('overflow', 'hidden');

    application.css('padding-bottom', '0');
  }),

});
