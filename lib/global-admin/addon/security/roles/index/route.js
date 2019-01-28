import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { get } from '@ember/object';
import { hash } from 'rsvp';

export default Route.extend({
  roleTemplateService: service('roleTemplate'),
  globalStore:         service(),

  model(/* params */) {
    return hash({
      roleTemplates: get(this, 'roleTemplateService.allVisibleRoleTemplates'),
      globalRoles:   get(this, 'globalStore').find('globalRole'),
    });
  },

  /**
   * Temporary workaround for https://github.com/ember-engines/ember-engines/issues/614 .
   * This also fixes the infinite-loop for query params with `refreshModel:true`.
   *
   * The gist: Behind the scenes, the router tries to match against `routeName`, but
   * for engines it needs to use `fullRouteName` instead or else things don't line up.
   * This is a silly hack, but setting routeName=fullRouteName seems to work A-OK.
   */
  refresh() {
    const temp = this.routeName;

    this.routeName = this.fullRouteName;
    this._super(...arguments);
    this.routeName = temp;
  },

  queryParams:         { context: { refreshModel: true } },
});
