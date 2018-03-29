import Component from '@ember/component';
import { inject as service } from '@ember/service';

var validateStageName = function(stages, stage) {
  for (var i = 0; i < stages.length; i++) {
    var item = stages[i];
    if (item.name === stage.name) {
      return i;
    }
  }
  return -1;
};

var validateConditions = function(stage){
  if(!stage.expressions){
    stage.conditions = {}
  }
}
export default Component.extend({
  sortFinishText: null,
  crt: null,
  dragDom: null,
  model: null,
  pipeline: null,
  envvars: ['CICD_GIT_COMMIT',
'CICD_GIT_REPO_NAME',
'CICD_GIT_BRANCH',
'CICD_GIT_URL',
'CICD_PIPELINE_ID',
'CICD_PIPELINE_NAME',
'CICD_TRIGGER_TYPE',
'CICD_EXECUTION_ID',
'CICD_EXECUTION_SEQUENCE'].map(ele=>`\${${ele}}`),
  systemVars: null,
  envvarsLoading: true,
  modalService: service('modal'),
  review: function(){
    return !this.get('editable');
  }.property('editable'),
  init() {
    this._super(...arguments);
  },
  actions: {
    dragStart: function(content, e) {
      var dom = e.target
      var crt = dom.cloneNode(true);
      crt.style.position = "fixed";
      crt.style.top = "-100%";
      crt.style.right = "-100%";
      crt.style.filter = "grayscale(1)";
      var stepWrapGhost = crt.getElementsByClassName('steps-wrap')[0]
      stepWrapGhost.style.border = "1px dashed gray";
      dom.appendChild(crt);
      e.dataTransfer.setDragImage(crt, 84, 50);
      dom.style.filter = 'grayscale(1) drop-shadow(5px 5px 5px #ccc)';
      this.dragDom = dom;
      this.crt = crt;
    },
    startHook: function() {

    },
    dragEnd: function() {
      var crt = this.crt
      crt && crt.remove()
      this.dragDom && (this.dragDom.style.filter = "")
    },
    addStage: function() {
      var cb = (stage) => {
        var stages = this.get('pipeline.stages');
        var valid = validateStageName(stages, stage)
        if (valid !== -1) {
          return false;
        }
        validateConditions(stage);
        stages.pushObject(stage);
        return true;
      };
      this.get('modalService').toggleModal('modal-pipeline-new-stage', {
        mode: 'new',
        pipeline: this.get('pipeline'),
        cb: cb
      })
    },
    editStage: function(index) {
      var review = !this.get('editable');
      this.get('modalService').toggleModal('modal-pipeline-new-stage', {
        stage: this.get('pipeline.stages')[index],
        pipeline: this.get('pipeline'),
        mode: review ? 'review' : 'edit',
        cb: (stage) => {
          var stages = this.get('pipeline.stages');
          var valid = validateStageName(stages, stage);
          if (valid !== -1 && valid !== index) {
            return false;
          }
          var newStage = stages.map((ele, i) => {
            if (i === index) {
              return stage;
            }
            return ele;
          })
          validateConditions(stage);
          this.set('pipeline.stages', newStage);
          return true;
        },
        rmCb: () => {
          var newStage = this.get('pipeline.stages').filter((ele, i) => {
            if (i === index) {
              return false;
            }
            return true;
          });
          this.set('pipeline.stages', newStage);
        }
      })
    }
  }
});
