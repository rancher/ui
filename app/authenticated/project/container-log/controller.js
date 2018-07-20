import $ from 'jquery';
import Controller from '@ember/controller';
import Console from 'ui/mixins/console';

export default Controller.extend(Console, {

  bootstrap: function() {
    let body        = $('body');
    let application = $('#application');

    body.css('overflow', 'hidden');

    application.css('padding-bottom', '0');
  }.on('init'),

});
