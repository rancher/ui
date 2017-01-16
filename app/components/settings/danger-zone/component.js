import Ember from 'ember';
import { normalizeName } from 'ui/services/settings';

const ALLOWED = {
  'access.log': {description: 'Path to write access logs to (HA installation only)'},
  'api.auth.jwt.token.expiry': {description: 'Authorization token/UI session lifetime (milliseconds)', kind: 'int'},
  'api.auth.realm': {description: 'HTTP Basic Auth realm for requests without Authorization header'},
  'api.proxy.allow': {description: 'Allow use of /v1/proxy to talk to whitelisted domains, for custom Add Host UIs', kind: 'boolean'},
  'api.proxy.whitelist': {description: 'Whitelist of domains to that can be proxied through /v1/proxy to, for custom Add Host UIs'},
  'api.ui.css.url': {description: 'API UI CSS URL'},
  'api.ui.js.url': {description: 'API UI JavaScript URL'},
  'audit_log.purge.after.seconds': {description: 'Auto-purge Audit Log entries after this long (seconds)', kind: 'int'},
  'catalog.refresh.interval.seconds': {description: 'Refresh Catalog git repos after this long (seconds)', kind: 'int'},
  'container.event.max.size': {description: 'Maximum number of outstanding container events allowed per host before dropping events', kind: 'int'},
  'events.purge.after.seconds': {description: 'Auto-purge Event entries after this long (seconds)', kind: 'int'},
  'global.pool.maxidle': {description: 'Database pool: maximum idle connections', kind: 'int'},
  'global.pool.maxtotal': {description: 'Database pool: maximum total connections', kind: 'int'},
  'graphite.options': {description: 'Graphite: Additional options'},
  'graphite.host': {description: 'Graphite: Server hostname or IP (must restart server container(s) after changing)'},
  'graphite.port': {description: 'Graphite: Server port', kind: 'int'},
  'lb.instance.image': {description: 'Default docker image for Load Balancer Services'},
  'main_tables.purge.after.seconds': {description: 'Auto-purge deleted entries from most tables after this long (seconds)', kind: 'int'},
  'registry.whitelist': {description: 'Allow containers images only from the specified registries (if specified; comma-separated)'},
  'registry.default': {description: 'Pull images with no registry specified from this registry instead of DockerHub'},
  'service_log.purge.after.seconds': {description: 'Auto-purge Service Log entries after this long (seconds)', kind: 'int'},
  'ui.pl': {description: 'Private-Label company name'},
  'auth.filter.proxy.config': {description: 'Authorization filter proxy configuration JSON file', kind: 'multiline'},
};

export default Ember.Component.extend({
  settings: Ember.inject.service(),
  modalService: Ember.inject.service('modal'),

  loading: false,
  show: false,

  actions: {
    show() {
      this.set('loading', true);
      this.get('settings').loadAll().then(() => {
        this.set('loading', false);
        this.set('show', true);
      }).catch(() => {
        this.set('loading', false);
        this.set('show', false);
      });
    },

    showEdit(key) {
      let obj =  this.get('settings').findByName(key);
      let details = ALLOWED[key];

      this.get('modalService').toggleModal('modal-edit-setting', Ember.Object.create({
        key: key,
        description: details.description,
        kind: details.kind,
        obj: obj,
        canDelete: obj && !obj.get('isDefault'),
      }));
    }
  },

  current: function() {
    let all = this.get('settings.asMap');

    return Object.keys(ALLOWED).map((key) => {
      let obj = all[normalizeName(key)];
      let details = ALLOWED[key];

      let out =  Ember.Object.create({
        key: key,
        obj: obj,
      });

      (Object.keys(details)||[]).forEach((key2) => {
        out.set(key2, details[key2]);
      });

      return out;
    });
  }.property('settings.all.@each.{name,source}'),
});
