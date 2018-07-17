import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { set, get } from '@ember/object';

export default Component.extend({
  modalService:   service('modal'),
  sortFinishText: null,
  model:          null,
  crt:            null,
  dragDom:        null,
  stageInfo:      null,
  stageIndex:     null,
  pipeline:       null,
  dotClass:       function(){
    var stage = get(this, 'pipeline').stages[get(this, 'stageIndex') - 1];

    if (stage && stage.needApprove){
      return 'need-approve';
    }

    return ''
  }.property('pipeline'),
  sortingScope: function() {
    return get(this, 'stageId')
  }.property('stageId'),
  init(){
    this._super(...arguments);
    setTimeout(() => {
      this.showStepAdd();
    }, 0);
  },
  actions:      {
    dragStart(content, e) {
      var dom = e.target
      var crt = dom.cloneNode(true);

      crt.style.position = 'fixed';
      crt.style.top = '-100%'; crt.style.right = '-100%';
      crt.style.backgroundColor = crt.style.color
      dom.appendChild(crt);
      e.dataTransfer.setDragImage(crt, e.offsetX, e.offsetY);
      dom.style.backgroundColor = document.defaultView.getComputedStyle(dom.getElementsByClassName('step-name')[0]).color
      dom.style.filter = 'brightness(1.3)';
      this.dragDom = dom;
      this.crt = crt;
    },
    startHook(){

    },
    dragEnd(){
      var crt = this.crt

      crt && crt.remove()
      if (this.dragDom){
        this.dragDom.style.filter = '';
        this.dragDom.style.backgroundColor = 'white';
      }
    },
    addStep() {
      var cb = (step) => {
        var model = get(this, 'model');

        set(this, 'model', model.concat(step));
      };

      get(this, 'modalService').toggleModal('modal-pipeline-new-step', {
        type:            'add',
        pipeline:        get(this, 'pipeline'),
        clusterPipeline: get(this, 'clusterPipeline'),
        stageInfo:       get(this, 'stageInfo'),
        stageIndex:      get(this, 'stageIndex'),
        stepMode:        get(this, 'stepMode'),
        editMode:        get(this, 'editMode'),
        accounts:        get(this, 'accounts'),
        routeState:      get(this, 'routeState'),
        cb
      });
    },
    editStep(index) {
      var review = get(this, 'review');

      get(this, 'modalService').toggleModal('modal-pipeline-new-step', {
        type:            review ? 'review' : 'edit',
        pipeline:        get(this, 'pipeline'),
        clusterPipeline: get(this, 'clusterPipeline'),
        params:          get(this, 'model')[index],
        stageInfo:       get(this, 'stageInfo'),
        stageIndex:      get(this, 'stageIndex'),
        stepMode:        get(this, 'stepMode'),
        editMode:        get(this, 'editMode'),
        accounts:        get(this, 'accounts'),
        routeState:      get(this, 'routeState'),
        cb:              (step) => {
          var model = get(this, 'model');
          var newModel = model.map((ele, i) => {
            if (i === index){
              return step
            }

            return ele
          })

          set(this, 'model', newModel);
        },
        rmCb: () => {
          var model = get(this, 'model');
          var newModel = model.filter((ele, i) => {
            if (i === index){
              return false
            }

            return true
          })

          set(this, 'model', newModel);
        }
      });
    }
  },
  // sortingScope: 'sortingPipelineSteps',
  showStepAdd(){
    var stepMode = get(this, 'stepMode');
    var editMode = get(this, 'editMode');
    let saved = get(this, 'saved');

    if (stepMode === 'scm' && editMode === 'new' && !saved){
      this.triggerAction({
        action: 'addStep',
        target: this
      })
    }
  },
});
