import Ember from 'ember';
import Driver from 'ui/mixins/driver';
import fetch from 'ember-api-store/utils/fetch';

const WHITELIST = ['centos_7', 'coreos_stable', 'ubuntu_14_04', 'ubuntu_16_04', 'rancher'];

export default Ember.Component.extend(Driver, {
  driverName:      'packet',
  packetConfig:    Ember.computed.alias('model.publicValues.packetConfig'),

  facilityChoices: null,
  planChoices:     null,
  osChoices:       null,
  dataFetched:     false,
  osWhitelist:     WHITELIST,

  apiRequest: function(command, opt, out) {
    opt = opt || {};

    let url = this.get('app.proxyEndpoint')+'/';
    if ( opt.url ) {
      url += opt.url.replace(/^http[s]?\/\//,'');
    } else {
      url += `${'api.packet.net'}/${command}`;
    }

    return fetch(url, {
      headers: {
        'Accept': 'application/json',
        'X-Auth-Token': this.get('model.secretValues.packetConfig.apiKey'),
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

  planChoiceDetails: Ember.computed('packetConfig.plan', function() {
    let planSlug = this.get('packetConfig.plan');
    let plan     = this.get('allPlans').findBy('slug', planSlug) || null;

    return plan;
  }),

  parseOSs(osList) {
    let whitelist = this.get('osWhitelist');
    return osList.filter((os) => {
      if (whitelist.indexOf(os.slug) !== -1 && os.provisionable_on.length > 0) {
        return os;
      }
    });
  },

  parsePlans(os, plans) {
    let out = [];

    os.provisionable_on.forEach((loc) => {
      let plan = plans.findBy('slug', loc);

      if (plan) {
        out.push(plan);
      }
    });

    return out;
  },

  osObserver: Ember.on('init', Ember.observer('packetConfig.os', function() {
    let os    = this.get('allOS').findBy('slug', this.get('packetConfig.os'));
    let plans = this.get('allPlans');

    if (plans && os) {
      this.set('planChoices', this.parsePlans(os, plans));
      this.set('packetConfig.plan', os.provisionable_on[0]);
    }

  })),

  actions: {
    authPacket(savedCB) {
      let promises = {
        plans:      this.apiRequest('plans'),
        opSys:      this.apiRequest('operating-systems'),
        facilities: this.apiRequest('facilities'),
      };

      Ember.RSVP.hash(promises).then((hash) => {

        let osChoices = this.parseOSs(hash.opSys.operating_systems);
        let selectedPlans = this.parsePlans(osChoices.findBy('slug', 'ubuntu_14_04'), hash.plans.plans);
        let config = this.get('packetConfig');

        this.setProperties({
          allOS:           osChoices,
          allPlans:        hash.plans.plans,
          dataFetched:     true,
          facilityChoices: hash.facilities.facilities,
          osChoices:       osChoices,
          planChoices:     selectedPlans,
        });

        config.setProperties({
          os           : 'ubuntu_14_04',
          facilityCode : 'ewr1',
          plan         : 'baremetal_0',
          billingCycle : 'hourly',
        });

        savedCB(true);
      }, (err) => {

        let errors = this.get('errors') || [];
        errors.push(`${err.statusText}: ${err.body.message}`);

        this.setProperties({
          errors: errors,
        });
        savedCB(false);

      });
    },
  },

  bootstrap: function() {
    let store = this.get('store');
    let config = store.createRecord({
      type         : 'packetConfig',
      projectId    : '',
    });

    this.set('model', this.get('store').createRecord({
      type:         'hostTemplate',
      driver:       'packet',
      publicValues: {
        packetConfig: config
      },
      secretValues: {
        packetConfig: {
          apiKey       : '',
        }
      }
    }));
    this.setProperties({
      facilityChoices: [],
      planChoices: [],
      osChoices: [],
      allOS: [],
    });
  },

  validate: function() {
    let errors = this.get('model').validationErrors();

    if (!this.get('packetConfig.projectId') ) {
      errors.push('Project ID is required');
    }

    if (!this.get('model.secretValues.packetConfig.apiKey') ) {
      errors.push('API Key is requried');
    }

    if ( errors.length ) {
      this.set('errors',errors.uniq());
      return false;
    }

    return true;
  },
});
