import Service from '@ember/service';
import { inject as service } from '@ember/service';
import { addQueryParam, addQueryParams } from 'shared/utils/util';
import { get, set } from '@ember/object';
import { reject } from 'rsvp';

const OCI_META_API = '/meta/oci';

export default Service.extend({
  app:         service(),
  globalStore: service(),

  request(auth = {}, command, opt = {}) {
    let url     = `${ OCI_META_API }/${ command }`;
    let token   = get(auth, 'token');
    let headers = { 'Accept': 'application/json' };
    let data = {}

    if (token === null || token === '' || token === undefined) {
      // OKE and cloud-credential form will pass these values directly
      data = auth
      set(headers, 'Content-Type', 'application/json');
    } else {
      // All other paths must pass the cloudCredentialId as the token
      url = addQueryParam(url, 'cloudCredentialId', token);
      url = addQueryParams(url, opt.params || {});
    }

    if (get(auth, 'type') === 'cloud') {
      set(headers, 'x-api-cattleauth-header', `Bearer credID=${ token } passwordField=privateKeyPassphrase`);
    } else {
      set(headers, 'X-Api-Auth-Header', `Bearer ${ token }`);
    }

    return fetch(url, {
      method:  'POST',
      headers,
      body:    JSON.stringify(data)
    }).then((resp) => {
      let json = resp.json(); // there's always a body

      if (resp.status >= 200 && resp.status < 300) {
        return json;
      } else {
        return json.then(Promise.reject.bind(Promise));
      }
    }).catch((err) => {
      return reject(err);
    });
  }
});
