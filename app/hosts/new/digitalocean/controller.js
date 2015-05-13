import Ember from 'ember';
import Regions from './digitalocean_regions';
import NewHost from 'ui/mixins/new-host';

var regionChoices = Regions.regions.filter(function(region) {
  return region.available && (region.features.indexOf('metadata') >= 0);
}).map(function(region) {
  return {
    id: region.slug,
    name: region.name,
  };
}).sortBy('name');

export default Ember.ObjectController.extend(NewHost, {

  regionChoices: regionChoices,

  sizeChoices: function() {
    var slug = this.get('digitaloceanConfig.region');
    return Regions.regions.filter(function(choice) {
      return choice.slug === slug;
    })[0].sizes.sort(function(a,b) {
      var aMb = a.indexOf('mb') >= 0;
      var bMb = b.indexOf('mb') >= 0;

      if ( aMb === bMb )
      {
        return parseInt(a,10) - parseInt(b,10);
      }
      else if ( aMb )
      {
        return -1;
      }
      else
      {
        return 1;
      }
    });
  }.property('digitaloceanConfig.region'),

  imageChoices: [
//    'coreos-stable',
//    'coreos-alpha',
//    'coreos-beta',
//    'centos-7-0-x64',
//    'debian-7-0-x64',
//    'fedora-21-x64',
    'ubuntu-14-04-x64',
    'ubuntu-14-10-x64',
  ],

  validate: function() {
    this._super();
    var errors = this.get('errors')||[];

    var name = this.get('name')||'';
    if ( name.length > 200 )
    {
      errors.push('"name" should be 1-200 characters long');
    }

    if ( name.match(/[^a-z0-9-]/i) )
    {
      errors.push('"name" can only contain letters, numbers, and hyphen');
    }

    var accessToken = this.get('digitaloceanConfig.accessToken')||'';
    if ( accessToken && accessToken.length !== 64 )
    {
      errors.push("That doesn't look like a valid access token");
    }

    if ( errors.get('length') )
    {
      this.set('errors',errors);
      return false;
    }

    return true;
  },

  doneSaving: function() {
    var out = this._super();
    this.transitionToRoute('hosts');
    return out;
  },
});
