import Ember from 'ember';
import { alternateLabel } from 'ui/utils/platform';
import ThrottledResize from 'ui/mixins/throttled-resize';
import Terminal from 'npm:xterm';
import { proposeGeometry } from 'ui/utils/xterm-fit-addon';

const DEFAULT_COMMAND = ["/bin/sh","-c",'TERM=xterm-256color; export TERM; [ -x /bin/bash ] && ([ -x /usr/bin/script ] && /usr/bin/script -q -c "/bin/bash" /dev/null || exec /bin/bash) || exec /bin/sh'];

export default Ember.Component.extend(ThrottledResize, {
  instance: null,
  command: null,
  cols: 80,
  rows: 24,
  alternateLabel: alternateLabel,
  showProtip: true,
  contenteditable: false,

  status: 'connecting',
  error: null,
  socket: null,
  term: null,

  actions: {
    contextMenuHandler() {
      // fix for no paste button in firefox context menu on Windows
      this.set('contenteditable', true);
      setTimeout(()=> {
        this.set('contenteditable', false);
      }, 20);
    }
  },

  fit() {
    var term = this.get('term');
    var socket = this.get('socket');
    if (term && socket)
    {
      var geometry = proposeGeometry(term);
      socket.send(`:resizeTTY:${geometry.cols},${geometry.rows}`);
      term.resize(geometry.cols, geometry.rows);
    }
  },

  onResize: function () {
    this.fit();
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
        useStyle: true,
        screenKeys: true,
        cursorBlink: false
      });
      this.set('term', term);

      term.on('data', function(data) {
        //console.log('To Server:',data);
        socket.send(AWS.util.base64.encode(data));
      });

      term.open(this.$('.shell-body')[0]);
      this.fit();
      socket.onmessage = (message) => {
        this.set('status','connected');
        this.sendAction('connected');
        //console.log('From Server:',message.data);
        term.write(AWS.util.base64.decode(message.data).toString());
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
