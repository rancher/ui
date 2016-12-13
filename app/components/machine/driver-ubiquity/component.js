import Ember from 'ember';
import Driver from 'ui/mixins/driver';
import { ajaxPromise } from 'ember-api-store/utils/ajax-promise';

export default Ember.Component.extend(Driver, {
  driverName         : 'ubiquity',
  ubiquityConfig     : Ember.computed.alias('model.ubiquityConfig'),
  ubiquityHostingApi : 'api.ubiquityhosting.com/v25/api.php',

  allZones           : null,
  allImages          : null,
  allFlavors         : null,

  step               : 1,
  isStep1            : Ember.computed.equal('step',1),
  isStep2            : Ember.computed.equal('step',2),
  isGteStep3         : Ember.computed.gte('step',3),

  bootstrap: function() {
    let store = this.get('store');

    let config = store.createRecord({
      type: 'ubiquityConfig',
      apiToken: '',
      apiUsername: '',
      clientId: '',
      flavorId: '',
      imageId: '',
      zoneId: ''
    });

    this.set('model', store.createRecord({
      type: 'host',
      ubiquityConfig: config,
    }));
  },

  willDestroyElement() {
    this.set('errors', null);
    this.set('step', 1);
  },

  actions: {
    /* Login step */
    ubiLogin: function() {
      this.set('errors', null);
      this.set('step', 2);
      this.set('ubiquityConfig.clientId', (this.get('ubiquityConfig.clientId')||'').trim());
      this.set('ubiquityConfig.apiUsername', (this.get('ubiquityConfig.apiUsername')||'').trim());
      this.set('ubiquityConfig.apiToken', (this.get('ubiquityConfig.apiToken')||'').trim());

      Ember.RSVP.hash({
        zones: this.getZones(),
        flavors: this.getFlavors(),
      }).then((hash) => {
        this.set('allZones', hash.zones);
        this.set('allFlavors', hash.flavors);

        if ( !this.get('ubiquityConfig.zoneId') )
        {
          this.set('ubiquityConfig.zoneId', this.get('allZones.firstObject.id'));
        }

        if ( !this.get('ubiquityConfig.flavorId') )
        {
          this.set('ubiquityConfig.flavorId', this.get('allFlavors.firstObject.id'));
        }

        return this.zoneChange(this.get('ubiquityConfig.zoneId')).then(() => {
          this.set('step', 3);
        });
      }).catch((err) => {
        this.set('errors', [err]);
        this.set('step', 1);
      });
    },

    setZone(zoneId) {
      this.zoneChange(zoneId);
    },
  },

  zoneChange: function(zoneId) {
    this.set('ubiquityConfig.zoneId', zoneId);
    return this.getImages(zoneId).then((images) => {
      this.set('allImages', images);
      let existing = this.get('ubiquityConfig.imageId');
      if ( !existing || images.filterBy('id', existing).length === 0 ) {
        this.set('ubiquityConfig.imageId', images[0].id);
      }
    });
  },

  getZones: function() {
    return this.apiRequest('list_zones').then((res) => {
      return (res.Zones || []).map((zone) => {
        return {
          id: zone.id,
          name: zone.name,
        };
      });
    });
  },

  getImages: function(zone_id) {
    return this.apiRequest('list_images', {zone_id: zone_id, docker_machine: 'true'}).then((res) => {
      return (res.Images || []).map((image) => {
        return {
          id: image.id,
          name: image.name,
          description: image.cat_desc,
        };
      });
    });
  },

  getFlavors: function() {
    return this.apiRequest('list_flavors').then((res) => {
      return (res.Flavors || []).map((flavor) => {
        return {
          id: flavor.id,
          name: flavor.name,
        };
      });
    });
  },

  apiRequest: function(command, params) {
    let url = this.get('app.proxyEndpoint') + '/' + this.ubiquityHostingApi + "?method=cloud." + encodeURIComponent(command);

    let auth = this.get('ubiquityConfig.clientId') + ':' + this.get('ubiquityConfig.apiUsername') + ':' + this.get('ubiquityConfig.apiToken');
    params = params || {};

    return ajaxPromise({
      url: url,
      method: 'POST',
      dataType: 'json',

      headers: {
        'Accept': 'application/json',
        'X-Api-Headers-Restrict': 'Content-Length',
        'X-Api-Auth-Header': 'Basic ' + window.btoa(auth),
      },

      beforeSend: (xhr, settings) => {
        xhr.setRequestHeader('Content-Type', 'rancher:' + settings.contentType);
        return true;
      },

      data: params,
      params: params
    }, true).then((res) => {
      if ((res || '') === '') {
        return Ember.RSVP.reject('Authentication Failed: Please check the access credentials and that the server is in the list of authorized IP addresses in the Ubiquity console');
      } else {
        return res;
      }
    });
  },

  validate: function() {
    this._super();
    let errors = this.get('errors')||[];
    let name = this.get('model.hostname')||'';

    if (name.length < 1 || name.length > 200) {
      errors.push('"name" should be 1-200 characters long');
    }

    if (name.match(/[^a-z0-9-]/i)) {
      errors.push('"name" can only contain letters, numbers, and hyphen');
    }

    if (errors.get('length')) {
      this.set('errors',errors);
      return false;
    }

    return true;
  },
});
