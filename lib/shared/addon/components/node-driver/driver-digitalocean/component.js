import { hash } from 'rsvp';
import {
  get, set, computed, observer, setProperties
} from '@ember/object';
import { alias } from '@ember/object/computed';
import Component from '@ember/component';
import NodeDriver, { registerDisplayLocation, registerDisplaySize } from 'shared/mixins/node-driver';
import fetch from 'ember-api-store/utils/fetch';
import { addQueryParam, addQueryParams } from 'shared/utils/util';
import layout from './template';
import { inject as service } from '@ember/service';

registerDisplayLocation(DRIVER, 'config.region');
registerDisplaySize(DRIVER, 'config.size');

const DRIVER = 'digitalocean';
const DIGITALOCEAN_API = 'api.digitalocean.com/v2';
const VALID_IMAGES = [
  'rancheros',
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
  'ubuntu-18-04-x64',
//  'ubuntu-16-10-x64'
];

export default Component.extend(NodeDriver, {
  app: service(),
  layout,

  driverName:          'digitalocean',
  regionChoices:       null,
  model:               null,

  step:         1,
  sizeChoices:         null,
  imageChoices:        null,
  tags:                null,

  config:              alias('model.digitaloceanConfig'),
  filteredSizeChoices: computed('config.region', function(){

    let region = get(this, 'regionChoices').findBy('slug', get(this, 'config.region'));
    let sizes = get(this, 'sizeChoices');
    let out = sizes.filter((size) => {

      return region.sizes.indexOf(size.slug) >= 0;

    });

    return out;

  }),

  imageChanged: observer('config.image', function() {

    const image = get(this, 'config.image');
    const user = get(this, 'config.sshUser');

    if ( image === 'rancheros' && user === 'root' ) {

      set(this, 'config.sshUser', 'rancher');

    } else if ( image !== 'rancheros' && user === 'rancher' ) {

      set(this, 'config.sshUser', 'root');

    }

  }),

  tagsDidChange: observer('tags', function() {

    set(this, 'config.tags', get(this, 'tags').join(','));

  }),

  init() {

    this._super(...arguments);

    const tags = get(this, 'config.tags');

    if (tags) {

      set(this, 'tags', tags.split(','));

    }

  },

  actions: {
    getData(cb) {

      let promises = {
        regions:  this.apiRequest('regions'),
        images:   this.apiRequest('images', { params: { type: 'distribution' } }),
        sizes:    this.apiRequest('sizes')
      };

      hash(promises).then((hash) => {

        let filteredRegions = hash.regions.regions.filter((region) => {

          return region.available && (region.features.indexOf('metadata') >= 0);

        }).sortBy('name');

        let filteredSizes = hash.sizes.sizes.map((size) => {

          size.memoryGb = size.memory / 1024;
          size.highMem = size.slug.indexOf('m-') >= 0;

          return size;

        }).filter((size) => {

          return size.available;

        })
          .sortBy('highMem', 'memory');

        let filteredImages = hash.images.images.filter((image) => {

          // 64-bit only
          return !((image.name || '').match(/x32$/));

        }).map((image) => {

          image.disabled = VALID_IMAGES.indexOf(image.slug) === -1;

          return image;

        });

        filteredImages = filteredImages.sortBy('distribution', 'name');

        setProperties(this, {
          regionChoices: filteredRegions,
          sizeChoices:   filteredSizes,
          imageChoices:  filteredImages,
          step:          2,
          errors:        null,
        });

        this.sendAction('hidePicker');

      }, (err) => {

        let errors = get(this, 'errors') || [];

        errors.push(`${ err.statusText }: ${ err.body.message }`);

        setProperties(this, { errors, });

        cb();

      });

    },
  },

  bootstrap() {

    let config = get(this, 'globalStore').createRecord({
      type:    'digitaloceanConfig',
      size:    '1gb',
      region:  'nyc3',
      image:   'ubuntu-16-04-x64',
      sshUser: 'root'
    });

    const model = get(this, 'model');

    set(model, 'digitaloceanConfig', config);

  },

  apiRequest(command, opt, out) {

    opt = opt || {};

    let url = `${ get(this, 'app.proxyEndpoint') }/`;

    if ( opt.url ) {

      url += opt.url.replace(/^http[s]?\/\//, '');

    } else {

      url += `${ DIGITALOCEAN_API }/${ command }`;
      url = addQueryParam(url, 'per_page', opt.per_page || 100);
      url = addQueryParams(url, opt.params || {});

    }

    return fetch(url, {
      headers: {
        'Accept':            'application/json',
        'X-Api-Auth-Header': `Bearer ${  get(this, 'config.accessToken') }`,
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

  }
});
