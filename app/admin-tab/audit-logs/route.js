import EmberObject from '@ember/object';
import Route from '@ember/routing/route';
import PolledModel from 'ui/mixins/polled-model';
import { urlOptions } from 'ember-api-store/utils/url-options';

export default Route.extend(PolledModel, {
  pollInterval: 10000,

  queryParams: {
    sortBy: {
      refreshModel: true
    },
    descending: {
      refreshModel: true
    },
    eventType: {
      refreshModel: true
    },
    resourceType: {
      refreshModel: true
    },
    resourceId: {
      refreshModel: true
    },
    clientIp: {
      refreshModel: true
    },
    authType: {
      refreshModel: true
    }
  },

  model(params) {
    const us = this.get('userStore');
    const schema = us.getById('schema','auditlog');
    const resourceTypes = this.get('userStore').all('schema').filterBy('links.collection').map(x => x.get('_id'));

    let descending = params.descending;
    delete params.descending;
    if ( params.sortBy === 'created' ) {
      descending = !descending;
    }

    if ( descending ) {
      params.sortOrder = 'desc';
    }

    let opt = this.requestOptions(params);

    let url = urlOptions(schema.links.collection, opt);
    return us.rawRequest({url}).then((res) => {
      let records = us._typeify(res.body, {updateStore: false});

      return EmberObject.create({
        auditLog: records,
        resourceTypes: resourceTypes
      });
    });
  },

  requestOptions(params) {
    var out = {
      filter      : {},
      limit       : 1000,
      depaginate  : false,
      forceReload : true,
    };

    Object.keys(params).forEach((key) => {
      const item = params[key];

      if ( ['sortBy','sortOrder','forceReload'].includes(key) )  {
        out[key] = item;
      } else if (item) {
        out.filter[key] = item;
      } else {
        delete out.filter[key];
      }
    });

    return out;
  },

});
