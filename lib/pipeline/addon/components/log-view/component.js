import Component from '@ember/component';
import { next } from '@ember/runloop';
import {
  set, get, observer
} from '@ember/object';
import ThrottledResize from 'shared/mixins/throttled-resize';
import { inject as service } from '@ember/service';

export default Component.extend(ThrottledResize, {
  scope:    service(),
  logIndex: null,

  status:    'connecting',
  socket:    null,
  logHeight: 300,
  content:   null,
  clean:     null,

  selectedDidChange: observer('logIndex.{stageIndex,stepIndex}', function() {

    this.disconnect();
    this.connect();

  }),

  init() {

    this._super(...arguments);

    next(() => {

      this.selectedDidChange();

    });

  },

  willDestroyElement() {

    this.disconnect();
    this._super();

  },

  actions: {
    scrollToBottom() {

      document.querySelector('.anchor-bottom').scrollIntoView(false);// eslint-disable-line

    },

    scrollToTop() {

      document.querySelector('.anchor-top').scrollIntoView(true);// eslint-disable-line

    },
  },

  getDefaultLog() {

    const stageIndex = get(this, 'logIndex.stageIndex');

    if ( stageIndex === -1 ) {

      return 'Setting up executor...';

    }

    const stepIndex = get(this, 'logIndex.stepIndex');
    const stages = get(this, 'activity.stages');
    const step = stages[stageIndex].steps[stepIndex];

    if ( step && step.state !== 'Waiting' ) {

      return 'Loading...'

    } else {

      return '';

    }

  },

  connect() {

    var body = this.$('.log-body')[0];
    var $body = $(body); // eslint-disable-line

    $body.empty();
    body.insertAdjacentHTML('beforeend', this.getDefaultLog());
    set(this, 'clean', false);

    const stageIndex = get(this, 'logIndex.stageIndex');
    const stepIndex = get(this, 'logIndex.stepIndex');
    const activity = get(this, 'activity');

    if ( !activity || stageIndex === -1 || stepIndex === -1 ) {

      return;

    }

    const scheme = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
    let url = `${ scheme }${ window.location.host }/v3/projects/${ get(this, 'scope.currentProject.id') }/pipelineExecutions/${ activity.id }/log?stage=${ stageIndex }&step=${ stepIndex }`;

    var socket = new WebSocket(url);

    set(this, 'socket', socket);

    set(this, 'status', 'initializing');

    socket.onopen = () => {

      set(this, 'status', 'connected');

    };

    socket.onmessage = (message) => {

      if ( !get(this, 'clean') ) {

        set(this, 'clean', true);
        $body.empty();

      }

      const isFollow = (window.innerHeight + window.scrollY) >= ( document.body.offsetHeight - 200);

      set(this, 'status', 'connected');
      body.insertAdjacentHTML('beforeend', message.data);

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

  onResize() {

    const amount = get(this, 'activity.amount')
    this.$('.log-body').css('min-height', Math.max(($(window).height() - get(this, 'logHeight'))) + 'px'); // eslint-disable-line
    if (amount) {

      this.$('.log-body').css('min-height', `${ (amount.countStep + amount.countStage) * 82  }px`);

    }

  },
});
