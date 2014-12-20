import Cattle from 'ui/utils/cattle';

export default Cattle.CollectionController.extend({
  itemController: 'apikey',

  endpoint: function() {
    var url = this.get('app.endpoint');
    if ( url.indexOf('http') !== 0 )
    {
      url += window.location.origin;
    }

    return url;
  }.property('app.endpoint')
});
