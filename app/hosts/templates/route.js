import Ember from 'ember';

export default Ember.Route.extend({
  model(/* params */) {
    return this.get('store').find('hostTemplates', null, {forceReload: true}).then((templates) => {
      //@@TODO possibly redirect to add when no temps exist
      return templates;
    });

  }
});
