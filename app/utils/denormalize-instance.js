import Ember from 'ember';

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
