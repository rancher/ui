import Ember from 'ember';

// Instance
export function getByInstanceId(store,id) {
  let obj = store.getById('container', id);
  if ( !obj ) {
    obj = store.getById('virtualmachine', id);
  }

  return obj;
}

export function denormalizeInstanceArray(field) {
  return Ember.computed(field+'.[]', function() {
    let out = [];
    let store = this.get('store');

    (this.get(field)||[]).forEach((id) => {
      let obj = getByInstanceId(store,id);
      if ( obj ) {
        out.push(obj);
      }
    });

    return out;
  });
}

export function denormalizeInstanceId(field) {
  return Ember.computed(field, function() {
    let id = this.get(field);
    return getByInstanceId(this.get('store'), id);
  });
}

// Service
const SERVICE_TYPES = ['composeservice','kubernetesservice','networkdriverservice','storagedriverservice','externalservice','dnsservice','loadbalancerservice','service'];
export function getByServiceId(store, id) {
  let obj;
  let i = SERVICE_TYPES.length-1;

  while ( !obj && i >= 0 )
  {
    obj = store.getById( SERVICE_TYPES[i], id);
    i--;
  }

  return obj;
}

export function denormalizeServiceArray(field) {
  return Ember.computed(field+'.[]', function() {
    let out = [];
    let store = this.get('store');

    (this.get(field)||[]).forEach((id) => {
      let obj = getByServiceId(store,id);
      if ( obj ) {
        out.push(obj);
      }
    });

    return out;
  });
}

export function denormalizeServiceId(field) {
  return Ember.computed(field, function() {
    let id = this.get(field);
    return getByServiceId(this.get('store'), id);
  });
}
