import Service, { inject as service }from '@ember/service';
// @@TODO@@ - 10-27-17 - move errors to addon
import Errors from 'ui/utils/errors';

export default Service.extend({
  app: service(),
  init: function() {
    $.jGrowl.defaults.pool = 6;
    $.jGrowl.defaults.closeTemplate = '<i class="icon icon-x"></i>';
    $.jGrowl.defaults.closerTemplate = '<div><button type="button" class="btn bg-info btn-xs btn-block">Dismiss All Notifications</button></div>';
    this._super(...arguments);
  },

  close: function() {
    $("div.jGrowl").jGrowl("close"); // eslint-disable-line
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
    if ( !err && typeof title === 'object' ) {
      err = title;
      title = 'Error';
    }

    var body = Errors.stringify(err);
    this.error(title,body);
  },
});
