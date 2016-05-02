import Ember from 'ember';
import C from 'ui/utils/constants';

export default Ember.Component.extend({
  machine: null,
  settings: Ember.inject.service(),

  didReceiveAttrs() {
    if ( !this.get('machine.engineInstallUrl') )
    {
      this.set('machine.engineInstallUrl', this.get(`settings.${C.SETTING.ENGINE_URL}`) || '');
    }
  },
});
