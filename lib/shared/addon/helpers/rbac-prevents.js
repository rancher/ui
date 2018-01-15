import { inject as service } from '@ember/service';
import { isArray } from '@ember/array';
import { get } from '@ember/object';
import Helper from '@ember/component/helper';

export default Helper.extend({
  globalStore: service(),
  projectStore: service('store'),

  compute(params, options) {
    let resource = options.resource;
    let scope = options.scope === 'project' ? 'project' : 'global';
    const permission = options.permission ? options.permission: 'create';
    if (!resource || !permission || !scope) {
      return false;
    }
    if (!isArray(resource)) {
      resource = [resource];
    }

    if (permission === 'list') {
      return !resource.some(r => get(this, `${scope}Store`).canList(r));
    } else if (permission === 'create') {
      return !resource.some(r => get(this, `${scope}Store`).canCreate(r));
    }

    return true;
  }
});
