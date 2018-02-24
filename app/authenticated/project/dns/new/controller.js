import Controller from '@ember/controller';

export default Controller.extend({
  queryParams: ['namespaceId','dnsRecordId'],
  namespaceId: null,
  dnsRecordId: null,

  actions: {
    done() {
      return this.transitionToRoute('authenticated.project.dns.index');
    },

    cancel() {
      this.send('goToPrevious');
    },
  },
});
