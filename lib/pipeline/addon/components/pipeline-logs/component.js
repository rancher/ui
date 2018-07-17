import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { next } from '@ember/runloop';
import { set, get } from '@ember/object';
import ThrottledResize from 'shared/mixins/throttled-resize';
import { alternateLabel } from 'shared/utils/platform';

export default Component.extend(ThrottledResize, {
  globalStore:     service(),
  instance:        null,
  timeOutAnchor:   null,
  alternateLabel,
  showProtip:      true,
  status:          'connecting',
  socket:          null,
  logHeight:       300,
  onlyCombinedLog: true,
  which:           'combined',

  showLogsTrigger: '',
  showLogs:        function() {
    var inst = get(this, 'instance');

    if (!inst){
      return
    }
    var key = `${ inst.stageIndex  }-${  inst.stepIndex }`;

    next(() => {
      this.send('scrollToBottom');
    });
    if (!inst.activityLogs[key]){
      this.observeInstance();

      return
    }

    return inst.activityLogs[key];
  }.property('instance.{stageIndex,stepIndex,activityLogs}', 'showLogsTrigger'),
  observeInstance: function() {
    this.disconnect();
    next(this, 'exec');
  }.observes('instance.{stageIndex,stepIndex}'),
  didInsertElement() {
    this._super();
    next(this, 'exec');
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

    scrollToTop() {
      this.$('.log-body').animate({ scrollTop: '0px' });
    },

    scrollToBottom() {
      var body = this.$('.log-body');

      body.stop().animate({ scrollTop: `${ body[0].scrollHeight + 1000  }px` });
    },
  },
  exec() {
    this.connect();
  },

  connect() {
    set(this, 'status', 'initializing');
    let body = this.$('.log-body')[0];
    let $body = $(body); // eslint-disable-line
    // inst should be get from outside of the onmessage, cause inst may have changed when onmessage callback
    let inst = get(this, 'instance');

    if (!inst){
      return;
    }

    let onmessage = (message) => {
      inst = get(this, 'instance');
      if (!inst){
        return;
      }
      var isFollow = ($body.scrollTop() + $body.outerHeight() + 10) >= body.scrollHeight;

      var logs = message;

      var logsAry = inst.activityLogs;
      var key = `${ inst.stageIndex  }-${  inst.stepIndex }`;

      set(logsAry, key, logs);
      set(this, 'showLogsTrigger', logs);
      if (isFollow) {
        next(() => {
          this.send('scrollToBottom');
        });
      }
    };

    let activity = inst.activity;

    let fetchLog = () => {
      if (inst.stageIndex === -1 || inst.stepIndex === -1){
        return
      }
      let stepState = activity.stages[inst.stageIndex].steps[inst.stepIndex].state;
      let logKey = `${ inst.stageIndex  }-${  inst.stepIndex }`;

      activity.followLink('log', {
        filter: {
          stage: inst.stageIndex,
          step:  inst.stepIndex
        }
      }).then((res) => {
        let status = get(this, 'status');

        if (status && status !== 'closed') {
          onmessage(res.message);
        }
      }).then(() => {
        let status = get(this, 'status');

        if (status
            && status !== 'closed'
            && (stepState === 'Building'
                || ( stepState !== 'Waiting' && !inst.activityLogs[logKey])
            )
        ){
          let timeOutAnchor = setTimeout(() => {
            fetchLog();
          }, 1000);

          set(this, 'timeOutAnchor', timeOutAnchor);
        }
      });
    }

    set(this, 'status', 'connected');
    fetchLog();
  },

  disconnect() {
    set(this, 'status', 'closed');
    let timeOutAnchor = get(this, 'timeOutAnchor');

    if (timeOutAnchor){
      clearTimeout(timeOutAnchor);
      set(this, 'timeOutAnchor', timeOutAnchor);
    }
    var socket = get(this, 'socket');

    if (socket) {
      socket.close();
      set(this, 'socket', null);
    }
  },

  onResize() {
    var amount = get(this, 'instance.activity.amount')
    this.$('.log-body').css('min-height', Math.max(($(window).height() - get(this, 'logHeight'))) + 'px');  // eslint-disable-line
    if (amount){
      this.$('.log-body').css('height', `${ (amount.countStep + amount.countStage) * 82  }px`);
    }
  },

});
