import Resource from '@rancher/ember-api-store/models/resource';
import { computed } from '@ember/object';

var Port = Resource.extend({
  _publicIp:       null,
  _publicIpState:  null,
  displayPublicIp: computed('_publicIpState', '_publicIp', 'publicIpAddressId', 'bindAddress', 'publicPort', function() {
    var bind = this.get('bindAddress');

    if ( bind ) {
      return bind;
    } else if ( !this.get('publicPort') ) {
      return null;
    }

    var ip = this.get('_publicIp');

    if ( ip ) {
      return ip;
    } else if ( this.get('_publicIpState') === 2 ) {
      return '(Unknown IP)';
    } else if ( !this.get('_publicIpState') ) {
      this.set('_publicIpState', 1);
      this.get('store').find('ipaddress', this.get('publicIpAddressId'))
        .then((ip) => {
          this.set('_publicIp', ip.get('address'));
        })
        .finally(() => {
          this.set('_publicIpState', 2);
        });

      return 'Loading...';
    }

    return null;
  }),
});

export default Port;
