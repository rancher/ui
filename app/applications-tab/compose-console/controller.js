import Ember from 'ember';
import Util from 'ui/utils/util';

export default Ember.Controller.extend({
  access: Ember.inject.service(),
  endpoint: Ember.inject.service(),
  growl: Ember.inject.service(),
  projects: Ember.inject.service(),

  step: 1,

  actions: {
    generate() {
      this.set('step', 2);

      var name = this.get('access.identity.name');
      if ( name ) {
        name = 'Docker CLI: ' + name;
      } else {
        name = 'Docker CLI';
      }

      this.get('store').createRecord({
        type: 'apiKey',
        name: name,
        description: 'Provides workstation access to Docker CLI'
      }).save().then((key) => {
        this.set('step',3);
        key.waitForState('active').then(() => {
          Util.download(key.linkFor('certificate'));
          this.set('step',4);
        });
      }).catch((err) => {
        this.set('step',1);
        this.get('growl').fromError('Error creating API Key',err);
      });
    },
  },
});
