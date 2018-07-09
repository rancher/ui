import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { set, get } from '@ember/object';

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

  if (!stage.expressions){

    stage.conditions = {}

  }

}

export default Component.extend({
  modalService:   service('modal'),
  sortFinishText: null,
  crt:            null,
  dragDom:        null,
  model:          null,
  pipeline:       null,
  envvars:        '[]',
  systemVars:     null,
  envvarsLoading: true,
  review:         function(){

    return !get(this, 'editable');

  }.property('editable'),
  init() {

    this._super(...arguments);
    set(this, 'envvars', JSON.parse(get(this, 'envvars')).map((ele) => `\${${ ele }}`));

  },
  actions: {
    dragStart(content, e) {

      var dom = e.target
      var crt = dom.cloneNode(true);

      crt.style.position = 'fixed';
      crt.style.top = '-100%';
      crt.style.right = '-100%';
      crt.style.filter = 'grayscale(1)';
      var stepWrapGhost = crt.getElementsByClassName('steps-wrap')[0]

      stepWrapGhost.style.border = '1px dashed gray';
      dom.appendChild(crt);
      e.dataTransfer.setDragImage(crt, 84, 50);
      dom.style.filter = 'grayscale(1) drop-shadow(5px 5px 5px #ccc)';
      this.dragDom = dom;
      this.crt = crt;

    },
    // startHook: function() {

    // },
    dragEnd() {

      var crt = this.crt

      crt && crt.remove()
      this.dragDom && (this.dragDom.style.filter = '')

    },
    addStage() {

      var cb = (stage) => {

        var stages = get(this, 'pipeline.stages');
        var valid = validateStageName(stages, stage)

        if (valid !== -1) {

          return false;

        }
        validateConditions(stage);
        setTimeout(() => {

          this.$(`.js-add-step-${ stages.length }`).trigger('click');

        }, 0);
        stages.pushObject(stage);

        return true;

      };

      get(this, 'modalService').toggleModal('modal-pipeline-new-stage', {
        mode:     'new',
        pipeline: get(this, 'pipeline'),
        cb
      })

    },
    editStage(index) {

      var review = !get(this, 'editable');

      get(this, 'modalService').toggleModal('modal-pipeline-new-stage', {
        stage:    get(this, 'pipeline.stages')[index],
        pipeline: get(this, 'pipeline'),
        mode:     review ? 'review' : 'edit',
        cb:       (stage) => {

          var stages = get(this, 'pipeline.stages');
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
          set(this, 'pipeline.stages', newStage);

          return true;

        },
        rmCb: () => {

          var newStage = get(this, 'pipeline.stages').filter((ele, i) => {

            if (i === index) {

              return false;

            }

            return true;

          });

          set(this, 'pipeline.stages', newStage);

        }
      })

    }
  }
});
