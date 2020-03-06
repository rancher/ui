import Controller from '@ember/controller';
import { alias } from '@ember/object/computed';
import { get, observer } from '@ember/object';
import { inject as service } from '@ember/service';

export default Controller.extend({
  settings: service(),

  queryParams:             ['provider', 'clusterTemplateRevision', 'scrollTo'],
  provider:                null,
  clusterTemplateRevision: null,

  cluster: alias('model.cluster'),

  actions: {
    close() {
      this.transitionToRoute('authenticated.cluster');
    },
  },

  scrolling: observer('model.activated', function() {
    const intervalId = setInterval(() => {
      const element = $(`#${ get(this, 'scrollTo') }`); // eslint-disable-line

      if (element.length > 0 && element.get(0).getBoundingClientRect().top !== 0) {
        element.get(0).scrollIntoView(true);
        clearInterval(intervalId);
      }
    }, 10);
  })
});
