import Ember from 'ember';
import {Regions} from 'ui/utils/digitalocean-choices';
import Driver from 'ui/mixins/driver';

let regionChoices = Regions.regions.filter(function(region) {
  return region.available && (region.features.indexOf('metadata') >= 0);
}).map(function(region) {
  return {
    id: region.slug,
    name: region.name,
  };
}).sortBy('name');

export default Ember.Component.extend(Driver, {
  driverName         : 'digitalocean',
  regionChoices      : regionChoices,
  model              : null,
  digitaloceanConfig : Ember.computed.alias('model.digitaloceanConfig'),

  bootstrap: function() {
    let store = this.get('store');

    let config = store.createRecord({
      type        : 'digitaloceanConfig',
      accessToken : '',
      size        : '1gb',
      region      : 'nyc3',
      image       : 'ubuntu-14-04-x64'
    });

    this.set('model', store.createRecord({
      type: 'machine',
      digitaloceanConfig: config,
    }));
  }.on('init'),


  sizeChoices: function() {
    let slug = this.get('digitaloceanConfig.region');
    return Regions.regions.filter(function(choice) {
      return choice.slug === slug;
    })[0].sizes.sort(function(a,b) {
      let aMb = a.indexOf('mb') >= 0;
      let bMb = b.indexOf('mb') >= 0;

      if ( aMb === bMb ) {
        return parseInt(a,10) - parseInt(b,10);
      } else if ( aMb ) {
        return -1;
      } else {
        return 1;
      }
    });
  }.property('digitaloceanConfig.region'),

  imageChoices: [
    'ubuntu-14-04-x64',
  ],

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
});
