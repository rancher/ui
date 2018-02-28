import Ember from 'ember'
import Resource from 'ember-api-store/models/resource';
import branchConditionsEnums from 'pipeline/utils/branchConditionsEnums';
import { inject as service } from '@ember/service';

const ENUMS_STATUSCLASS = {
  'true': 'bg-success',
  'false': 'bg-warning',
};

let Pipeline = Resource.extend({
  type: 'pipeline',
  router: service(),
  modalService: service('modal'),
  init(...args) {
    this._super(...args);
  },
  cb() {
    this.delete().then(()=>{
      this.get('router').transitionTo('authenticated.project.pipeline.pipelines');
    })
  },
  isActive: function(){
    return this.get('pipelineState') === 'active'?true:false;
  }.property('pipelineState'),
  actions: {
    run: function() {
      return this.doAction('run')
        .then(() => {
          this.get('router').transitionTo('authenticated.project.pipeline.pipeline', this.get('id'),{queryParams:{mode: 'review'}})
        });
    },
    duplicate: function() {
      this.get('router').transitionTo('authenticated.project.pipeline.pipeline', this.get('id'), {
        queryParams: {
          mode: 'duplicate'
        }
      })
    },
    edit: function() {
      this.get('router').transitionTo('authenticated.project.pipeline.pipeline', this.get('id'), {
        queryParams: {
          mode: ''
        }
      })
    },
    // remove:function(){
    //   this.get('modalService').toggleModal('confirm-delete', {resources: [this]});
    // },
    activate: function() {
      return this.doAction('activate');
    },
    deactivate: function() {
      return this.doAction('deactivate');
    },
  },
  availableActions: function() {
    var isActive = this.get('isActive');
    let l = this.get('links')||{};
    return [
      { label: 'action.run', icon: 'icon icon-play', action: 'run', enabled: true, bulkable: false },
      { divider: true },
      { label: 'action.edit', icon: 'icon icon-edit', action: 'edit', enabled: true, bulkable: false },
      { label: 'action.clone', icon: 'icon icon-copy', action: 'duplicate', enabled: true, bulkable: false },
      { divider: true },
      { label:   'action.viewConfig',     icon: 'icon icon-files',          action: 'viewCode',         enabled: !!l.exportConfig, bulkable: false },
      { label:   'action.exportConfig',   icon: 'icon icon-download',       action: 'exportConfig',     enabled: !!l.exportConfig, bulkable: false },
      { divider: true },
      { label: 'action.activate', icon: 'icon icon-plus-circle', action: 'activate', enabled: !isActive, bulkable: !isActive},
      { label: 'action.deactivate', icon: 'icon icon-minus-circle', action: 'deactivate', enabled: isActive, bulkable: isActive},
      { divider: true },
      { label: 'action.remove', icon: 'icon icon-trash', action: 'promptDelete', altAction:'delete', enabled: true, bulkable: true },
      { divider: true },
      { label:   'action.viewInApi',  icon: 'icon icon-external-link', action:  'goToApi',      enabled: true},
    ];
  }.property('actions.{run,remove,deactivate,activate,edit,clone}', 'piplineState', 'isActive'),
  validationErrors() {
    var errors = []
    if (!this.get('name')) {
      errors.push('"Pipeline Name" is required');
    }
    var allStageNotEmpty = true
    var stages = this.get('stages');
    for(var i=0; i<stages.length;i++){
      var item = stages[i]
      if(!item.steps||item.steps.length===0){
        allStageNotEmpty = false
        break;
      }
    }
    if(!allStageNotEmpty){
      errors.push('Stage must contain at least one Step');
    }
    return errors;
  },
  images: function() {
    var images = [];
    var stages = this.get('stages');
    for (var i = 0; i < stages.length; i++) {
      var item = stages[i].steps;
      for(var j=0; j< item.length;j++){
        var itemJ = item[j];
        if(itemJ.type==="task"){
          var exist = images.findIndex(ele=>ele===itemJ.image);
          (exist===-1)&&images.push(itemJ.image);
        }
        if(itemJ.type==="build"){
          exist = images.findIndex(ele=>ele===itemJ.targetImage);
          (exist===-1)&&images.push(itemJ.targetImage);
        }
      }
    }
    return images;
  }.property('stages.@each.{steps}'),
  repository: function() {
    return this.get('stages')[0].steps[0].sourceCodeConfig.url;
  }.property('stages'),
  branch: function() {
    return this.get('stages')[0].steps[0].sourceCodeConfig.branch;
  }.property('stages'),
  branchConditionLabel: function(){
    let branchCondition = this.get('stages')[0].steps[0].sourceCodeConfig.branchCondition;
    let branchEnum = branchConditionsEnums.find(ele=>ele.value===branchCondition);
    return branchEnum&&branchEnum.label||'';
  }.property('stages'),
  statusClass: function() {
    var status = !!this.get('isActive')+'';
    return ENUMS_STATUSCLASS[status];
  }.property('isActive'),
  lastRun: function(){
    return this.get('nextRun') - 1;
  }.property('nextRun'),
});

export default Pipeline;