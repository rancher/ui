import { next } from '@ember/runloop';
import {
  set, get, observer
} from '@ember/object';
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
  instance:       null,
  alternateLabel,
  showProtip:     true,

  status:        'connecting',
  containerName: null,
  socket:        null,

  containerDidChange: observer('containerName', function() {

    this.disconnect();
    this.send('clear');
    this.exec();

  }),

  init() {

    this._super(...arguments);

    const containerName = get(this, 'instance.containers.firstObject.name');

    set(this, 'containerName', containerName);

  },

  didInsertElement() {

    this._super();
    next(this, () => {

      this.exec();
      var btn = $('.scroll-bottom')[0]; // eslint-disable-line

      if ( btn ) {

        btn.focus();

      }

    });

  },

  willDestroyElement() {

    this.disconnect();
    this._super();

  },

  actions: {
    cancel() {

      this.disconnect();
      this.sendAction('dismiss');

    },

    clear() {

      var body = this.$('.log-body')[0];

      body.innerHTML = '';
      body.scrollTop = 0;

    },

    scrollToTop() {

      this.$('.log-body').animate({ scrollTop: '0px' });

    },

    scrollToBottom() {

      var body = this.$('.log-body');

      body.stop().animate({ scrollTop: `${ body[0].scrollHeight + 1000  }px` });

    },
  },

  exec() {

    var instance = get(this, 'instance');
    const clusterId = get(this, 'scope.currentCluster.id');
    const namespaceId = get(instance, 'namespaceId');
    const podName = get(instance, 'name');
    const containerName = get(this, 'containerName');
    const scheme = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
    let url = `${ scheme }${ window.location.host }/k8s/clusters/${ clusterId }/api/v1/namespaces/${ namespaceId }/pods/${ podName }/log`;

    url += `?container=${ encodeURIComponent(containerName) }&tailLines=${ LINES }&follow=true&timestamps=true`;

    this.connect(url);

  },

  connect(url) {

    var socket = new WebSocket(url, 'base64.binary.k8s.io');

    set(this, 'socket', socket);

    var body = this.$('.log-body')[0];
    var $body = $(body); // eslint-disable-line

    set(this, 'status', 'initializing');

    socket.onopen = () => {

      set(this, 'status', 'connected');

    };

    socket.onmessage = (message) => {

      let ansiup = new AnsiUp.default;

      set(this, 'status', 'connected');
      var isFollow = ($body.scrollTop() + $body.outerHeight() + 10) >= body.scrollHeight;
      const data = AWS.util.base64.decode(message.data).toString();

      data.trim().split(/\n/)
        .filter((line) => line)
        .forEach((line) => {

          var match = line.match(/^\[?([^ \]]+)\]?\s?/);
          var dateStr = '';
          var msg = '';

          if (match && this.isDate(new Date(match[1]))) {

            var date = new Date(match[1]);

            msg = line.substr(match[0].length);
            dateStr = `<span class="log-date">${  Util.escapeHtml(date.toLocaleDateString())  } ${  Util.escapeHtml(date.toLocaleTimeString())  } </span>`;

          } else {

            msg = line;

          }

          // @@TODO@@ - 10-13-17 - needed to remove the escaping here because it was being double escaped but double verify that its acutally being escaped
          body.insertAdjacentHTML('beforeend',
            `<div class="log-msg log-combined">${
              dateStr
            }${ ansiup.ansi_to_html(msg)
            }</div>`
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

      set(this, 'status', 'disconnected');

    };

  },

  disconnect() {

    set(this, 'status', 'closed');

    var socket = get(this, 'socket');

    if (socket) {

      socket.close();
      set(this, 'socket', null);

    }

  },

  isDate(date) {

    return new Date(date) !== 'Invalid Date' && !isNaN(new Date(date))

  }
});
