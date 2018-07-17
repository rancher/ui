import Helper from '@ember/component/helper';

export default Helper.extend({
  compute(params, options) {
    let separator = options.separator || ', ';

    return (params[0] || []).join(separator);
  },
});
