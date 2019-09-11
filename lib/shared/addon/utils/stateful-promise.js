import { setProperties } from '@ember/object';
import RSVP from 'rsvp';

export default class StatefulPromise {
  static wrap(target, defaultValue) {
    const promise = RSVP.resolve(target);

    setProperties(promise, {
      loading: true,
      loaded:  false,
      error:   false,
      value:   defaultValue
    });

    promise.then((value) => {
      setProperties(promise, {
        loading: false,
        loaded:  true,
        value
      });
    }, (value) => {
      setProperties(promise, {
        loading: false,
        error:   true,
        value
      });
    });

    return promise;
  }
}