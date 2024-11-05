import Service from '@ember/service';
import fetch from 'ember-api-store/utils/fetch';
import { inject as service } from '@ember/service';
import { get, set } from '@ember/object';
import { reject } from 'rsvp';

const LINODE_API = 'api.linode.com/v4';

export default Service.extend({
  app: service(),

  request(auth = {}, command) {
    let url     = `${ get(this, 'app.proxyEndpoint') }/`;
    let token   = get(auth, 'token');
    let headers = { 'Accept': 'application/json' };

    if (get(auth, 'type') === 'cloud') {
      set(headers, 'x-api-cattleauth-header', `Bearer credID=${ token } passwordField=token`);
    } else {
      set(headers, 'X-Api-Auth-Header', `Bearer ${ token }`);
    }
    url += `${ LINODE_API }/${ command }`;

    return fetch(url, { headers }).then((res) => {
      return res.body;
    }).catch((err) => {
      return reject(err);
    });
  }
});
