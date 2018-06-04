import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { set, get, observer } from '@ember/object';
import { alias } from '@ember/object/computed';
import { next } from '@ember/runloop';
import { downloadFile, generateZip } from 'shared/utils/download-files';

export default Component.extend({
  growl:        service(),
  intl:         service(),
  router:       service(),
  modalService: service('modal'),

  errors:         null,
  selectedConfig: null,
  showAdvanced:   false,
  pushConfig:     true,
  when:           null,

  pipeline:       alias('model.pipelineConfig'),
  selectedBranch: alias('pipeline.selectedBranch'),
  actions:        {
    save(success){
      let pipeline = get(this, 'model.pipeline').clone();
      const config = get(this, 'pipeline');

      const originConfigs = JSON.parse(get(config, 'rawBranches'));
      const unSyncConfigs = {};
      const updatedBranch = [];

      const key = get(this, 'selectedBranch');
      const branch = (get(this, 'pipeline.branches') || []).findBy('branch', key);
      let current;

      if ( !branch.config || !branch.config.stages || branch.config.stages.length < 2 ) {
        current = 'null';
      } else {
        const config = Object.assign({}, branch.config);

        set(config, 'stages', config.stages.slice(1));
        current = JSON.stringify(config);
      }
      const origin = JSON.stringify(originConfigs[key]);

      if ( current !== origin ) {
        const config = Object.assign({}, branch.config);
        const stages = config.stages.filter((stage) => stage.steps && stage.steps.length && !stage.steps[0].sourceCodeConfig );
        const branches = config.branch;

        set(config, 'stages', stages);
        set(config, 'branch', branches);
        if ( config.timeout ) {
          set(config, 'timeout', parseInt(config.timeout, 10));
        }
        unSyncConfigs[key] = config;
        updatedBranch.push(key);
      }

      set(pipeline, 'unSyncConfigs', unSyncConfigs);

      if ( updatedBranch.length ) {
        get(this, 'modalService').toggleModal('confirm-update-config', {
          updatedBranch,
          pushToRepo: () => {
            this.submit(pipeline, success, true)
          },

          download: () => {
            this.download(pipeline, success);
          },

          cancel:     () => {
            success(false)
          },
        });
      } else {
        this.submit(pipeline, success);
      }
    },

    cancel(){
      get(this, 'router').transitionTo('authenticated.project.pipeline.pipelines');
    },

    select(branch){
      set(this, 'selectedBranch', branch.branch);
    },

    enableBranch() {
      const branch = (get(this, 'pipeline.branches') || []).findBy('branch', get(this, 'selectedBranch'));

      branch.config = {
        stages: [{
          name:  'clone',
          steps: [{ sourceCodeConfig: {},  }]
        }],
        timeout: 60
      };
      this.branchDidChange();
    },
  },

  whenDidChange:  observer('when', function(){
    const branches = get(this, 'when.branch');

    if ( get(this, 'selectedConfig') ) {
      if ( !get(this, 'selectedConfig.branch') && Object.keys(branches).length === 0 ) {
        return;
      }
      set(this, 'selectedConfig.branch', branches);
    }
  }),

  selectedConfigDidChange: observer('selectedConfig', function(){
    set(this, 'showAdvanced', false);
    const branches = get(this, 'selectedConfig.branch') || {};

    if ( get(this, 'selectedConfig') ) {
      set(this, 'when', { branch: branches });
      next(() => {
        set(this, 'showAdvanced', true);
      });
    }
  }),

  branchDidChange: observer('pipeline.branches', 'selectedBranch', function(){
    const branch = (get(this, 'pipeline.branches') || []).findBy('branch', get(this, 'selectedBranch'));

    if ( !branch ) {
      return;
    }
    if ( !branch.config ) {
      set(branch, 'config', {});
    }
    if ( !branch.config.stages ) {
      set(branch, 'config.stages', []);
    }
    set(this, 'selectedConfig', branch.config);
  }),

  download(pipeline, success) {
    const unSyncConfigs = get(pipeline, 'unSyncConfigs');

    get(this, 'store').rawRequest({
      url:    `${ get(pipeline, 'links.yaml') }?configs=${ JSON.stringify(unSyncConfigs) }`,
      method: 'GET',
    }).then((res) => {
      const data = JSON.parse(res.body);
      const files = [];

      Object.keys(data).forEach((key) => {
        files.push({
          name: `${ key }.yml`,
          file: data[key]
        });
      });

      if ( files.length > 1 ) {
        generateZip(files).then((zip) => {
          downloadFile(`rancher-pipeline.zip`, zip, zip.type);
        });
      } else {
        downloadFile(`.rancher-pipeline.yml`, files[0].file);
      }

      success(true);
      get(this, 'router').transitionTo('authenticated.project.pipeline.pipelines');
    }).catch(() => {
      success(false);
    });
  },

  submit(pipeline, success, pushToRepo = false) {
    const unSyncConfigs = get(pipeline, 'unSyncConfigs');

    if ( pushToRepo ) {
      pipeline.doAction('pushconfig', { configs: unSyncConfigs }).then(() => {
        success(true);
        get(this, 'router').transitionTo('authenticated.project.pipeline.pipelines');
      }).catch(() => {
        success(false);
      });
    } else {
      success(true);
      get(this, 'router').transitionTo('authenticated.project.pipeline.pipelines');
    }
  },

});
