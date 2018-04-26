import { inject as service } from '@ember/service';
import Controller from '@ember/controller';
import { get, computed } from '@ember/object';
import { isEmpty } from '@ember/utils';

export default Controller.extend({

  scope: service(),

  allNamespace: computed('model.namespaces', function() {
    let ns = get(this, 'model.namespaces');
    let pId = get(this, 'scope.currentProject.id');

    return ns.filter( n => {
      return get(n, 'projectId') === pId || isEmpty(get(n, 'projectId'));
    });
  }),

});
