import { hash } from 'rsvp';
import { on } from '@ember/object/evented';
import {
  get, set, setProperties, computed, observer
} from '@ember/object';
import { isEmpty } from '@ember/utils';
import { alias } from '@ember/object/computed';
import Component from '@ember/component';
import NodeDriver from 'shared/mixins/node-driver';
import fetch from 'ember-api-store/utils/fetch';
import layout from './template';

const OS_WHITELIST = ['centos_7', 'coreos_stable', 'ubuntu_14_04', 'ubuntu_16_04', 'rancher'];
const PLAN_BLACKLIST = ['baremetal_2a']; // quick wheres james spader?
const DEFAULTS = {
  os:           'ubuntu_16_04',
  facilityCode: 'ewr1',
  plan:         'baremetal_0',
  billingCycle: 'hourly',
}

export default Component.extend(NodeDriver, {
  layout,
  driverName:       'packet',
  facilityChoices:  null,
  planChoices:      null,
  osChoices:        null,
  step:             1,

  config: alias('model.packetConfig'),

  init() {
    this._super(...arguments);

    setProperties(this, {
      facilityChoices: [],
      planChoices:     [],
      osChoices:       [],
      allOS:           [],
    });
  },

  actions: {
    authPacket(savedCB) {
      let promises = {
        plans:      this.apiRequest('plans'),
        opSys:      this.apiRequest('operating-systems'),
        facilities: this.apiRequest('facilities'),
      };

      hash(promises).then((hash) => {
        let osChoices     = this.parseOSs(hash.opSys.operating_systems);
        let selectedPlans = this.parsePlans(osChoices.findBy('slug', 'ubuntu_14_04'), hash.plans.plans);
        let config        = get(this, 'config');

        setProperties(this, {
          allOS:           osChoices,
          allPlans:        hash.plans.plans,
          step:            2,
          facilityChoices: hash.facilities.facilities,
          osChoices,
          planChoices:     selectedPlans,
        });

        setProperties(config, DEFAULTS);

        savedCB(true);
      }, (err) => {
        let errors = get(this, 'errors') || [];

        errors.push(`${ err.statusText }: ${ err.body.message }`);

        set(this, 'errors', errors);
        savedCB(false);
      });
    },
  },

  planChoiceDetails: computed('allPlans', 'config.plan', function() {
    let planSlug = get(this, 'config.plan');
    let plan     = get(this, 'allPlans').findBy('slug', planSlug);

    return plan;
  }),

  facilityObserver: on('init', observer('config.facility', function() {
    let facilities = get(this, 'facilityChoices');
    let slug       = get(this, 'config.facility');
    let facility   = facilities.findBy('code', slug);
    let plans      = get(this, 'allPlans');
    let out        = [];

    if (plans && facility) {
      plans.forEach((plan) => {
        plan.available_in.forEach((fac) => {
          let facId = fac.href.split('/')[fac.href.split('/').length - 1];

          if (facility.id === facId) {
            out.push(plan);
          }
        })
      });
      set(this, 'planChoices', out);
    }
  })),

  bootstrap() {
    let store = get(this, 'globalStore');
    let config = store.createRecord({
      type:      'packetConfig',
      projectId: '',
      apiKey:    '',
    });

    const model = get(this, 'model');

    set(model, 'packetConfig', config);
  },

  apiRequest(command, opt, out) {
    opt = opt || {};

    let url = `${ get(this, 'app.proxyEndpoint') }/`;

    if ( opt.url ) {
      url += opt.url.replace(/^http[s]?\/\//, '');
    } else {
      url += `${ 'api.packet.net' }/${ command }`;
    }

    return fetch(url, {
      headers: {
        'Accept':       'application/json',
        'X-Auth-Token': get(this, 'config.apiKey'),
      },
    }).then((res) => {
      let body = res.body;

      if ( out ) {
        out[command].pushObjects(body[command]);
      } else {
        out = body;
      }

      // De-paging
      if ( body && body.links && body.links.pages && body.links.pages.next ) {
        opt.url = body.links.pages.next;

        return this.apiRequest(command, opt, out).then(() => {
          return out;
        });
      } else {
        return out;
      }
    });
  },

  parseOSs(osList) {
    return osList.filter((os) => {
      if (OS_WHITELIST.includes(os.slug) && !isEmpty(os.provisionable_on)) {
        return os;
      }
    });
  },

  parsePlans(os, plans) {
    let out = [];

    os.provisionable_on.forEach((loc) => {
      let plan = plans.findBy('slug', loc);

      if (plan && !PLAN_BLACKLIST.includes(loc)) {
        out.push(plan);
      }
    });

    return out;
  },

  validate() {
    let errors = get(this, 'model').validationErrors();

    if (!get(this, 'config.projectId') ) {
      errors.push('Project ID is required');
    }

    if (!get(this, 'config.apiKey') ) {
      errors.push('API Key is requried');
    }

    if ( errors.length ) {
      set(this, 'errors', errors.uniq());

      return false;
    }

    return true;
  },
});
