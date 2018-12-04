import { get } from '@ember/object';
import Route from '@ember/routing/route';
import { hash } from 'rsvp';

export default Route.extend({
  beforeModel() {
    if (window.ShellQuote) {
      return;
    } else {
      return import('shell-quote').then( (module) => {
        window.ShellQuote = module.default;

        return module.default;
      })
    }
  },
  model(params) {
    const pod = get(this, 'store').find('pod', params.pod_id);

    return hash({ pod }).then((hash) => {
      const container = get(hash, 'pod.containers').findBy('name', params.container_name);

      if ( !container ) {
        this.replaceWith('authenticated.project.index');
      }

      return container;
    });
  },
});
