import Ember from 'ember';
import { alternateLabel } from 'ui/utils/platform';
import Terminal from 'npm:xterm';

const DEFAULT_COMMAND = ["/bin/sh","-c",'TERM=xterm-256color; export TERM; [ -x /bin/bash ] && ([ -x /usr/bin/script ] && /usr/bin/script -q -c "/bin/bash" /dev/null || exec /bin/bash) || exec /bin/sh'];

export default Ember.Component.extend({
  instance: null,
  command: null,
  cols: 80,
  rows: 24,
  alternateLabel: alternateLabel,
  showProtip: true,

  status: 'connecting',
  error: null,
  socket: null,
  term: null,

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

    if ( instance.hasAction('execute') ) {
      instance.doAction('execute',opt).then((exec) => {
        exec.set('instance', instance);
        this.connect(exec);
      }).catch((err) => {
        this.setProperties({
          status: 'error',
          error: err
        });
      });
    }
  },

  connect: function(exec) {
    var url = exec.get('url') +'?token='+ encodeURIComponent(exec.get('token'));
    var socket = new WebSocket(url);
    this.set('socket', socket);

    socket.onopen = () => {
      this.set('status','initializing');

      var term = new Terminal({
        cols: this.get('cols'),
        rows: this.get('rows'),
        useStyle: true,
        screenKeys: true,
        cursorBlink: false
      });
      this.set('term', term);

      term.on('data', function(data) {
        //console.log('To Server:',data);
        socket.send(btoa(unescape(encodeURIComponent(data))));// jshint ignore:line
      });

      term.open(this.$('.shell-body')[0]);

      socket.onmessage = (message) => {
        this.set('status','connected');
        this.sendAction('connected');
        //console.log('From Server:',message.data);
        term.write(decodeURIComponent(escape(atob(message.data))));// jshint ignore:line
      };

      socket.onclose = () => {
        try {
          this.set('status','closed');
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
    this.set('status','closed');
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

    this.sendAction('disconnected');
  },

  willDestroyElement: function() {
    this.disconnect();
    this._super();
  }
});
