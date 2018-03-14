import { inject as service } from '@ember/service';
import Resource from 'ember-api-store/models/resource';

let ENUMS_STATUSCLASS = {
  'Success': 'text-success',
  'Pending': 'text-warning',
  'Building': 'text-info',
  'Denied': 'text-error',
  'Waiting': 'text-info',
  'Fail': 'text-error',
  'Abort': 'text-secondary'
};

const STATUS_LABEL_ENUMS = {
  'Waiting': 'running',
  'Building': 'running',
  'Success': 'success',
  'Fail': 'fail',
  'Denied': 'denied',
  'Abort': 'abort'
}

const BANNER_TRANSITIONING={
  'yes': 'bg-info',
  'no': 'bg-info',
  'error': 'bg-error'
}

const BANNER_ICON_TRANSITIONING={
  'yes': 'icon-spin icon-spinner',
  'no': '',
  'error': 'icon-across',
}

let PipelineExecution = Resource.extend({
  type: 'pipelineexecution',
  router: service(),
  actions: {
    rerun: function() {
      return this.doAction('rerun')
        .then((/*res*/) => {
          this.get('router').transitionTo('pipelines.activity', this.get('id'))
        });
    },
    approve: function() {
      return this.doAction('approve')
        .then((/*res*/) => {
          this.get('router').transitionTo('pipelines.activity', this.get('id'))
        });
    },
    deny: function() {
      return this.doAction('deny');
    },
    stop: function() {
      return this.doAction('stop');
    },
    remove:function(){
      this.get('modalService').toggleModal('confirm-delete', {resources: [this]});
    },
  },
  showTransitioningMessage: function() {
    var trans = this.get('transitioning');
    if (trans === 'yes' || trans === 'error') {
      let message = (this.get('transitioningMessage')||'');
      if ( message.length && message.toLowerCase() !== this.get('displayState').toLowerCase() ) {
        return true;
      }
    }

    return false;
  }.property('transitioning','transitioningMessage','displayState'),
  bannerClass: function(){
    var trans = this.get('transitioning');
    return BANNER_TRANSITIONING[trans];
  }.property('transitioning'),
  bannerIcon: function(){
    var trans = this.get('transitioning');
    return BANNER_ICON_TRANSITIONING[trans];
  }.property('transitioning'),
  amount: function(){
    var activity_stages = this.get('pipeline.stages');
    var countStage = 0;
    var countStep = 0;
    for (var i = 0; i < activity_stages.length; i++) {
      var stage = activity_stages[i];
      countStage++;
      for (var j = 0; j < stage.steps.length; j++) {
        stage.steps[j];
        countStep++;
      }
    }
    return {
      countStage,
      countStep
    };
  }.property('pipeline.stages'),
  availableActions: function() {
    var a = this.get('actionLinks');
    var status = this.get('status');
    return [
      { label: 'action.rerun', icon: 'icon icon-refresh', action: 'rerun', enabled: a.rerun ? true : false ,bulkable: a.rerun ? true : false},
      { label: 'action.stop', icon: 'icon icon-stop', action: 'stop', enabled: a.stop ? true : false ,bulkable: a.stop ? true : false},
      { divider: true },
      { label: 'action.approve', icon: 'icon icon-success', action: 'approve', enabled: status === 'Pending' && a.approve ? true : false ,bulkable: status === 'Pending' && a.approve ? true : false},
      { label: 'action.deny', icon: 'icon-x-circle', action: 'deny', enabled: status === 'Pending' && a.deny ? true : false ,bulkable: status === 'Pending' && a.deny ? true : false},
      { divider: true },
      { label: 'action.remove', icon: 'icon icon-trash', action: 'remove', enabled: true, bulkable: true },
    ];
  }.property('actionLinks.{rerun,stop,approve,deny,remove}'),
  commit: function() {
    var commitInfo = this.get('commitInfo')
    if (commitInfo) {
      return commitInfo.substr(0, 8)
    }
    return '';
  }.property('commitInfo'),
  repository: function() {
    return this.get('pipeline.stages')[0].steps[0].sourceCodeConfig.url
  }.property('pipeline.stages'),
  branch: function() {
    return this.get('pipeline.stages')[0].steps[0].sourceCodeConfig.branch
  }.property('pipeline.stages'),
  approversName: [],
  statusClass: function() {
    var state = this.get('executionState');
    return ENUMS_STATUSCLASS[state];
  }.property('executionState'),
  statusLabel: function () {
    var state = this.get('executionState');
    return STATUS_LABEL_ENUMS[state];
  }.property('executionState'),
  name: function(){
    return '#'+ this.get('runSequence') + ' by ' + this.get('pipelineSource.name');
  }.property('runSequence', 'pipelineSource.name'),
  startedTimeStamp: function(){
    let time = this.get('started');
    return new Date(time);
  }.property('started')
});


PipelineExecution.reopenClass({
  mangleIn(data) {
    if ( data && data.pipeline ) {
      data.pipeline._type = data.pipeline.type;
      delete data.pipeline.type;
    }
    return data;
  },
});

export default PipelineExecution