import Service from '@ember/service';
import { addQueryParam, addQueryParams } from 'shared/utils/util';
import fetch from 'ember-api-store/utils/fetch';
import { inject as service } from '@ember/service';
import { get, set } from '@ember/object';
import { reject } from 'rsvp';

const DIGITALOCEAN_API = 'api.digitalocean.com/v2';

export default Service.extend({
  app: service(),

  request(auth = {}, command, opt = {}, out) {
    let url     = `${ get(this, 'app.proxyEndpoint') }/`;
    let token   = get(auth, 'token');
    let headers = { 'Accept': 'application/json' };

    if (get(auth, 'type') === 'cloud') {
      set(headers, 'x-api-cattleauth-header', `Bearer credID=${ token } passwordField=accessToken`);
    } else {
      set(headers, 'X-Api-Auth-Header', `Bearer ${ token }`);
    }

    if ( opt.url ) {
      url += opt.url.replace(/^http[s]?\/\//, '');
    } else {
      url += `${ DIGITALOCEAN_API }/${ command }`;
      url = addQueryParam(url, 'per_page', opt.per_page || 100);
      url = addQueryParams(url, opt.params || {});
    }


    return fetch(url, { headers }).then((res) => {
      let body = res.body;

      if ( out ) {
        out[command].pushObjects(body[command]);
      } else {
        out = body;
      }

      // De-paging
      if ( body && body.links && body.links.pages && body.links.pages.next ) {
        opt.url = body.links.pages.next;

        return this.request(auth, command, opt, out).then(() => {
          return out;
        });
      } else {
        return out;
      }
    }).catch((err) => {
      return reject(err);
    });
  }
});
