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

  selectedNotification: null,
  pipeline:             alias('model.pipelineConfig'),
  selectedBranch:       alias('pipeline.selectedBranch'),
  actions:              {
    save(success){
      let pipeline = get(this, 'model.pipeline').clone();
      const config = get(this, 'pipeline');

      const originConfigs = JSON.parse(get(config, 'rawBranches'));
      const unSyncConfigs = {};
      const updatedBranch = [];

      const key = get(this, 'selectedBranch');
      const branch = (get(this, 'pipeline.branches') || []).findBy('branch', key);
      let current;

      if ( !get(branch, 'config') || !get(branch, 'config.stages') || get(branch, 'config.stages.length') < 2 ) {
        current = 'null';
      } else {
        const config = Object.assign({}, get(branch, 'config'));

        set(config, 'stages', get(config, 'stages').slice(1));
        current = JSON.stringify(config);
      }
      const origin = JSON.stringify(originConfigs[key]);

      if ( current !== origin ) {
        const config = Object.assign({}, get(branch, 'config'));
        const stages = get(config, 'stages').filter((stage) => get(stage, 'steps') && get(stage, 'steps.length') && !get(stage, 'steps.firstObject.sourceCodeConfig') );
        const branches = get(config, 'branch');

        set(config, 'stages', stages);
        set(config, 'branch', branches);
        if ( get(config, 'timeout') ) {
          set(config, 'timeout', parseInt(get(config, 'timeout'), 10));
        }
        unSyncConfigs[key] = config;
        updatedBranch.push(key);
      }

      set(pipeline, 'unSyncConfigs', unSyncConfigs);

      if ( get(updatedBranch, 'length') ) {
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
      set(this, 'selectedBranch', get(branch, 'branch'));
    },

    enableBranch() {
      const branch = (get(this, 'pipeline.branches') || []).findBy('branch', get(this, 'selectedBranch'));

      set(branch, 'config', {
        stages: [{
          name:  'clone',
          steps: [{ sourceCodeConfig: {},  }]
        }],
        timeout: 60
      });
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
    const defaultNotification = {
      recipients: [{
        notifierId:   null,
        recipient:    null,
      }]
    }
    let notification = get(this, 'selectedConfig.notification')

    if (!notification) {
      notification = defaultNotification
      set(this, 'selectedConfig.notification', notification)
    }

    if ( get(this, 'selectedConfig') ) {
      set(this, 'when', { branch: branches });
      set(this, 'selectedNotification', notification)
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
    if ( !get(branch, 'config') ) {
      set(branch, 'config', {});
    }
    if ( !get(branch, 'config.stages') ) {
      set(branch, 'config.stages', []);
    }
    set(this, 'selectedConfig', get(branch, 'config'));
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
          downloadFile(`rancher-pipeline.zip`, zip, get(zip, 'type'));
        });
      } else {
        downloadFile(`.rancher-pipeline.yml`, get(files, 'firstObject.file'));
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
