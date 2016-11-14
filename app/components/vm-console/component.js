import Ember from 'ember';
import parseUri from 'ui/utils/parse-uri';
import Util from 'ui/utils/util';

export default Ember.Component.extend({
  instance : null,

  status   : 'Connecting...',
  rfb      : null,
  rfbState : null,
  showProtip: true,

  actions: {
    outsideClick() {
    },

    cancel() {
      this.disconnect();
      this.sendAction('dismiss');
    },

    ctrlAltDelete() {
      this.get('rfb').sendCtrlAltDel();
    },
  },

  didInsertElement() {
    this._super();
    Ember.run.next(this, 'exec');
  },

  willDestroyElement() {
    this.disconnect();
    this._super();
  },


  exec() {
    var instance = this.get('instance');
    instance.doAction('console').then((exec) => {
      exec.set('instance', instance);
      this.connect(exec);
    }).catch((err) => {
      this.set('status', 'Error:', err);
    });
  },

  connect(exec) {
    var parts = parseUri(exec.get('url'));

    var self = this;
    function updateState(rfb, state, oldstate, msg) {
      if ( this.isDestroyed || this.isDestroying ) {
        return;
      }

      if (typeof msg !== 'undefined')
      {
        self.set('status', (msg+'').replace(/ \(unencrypted\)/,''));
      }

      self.set('rfbState', state);
    }

    var rfb = new NoVNC.RFB({
      target: this.$('.console-canvas')[0],
      encrypt: parts.protocol === 'wss',
      true_color: true,
      local_cursor: true,
      shared: true,
      view_only: false,
      onUpdateState: updateState,
      wsProtocols: ['binary'],
    });

    var path = Util.addQueryParam(parts.path.substr(1), 'token', exec.get('token'));

    rfb.connect(parts.host, parts.port, null, path);

    this.set('rfb', rfb);
  },

  rfbStateChanged: function() {
    if ( this.get('rfbState') === 'disconnected' && !this.get('userClosed') )
    {
      this.send('cancel');
    }

    if ( this.get('rfbState') === 'normal' )
    {
      var $body = this.$('.console-body');
      var width = $('CANVAS').width() + parseInt($body.css('padding-left'),10) + parseInt($body.css('padding-right'),10);
      console.log('set width', width);
      $body.width(width);
    }
  }.observes('rfbState'),

  disconnect() {
    this.set('status','Closed');
    this.set('userClosed',true);

    var rfb = this.get('rfb');
    if (rfb)
    {
      rfb.disconnect();
      this.set('rfb', null);
    }
  },

  ctrlAltDeleteDisabled: function() {
    return this.get('rfbState') !== 'normal';
  }.property('rfbState'),

});
