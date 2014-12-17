import Overlay from '../../../views/overlay';

export default Overlay.extend({
  templateName: 'container/console',

  ctrlAltDeleteDisabled: true,

  status: 'Connecting...',
  socket: null,
  term: null,

  actions: {
    overlayClose: function() {
      this.get('controller').send('cancel');
    },

    ctrlAltDelete: function() {
    }
  },

  didInsertElement: function() {
    var self = this;
    this._super();

    var url = this.get('context.url') +'?token='+ encodeURIComponent(this.get('context.token'));
    var socket = new WebSocket(url);
    this.set('socket', socket);

    socket.onopen = function() {
      self.set('status','Initializing...');

      var term = new Terminal({
        cols: 80,
        rows: 24,
        useStyle: true,
        screenKeys: true,
        cursorBlink: false
      });
      self.set('term', term);

      term.on('data', function(data) {
        //console.log('To Server:',data);
        socket.send(btoa(data));
      });

      term.open(self.$('.console-body')[0]);

      socket.onmessage = function(message) {
        self.set('status','Connected');
        //console.log('From Server:',message);
        term.write(atob(message.data));
      };

      socket.onclose = function() {
        self.set('status','Closed');
        term.destroy();
        self.send('overlayClose');
      };
    };
  },

  willDestroyElement: function() {
    this.set('status','Closed');

    var term = this.get('term');
    if (term)
    {
      term.destroy();
      this.set('term', null);
    }

    var socket = this.get('socket');
    if (socket)
    {
      socket.close();
      this.set('socket', null);
    }
  }
});
