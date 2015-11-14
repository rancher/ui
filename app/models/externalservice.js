import Service from 'ui/models/service';
import Ember from 'ember';

const esc = Ember.Handlebars.Utils.escapeExpression;

var ExternalService = Service.extend({
  type: 'externalService',

  healthState: function() {
    return 'healthy';
  }.property(),

  displayDetail: function() {
    var out = '';
    if ( this.get('hostname') )
    {
      out = esc(this.get('hostname'));
    }
    else
    {
      var ips = this.get('externalIpAddresses');
      var num = ips.get('length');
      for ( var i = 0 ; i < 3 && i < num ; i++ )
      {
        out += '<span>'+ (i === 0 ? '' : ', ') + esc(ips.objectAt(i)) + '</span>';
      }

      if ( num > 3 )
      {
        out += ' and ' + (num-3) + ' more';
      }
    }

    return ('<span class="text-muted">To: </span>' + out).htmlSafe();
  }.property('hostname','externalIpAddresses.[]'),
});

export default ExternalService;
