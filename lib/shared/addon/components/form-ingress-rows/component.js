import { get, set, computed, observer } from '@ember/object'
import Component from '@ember/component';
import layout from './template';
import { inject as service } from '@ember/service';
import C from 'shared/utils/constants';

export default Component.extend({
  settings: service(),

  layout,

  mode: 'automatic',

  rule: null,
  rules: null,
  ingress: null,
  editing: true,
  defaultBackend: null,

  init() {
    this._super(...arguments);

    const xip = get(this, `settings.${C.SETTING.INGRESS_IP_DOMAIN}`);
    const host = get(this,'rule.host');

    if (get(this, 'rule.defaultBackend')) {
      set(this, 'mode', 'default');
    } else if ( host && host === xip ) {
      set(this, 'mode', 'automatic');
    } else if ( host ) {
      set(this, 'mode', 'manual');
    }

    this.modeChanged();
  },

  actions: {
    removeRule(rule) {
      this.sendAction('removeRule', rule);
    },
  },

  isDefault: computed('mode', function() {
    return get(this,'mode') === 'default';
  }),

  defaultDisabled: computed('defaultBackend','rule', function() {
    const def = get(this, 'defaultBackend');
    const me = get(this, 'rule');

    return !!def && (def !== me);
  }),


  modeChanged: observer('mode', function() {
    const mode = get(this, 'mode');
    const rule = get(this, 'rule');
    const def = get(this, 'defaultBackend');

    if ( mode === 'default' ) {
      this.sendAction('updateDefaultBackend', rule);
    } else if ( def ){
      this.sendAction('updateDefaultBackend', null);
    }

    const xip = get(this, `settings.${C.SETTING.INGRESS_IP_DOMAIN}`);
    if ( mode === 'automatic' ) {
      set(rule,'host', xip);
    } else {
      if ( get(rule, 'host') === xip ) {
        set(rule, 'host', '');
      }
    }
  }),

  defaultBackendChanged: observer('defaultBackend', function () {
    const isDefault = get(this, 'defaultBackend') === get(this, 'rule');
    const mode = get(this, 'mode');
    const hasHost = !!get(this, 'rule.host');

    if ( isDefault && mode !== 'default') {
      set(this, 'mode', 'default');
    }  else if ( !isDefault && mode === 'default' ) {
      if ( hasHost ) {
        set(this, 'mode', 'manual');
      } else {
        set(this, 'mode', 'automatic');
      }
    }
  }),
});
