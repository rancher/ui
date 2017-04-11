import Ember from 'ember';

export default Ember.Route.extend({
  model: function(/*params,transition*/) {
    return this.get('store').find('hostTemplates', null, {forceReload: true}).then((templates) => {
      return templates;
    });
  }
});
