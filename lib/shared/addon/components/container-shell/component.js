import Ember from 'ember';
import { get } from '@ember/object';
import { inject as service } from '@ember/service';
import { alternateLabel } from 'ui/utils/platform';
import ThrottledResize from 'shared/mixins/throttled-resize';
import Terminal from 'npm:xterm';
import { proposeGeometry } from 'ui/utils/xterm-fit-addon';
import { next } from '@ember/runloop';
import layout from './template';

const DEFAULT_COMMAND = ["/bin/sh", "-c", 'TERM=xterm-256color; export TERM; [ -x /bin/bash ] && ([ -x /usr/bin/script ] && /usr/bin/script -q -c "/bin/bash" /dev/null || exec /bin/bash) || exec /bin/sh'];

export default Ember.Component.extend(ThrottledResize, {
  scope: service(),

  layout,
  instance: null,
  command: null,
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
      setTimeout(() => {
        this.set('contenteditable', false);
      }, 20);
    }
  },

  fit() {
    var term = this.get('term');
    var socket = this.get('socket');
    if (term && socket) {
      var geometry = proposeGeometry(term);
      socket.send("4" + window.btoa(`{"Width":${geometry.cols},"Height":${geometry.rows}}`));
      term.resize(geometry.cols, geometry.rows);
    }
  },

  onResize: function () {
    this.fit();
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
    let url = `${scheme}${window.location.host}/k8s/clusters/${clusterId}/api/v1/namespaces/${namespaceId}/pods/${podName}/exec`;
    url += `?container=${encodeURIComponent(containerName)}&stdout=1&stdin=1&stderr=1&tty=1`;
    const command = get(instance, 'command') || DEFAULT_COMMAND;
    command.forEach(c => {
      url += "&command=" + encodeURIComponent(c);
    });

    this.connect(url);
  },

  connect: function (url) {
    var socket = new WebSocket(url, 'base64.channel.k8s.io');
    this.set('socket', socket);

    socket.onopen = () => {
      this.set('status', 'initializing');

      var term = new Terminal({
        useStyle: true,
        screenKeys: true,
        cursorBlink: false
      });
      this.set('term', term);

      term.on('data', function (data) {
        socket.send(`0${window.btoa(window.unescape(encodeURIComponent(data)))}`);
      });

      term.open(this.$('.shell-body')[0], true);
      this.fit();
      socket.onmessage = (message) => {
        this.set('status', 'connected');
        this.sendAction('connected');
        const data = message.data.slice(1);
        switch (message.data[0]) {
          case '1':
          case '2':
          case '3':
            term.write(decodeURIComponent(window.escape(window.atob(data))));
            break;
        }
      };

      socket.onclose = () => {
        try {
          this.set('status', 'closed');
          term.destroy();
          if (!this.get('userClosed')) {
            this.sendAction('dismiss');
          }
        } catch (e) {
        }
      };
    };
  },

  disconnect: function () {
    this.set('status', 'closed');
    this.set('userClosed', true);

    var term = this.get('term');
    if (term) {
      term.destroy();
      this.set('term', null);
    }

    var socket = this.get('socket');
    if (socket) {
      socket.close();
      this.set('socket', null);
    }

    this.sendAction('disconnected');
  },

  willDestroyElement: function () {
    this.disconnect();
    this._super();
  }
});
