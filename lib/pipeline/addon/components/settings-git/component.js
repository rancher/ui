import Component from '@ember/component';
import { later, cancel } from '@ember/runloop';
import { set, get, computed } from '@ember/object';

export default Component.extend({
  classNames: ['accordion-wrapper'],

  selectedOauthType:    'github',

  oauthModel:     {},
  scale:          null,
  confirmDisable: false,
  scaleTimer:     null,

  didReceiveAttrs() {
    const quota = get(this, 'settings').findBy('name', 'executor-quota');

    set(this, 'scale', quota);

    const provider = get(this, 'provider');

    if ( provider ) {
      set(this, 'selectedOauthType', get(provider, 'name'));
    }
  },

  actions: {
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
