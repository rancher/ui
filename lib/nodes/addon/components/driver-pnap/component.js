import { alias } from '@ember/object/computed';
import { get, set } from '@ember/object';
import Component from '@ember/component';
import NodeDriver from 'shared/mixins/node-driver';
import layout from './template';
import { inject as service } from '@ember/service';


const DRIVER = 'pnap';
const CONFIG = 'pnapConfig';

const LOCATION_CHOICES = [
  { value: 'PHX' },
  { value: 'ASH' }
];

const OS_CHOICES = [
  { value: 'ubuntu/bionic' },
  { value: 'centos/centos7' }
];


const TYPE_CHOICES = [
  { value: 's1.c1.small' },
  { value: 's1.c1.medium' },
  { value: 's1.c2.medium' },
  { value: 's1.c2.large' },
  { value: 'd1.c1.small' },
  { value: 'd1.c1.medium' },
  { value: 'd1.c1.large' },
  { value: 'd1.m1.medium' }
];

export default Component.extend(NodeDriver, {
  intl: service(),

  layout,
  driverName:         DRIVER,
  locationChoices:    LOCATION_CHOICES,
  osChoices:          OS_CHOICES,
  typeChoices:        TYPE_CHOICES,

  model:              null,
  config:             alias(`model.${ CONFIG }`),

  actions: {
    finishAndSelectCloudCredential(credential) {
      set(this, 'model.cloudCredentialId', get(credential, 'id'))
    }
  },

  bootstrap() {
    let config = get(this, 'globalStore').createRecord({
      type:           CONFIG,
      serverLocation: 'PHX',
      serverType:     's1.c1.medium',
      serverOs:       'ubuntu/bionic',
      serverHostname: 'host'
    });

    set(this, `model.${ CONFIG }`, config);
  },

  validate() {
    this._super();
    let errors = get(this, 'errors') || [];

    if ( !get(this, 'model.name') ) {
      errors.push(this.intl.t('nodeDriver.nameError'));
    }

    if (!this.validateCloudCredentials()) {
      errors.push(this.intl.t('nodeDriver.cloudCredentialError'))
    }


    if (errors.length) {
      set(this, 'errors', errors.uniq());

      return false;
    }

    return true;
  },

});
