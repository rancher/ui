import {
  get, set, observer
} from '@ember/object';
import { inject as service } from '@ember/service';
import { alternateLabel } from 'ui/utils/platform';
import ThrottledResize from 'shared/mixins/throttled-resize';
import Terminal from 'npm:xterm';
import { proposeGeometry } from 'ui/utils/xterm-fit-addon';
import { next } from '@ember/runloop';
import layout from './template';
import Component from '@ember/component';

const DEFAULT_COMMAND = ['/bin/sh', '-c', 'TERM=xterm-256color; export TERM; [ -x /bin/bash ] && ([ -x /usr/bin/script ] && /usr/bin/script -q -c "/bin/bash" /dev/null || exec /bin/bash) || exec /bin/sh'];

export default Component.extend(ThrottledResize, {
  scope: service(),

  layout,
  // URL or instance+cmd
  url:      null,
  instance: null,
  command:  null,

  alternateLabel,
  showProtip:      true,
  contenteditable: false,

  status:        'connecting',
  error:         null,
  socket:        null,
  term:          null,
  containerName: null,

  containerDidChange: observer('containerName', function() {

    this.disconnect();
    this.exec();

  }),
  init() {

    this._super(...arguments);

    const containerName = get(this, 'instance.containers.firstObject.name');

    set(this, 'containerName', containerName);

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

  fit() {

    var term = get(this, 'term');
    var socket = get(this, 'socket');

    if (term && socket) {

      var geometry = proposeGeometry(term);

      socket.send(`4${  AWS.util.base64.encode(`{"Width":${ geometry.cols },"Height":${ geometry.rows }}`) }`);
      term.resize(geometry.cols, geometry.rows);

    }

  },

  onResize() {

    this.fit();

  },

  exec() {

    let url = get(this, 'url');

    if ( !url ) {

      var instance = get(this, 'instance');
      const clusterId = get(this, 'scope.currentCluster.id');
      const namespaceId = get(instance, 'namespaceId');
      const podName = get(instance, 'name');
      const containerName = get(this, 'containerName');
      const scheme = window.location.protocol === 'https:' ? 'wss://' : 'ws://';

      url = `${ scheme }${ window.location.host }/k8s/clusters/${ clusterId }/api/v1/namespaces/${ namespaceId }/pods/${ podName }/exec`;
      url += `?container=${ encodeURIComponent(containerName) }&stdout=1&stdin=1&stderr=1&tty=1`;
      const command = get(instance, 'command') || DEFAULT_COMMAND;

      command.forEach((c) => {

        url += `&command=${  encodeURIComponent(c) }`;

      });

    }

    this.connect(url);

  },

  connect(url) {

    var socket = new WebSocket(url, 'base64.channel.k8s.io');

    set(this, 'socket', socket);

    socket.onopen = () => {

      set(this, 'status', 'initializing');

      var term = new Terminal({
        useStyle:    true,
        screenKeys:  true,
        cursorBlink: false
      });

      set(this, 'term', term);

      term.on('data', (data) => {

        socket.send(`0${ AWS.util.base64.encode(data) }`);

      });

      term.open(this.$('.shell-body')[0], true);
      this.fit();
      socket.onmessage = (message) => {

        set(this, 'status', 'connected');
        this.sendAction('connected');
        const data = message.data.slice(1);

        switch (message.data[0]) {

        case '1':
        case '2':
        case '3':
          term.write(AWS.util.base64.decode(data).toString());
          break;

        }

      };

      socket.onclose = () => {

        try {

          if ( !get(this, 'userClosed') && get(this, 'instance.containers.length') === 1 ) {

            term.destroy();
            this.sendAction('dismiss');

          }
          set(this, 'status', 'closed');

        } catch (e) {
        }

      };

    };

  },

  disconnect() {

    set(this, 'status', 'closed');
    set(this, 'userClosed', true);

    var term = get(this, 'term');

    if (term) {

      term.destroy();
      set(this, 'term', null);

    }

    var socket = get(this, 'socket');

    if (socket) {

      socket.close();
      set(this, 'socket', null);

    }

    this.sendAction('disconnected');

  },

});
