import Ember from 'ember';
import { get, set } from '@ember/object';
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
  // URL or instance+cmd
  url: null,
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
      set(this,'contenteditable', true);
      setTimeout(() => {
        set(this,'contenteditable', false);
      }, 20);
    }
  },

  fit() {
    var term = get(this,'term');
    var socket = get(this,'socket');
    if (term && socket) {
      var geometry = proposeGeometry(term);
      socket.send("4" + AWS.util.base64.encode(`{"Width":${geometry.cols},"Height":${geometry.rows}}`));
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
    let url = get(this, 'url');

    if ( !url ) {
      var instance = get(this,'instance');
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
    }

    this.connect(url);
  },

  connect: function (url) {
    var socket = new WebSocket(url, 'base64.channel.k8s.io');
    set(this,'socket', socket);

    socket.onopen = () => {
      set(this,'status', 'initializing');

      var term = new Terminal({
        useStyle: true,
        screenKeys: true,
        cursorBlink: false
      });
      set(this,'term', term);

      term.on('data', function (data) {
        socket.send(`0${AWS.util.base64.encode(window.unescape(encodeURIComponent(data)))}`);
      });

      term.open(this.$('.shell-body')[0], true);
      this.fit();
      socket.onmessage = (message) => {
        set(this,'status', 'connected');
        this.sendAction('connected');
        const data = message.data.slice(1);
        switch (message.data[0]) {
          case '1':
          case '2':
          case '3':
            term.write(decodeURIComponent(window.escape(AWS.util.base64.decode(data))));
            break;
        }
      };

      socket.onclose = () => {
        try {
          set(this,'status', 'closed');
          term.destroy();
          if (!get(this,'userClosed')) {
            this.sendAction('dismiss');
          }
        } catch (e) {
        }
      };
    };
  },

  disconnect: function () {
    set(this,'status', 'closed');
    set(this,'userClosed', true);

    var term = get(this,'term');
    if (term) {
      term.destroy();
      set(this,'term', null);
    }

    var socket = get(this,'socket');
    if (socket) {
      socket.close();
      set(this,'socket', null);
    }

    this.sendAction('disconnected');
  },

  willDestroyElement: function () {
    this.disconnect();
    this._super();
  }
});
