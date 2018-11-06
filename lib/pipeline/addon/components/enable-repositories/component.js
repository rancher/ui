import Component from '@ember/component';
import { inject as service } from '@ember/service';
import EmberObject, { set, get, computed, observer } from '@ember/object';
import { alias } from '@ember/object/computed';
import C from 'shared/utils/pipeline-constants';

const headers = [
  {
    translationKey: 'repositories.table.repository',
    name:           'url',
    sort:           ['url'],
  },
  { width: 200,  },
]

export default Component.extend({
  growl:           service(),
  modalService:    service('modal'),
  router:          service(),
  providerService: service('pipeline-github'),

  repositories:         null,
  headers,
  errors:               null,
  authorizing:          false,
  loggingout:           false,
  refreshing:           false,
  filteredRepositories: null,
  sortBy:               'url',

  accounts:  alias('model.accounts'),
  pipeline:  alias('model.pipeline'),
  pipelines: alias('model.pipelines'),
  providers: alias('model.providers'),
  canConfig: alias('model.canConfig'),

  init() {
    this._super(...arguments);

    if ( get(this, 'accountsInfo') ) {
      set(this, 'repositories', get(this, 'model.repositories'));
    } else {
      this.initDemoRepo();
    }
    this.repositoriesDidChange();
  },

  actions: {
    logout() {
      set(this, 'loggingout', true);
      get(this, 'accountsInfo').doAction('logout')
        .then(() => {
          set(this, 'accountsInfo', null);
          this.initDemoRepo();
        })
        .finally(() => {
          set(this, 'loggingout', false);
        });
    },

    refresh() {
      set(this, 'refreshing', true);
      get(this, 'accountsInfo').doAction('refreshrepos')
        .then((res) => {
          set(this, 'repositories', res.content);
        })
        .finally(() => {
          set(this, 'refreshing', false);
        });
    },

    authorize() {
      const provider = get(this, 'providers.firstObject');

      if ( !provider ) {
        get(this, 'modalService').toggleModal('modal-pipeline-enable', {
          canConfig:  get(this, 'canConfig'),
          escToClose: true,
        });

        return;
      }
      set(this, 'authorizing', true);

      if ( get(provider, 'type') === 'bitbucketServerProvider' ) {
        provider.doAction('requestLogin', {}).then((res) => {
          const url = get(res, 'loginUrl');

          get(this, 'providerService').authorizeTest(url, () => {
            const code = url.slice(url.lastIndexOf('=') + 1 );

            this.doLogin(provider, code);
          }, true);
        })
      } else {
        get(this, 'providerService').authorizeTest(provider.redirectUrl, (err, code) => {
          if ( err ) {
            this.showErrors(err);
            set(this, 'authorizing', false);
          } else {
            this.doLogin(provider, code);
          }
        });
      }
    },

    cancel() {
      get(this, 'router').transitionTo('authenticated.project.pipeline.pipelines');
    }
  },

  repositoriesDidChange: observer('repositories', 'pipelines.[]', function() {
    const out = [];
    const pipelines = get(this, 'pipelines');
    const sourceCodeCredentialId = get(this, 'accountsInfo.id');

    get(this, 'repositories').forEach((repo) => {
      out.push(EmberObject.create({
        isExample: !!repo.isExample,
        url:       repo.url,
        pipeline:  pipelines.findBy('repositoryUrl', repo.url),
        sourceCodeCredentialId,
      }));
    });
    set(this, 'filteredRepositories', out);
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

  doLogin(provider, code) {
    provider.doAction('login', { code,  }).then((user) => {
      set(this, 'accountsInfo', user);
      user.followLink('sourceCodeRepositories').then((repositories) => {
        set(this, 'repositories', repositories);
      });
      set(this, 'authorizing', false);
    })
      .catch((err) => {
        this.showErrors(err);
        set(this, 'authorizing', false);
      });
  },

  showErrors(err) {
    if ( err.message ) {
      set(this, 'errors', [`${ err.message }${ err.detail ? `(${  err.detail  })` : '' }`]);
    } else {
      set(this, 'errors', [`Error (${ err.status } - ${ err.code })`]);
    }
  },

  initDemoRepo() {
    set(this, 'repositories', C.DEMO_REPOSITORIES.map((repo) => EmberObject.create({
      url:       repo.url,
      isExample: true,
    })));
  },

});
