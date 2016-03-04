import Ember from 'ember';
import Console from 'ui/mixins/console';

export default Ember.Controller.extend(Console, {

  bootstrap: function() {
    let body        = Ember.$('body');
    let application = Ember.$('#application');

    body.css('overflow', 'hidden');

    application.css('padding-bottom', '0');

  }.on('init'),

});
