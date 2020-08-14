import { hash } from 'rsvp';
import {
  get, set, computed, observer, setProperties
} from '@ember/object';
import { alias } from '@ember/object/computed';
import Component from '@ember/component';
import NodeDriver from 'shared/mixins/node-driver';
import layout from './template';
import { inject as service } from '@ember/service';

const VALID_IMAGES = [
  'rancheros',
  'centos-7-x64',
  'coreos-alpha',
  'coreos-beta',
  'coreos-stable',
  'debian-8-x64',
  'debian-9-x64',
  'fedora-27-x64',
  'fedora-28-x64',
  'ubuntu-14-04-x64',
  'ubuntu-16-04-x64',
  'ubuntu-18-04-x64',
  'ubuntu-20-04-x64',
];

export default Component.extend(NodeDriver, {
  app:          service(),
  digitalOcean: service(),
  intl:         service(),
  layout,

  driverName:    'digitalocean',
  regionChoices: null,
  model:         null,
  step:          1,
  sizeChoices:   null,
  imageChoices:  null,
  tags:          null,

  config:        alias('primaryResource.digitaloceanConfig'),

  init() {
    this._super(...arguments);

    this.initTags();
  },

  actions: {
    finishAndSelectCloudCredential(cred) {
      if (cred) {
        set(this, 'primaryResource.cloudCredentialId', get(cred, 'id'));

        this.send('getData');
      }
    },

    getData(cb) {
      const auth = {
        type:  'cloud',
        token: get(this, 'primaryResource.cloudCredentialId')
      };

      let promises = {
        regions:  this.digitalOcean.request(auth, 'regions'),
        images:   this.digitalOcean.request(auth, 'images', { params: { type: 'distribution' } }),
        sizes:    this.digitalOcean.request(auth, 'sizes')
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
        }).sortBy('highMem', 'memory');

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

        if (this.hidePicker) {
          this.hidePicker();
        }
      }, (err) => {
        let errors = get(this, 'errors') || [];

        errors.push(`${ err.statusText }: ${ err.body.message }`);

        setProperties(this, { errors, });

        if (cb && typeof cb === 'function') {
          cb();
        }
      });
    },
  },

  imageChanged: observer('config.image', function() {
    const image = get(this, 'config.image');

    if ( image === 'rancheros' ) {
      set(this, 'config.sshUser', 'rancher');
    } else if ( image.startsWith('coreos') ) {
      set(this, 'config.sshUser', 'core');
    } else {
      set(this, 'config.sshUser', 'root');
    }
  }),

  tagsDidChange: observer('tags', function() {
    set(this, 'config.tags', get(this, 'tags').join(','));
  }),

  filteredSizeChoices: computed('config.region', function(){
    let region = get(this, 'regionChoices').findBy('slug', get(this, 'config.region'));
    let sizes = get(this, 'sizeChoices');
    let out = sizes.filter((size) => {
      return region.sizes.indexOf(size.slug) >= 0;
    });

    return out;
  }),

  initTags() {
    const tags = get(this, 'config.tags');

    if (tags) {
      set(this, 'tags', tags.split(','));
    }
  },

  bootstrap() {
    let config = get(this, 'globalStore').createRecord({
      type:    'digitaloceanConfig',
      size:    's-2vcpu-2gb',
      region:  'nyc3',
      image:   'ubuntu-18-04-x64',
      sshUser: 'root'
    });

    const primaryResource = get(this, 'primaryResource');

    set(primaryResource, 'digitaloceanConfig', config);
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
