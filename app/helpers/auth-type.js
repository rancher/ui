import Ember from 'ember';

const AUTHTYPES = {
  AdminAuth: 'None',
  BasicAuth: 'API Key',
  HeaderAuth: 'HeaderAuth',
  RegistrationToken: 'Host Registration',
  TokenAccount: 'TokenAccount',
  TokenAuth: 'UI Session'
};


export function authType(type /*, hash*/) {
  return AUTHTYPES[type];
}

export default Ember.Helper.helper(authType);
