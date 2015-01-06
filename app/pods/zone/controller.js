import Cattle from 'ui/utils/cattle';

var ZoneController = Cattle.TransitioningResourceController.extend({
  icon: function() {
    var name = this.get('name').toLowerCase().replace(/\s+/g,'');
    if ( name.indexOf('amazon') >= 0 || name.indexOf('aws') >= 0 )
    {
      return 'fa-cube';
    }
    else if ( name.indexOf('digitalocean') >= 0 )
    {
      return 'fa-tint';
    }
    else if ( name.indexOf('softlayer') >= 0 )
    {
      return 'fa-bars';
    }
    else if ( name.indexOf('google') >= 0 )
    {
      return 'fa-google';
    }
  }.property('name'),
});

export default ZoneController;
