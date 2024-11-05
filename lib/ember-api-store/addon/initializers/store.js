import Store from '../services/store';
import Resource from '../models/resource';
import Collection from '../models/collection';
import ApiError from '../models/error';
import Schema from '../models/schema';

export default function(serviceName='store', injectAs=null) {
  if (!injectAs) {
    injectAs = serviceName;
  }

  return function(app) {
    app.register('service:'+serviceName, Store);

    if ( !app.hasRegistration('model:resource') ) {
      app.register('model:resource', Resource);
      app.register('model:collection', Collection);
      app.register('model:schema', Schema);
      app.register('model:error', ApiError);
    }

    app.inject('controller', injectAs, 'service:'+serviceName);
    app.inject('route',      injectAs, 'service:'+serviceName);
    app.inject('component',  injectAs, 'service:'+serviceName);
  };
}
