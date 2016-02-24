import Ember from 'ember';

const DEFAULT_COMMAND = ["/bin/sh","-c",'TERM=xterm-256color; export TERM; [ -x /bin/bash ] && ([ -x /usr/bin/script ] && /usr/bin/script -q -c "/bin/bash" /dev/null || exec /bin/bash) || exec /bin/sh'];

export default Ember.Component.extend({
  originalModel: null,
  instance: Ember.computed.alias('originalModel'),
  command: null, // defaults to DEFAULT_COMMAND
  showHeader: true,
  showClose: true,

  status: 'Connecting...',
  socket: null,
  term: null,

  actions: {
    outsideClick: function() {},

    cancel: function() {
      this.disconnect();
      this.sendAction('dismiss');
    }
  },

  didInsertElement: function() {
    this._super();
    Ember.run.next(this, 'exec');
  },

  exec: function() {
    var instance = this.get('instance');
    var opt = {
      attachStdin: true,
      attachStdout: true,
      tty: true,
      command: this.get('command') || DEFAULT_COMMAND,
    };

    instance.doAction('execute',opt).then((exec) => {
      exec.set('instance', instance);
      this.connect(exec);
    }).catch((err) => {
      this.set('status', 'Error:', err);
    });
  },

  connect: function(exec) {
    var url = exec.get('url') +'?token='+ encodeURIComponent(exec.get('token'));
    var socket = new WebSocket(url);
    this.set('socket', socket);

    socket.onopen = () => {
      this.set('status','Initializing...');

      var term = new Terminal({
        cols: 80,
        rows: 24,
        useStyle: true,
        screenKeys: true,
        cursorBlink: false
      });
      this.set('term', term);

      term.on('data', function(data) {
        //console.log('To Server:',data);
        socket.send(btoa(data));
      });

      term.open(this.$('.shell-body')[0]);

      socket.onmessage = (message) => {
        this.set('status','Connected');
        //console.log('From Server:',message);
        term.write(atob(message.data));
      };

      socket.onclose = () => {
        try {
          this.set('status','Closed');
          term.destroy();
          if ( !this.get('userClosed') )
          {
            this.sendAction('dismiss');
          }
        } catch (e) {
        }
      };
    };
  },

  disconnect: function() {
    this.set('status','Closed');
    this.set('userClosed',true);

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
  },

  willDestroyElement: function() {
    this.disconnect();
    this._super();
  }
});
