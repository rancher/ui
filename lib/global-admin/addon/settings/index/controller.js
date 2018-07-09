import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import Controller from '@ember/controller';
import C from 'ui/utils/constants';

export default Controller.extend({
  settings:  service(),
  cookies:   service(),
  projectId: alias(`cookies.${ C.COOKIE.PROJECT }`),
});
