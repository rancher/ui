import {
  get, set, computed, observer
} from '@ember/object'
import Component from '@ember/component';
import layout from './template';
import { inject as service } from '@ember/service';
import C from 'shared/utils/constants';

export default Component.extend({
  settings: service(),

  layout,

  mode: 'automatic',

  rule:         null,
  rules:        null,
  ingress:      null,
  editing:      true,
  existingHost: null,

  isDefault: computed('mode', function() {
    return get(this, 'mode') === 'default';
  }),

  defaultDisabled: computed('rules.@each.defaultBackend', function() {
    const def = get(this, 'ingress.defaultBackend');
    const me = get(this, 'rule.defaultBackend');

    return !!def && !me;
  }),


  modeChanged: observer('mode', function() {
    const mode = get(this, 'mode');
    const rule = get(this, 'rule');
    const def = get(this, 'ingress.defaultBackend');

    if ( mode === 'default' && !get(this, 'rule.defaultBackend') ) {
      set(this, 'rule.defaultBackend', true);
    } else if ( mode !== 'default' && def && get(this, 'rule.defaultBackend') ){
      set(this, 'rule.defaultBackend', false);
      set(this, 'ingress.defaultBackend', null);
    }

    const xip = get(this, `settings.${ C.SETTING.INGRESS_IP_DOMAIN }`);
    const existingHost = get(this, 'existingHost');

    if ( mode === 'automatic' ) {
      set(rule, 'host', xip);
    } else if ( mode === 'existing' ) {
      set(rule, 'host', existingHost);
    } else {
      if ( get(rule, 'host') === xip ) {
        set(rule, 'host', existingHost || '');
      }
    }
  }),
  init() {
    this._super(...arguments);

    const xip = get(this, `settings.${ C.SETTING.INGRESS_IP_DOMAIN }`);
    const host = get(this, 'rule.host');

    if (get(this, 'rule.defaultBackend')) {
      set(this, 'mode', 'default');
    } else if ( host && host === xip ) {
      set(this, 'mode', 'automatic');
    } else if ( !get(this, 'rule.new') ) {
      set(this, 'mode', 'existing');
      set(this, 'existingHost', host);
    }

    this.modeChanged();
  },

  actions: {
    removeRule(rule) {
      this.sendAction('removeRule', rule);
      if ( rule.defaultBackend ) {
        set(this, 'ingress.defaultBackend', null);
      }
    },
  },

});
