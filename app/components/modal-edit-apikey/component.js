import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import NewOrEdit from 'shared/mixins/new-or-edit';
import ModalBase from 'shared/mixins/modal-base';
import layout from './template';
import {
  get, set, computed, observer, setProperties
} from '@ember/object';
import moment from 'moment';
import $ from 'jquery';
import C from 'ui/utils/constants';

const ttlUnits = ['minutes', 'hours', 'days', 'years'];

export default Component.extend(ModalBase, NewOrEdit, {
  endpointService: service('endpoint'),
  intl:            service(),
  scope:           service(),
  settings:        service(),

  layout,
  classNames:      ['large-modal', 'alert'],
  model:           null,
  clone:           null,
  justCreated:     false,
  expire:          'never',
  complexExpire:   'max',
  ttlUnit:         'minutes',
  customTTL:       '0',

  ttlUnits,
  originalModel:    alias('modalService.modalOpts'),
  displayEndpoint:  alias('endpointService.api.display.current'),
  linkEndpoint:     alias('endpointService.api.auth.current'),
  showSimpleExpire: computed.not('authTokenHasMaxTTL'),

  didReceiveAttrs() {
    setProperties(this, {
      clone:       get(this, 'originalModel').clone(),
      model:       get(this, 'originalModel').clone(),
      justCreated: false,
    });

    this.expireChanged();
    this.complexExpireChanged();
  },

  didInsertElement() {
    setTimeout(() => {
      $('TEXTAREA')[0].focus();
    }, 250);
  },

  expireChanged: observer('expire', function() {
    const now  = moment();
    let expire = now.clone();

    if ( get(this, 'expire') ) {
      expire = expire.add(1, get(this, 'expire'));
    }

    set(this, 'model.ttl', expire.diff(now));
  }),

  complexExpireChanged: observer('customTTL', 'ttlUnit', 'complexExpire', 'maxTTLDuration', function() {
    const customTTL = Number.parseFloat(get(this, 'customTTL'));
    const ttlUnit = get(this, 'ttlUnit');
    const complexExpire = get(this, 'complexExpire');
    const maxTTLDuration = get(this, 'maxTTLDuration');
    const customDuration = moment.duration(customTTL, ttlUnit);
    const duration = complexExpire === 'max' ? maxTTLDuration : customDuration;

    set(this, 'model.ttl', duration.asMinutes());
  }),

  ttlUnitChanged: observer('ttlUnit', function() {
    set(this, 'customTTL', 0);
  }),

  authTokenMaxTTL: computed(`settings.${ C.SETTING.AUTH_TOKEN_MAX_TTL_MINUTES }`, function() {
    const maxTTL = get(this, `settings.${ C.SETTING.AUTH_TOKEN_MAX_TTL_MINUTES }`) || '0';

    return Number.parseFloat(maxTTL);
  }),

  authTokenHasMaxTTL: computed('authTokenMaxTTL', function() {
    return get(this, 'authTokenMaxTTL') > 0;
  }),

  maxTTLDuration: computed('authTokenMaxTTL', function() {
    const maxTTLInMinutes = get(this, 'authTokenMaxTTL');

    return moment.duration(maxTTLInMinutes, 'minutes');
  }),

  maxTTLBestUnit: computed('maxTTLDuration', function() {
    const duration = get(this, 'maxTTLDuration');

    return this.getBestTimeUnit(duration);
  }),

  friendlyMaxTTL: computed('maxTTLDuration', 'maxTTLBestUnit', function() {
    const intl = get(this, 'intl');
    const duration = get(this, 'maxTTLDuration');
    const unit = get(this, 'maxTTLBestUnit');
    const count = roundDown(duration.as(unit), 2);

    return intl.t(`editApiKey.ttl.max.unit.${ unit }`, { count });
  }),

  editing: computed('clone.id', function() {
    return !!get(this, 'clone.id');
  }),

  displayPassword: computed('clone.token', 'clone.name', function() {
    const prefix = get(this, 'clone.name');
    const token  = get(this, 'clone.token');

    if ( !token || !prefix ) {
      return null;
    }

    const parts = token.split(':');

    if ( parts.length === 2 && parts[0] === prefix ){
      return parts[1];
    }

    return null;
  }),

  ttlCustomMax: computed('authTokenHasMaxTTL', 'ttlUnit', 'maxTTLDuration', function() {
    if (!get(this, 'authTokenHasMaxTTL')) {
      return 0;
    }

    const unit = get(this, 'ttlUnit');
    const duration = get(this, 'maxTTLDuration');

    return roundDown(duration.as(unit), 2);
  }),


  ttlUnitOptions: computed('maxTTLBestUnit', function() {
    const unit = get(this, 'maxTTLBestUnit');
    const indexOfUnit = ttlUnits.indexOf(unit);

    return ttlUnits.slice(0, indexOfUnit + 1);
  }),

  allClusters: computed('scope.allClusters.@each.{id}', function() {
    const allClusters = get(this, 'scope.allClusters');

    return allClusters.map((c) => {
      return {
        label: `${ get(c, 'displayName') } ( ${ get(c, 'id') } )`,
        value: get(c, 'id'),
      }
    }).sortBy('displayName');
  }),

  getBestTimeUnit(duration) {
    const unit = [...ttlUnits].reverse().find(((unit) => duration.as(unit) >= 1));

    return unit || ttlUnits[0];
  },

  doneSaving(neu) {
    if ( get(this, 'editing') ) {
      this.send('cancel');
    } else {
      setProperties(this, {
        justCreated: true,
        clone:       neu.clone()
      });
    }
  }
});

function roundDown(value, digits) {
  const factor = 10 * digits;

  return Math.floor(value * factor) / factor;
}