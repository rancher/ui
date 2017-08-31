import Ember from 'ember';

export default Ember.Route.extend({
  access    : Ember.inject.service(),
  projects  : Ember.inject.service(),

  model(params/*, transition*/) {
    var project = this.get('projects.current');

    if ( !project )
    {
      this.replaceWith('authenticated.clusters');
      return;
    }

    // If the project ID in the URL is out of sync somehow, bail & try again
    if ( project.get('id') !== params.project_id )
    {
      this.replaceWith('authenticated');
      return;
    }

    return Ember.Object.create({
      project: project,
      hosts: this.get('store').all('host'),
    });
  },

  loadingError(err, transition, ret) {
    if ( err && err.status && [401,403].indexOf(err.status) >= 0 )
    {
      this.send('logout',transition,true);
      return;
    }

    this.transitionTo('authenticated');
    return ret;
  },

  actions: {
    toggleGrouping() {
      let choices = ['none','service','stack'];
      let cur = this.get('controller.group');
      let neu = choices[((choices.indexOf(cur)+1) % choices.length)];
      Ember.run.next(() => {
        this.set('controller.group', neu);
      });
    },
  },

  shortcuts: {
    'g': 'toggleGrouping',
  }
});
