import Overlay from 'ui/pods/overlay/view';
import ThrottledResize from 'ui/mixins/throttled-resize';

export default Overlay.extend(ThrottledResize,{
  status: 'Connecting...',
  socket: null,

  actions: {
    overlayClose: function() {
      this.send('cancel');
    },

    clear: function() {
      var body = this.$('.log-body')[0];
      body.innerHTML = '';
      body.scrollTop = 0;
    },

    scrollToTop: function() {
      var body = this.$('.log-body')[0];
      body.scrollTop = 0;
    },

    scrollToBottom: function() {
      var body = this.$('.log-body')[0];
      body.scrollTop = body.scrollHeight;
    }
  },

  didInsertElement: function() {
    var self = this;
    this._super();

    var url = this.get('context.url') +'?token='+ encodeURIComponent(this.get('context.token'));
    var socket = new WebSocket(url);
    this.set('socket', socket);

    var body = this.$('.log-body')[0];
    var $body = $(body);

    self.set('status','Initializing...');
    socket.onopen = function() {
      self.set('status','Connected');
    };

    socket.onmessage = function(message) {
      self.set('status','Connected');

      var isFollow = ($body.scrollTop() + $body.outerHeight() + 10) >= body.scrollHeight;

      message.data.trim().split(/\n/).forEach(function(line) {
        body.insertAdjacentHTML('beforeend', '<div class="log-msg">' + line + '</div>');
      });

      if ( isFollow )
      {
        this.send('scrollToBottom');
      }
    };

    socket.onclose = function() {
      self.set('status','Disconnected');
    };
  },

  onResize: function() {
    this.$('.log-body').css('max-height', ($(window).height() - 200) + 'px');
  },

  willDestroyElement: function() {
    this.set('status','Closed');

    var socket = this.get('socket');
    if (socket)
    {
      socket.close();
      this.set('socket', null);
    }
  }
});
