import Route from '@ember/routing/route';

export default Route.extend({
  beforeModel() {
    if (window.ShellQuote) {
      return;
    } else {
      return import('shell-quote').then( (module) => {  // TODO: RC
        window.ShellQuote = module.default;

        return module.default;
      })
    }
  },
  model(params) {
    const pod = this.store.find('pod', params.pod_id);

    if ( !pod ) {
      this.replaceWith('authenticated.project.index');
    }

    return pod;
  },
});
