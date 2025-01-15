import Resource from 'ember-api-store/models/resource';
import { computed } from '@ember/object';

var Port = Resource.extend({
  _publicIp:       null,
  _publicIpState:  null,
  displayPublicIp: computed('_publicIp', '_publicIpState', 'bindAddress', 'publicIpAddressId', 'publicPort', 'store', function() {
    var bind = this.bindAddress;

    if ( bind ) {
      return bind;
    } else if ( !this.publicPort ) {
      return null;
    }

    var ip = this._publicIp;

    if ( ip ) {
      return ip;
    } else if ( this._publicIpState === 2 ) {
      return '(Unknown IP)';
    } else if ( !this._publicIpState ) {
      this.set('_publicIpState', 1);
      this.store.find('ipaddress', this.publicIpAddressId)
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
