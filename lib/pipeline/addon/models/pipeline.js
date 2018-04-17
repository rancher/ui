import Resource from 'ember-api-store/models/resource';
import branchConditionsEnums from 'pipeline/utils/branchConditionsEnums';
import { inject as service } from '@ember/service';
import { download } from 'shared/utils/util';

const ENUMS_STATUSCLASS = {
  'true': 'bg-success',
  'false': 'bg-warning',
};

let Pipeline = Resource.extend({
  type: 'pipeline',
  router: service(),
  access: service(),
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
      let branchCondition = this.get('branchCondition');
      if(branchCondition==='only'){
        return this.doAction('run', {branch:''})
          .then(() => {
            setTimeout(()=>{
              this.get('router').transitionTo('authenticated.project.pipeline.pipeline', this.get('id'),{queryParams:{mode: 'review'}})
            },0);
            this.get('router').transitionTo('authenticated.project.pipelines');
          });
      }else{
        let cb = (params)=>{
          return this.doAction('run', params)
            .then(() => {
              this.get('router').transitionTo('authenticated.project.pipeline.pipeline', this.get('id'),{queryParams:{mode: 'review'}})
            });
        }
        this.get('modalService').toggleModal('modal-pipeline-run', {cb});
      }
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
    exportConfig: function() {
      download(this.linkFor('export'));
    },
    viewConfig: function() {
      this.get('router').transitionTo('authenticated.project.pipeline.view-config',this.get('id'));
    },
    activate: function() {
      return this.doAction('activate');
    },
    deactivate: function() {
      return this.doAction('deactivate');
    },
  },
  availableActions: function() {
    var isActive = this.get('isActive');
    let me = this.get('access.me');
    let l = this.get('links')||{};
    return [
      { label: 'action.run', icon: 'icon icon-play', action: 'run', enabled: true, bulkable: false },
      { divider: true },
      { label: 'action.edit', icon: 'icon icon-edit', action: 'edit', enabled: (me.id===this.get('creatorId')), bulkable: false },
      { label: 'action.clone', icon: 'icon icon-copy', action: 'duplicate', enabled: (me.id===this.get('creatorId')), bulkable: false },
      { divider: true },
      { label:   'action.viewConfig',     icon: 'icon icon-files',          action: 'viewConfig',         enabled: !!l.export, bulkable: false },
      { label:   'action.exportConfig',   icon: 'icon icon-download',       action: 'exportConfig',     enabled: !!l.export, bulkable: false },
      { divider: true },
      { label: 'action.activate', icon: 'icon icon-play', action: 'activate', enabled: !isActive, bulkable: !isActive},
      { label: 'action.deactivate', icon: 'icon icon-stop', action: 'deactivate', enabled: isActive, bulkable: isActive},
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
  branchCondition: function(){
    let branchCondition = this.get('stages')[0].steps[0].sourceCodeConfig.branchCondition;
    return branchCondition;
  }.property('stages'),
  statusClass: function() {
    var status = !!this.get('isActive')+'';
    return ENUMS_STATUSCLASS[status];
  }.property('isActive'),
  lastRun: function(){
    return this.get('nextRun') - 1;
  }.property('nextRun'),
});

Pipeline.reopenClass({
  mangleIn(data) {
    if ( data && data.sourceCodeCredential ) {
      data.sourceCodeCredential._id = data.sourceCodeCredential.id;
      delete data.sourceCodeCredential.id;
    }
    return data;
  },
});


export default Pipeline;