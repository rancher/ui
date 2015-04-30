import OverlayRoute from 'ui/overlay/route';

export default OverlayRoute.extend({
  model: function() {
    var container = this.modelFor('container').get('container');
    var opt = {
      follow: true,
      lines: 500,
    };
    var promise = container.doAction('logs',opt).then(function(logs) {
      logs.set('instance', container);
      return logs;
    });

    return promise;
  },

  renderTemplate: function() {
    this.render('container/logs', {into: 'application', outlet: 'overlay'});
  },

  actions: {
    cancel: function() {
      this.goToPrevious();
    },
  }
});
