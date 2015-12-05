import Container from 'ui/models/container';

export default Container.extend({
  actions: {
    console: function() {
      this.get('application').setProperties({
        showConsole: true,
        originalModel: this,
      });
    },
  },
});
