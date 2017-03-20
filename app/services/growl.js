import Ember from 'ember';
import Errors from 'ui/utils/errors';

export default Ember.Service.extend({
  init: function() {
    $.jGrowl.defaults.pool = 6;
    $.jGrowl.defaults.closeTemplate = '<i class="icon icon-x"></i>';
    $.jGrowl.defaults.closerTemplate = '<div><button type="button" class="btn bg-info btn-xs btn-block">Dismiss All Notifications</button></div>';
  },

  raw: function(title, body, opt) {
    opt = opt || {};

    if ( title )
    {
      opt.header = title;
    }

    return $.jGrowl(body, opt);
  },

  success: function(title, body) {
    this.raw(title, body, {
      theme: 'success'
    });
  },

  message: function(title, body) {
    this.raw(title, body, {
      theme: 'message'
    });
  },

  error: function(title, body) {
    this.raw(title, body, {
      sticky: true,
      theme: 'error'
    });
  },

  fromError: function(title, err) {
    var body = Errors.stringify(err);
    this.error(title,body);
  },
});
