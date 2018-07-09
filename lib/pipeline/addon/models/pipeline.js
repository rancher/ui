import Resource from 'ember-api-store/models/resource';
import branchConditionsEnums from 'pipeline/utils/branchConditionsEnums';
import { inject as service } from '@ember/service';
import { download } from 'shared/utils/util';
import { get } from '@ember/object';

const ENUMS_STATUSCLASS = {
  'true':  'bg-success',
  'false': 'bg-warning',
};

let Pipeline = Resource.extend({
  isActive: function() {

    return get(this, 'pipelineState') === 'active' ? true : false;

  }.property('pipelineState'),

  availableActions: function() {

    var isActive = get(this, 'isActive');
    let l = get(this, 'links') || {};

    return [
      { divider: true },
      {
        label:    'action.run',
        icon:     'icon icon-play',
        action:   'run',
        enabled:  true,
        bulkable: false
      },
      { divider: true },
      {
        label:    'action.viewConfig',
        icon:     'icon icon-files',
        action:   'viewConfig',
        enabled:  !!l.export,
        bulkable: false
      },
      {
        label:    'action.exportConfig',
        icon:     'icon icon-download',
        action:   'exportConfig',
        enabled:  !!l.export,
        bulkable: false
      },
      { divider: true },
      {
        label:    'action.activate',
        icon:     'icon icon-play',
        action:   'activate',
        enabled:  !isActive,
        bulkable: !isActive
      },
      {
        label:    'action.deactivate',
        icon:     'icon icon-stop',
        action:   'deactivate',
        enabled:  isActive,
        bulkable: isActive
      },
    ];

  }.property('actions.{run,remove,deactivate,activate,edit,clone}', 'piplineState', 'isActive'),

  images: function() {

    var images = [];
    var stages = get(this, 'stages');

    for (var i = 0; i < stages.length; i++) {

      var item = stages[i].steps;

      for (var j = 0; j < item.length;j++){

        var itemJ = item[j];

        if (itemJ.type === 'task'){

          var exist = images.findIndex((ele) => ele === itemJ.image);

          (exist === -1) && images.push(itemJ.image);

        }
        if (itemJ.type === 'build'){

          exist = images.findIndex((ele) => ele === itemJ.targetImage);
          (exist === -1) && images.push(itemJ.targetImage);

        }

      }

    }

    return images;

  }.property('stages.@each.{steps}'),

  repository: function() {

    return get(this, 'stages')[0].steps[0].sourceCodeConfig.url;

  }.property('stages'),

  branch: function() {

    return get(this, 'stages')[0].steps[0].sourceCodeConfig.branch;

  }.property('stages'),

  branchConditionLabel: function() {

    let branchCondition = get(this, 'stages')[0].steps[0].sourceCodeConfig.branchCondition;
    let branchEnum = branchConditionsEnums.find((ele) => ele.value === branchCondition);

    return branchEnum && branchEnum.label || '';

  }.property('stages'),

  branchCondition: function() {

    let branchCondition = get(this, 'stages')[0].steps[0].sourceCodeConfig.branchCondition;

    return branchCondition;

  }.property('stages'),

  statusClass: function() {

    var status = `${ !!get(this, 'isActive') }`;

    return ENUMS_STATUSCLASS[status];

  }.property('isActive'),

  lastRun: function() {

    return get(this, 'nextRun') - 1;

  }.property('nextRun'),
  type:         'pipeline',
  router:       service(),
  access:       service(),
  modalService: service('modal'),

  init(...args) {

    this._super(...args);

  },

  cb() {

    this.delete().then(() => {

      get(this, 'router').transitionTo('authenticated.project.pipeline.pipelines');

    })

  },

  actions: {
    run() {

      let branchCondition = get(this, 'branchCondition');

      if (branchCondition === 'only'){

        return this.doAction('run', { branch: '' })
          .then(() => {

            get(this, 'router').transitionTo('authenticated.project.pipeline.pipeline', get(this, 'id'), { queryParams: { mode: 'review' } })

          });

      } else {

        let cb = (params) => {

          return this.doAction('run', params)
            .then(() => {

              get(this, 'router').transitionTo('authenticated.project.pipeline.pipeline', get(this, 'id'), { queryParams: { mode: 'review' } })

            });

        }

        get(this, 'modalService').toggleModal('modal-pipeline-run', { cb });

      }

    },

    clone() {

      get(this, 'router').transitionTo('authenticated.project.pipeline.pipeline', get(this, 'id'), { queryParams: { mode: 'duplicate' } })

    },

    edit() {

      get(this, 'router').transitionTo('authenticated.project.pipeline.pipeline', get(this, 'id'), { queryParams: { mode: '' } })

    },

    exportConfig() {

      download(this.linkFor('export'));

    },

    viewConfig() {

      get(this, 'router').transitionTo('authenticated.project.pipeline.view-config', get(this, 'id'));

    },

    activate() {

      return this.doAction('activate');

    },

    deactivate() {

      return this.doAction('deactivate');

    },
  },

  validationErrors() {

    var errors = []

    if (!get(this, 'name')) {

      errors.push('"Pipeline Name" is required');

    }
    var allStageNotEmpty = true
    var stages = get(this, 'stages');

    for (var i = 0; i < stages.length;i++){

      var item = stages[i]

      if (!item.steps || item.steps.length === 0){

        allStageNotEmpty = false
        break;

      }

    }
    if (!allStageNotEmpty){

      errors.push('Stage must contain at least one Step');

    }

    return errors;

  },

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
