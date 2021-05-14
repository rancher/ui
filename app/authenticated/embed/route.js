import Route from '@ember/routing/route';

export default Route.extend({
  redirect(params) {
    if (params.path.indexOf('dashboard') === 0) {
      if (window.top !== window) {
        const page = params.path.substr(9);

        window.top.postMessage({
          action: 'dashboard',
          page
        });
      }

      return;
    }

    const r = `/c/${ params.path }`;

    this.replaceWith(r);
  },
});
