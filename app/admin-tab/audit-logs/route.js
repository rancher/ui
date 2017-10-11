import Ember from 'ember';
import PolledModel from 'ui/mixins/polled-model';
import { urlOptions } from 'ember-api-store/utils/url-options';

export default Ember.Route.extend(PolledModel, {
  pollInterval: 10000,

  queryParams: {
    sortBy: {
      refreshModel: true
    },
    sortOrder: {
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

    let url = urlOptions(schema.links.collection, this.parseFilters(params));
    return us.rawRequest({url}).then((res) => {
      let records = us._typeify(res.body, {updateStore: false});

      return Ember.Object.create({
        auditLog: records,
        resourceTypes: resourceTypes
      });
    });
  },

  parseFilters(params) {
    var returnValue = {
      filter      : {},
      limit       : 20,
      depaginate  : false,
      forceReload : true,
    };
    if (params) {
      _.forEach(params, (item, key) => {
        if ( ['sortBy','sortOrder','forceReload'].indexOf(key) >= 0 )  {
          returnValue[key] = item;
        } else {
          if (item) {
            returnValue.filter[key] = item;
          } else {
            delete returnValue.filter[key];
          }
        }
      });
    }
    return returnValue;
  },

});
