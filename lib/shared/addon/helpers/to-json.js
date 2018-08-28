import Helper from '@ember/component/helper';

export default Helper.extend({
  compute(params/* , options*/) {
    return JSON.stringify(params[0], undefined, 2);
  },
});
