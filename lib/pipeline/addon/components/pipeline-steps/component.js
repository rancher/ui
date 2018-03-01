import Component from '@ember/component';
import { inject as service } from '@ember/service';

export default Component.extend({
  sortFinishText: null,
  model: null,
  crt: null,
  dragDom: null,
  stageInfo: null,
  stageIndex: null,
  pipeline: null,
  init(){
    this._super(...arguments);
    setTimeout(()=>{
      let route = this.get('route');
      this.showStepAdd();
    },0);
  },
  dotClass: function(){
    var stage = this.get('pipeline').stages[this.get('stageIndex')-1];
    if(stage&&stage.needApprove){
      return 'need-approve';
    }
    return ''
  }.property('pipeline'),
  sortingScope: function() {
    return this.get('stageId')
  }.property('stageId'),
  // sortingScope: 'sortingPipelineSteps',
  showStepAdd(){
    var stepMode = this.get('stepMode');
    var editMode= this.get('editMode');
    let saved = this.get('saved');
    if(stepMode==="scm"&&editMode==="new"&&!saved){
      this.triggerAction({
        action: 'addStep',
        target: this
      })
    }
  },
  modalService: service('modal'),
  actions: {
    dragStart: function(content,e) {
      var dom = e.target
      var crt = dom.cloneNode(true);
      crt.style.position = "fixed";
      crt.style.top = "-100%"; crt.style.right = "-100%";
      crt.style.backgroundColor=crt.style.color
      dom.appendChild(crt);
      e.dataTransfer.setDragImage(crt,e.offsetX,e.offsetY);
      dom.style.backgroundColor=document.defaultView.getComputedStyle(dom.getElementsByClassName('step-name')[0]).color
      dom.style.filter = 'brightness(1.3)';
      this.dragDom = dom;
      this.crt=crt;
    },
    startHook: function(){

    },
    dragEnd: function(){
      var crt = this.crt
      crt&&crt.remove()
      if(this.dragDom){
        this.dragDom.style.filter="";
        this.dragDom.style.backgroundColor="white";
      }
    },
    addStep: function() {
      var cb = (step) => {
          var model = this.get('model');
          this.set('model',model.concat(step));
        };
      this.get('modalService').toggleModal('modal-pipeline-new-step', {
        type: 'add',
        pipeline: this.get('pipeline'),
        clusterPipeline: this.get('clusterPipeline'),
        stageInfo: this.get('stageInfo'),
        stageIndex: this.get('stageIndex'),
        stepMode: this.get('stepMode'),
        editMode: this.get('editMode'),
        accounts: this.get('accounts'),
        routeState: this.get('routeState'),
        cb: cb
      });
    },
    editStep: function(index) {
      var review = this.get('review');
      this.get('modalService').toggleModal('modal-pipeline-new-step', {
        type: review?'review':'edit',
        pipeline: this.get('pipeline'),
        clusterPipeline: this.get('clusterPipeline'),
        params: this.get('model')[index],
        stageInfo: this.get('stageInfo'),
        stageIndex: this.get('stageIndex'),
        stepMode: this.get('stepMode'),
        editMode: this.get('editMode'),
        accounts: this.get('accounts'),
        routeState: this.get('routeState'),
        cb: (step) => {
          var model = this.get('model');
          var newModel = model.map((ele,i) => {
            if(i===index){
              return step
            }
            return ele
          })
          this.set('model',newModel);
        },
        rmCb: ()=>{
          var model = this.get('model');
          var newModel = model.filter((ele,i) => {
            if(i===index){
              return false
            }
            return true
          })
          this.set('model',newModel);
        }
      });
    }
  }
});
