import Mixin from '@ember/object/mixin';
import { inject as service } from '@ember/service';
// import C from 'shared/utils/constants';

export default Mixin.create({
  access:      service(),
  cookies:     service(),
  modal:       service(),
  prefs:       service(),
  settings:    service(),
  globalStore: service(),

  queryParams: {
    config:            { refreshModel: false },
    code:              { refreshModel: false },
    forward:           { refreshModel: false },
    state:             { refreshModel: false },
    authProvider:      { refreshModel: false },
    error_description: { refreshModel: false },
    oauth_token:       { refreshModel: false },
    oauth_verifier:    { refreshModel: false },
    login:             { refreshModel: false },
    errorCode:         { refreshModel: false },
    errorMsg:          { refreshModel: false },
  },

});
