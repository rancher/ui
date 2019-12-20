import Component from '@ember/component';
import { later, cancel } from '@ember/runloop';
import { set, get, computed, setProperties } from '@ember/object';
import { inject as service } from '@ember/service';
import { convertToMillis } from 'shared/utils/util';
import { parseSi } from 'shared/utils/parse-unit';
import { all as PromiseAll } from 'rsvp';

export default Component.extend({
  growl:      service(),
  intl:       service(),
  classNames: ['accordion-wrapper'],

  selectedOauthType:    'github',

  oauthModel:     {},
  scale:          null,
  confirmDisable: false,
  showCert:       false,
  scaleTimer:     null,
  cacerts:        null,

  didReceiveAttrs() {
    if (get(this, 'settings.length') === 0) {
      return
    }

    const quota = get(this, 'settings').findBy('name', 'executor-quota');
    const cacerts = get(this, 'settings').findBy('name', 'git-cacerts');
    const cpuRequest = get(this, 'settings').findBy('name', 'executor-cpu-request');
    const cpuLimit = get(this, 'settings').findBy('name', 'executor-cpu-limit');
    const memoryRequest = get(this, 'settings').findBy('name', 'executor-memory-request');
    const memoryLimit = get(this, 'settings').findBy('name', 'executor-memory-limit');

    setProperties(this, {
      scale:                     quota,
      cacerts,
      cpuRequest:                convertToMillis(get(cpuRequest, 'value')),
      cpuLimit:                  convertToMillis(get(cpuLimit, 'value')),
      memoryRequest:             parseSi(get(memoryRequest, 'value'), 1024) / 1048576,
      memoryLimit:               parseSi(get(memoryLimit, 'value'), 1024) / 1048576,
      'oauthModel.clientId':     '',
      'oauthModel.clientSecret': ''
    })

    const provider = get(this, 'provider');

    if ( provider ) {
      set(this, 'selectedOauthType', get(provider, 'name'));
    }
  },

  actions: {
    showCert() {
      set(this, 'showCert', true);
    },

    hideCert() {
      set(this, 'showCert', false);
    },

    saveCert(cb) {
      get(this, 'cacerts').save()
        .then(() => {
          cb(true);
        })
        .catch((err) => {
          get(this, 'growl').fromError('Error saving cacerts', err);
          cb(false);
        });
    },

    saveLimit(cb) {
      const {
        cpuRequest,
        cpuLimit,
        memoryRequest,
        memoryLimit
      } = this;
      const cpuRequestSetting    = get(this, 'settings').findBy('name', 'executor-cpu-request');
      const cpuLimitSetting      = get(this, 'settings').findBy('name', 'executor-cpu-limit');
      const memoryRequestSetting = get(this, 'settings').findBy('name', 'executor-memory-request');
      const memoryLimitSetting   = get(this, 'settings').findBy('name', 'executor-memory-limit');
      const promises = [];

      // there is a small possability that these values are NaN due to an issue where input-interger wouldn't set the Min value if the value inside was a NaN.
      // this helps those that may have hit this bug before the fix and will resolve the issue the next time they open this page.
      if (!Number.isNaN(cpuRequest)) {
        set(cpuRequestSetting, 'value', `${ cpuRequest }m`);
        promises.push(cpuRequestSetting.save());
      }

      if (!Number.isNaN(cpuLimit)) {
        set(cpuLimitSetting, 'value', `${ cpuLimit }m`);
        promises.push(cpuLimitSetting.save());
      }

      if (!Number.isNaN(memoryRequest)) {
        set(memoryRequestSetting, 'value', `${ memoryRequest }Mi`);
        promises.push(memoryRequestSetting.save());
      }

      if (!Number.isNaN(memoryLimit)) {
        set(memoryLimitSetting, 'value', `${ memoryLimit }Mi`);
        promises.push(memoryLimitSetting.save());
      }

      return PromiseAll(promises).then(() => {
        cb(true);
      }).catch((err) => {
        get(this, 'growl').fromError(get(this, 'intl').t('pipelinesSetting.error.limit'), err);
        cb(false);
      });
    },

    scaleDown() {
      set(this, 'scale.value', parseInt(get(this, 'scale.value'), 10) - 1);
      this.saveScale();
    },

    scaleUp() {
      set(this, 'scale.value', parseInt(get(this, 'scale.value'), 10) + 1);
      this.saveScale();
    },

    changeOauthType(type) {
      set(this, 'selectedOauthType', type);
      const store = get(this, 'store');

      set(this, 'oauthModel', store.createRecord({
        type:   'sourcecodecredential',
        scheme: true,
      }));
    },

    disable() {
      const provider = get(this, 'provider');

      set(this, 'disabling', true);
      provider.doAction('disable').then(() => {
        window.location.reload();
      });
    },

    promptDisable() {
      set(this, 'confirmDisable', true);
      later(this, function() {
        if ( this.isDestroyed || this.isDestroying ) {
          return;
        }
        set(this, 'confirmDisable', false);
      }, 10000);
    },
  },

  providerComponent: computed('selectedOauthType', function() {
    return `${ get(this, 'selectedOauthType') }-setting`
  }),

  provider:  computed('selectedOauthType', 'providers.@each.enabled', function() {
    const enabled = get(this, 'providers').findBy('enabled', true);
    const selected = get(this, 'providers').findBy('name', get(this, 'selectedOauthType'));

    if ( enabled ) {
      return enabled;
    } else if ( selected ) {
      return selected;
    } else {
      return get(this, 'providers.firstObject');
    }
  }),

  isBitbucket: computed('selectedOauthType', function() {
    const selected = get(this, 'selectedOauthType');

    return selected === 'bitbucketcloud' || selected === 'bitbucketserver';
  }),

  isBitbucketCloud: computed('selectedOauthType', function() {
    const selected = get(this, 'selectedOauthType');

    return selected === 'bitbucketcloud';
  }),

  isGithub: computed('selectedOauthType', function() {
    const selected = get(this, 'selectedOauthType');

    return selected === 'github';
  }),

  isGitlab: computed('selectedOauthType', function() {
    const selected = get(this, 'selectedOauthType');

    return selected === 'gitlab';
  }),

  saveScale() {
    if ( get(this, 'scaleTimer') ) {
      cancel(get(this, 'scaleTimer'));
    }

    const timer = later(this, function() {
      get(this, 'scale').save()
        .catch((err) => {
          get(this, 'growl').fromError('Error updating executor quota', err);
        });
    }, 500);

    set(this, 'scaleTimer', timer);
  },

});
