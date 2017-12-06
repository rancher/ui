import Controller from '@ember/controller'
import { computed } from '@ember/object';
import { get } from '@ember/object';
import { addQueryParam } from 'shared/utils/util';

export default Controller.extend({
  model: null,
  name: null,
  description: null,

  command: computed('model.manifestUrl','name','description', function() {
    let url = get(this, 'model.manifestUrl');

    let name = get(this, 'name');
    if ( name ) {
      url = addQueryParam(url, 'name', name);
    }

    let desc = get(this, 'description');
    if ( desc ) {
      url = addQueryParam(url, 'description', desc);
    }

    let command = `kubectl apply -f ${url}`;
    return command;
  }),
});
