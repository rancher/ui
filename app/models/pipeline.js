import Resource from '@rancher/ember-api-store/models/resource';
import { inject as service } from '@ember/service';
import { get, computed } from '@ember/object';
import C from 'shared/utils/pipeline-constants';

let Pipeline = Resource.extend({
  router:          service(),
  modalService:    service('modal'),
  type:            'pipeline',
  canEdit:         false,
  canViewYaml:     false,
  canDownloadYaml: false,

  lastRun: computed('nextRun', function() {
    return parseInt(get(this, 'nextRun'), 10) - 1;
  }),

  relevantState: computed('lastRunState', 'state', function() {
    if ( get(this, 'state') === 'removing' ) {
      return 'removing';
    }

    return get(this, 'lastRunState') || 'untriggered';
  }),

  displayRepositoryUrl: computed('repositoryUrl', function() {
    let url = get(this, 'repositoryUrl');

    if ( url.endsWith('.git') ) {
      url = url.substr(0, url.length - 4);
    }

    return url;
  }),

  projectName: computed('displayName', function() {
    const displayName = get(this, 'displayName')  ;
    let tokens = displayName.split('/') ;

    return tokens[0].startsWith('~') ? tokens[0].substr(1, tokens[0].length) : tokens[0];
  }),

  repoName: computed('displayName', function() {
    const displayName = get(this, 'displayName')  ;
    let tokens = displayName.split('/') ;

    return tokens[1];
  }),

  displayName: computed('repositoryUrl', function() {
    let tokens = get(this, 'repositoryUrl').split('/') ;

    tokens = tokens.slice(tokens.length - 2);
    const last = tokens[tokens.length - 1];

    if ( last.endsWith('.git')) {
      tokens[tokens.length - 1] = last.slice(0, last.length - 4);
    }

    return tokens.join('/');
  }),

  availableActions: computed('links.yaml', function() {
    let l = get(this, 'links') || {};
    let a = get(this, 'actions') || {};
    const isExample = C.DEMO_REPOSITORIES.findBy('url', get(this, 'repositoryUrl'));

    return [{ divider: true },
      {
        label:    'action.run',
        icon:     'icon icon-play',
        action:   'run',
        enabled:  !!a.run,
        bulkable: false
      },
      { divider: true },
      {
        label:    'action.editConfig',
        icon:     'icon icon-edit',
        action:   'editConfig',
        enabled:  !!l.update,
        bulkable: false
      },
      {
        label:    'action.editYaml',
        action:   'editYaml',
        icon:     'icon icon-files',
        enabled:  !!l.yaml,
        bulkable: false
      },
      { divider: true },
      {
        label:    'action.setting',
        icon:     'icon icon-process',
        action:   'setting',
        enabled:  !!l.update && !isExample,
        bulkable: false
      },
    ];
  }),
  actions: {
    run() {
      get(this, 'modalService').toggleModal('modal-pipeline-run', {
        originalModel: this,
        escToClose:    true,
      });
    },

    setting() {
      get(this, 'modalService').toggleModal('modal-pipeline-setting', {
        originalModel: this,
        escToClose:    true,
      });
    },

    editConfig() {
      get(this, 'router').transitionTo('authenticated.project.pipeline.pipelines.edit', get(this, 'id'))
    },

    editYaml() {
      get(this, 'modalService').toggleModal('modal-pipeline-yaml', {
        originalModel: this,
        escToClose:    true,
      });
    },
  },

});

Pipeline.reopenClass({
  mangleIn(data) {
    if (data && data.sourceCodeCredential) {
      data.sourceCodeCredential._id = data.sourceCodeCredential.id;
      delete data.sourceCodeCredential.id;
    }

    return data;
  },
});


export default Pipeline;
