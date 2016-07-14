import Ember from 'ember';
import Driver from 'ui/mixins/driver';
import { ajaxPromise } from 'ember-api-store/utils/ajax-promise';

const DIGITALOCEAN_API =  'api.digitalocean.com/v2';
const VALID_IMAGES =      ['centos-6-x64', 'centos-7-0-x64', 'coreos-alpha', 'coreos-beta', 'coreos-stable', 'debian-7-x64', 'debian-8-x64', 'fedora-23-x64', 'fedora-24-x64', 'freebsd-10-1-x64', 'freebsd-10-2-x64', 'ubuntu-14-04-x64', 'ubuntu-16-04-x64'];

export default Ember.Component.extend(Driver, {
  driverName:          'digitalocean',
  regionChoices:       null,
  model:               null,
  digitaloceanConfig:  Ember.computed.alias('model.digitaloceanConfig'),
  step1:               true,
  sizeChoices:         null,
  imageChoices:        null,
  gettingData:         false,

  filteredSizeChoices: Ember.computed('digitaloceanConfig.region', function(){
    let region = this.get('regionChoices').findBy('slug', this.get('digitaloceanConfig.region'));
    let sizes = this.get('sizeChoices');
    let out = sizes.filter((size) => {
      return region.sizes.indexOf(size.slug) >= 0;
    });

    return out;
  }),

  actions: {
    getData() {
      let promises = {
        regions:  this.apiRequest('regions'),
        images:   this.apiRequest('images', {type:  'distribution'}),
        sizes:    this.apiRequest('sizes')
      };

      this.set('gettingData', true);

      Ember.RSVP.hash(promises).then((hash) => {

        let filteredRegions = hash.regions.regions.filter(function(region) {
          return region.available && (region.features.indexOf('metadata') >= 0);
        }).sortBy('name');

        let filteredSizes = hash.sizes.sizes.filter((size) => {
          return size.available;
        });

        let filteredImages = hash.images.images.filter(function(image) {
          return VALID_IMAGES.indexOf(image.slug) >= 0;
        }).sortBy('distribution');

        this.setProperties({
          regionChoices: filteredRegions,
          sizeChoices: filteredSizes,
          imageChoices: filteredImages
        });

        this.setProperties({
          step1: false,
          gettingData: false,
          errors: null,
        });

      }, (err) => {

        let errors = this.get('errors') || [];
        errors.push(`${err.xhr.status}: ${err.err}`);

        this.setProperties({
          errors: errors,
          gettingData: false,
        });

      });
    },
  },

  bootstrap: function() {
    let config = this.get('store').createRecord({
      type        : 'digitaloceanConfig',
      accessToken : '',
      size        : '1gb',
      region      : 'nyc3',
      image       : 'ubuntu-14-04-x64'
    });

    this.set('model', this.get('store').createRecord({
      type: 'machine',
      digitaloceanConfig: config,
    }));
  },


  validate: function() {
    this._super();
    let errors      = this.get('errors')||[];
    let name        = this.get('name')||'';
    let accessToken = this.get('digitaloceanConfig.accessToken')||'';

    if ( name.length > 200 ) {
      errors.push('"name" should be 1-200 characters long');
    }

    if ( name.match(/[^a-z0-9-]/i) ) {
      errors.push('"name" can only contain letters, numbers, and hyphen');
    }


    if ( accessToken && accessToken.length !== 64 ) {
      errors.push("That doesn't look like a valid access token");
    }

    if ( errors.get('length') ) {
      this.set('errors',errors);
      return false;
    }

    return true;
  },

  apiRequest: function(command, params, method='GET') {
    let proxyEndpoint = this.get('app.proxyEndpoint');
    let url           = `${proxyEndpoint}/${DIGITALOCEAN_API}/${command}`;
    let accessToken   = this.get('model.digitaloceanConfig.accessToken');

    return ajaxPromise({
      url: url,
      method: method,
      header: {
        'Accept': 'application/json',
      },
      beforeSend: function(xhr) { xhr.setRequestHeader('x-api-auth-header','Bearer ' + accessToken); },
      data: params,
    }, true);
  }
});
