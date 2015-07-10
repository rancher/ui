import Ember from 'ember';
import ThrottledResize from 'ui/mixins/throttled-resize';
import Util from 'ui/utils/util';

var typeClass = {
  0: 'log-combined',
  1: 'log-stdout',
  2: 'log-stderr',
};

export default Ember.Component.extend(ThrottledResize, {
  originalModel: null,
  instance: Ember.computed.alias('originalModel'),

  status: 'Connecting...',
  socket: null,

  onlyCombinedLog: Ember.computed.alias('context.instance.tty'),
  which: 'combined',
  isCombined: Ember.computed.equal('which','combined'),
  isStdOut: Ember.computed.equal('which','stdout'),
  isStdErr: Ember.computed.equal('which','stderr'),

  stdErrVisible: true,
  stdOutVisible: true,

  actions: {
    outsideClick: function() {},

    cancel: function() {
      this.disconnect();
      this.sendAction('dismiss');
    },

    clear: function() {
      var body = this.$('.log-body')[0];
      body.innerHTML = '';
      body.scrollTop = 0;
    },

    scrollToTop: function() {
      this.$('.log-body').animate({ scrollTop: '0px'});
    },

    scrollToBottom: function() {
      var body = this.$('.log-body');
      body.stop().animate({ scrollTop: body[0].scrollHeight+'px'});
    },

    changeShow: function(which) {
      this.set('which',which);
      this.set('stdErrVisible', (which === 'combined' || which === 'stderr') );
      this.set('stdOutVisible', (which === 'combined' || which === 'stdout') );
      Ember.run.next(this, function() {
        this.send('scrollToBottom');
      });
    },
  },

  didInsertElement: function() {
    this._super();
    Ember.run.next(this, 'exec');
  },

  exec: function() {
    var instance = this.get('instance');
    var opt = {
      follow: true,
      lines: 500,
    };

    instance.doAction('logs',opt).then((logs) => {
      logs.set('instance', instance);
      this.connect(logs);
    });
  },

  connect: function(logs) {
    var url = logs.get('url') +'?token='+ encodeURIComponent(logs.get('token'));
    var socket = new WebSocket(url);
    this.set('socket', socket);

    var body = this.$('.log-body')[0];
    var $body = $(body);

    this.set('status','Initializing...');

    socket.onopen = () => {
      this.set('status','Connected');
    };

    socket.onmessage = (message) => {
      this.set('status','Connected');

      var isFollow = ($body.scrollTop() + $body.outerHeight() + 10) >= body.scrollHeight;

      //var framingVersion = message.data.substr(0,1); -- Always 0
      var type = parseInt(message.data.substr(1,1),10); // 0 = combined, 1 = stdout, 2 = stderr

      message.data.substr(2).trim().split(/\n/).forEach((line) => {
        var match = line.match(/^\[?([^ \]]+)\]?\s?/);
        var dateStr, msg;
        if ( match )
        {
          msg = line.substr(match[0].length);
          var date = new Date(match[1]);
          dateStr = '<span class="log-date">' + Util.escapeHtml(date.toLocaleDateString()) + ' ' + Util.escapeHtml(date.toLocaleTimeString()) + '</span>';
        }
        else
        {
          msg = line;
          dateStr = '<span class="log-date">Unknown Date</span>';
        }

        body.insertAdjacentHTML('beforeend',
          '<div class="log-msg '+ typeClass[type]  +'">' +
            dateStr +
            Util.escapeHtml(msg) +
          '</div>'
        );
      });

      if ( isFollow )
      {
        this.send('scrollToBottom');
      }
    };

    socket.onclose = () => {
      this.set('status','Disconnected');
    };
  },

  disconnect: function() {
    this.set('status','Closed');

    var socket = this.get('socket');
    if (socket)
    {
      socket.close();
      this.set('socket', null);
    }
  },

  onResize: function() {
    this.$('.log-body').css('height', Math.max(200, ($(window).height() - 270)) + 'px');
  },

  willDestroyElement: function() {
    this.disconnect();
    this._super();
  }
});
