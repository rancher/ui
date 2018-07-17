import Mixin from '@ember/object/mixin';

export default Mixin.create({
  toCb(name_or_fn, ...args) {
    return (results, cb) => {
      if ( typeof results === 'function' ) {
        cb = results;
        results = null;
      }

      let promise;

      if ( typeof name_or_fn === 'string' ) {
        promise = this[name_or_fn](...args, results);
      } else {
        promise = name_or_fn(...args, results);
      }

      promise.then((res) => {
        cb(null, res);
      }).catch((err) => {
        cb(err, null);
      });
    };
  }
});

