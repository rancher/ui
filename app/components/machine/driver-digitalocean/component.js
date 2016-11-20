import Ember from 'ember';
import Driver from 'ui/mixins/driver';
import fetch from 'ember-api-store/utils/fetch';
import Util from 'ui/utils/util';

const DIGITALOCEAN_API = 'api.digitalocean.com/v2';
const VALID_IMAGES = [
//  'centos-6-x64',
  'centos-7-x64',
  'coreos-alpha',
  'coreos-beta',
  'coreos-stable',
//  'debian-7-x64',
  'debian-8-x64',
  'fedora-23-x64',
  'fedora-24-x64',
//  'freebsd-10-1-x64',
//  'freebsd-10-2-x64',
  'ubuntu-14-04-x64',
  'ubuntu-16-04-x64',
//  'ubuntu-16-10-x64'
];

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
          // 64-bit only
          return !((image.name||'').match(/x32$/));
        }).map(function(image) {
          image.disabled = VALID_IMAGES.indexOf(image.slug) === -1;
          return image;
        }).sortBy('distribution','name');

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
        errors.push(`${err.statusText}: ${err.body.message}`);

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
      image       : 'ubuntu-16-04-x64'
    });

    this.set('model', this.get('store').createRecord({
      type: 'host',
      digitaloceanConfig: config,
    }));
  },


  validate: function() {
    this._super();
    let errors      = this.get('errors')||[];
    let name        = this.get('model.hostname')||'';
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

  apiRequest: function(command, params) {
    let proxyEndpoint = this.get('app.proxyEndpoint');
    let url           = `${proxyEndpoint}/${DIGITALOCEAN_API}/${command}?per_page=100`;
    url = Util.addQueryParams(url,params);
    let accessToken   = this.get('model.digitaloceanConfig.accessToken');

    return fetch(url, {
      headers: {
        'Accept': 'application/json',
        'X-Api-Auth-Header': 'Bearer ' + accessToken
      },
    }).then((res) => {
      return res.body;
    });
  }
});
