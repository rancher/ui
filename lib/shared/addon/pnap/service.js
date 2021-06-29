import Service from '@ember/service';
import { inject as service } from '@ember/service';
import { get } from '@ember/object';


const PNAP_API = 'api.phoenixnap.com';

export default Service.extend({
  app: service(),

  request(command) {
    let headers = { 'Content-Type': 'application/json' };

    let url = `${ get(this, 'app.proxyEndpoint') }/`;

    url += `${ PNAP_API  }/${  command }`;

    return fetch(url, { headers }).then((res) => {
      let json = res.json();

      return json;
    }).then((jsonObject) => {
      return jsonObject;
    }).catch((err) => {
      return JSON.parse(`{"message": "${  err  }", "validationErrors": ""}`);
    });
  }
});
