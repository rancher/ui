import Ember from 'ember';

export function subStr(params) {
  if(!params[0]||!params[0].substr){
    return 'N/A'
  }

  return params[0].substr(params[1],params[2])
}

export default Ember.Helper.helper(subStr);
