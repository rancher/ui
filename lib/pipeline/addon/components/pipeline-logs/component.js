import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { next } from '@ember/runloop';
import { set } from '@ember/object';
import ThrottledResize from 'shared/mixins/throttled-resize';
import { alternateLabel } from 'shared/utils/platform';

export default Component.extend(ThrottledResize, {
  instance: null,
  timeOutAnchor: null,
  alternateLabel: alternateLabel,
  showProtip: true,
  status: 'connecting',
  socket: null,
  pipeline: service(),
  logHeight: 300,
  globalStore: service(),
  onlyCombinedLog: true,
  which: 'combined',

  actions: {

    cancel: function() {
      this.disconnect();
      this.sendAction('dismiss');
    },

    scrollToTop: function() {
      this.$('.log-body').animate({ scrollTop: '0px' });
    },

    scrollToBottom: function() {
      var body = this.$('.log-body');
      body.stop().animate({ scrollTop: (body[0].scrollHeight + 1000) + 'px' });
    },
  },
  showLogs: function() {
    var inst = this.get('instance');
    var key = inst.stageIndex + '-' + inst.stepIndex;
    next(() => {
      this.send('scrollToBottom');
    });
    if(!inst.activityLogs[key]){
      this.observeInstance();
      return
    }
    return inst.activityLogs[key];
  }.property('instance.{stageIndex,stepIndex,activityLogs}', 'showLogsTrigger'),
  showLogsTrigger: '',
  observeInstance: function() {
    this.disconnect();
    next(this, 'exec');
  }.observes('instance.{stageIndex,stepIndex}'),
  didInsertElement: function() {
    this._super();
    next(this, 'exec');
  },

  exec: function() {
    this.connect();
  },

  connect: function() {
    this.set('status', 'initializing');
    var body = this.$('.log-body')[0];
    var $body = $(body);
    // inst should be get from outside of the onmessage, cause inst may have changed when onmessage callback 
    var inst = this.get('instance');

    var onmessage = (message) => {
      inst = this.get('instance');
      var isFollow = ($body.scrollTop() + $body.outerHeight() + 10) >= body.scrollHeight;


      // var logs = '';
      // message.trim().split(/\n/).forEach((line) => {
      //   var match = line.match(/^\[?([^ \]]+)\]?\s?/);
      //   var dateStr, msg;
      //   if (match) {
      //     msg = line.substr(match[0].length);
      //     var date = new Date(match[1] * 1);
      //     dateStr = '<span class="log-date">' + Util.escapeHtml(date.toLocaleDateString()) + ' ' + Util.escapeHtml(date.toLocaleTimeString()) + ' </span>';
      //   } else {
      //     msg = line;
      //     dateStr = '<span class="log-date">Unknown Date</span>';
      //   }

      //   // body.insertAdjacentHTML('beforeend',
      //   //   '<div class="log-msg">' +
      //   //   dateStr +
      //   //   AnsiUp.ansi_to_html(Util.escapeHtml(msg)) +
      //   //   '</div>'
      //   // );
      //   logs += '<div class="log-msg">' +
      //     dateStr +
      //     AnsiUp.ansi_to_html(Util.escapeHtml(msg)) +
      //     '</div>';
      // });
      var logs = message;

      var logsAry = inst.activityLogs;
      var key = inst.stageIndex + '-' + inst.stepIndex;
      set(logsAry, key, logs);
      this.set('showLogsTrigger', logs);
      if (isFollow) {
        next(() => {
          this.send('scrollToBottom');
        });
      }
    };

    var activity = inst.activity;
    // var params = `?activityId=${activity.id}&stageOrdinal=${inst.stageIndex}&stepOrdinal=${inst.stepIndex}`;
    // var url = ("ws://" + window.location.host + this.get('pipeline.pipelinesEndpoint') + '/ws/log' + params);
    // var socket = new WebSocket(url);
    // this.set('socket', socket);
    let fetchLog = ()=>{
      let stepState = activity.stages[inst.stageIndex].steps[inst.stepIndex].state
      let status = this.get('status');
      let logKey = inst.stageIndex + '-' + inst.stepIndex;
      activity.followLink('log', {filter:{stage:inst.stageIndex,step:inst.stepIndex}}).then(res=>{
        let status = this.get('status');
        if(status&&status!=='closed') {
         onmessage(res.message);
        }
      }).then(()=>{
        let status = this.get('status');
        if(status 
            && status!=='closed' 
            && (stepState === 'Building' 
                || ( stepState !== 'Waiting' && !inst.activityLogs[logKey])
                )
            ){
          let timeOutAnchor = setTimeout(()=>{
            fetchLog();
          },1000);
          this.set('timeOutAnchor', timeOutAnchor);
        }
      });
    }
    this.set('status', 'connected');
    fetchLog();
  },

  disconnect: function() {
    this.set('status', 'closed');
    let timeOutAnchor = this.get('timeOutAnchor');
    if(timeOutAnchor){
      clearTimeout(timeOutAnchor);
      this.set('timeOutAnchor', timeOutAnchor);
    }
    var socket = this.get('socket');
    if (socket) {
      socket.close();
      this.set('socket', null);
    }
  },

  onResize: function() {
    var amount = this.get('instance.activity.amount')
    // this.$('.log-body').css('min-height', Math.max(($(window).height() - this.get('logHeight'))) + 'px');
    this.$('.log-body').css('height', (amount.countStep + amount.countStage) * 82 + 'px');
  },

  willDestroyElement: function() {
    this.disconnect();
    this._super();
  }
});
