import Helper from '@ember/component/helper';

export default Helper.extend({
  compute(params/* , options*/) {
    return JSON.parse(params[0]);
  },
});
