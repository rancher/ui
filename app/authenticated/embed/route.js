import Route from '@ember/routing/route';
import { isEmbedded, dashboardWindow } from 'shared/utils/util';

export default Route.extend({
  redirect(params) {
    if (params.path.indexOf('dashboard') === 0) {
      if (isEmbedded()) {
        const page = params.path.substr(9);

        dashboardWindow().postMessage({
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
