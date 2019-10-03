import {
  get, set, observer, computed, setProperties
} from '@ember/object';
import { inject as service } from '@ember/service';
import { alternateLabel } from 'ui/utils/platform';
import ThrottledResize from 'shared/mixins/throttled-resize';
import { next } from '@ember/runloop';
import layout from './template';
import Component from '@ember/component';
import { Terminal } from 'xterm';
import * as fit from 'xterm/lib/addons/fit/fit';
import $ from 'jquery';

const DEFAULT_COMMAND = ['/bin/sh', '-c', 'TERM=xterm-256color; export TERM; [ -x /bin/bash ] && ([ -x /usr/bin/script ] && /usr/bin/script -q -c "/bin/bash" /dev/null || exec /bin/bash) || exec /bin/sh'];
const statusMap = {
  closed:     'closed',
  connected:  'connected',
  connecting: 'connecting',
  init:       'initializing'
};

export default Component.extend(ThrottledResize, {
  scope: service(),
  growl: service(),

  layout,
  // URL or instance+cmd
  url:             null,
  instance:        null,
  command:         null,
  alternateLabel,
  showProtip:      true,
  contenteditable: false,
  error:           null,
  socket:          null,
  term:            null,
  containerName:   null,

  init() {
    this._super(...arguments);

    this._bootstrap();
  },

  didInsertElement() {
    this._super();

    next(this, 'exec');
  },

  willDestroyElement() {
    this.disconnect();

    this._super();
  },

  actions: {
    contextMenuHandler() {
      // fix for no paste button in firefox context menu on Windows
      set(this, 'contenteditable', true);

      setTimeout(() => {
        set(this, 'contenteditable', false);
      }, 20);
    }
  },
  containerDidChange: observer('containerName', function() {
    this.disconnect();

    this.exec();
  }),

  runningContainers: computed('instance.containers', function() {
    return (get(this, 'instance.containers') || []).filterBy('canShell', true);
  }),

  status:          statusMap.connecting,

  _bootstrap() {
    set(this, 'containerName', get(this, 'containerName') || get(this, 'instance.containers.firstObject.name'));
  },

  fit() {
    const term   = get(this, 'term');
    const socket = get(this, 'socket');

    if (term && socket) {
      term.fit()

      socket.send(`4${ AWS.util.base64.encode(JSON.stringify({
        Width:  term.cols,
        Height: term.rows
      })) }`);
    }
  },

  onResize() {
    this.fit();
  },

  exec() {
    let url = get(this, 'url');

    if ( !url ) {
      const instance      = get(this, 'instance');
      const clusterId     = get(this, 'scope.currentCluster.id');
      const namespaceId   = get(instance, 'namespaceId');
      const podName       = get(instance, 'name');
      const containerName = get(this, 'containerName');
      const scheme        = window.location.protocol === 'https:' ? 'wss://' : 'ws://';

      let command         = get(instance, 'command') || DEFAULT_COMMAND;

      url = `${ scheme }${ window.location.host }/k8s/clusters/${ clusterId }/api/v1/namespaces/${ namespaceId }/pods/${ podName }/exec`;
      url += `?container=${ encodeURIComponent(containerName) }&stdout=1&stdin=1&stderr=1&tty=1`;

      if ( this.isWindows() ) {
        command = ['cmd']
      }

      command.forEach((c) => {
        url += `&command=${  encodeURIComponent(c) }`;
      });
    }

    this.connect(url);
  },

  isWindows() {
    if ( get(this, 'windows') === undefined ) {
      const system = get(this, 'instance.node.info.os.operatingSystem') || '';

      return system.startsWith('Windows');
    } else {
      return get(this, 'windows');
    }
  },

  connect(url) {
    const socket = new WebSocket(url, 'base64.channel.k8s.io');

    set(this, 'socket', socket);

    socket.onclose = (err = {}) => {
      const term = get(this, 'term')

      if (!get(this, 'userClosed')) {
        set(this, 'statusCode', err.code)
      }

      try {
        if ( !get(this, 'userClosed') && get(this, 'instance.containers.length') === 1 ) {
          term.destroy();
          if (this.dismiss) {
            this.dismiss();
          }
        }
        set(this, 'status', statusMap.closed);
      } catch (e) {
      }
    };

    socket.onerror = () => {
      const term = get(this, 'term')

      set(this, 'status', statusMap.closed);
      try {
        if ( !get(this, 'userClosed') && get(this, 'instance.containers.length') === 1 ) {
          term.destroy();
          if (this.dismiss) {
            this.dismiss();
          }
        }
      } catch (e) {
      }
    }

    socket.onopen = () => {
      set(this, 'status', statusMap.init);

      Terminal.applyAddon(fit)

      var term = new Terminal({
        cursorBlink: true,
        useStyle:    true,
        fontSize:    12,
      });

      set(this, 'term', term);

      term.on('data', (data) => {
        socket.send(`0${ AWS.util.base64.encode(data) }`);
      });

      term.open($('.shell-body')[0], true);

      this.fit();

      term.focus();

      socket.onmessage = (message) => {
        set(this, 'status', statusMap.connected);

        if (this.connected) {
          this.connected();
        }

        const data = message.data.slice(1);

        switch (message.data[0]) {
        case '1':
        case '2':
        case '3':
          term.write(AWS.util.base64.decode(data).toString());
          break;
        }
      };
    };
  },

  disconnect() {
    setProperties(this, {
      status:     statusMap.closed,
      userClosed: true,
    })

    const term = get(this, 'term');

    if (term) {
      term.destroy();

      set(this, 'term', null);
    }

    const socket = get(this, 'socket');

    if (socket) {
      socket.close();

      set(this, 'socket', null);
    }

    if (this.disconnected) {
      this.disconnected();
    }
  },

});
