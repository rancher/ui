import { get } from '@ember/object';
import Route from '@ember/routing/route';

export default Route.extend({
  model: function (params) {
    const pod = get(this, 'store').find('pod', params.container_id);
    if ( !pod ) {
      this.replaceWith('authenticated.project.index');
    }
    return pod;
  },
});
