import Resource from './resource';

export default Resource.extend({
  type: 'error',

  toString() {
    return JSON.stringify(this)
  }
});
