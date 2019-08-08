import Component from '@ember/component';
import layout from './template';
import { inject as service } from '@ember/service';
import { alias } from '@ember/object/computed';
import {
  set, get, computed, observer, setProperties
} from '@ember/object';

export default Component.extend({
  scope: service(),
  layout,

  // Inputs
  pipeline: null,
  accounts: null,

  errors: null,

  // Internal
  url:          alias('pipeline.url'),
  init() {
    this._super(...arguments);

    if ( get(this, 'url') ) {
      this.urlDidChange();
    }
  },

  selectedBranchDidChange: observer('pipeline.selectedBranch', function() {
    const branch = get(this, 'pipeline.selectedBranch');

    if ( branch ) {
      set(this, 'pipeline.loading', true);
      get(this, 'store')
        .request({
          url:    `/v3/projects/${ get(this, 'scope.currentProject.id') }/pipelines/${ get(this, 'pipelineId') }/configs?branch=${ branch }`,
          method: 'GET',
        })
        .then((res) => {
          const configs = JSON.parse(res);

          for (const key in configs) {
            let config;

            config = configs[key];

            if ( config && config.stages ) {
              config.stages.unshift({
                name:  'clone',
                steps: [{ sourceCodeConfig: {},  }]
              });
            }

            const target = get(this, 'pipeline.branches').findBy('branch', branch);

            set(target, 'config', config);
            setProperties(target, {
              config,
              rawBranches: res
            })
          }
        })
        .catch((err) => {
          set(this, 'serverErrors', [err.message]);
          this.showErrors(err);
        })
        .finally(() => {
          set(this, 'pipeline.loading', false);
        });
    }
  }),

  urlDidChange: observer('url', function() {
    if ( !get(this, 'url') ) {
      return;
    }

    set(this, 'pipeline.loading', true);
    const promise = get(this, 'store').request({
      url:    `/v3/projects/${ get(this, 'scope.currentProject.id') }/pipelines/${ get(this, 'pipelineId') }/branches`,
      method: 'GET',
    });

    promise.then((res) => {
      const branches = JSON.parse(res).map((branch) => {
        return { branch }
      }).sortBy('branch');

      set(this, 'pipeline.url', get(this, 'url'));
      set(this, 'pipeline.branches', branches);
      set(this, 'pipeline.selectedBranch', get(branches, 'firstObject.branch'));
    }).catch((err) => {
      set(this, 'serverErrors', [err.message]);
      set(this, 'pipeline.loading', false);
      this.showErrors(err);
    });
  }),

  principal: computed('accountsInfo', function() {
    const account = get(this, 'accountsInfo');

    if ( !account ) {
      return
    }
    const profile = Object.assign({}, account);

    profile.name = profile.loginName;
    profile.username = profile.displayName;
    profile.profilePicture = profile.avatarUrl;
    profile.avatarSrc = profile.avatarUrl;

    return profile;
  }),

  accountsInfo: computed('accounts.@each.logout', function() {
    const accounts = get(this, 'accounts').filter((account) => !account.logout);

    if ( get(accounts, 'length') === 0 ) {
      return get(this, 'pipeline.sourceCodeCredential');
    }

    const out = get(accounts, 'firstObject');

    return out ? out : null;
  }),

  showErrors(err) {
    if ( err.message ) {
      set(this, 'errors', [`${ err.message }${ err.detail ? `(${  err.detail  })` : '' }`]);
    } else {
      set(this, 'errors', [`Error (${ err.status } - ${ err.code })`]);
    }
  },
});
