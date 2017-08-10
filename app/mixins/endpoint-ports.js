import Ember from 'ember';
import Util from 'ui/utils/util';

export default Ember.Mixin.create({
  intl: Ember.inject.service(),

  endpointsMap: function() {
    var out = {};
    (this.get('publicEndpoints')||[]).forEach((endpoint) => {
      if ( !endpoint.publicPort )
      {
        // Skip nulls
        return;
      }

      let key = endpoint.get('portProto');
      let ary = out[key]
      if ( !ary ) {
        ary = [];
        out[key] = ary;
      }

      out[key].push(endpoint);
    });

    return out;
  }.property('publicEndpoints.@each.{ipAddress,publicPort}'),

  endpointsByPort: function() {
    var out = [];
    var map = this.get('endpointsMap');
    Object.keys(map).forEach((key) => {
      out.push({
        port: parseInt(key,10),
        endpoints: map[key]
      });
    });

    return out;
  }.property('endpointsMap'),

  endpointPorts: Ember.computed.mapBy('endpointsByPort','publicPort'),

  displayEndpoints: function() {
    let parts = [];

    this.get('endpointsByPort').forEach((obj) => {
      let endpoint = obj.endpoints.get('firstObject');
      if ( endpoint ) {
        if ( endpoint.get('isMaybeHttp') ) {
          parts.push('<span>' +
            '<a target="_blank" rel="nofollow noopener" href="'+ Util.escapeHtml(endpoint.get('linkEndpoint')) +'">' +
            Util.escapeHtml(endpoint.get('displayEndpoint')) +
            '</a>' +
            '</span>');
        } else {
          parts.push('<span>' + Util.escapeHtml(endpoint.get('displayEndpoint')) + '</span>');
        }
      }
    });

    let pub = parts.join(" / ");

    if ( pub )
    {
      return pub.htmlSafe();
    }
    else
    {
      return '';
    }
  }.property('endpointsByPort.@each.{port,endpoints}', 'intl.locale'),

});
