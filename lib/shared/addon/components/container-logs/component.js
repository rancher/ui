import { next } from '@ember/runloop';
import { get } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import Util from 'ui/utils/util';
import { alternateLabel } from 'ui/utils/platform';
import layout from './template';
import AnsiUp from 'npm:ansi_up';

const LINES = 500;

export default Component.extend({
  scope: service(),

  layout,
  instance: null,
  alternateLabel: alternateLabel,
  showProtip: true,

  status: 'connecting',
  socket: null,

  actions: {
    cancel: function () {
      this.disconnect();
      this.sendAction('dismiss');
    },

    clear: function () {
      var body = this.$('.log-body')[0];
      body.innerHTML = '';
      body.scrollTop = 0;
    },

    scrollToTop: function () {
      this.$('.log-body').animate({ scrollTop: '0px' });
    },

    scrollToBottom: function () {
      var body = this.$('.log-body');
      body.stop().animate({ scrollTop: (body[0].scrollHeight + 1000) + 'px' });
    },
  },

  didInsertElement: function () {
    this._super();
    next(this, 'exec');
  },

  exec: function () {
    var instance = this.get('instance');
    const clusterId = get(this, 'scope.currentCluster.id');
    const namespaceId = get(instance, 'namespaceId');
    const podName = get(instance, 'name');
    const containerName = get(instance, 'containers.firstObject.name');
    const scheme = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
    let url = `${scheme}${window.location.host}/k8s/clusters/${clusterId}/api/v1/namespaces/${namespaceId}/pods/${podName}/log`;
    url += `?container=${encodeURIComponent(containerName)}&tailLines=${LINES}&follow=true&timestamps=true`;

    this.connect(url);
  },

  connect: function (url) {
    var socket = new WebSocket(url, 'base64.binary.k8s.io');
    this.set('socket', socket);

    var body = this.$('.log-body')[0];
    var $body = $(body);

    this.set('status', 'initializing');

    socket.onopen = () => {
      this.set('status', 'connected');
    };

    socket.onmessage = (message) => {
      let ansiup = new AnsiUp.default;
      this.set('status', 'connected');
      var isFollow = ($body.scrollTop() + $body.outerHeight() + 10) >= body.scrollHeight;
      const data = decodeURIComponent(window.escape(window.atob(message.data)));

      data.trim().split(/\n/).filter(line => line).forEach((line) => {
        var match = line.match(/^\[?([^ \]]+)\]?\s?/);
        var dateStr, msg;
        if (match) {
          msg = line.substr(match[0].length);
          var date = new Date(match[1]);
          dateStr = '<span class="log-date">' + Util.escapeHtml(date.toLocaleDateString()) + ' ' + Util.escapeHtml(date.toLocaleTimeString()) + ' </span>';
        }
        else {
          msg = line;
          dateStr = '<span class="log-date">Unknown Date</span>';
        }

        // @@TODO@@ - 10-13-17 - needed to remove the escaping here because it was being double escaped but double verify that its acutally being escaped
        body.insertAdjacentHTML('beforeend',
          '<div class="log-msg log-combined">' +
          dateStr +
          ansiup.ansi_to_html(msg) +
          '</div>'
        );
      });

      if (isFollow) {
        next(() => {
          this.send('scrollToBottom');
        });
      }
    };

    socket.onclose = () => {
      if (this.isDestroyed || this.isDestroying) {
        return;
      }

      this.set('status', 'disconnected');
    };
  },

  disconnect: function () {
    this.set('status', 'closed');

    var socket = this.get('socket');
    if (socket) {
      socket.close();
      this.set('socket', null);
    }
  },

  willDestroyElement: function () {
    this.disconnect();
    this._super();
  }
});
