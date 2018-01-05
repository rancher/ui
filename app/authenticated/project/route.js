import { next } from '@ember/runloop';
import EmberObject from '@ember/object';
import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import { all as PromiseAll } from 'rsvp';
import Preload from 'ui/mixins/preload';

export default Route.extend(Preload,{
  access    : service(),
  scope  : service(),

  model(params, transition) {
    var project = this.get('scope.current');

    if ( !project )
    {
      this.replaceWith('global-admin.clusters');
      return;
    }

    // If the project ID in the URL is out of sync somehow, bail & try again
    if ( project.get('id') !== params.project_id )
    {
      this.replaceWith('authenticated');
      return;
    }

    return this.loadSchemas('store').then(() =>  {
      return PromiseAll([
        this.preload('workload'),
        this.preload('dnsRecord'),
        this.preload('namespace'),
        this.preload('pod'),
        this.preload('machine', 'globalStore'),
        this.preload('secret'),
        this.preload('namespacedSecret'),
        this.preload('projectRoleTemplateBinding', 'globalStore'),
      ]).then(() => {
        return EmberObject.create({
          project,
        });
      })
    }).catch((err) => {
      return this.loadingError(err, transition);
    });
  },

  actions: {
    toggleGrouping() {
      let choices = ['none','service','stack'];
      let cur = this.get('controller.group');
      let neu = choices[((choices.indexOf(cur)+1) % choices.length)];
      next(() => {
        this.set('controller.group', neu);
      });
    },
  },

  shortcuts: {
    'g': 'toggleGrouping',
  }
});
