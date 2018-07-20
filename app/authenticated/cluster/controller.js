import Controller from '@ember/controller';
import { get, set, observer } from '@ember/object';
import { next } from '@ember/runloop';

export default Controller.extend({

  wasReady:   true,
  watchReady: observer('model.isReady', function() {
    const wasReady = get(this, 'wasReady');
    const isReady = get(this, 'model.isReady');

    set(this, 'wasReady', isReady);

    if ( isReady && !wasReady ) {
      next(() => {
        this.send('becameReady');
      });
    }
  })
});
