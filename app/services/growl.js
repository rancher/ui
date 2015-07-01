import Ember from 'ember';
import ApiError from 'ember-api-store/models/error';

export default Ember.Service.extend({
  init: function() {
    $.jGrowl.defaults.pool = 6;
    $.jGrowl.defaults.closeTemplate = '<i class="ss-delete"></i>';
    $.jGrowl.defaults.closerTemplate = '<div><button type="button" class="btn btn-info btn-xs btn-block">Hide All Notifications</button></div>';
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
    // @TODO centralize all this with other places that do error handling...
    var body;
    if ( typeof err === 'string' )
    {
      body = err;
    }
    else if ( err instanceof ApiError )
    {
      if ( err.get('status') === 422 )
      {
        body = 'Validation failed:';
        var something = false;
        if ( err.get('fieldName') )
        {
          body += ' ' + err.get('fieldName');
          something = true;
        }

        if ( err.get('detail') )
        {
          body += ' (' + err.get('detail') + ')';
          something = true;
        }

        if ( !something )
        {
          body += ' (' + err.get('code') + ')';
        }

        switch ( err.get('code') )
        {
          case 'NotUnique':
            body += ' is not unique'; break;
        }
      }
      else
      {
        var str = err.get('message');
        if ( err.get('detail') )
        {
          str += ' (' + err.get('detail') + ')';
        }

        this.set('errors', [str]);
      }
    }
    else if ( typeof err === 'object' )
    {
      if ( err.message )
      {
        body = err.message;
        if ( err.detail )
        {
          body += ' (' + err.detail + ')';
        }
      }
      else if ( err.detail )
      {
        body = err.detail;
      }
    }
    else
    {
      // Good luck...
      body = err;
    }

    this.error(title,body);
  },
});
