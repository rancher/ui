import EmberObject from '@ember/object';
import Subscribe from 'shared/mixins/subscribe';
import { get, set } from '@ember/object';
import { inject as service } from '@ember/service';

export default EmberObject.extend(Subscribe, {
  scope: service(),

  init() {
    this._super(...arguments);
    set(this, 'endpoint', get(this, 'app.projectSubscribeEndpoint'));
  },

  validate() {
    const socket = get(this, 'subscribeSocket');
    const metadata = socket.getMetadata();
    const socketProjectId = get(metadata, 'projectId');
    const currentProjectId = get(this, 'scope.currentProject.id');

    if ( !currentProjectId || currentProjectId === socketProjectId ) {
      return true;
    } else {
      console.error(`${ this.label } Subscribe ignoring message, current=${ currentProjectId } socket=${ socketProjectId } ${  this.forStr() }`);

      return false;
    }
  }
});
