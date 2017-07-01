import Ember from 'ember';
import { normalizeName } from 'ui/services/settings';
import C from 'ui/utils/constants';

const ALLOWED = {
  'access.log': {description: 'Path to write access logs to (HA installation only)'},
  'api.auth.jwt.token.expiry': {description: 'Authorization token/UI session lifetime (milliseconds)', kind: 'int'},
  'api.auth.realm': {description: 'HTTP Basic Auth realm for requests without Authorization header'},
  'api.auth.restrict.concurrent.sessions': {description: 'Limit active session tokens to one per account.  This mainly prevents users from logging in to the UI from multiple computers simultaneously.  Note: Existing sessions may continue to be valid until they expire when this is initially enabled.', kind: 'boolean'},
  'api.interceptor.config': {description: 'JSON configuration for API Interceptor', kind: 'multiline'},
  'api.proxy.allow': {description: 'Allow use of /v1/proxy to talk to whitelisted domains, for custom Add Host UIs', kind: 'boolean'},
  'api.proxy.whitelist': {description: 'Whitelist of domains to that can be proxied through /v1/proxy to, for custom Add Host UIs'},
  'api.ui.css.url': {description: 'API UI CSS URL'},
  'api.ui.js.url': {description: 'API UI JavaScript URL'},
  'audit_log.purge.after.seconds': {description: 'Auto-purge Audit Log entries after this long (seconds)', kind: 'int'},
  'catalog.refresh.interval.seconds': {description: 'Refresh Catalog git repos after this long (seconds)', kind: 'int'},
  'container.event.max.size': {description: 'Maximum number of outstanding container events allowed per host before dropping events', kind: 'int'},
  'db.cattle.maxidle': {description: 'Database pool: maximum idle connections (change requires restart)', kind: 'int'},
  'db.cattle.maxtotal': {description: 'Database pool: maximum total connections (change requires restart)', kind: 'int'},
  'db.prep.stmt.cache.size': {description: 'Database pool: Prepared statement cache size (per connection; change requires restart)', kind: 'int'},
  'events.purge.after.seconds': {description: 'Auto-purge Event entries after this long (seconds)', kind: 'int'},
  'graphite.host': {description: 'Graphite: Server hostname or IP (change requires restart)'},
  'graphite.options': {description: 'Graphite: Additional options'},
  'graphite.port': {description: 'Graphite: Server port', kind: 'int'},
  'host.remove.delay.seconds': {description: 'Automatically remove hosts that are disconnected for more than this long (seconds)', kind: 'int'},
  'lb.instance.image': {description: 'Default docker image for Load Balancer Services'},
  'main_tables.purge.after.seconds': {description: 'Auto-purge deleted entries from most tables after this long (seconds)', kind: 'int'},
  'newest.docker.version': {description: 'The newest supported version of Docker at the time of this release.  A Docker version that does not satisfy supported.docker.range but is newer than this will be marked as untested'},
  'project.create.default': {description: 'Automatically create an Environment for users on first login, if they have access to no other Environments.', kind: 'boolean'},
  'registry.default': {description: 'Pull images with no registry specified from this registry instead of DockerHub'},
  'registry.whitelist': {description: 'Allow containers images only from the specified registries (if specified; comma-separated)'},
  'secrets.backend': {description: 'Backend storage provider for secrets', kind: 'enum', options: ['localkey','vault']},
  'service_log.purge.after.seconds': {description: 'Auto-purge Service Log entries after this long (seconds)', kind: 'int'},
  'settings.public': {description: 'The settings that are visible to non-admin users.  These are primarily needed for the UI.', devOnly: true},
  'supported.docker.range': {description: 'Semver range for suported Docker engine versions.  Versions which do not satisfy this range will be marked unsupported in the UI'},
  'ui.pl': {description: 'Private-Label company name'},
  'ui.show.custom.host': {description: 'Show the Custom host option on the Add Host screen.  Note that disabling this does not prevent a user from using the API to add custom hosts.', kind: 'boolean'},
  'ui.show.system': {description: 'Show or hide System Containers from container views', kind: 'enum', options: ['always','default_show','default_hide','never']},
  'ui.sendgrid.api_key': {description: 'SendGrid API key', mode: C.MODE.CAAS},
  'ui.sendgrid.template.password_reset': {description: 'SendGrid template for initiating password reset', mode: C.MODE.CAAS},
  'ui.sendgrid.template.create_user': {description: 'SendGrid template for confirming email', mode: C.MODE.CAAS},
  'ui.sendgrid.template.verify_password': {description: 'SendGrid template for confirming password reset', mode: C.MODE.CAAS},
  'upgrade.manager': {description: 'Automatic upgrades of infrastructure stacks', kind: 'enum', options: ['all','mandatory','none']},
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
        options: details.options,
        obj: obj,
        canDelete: obj && !obj.get('isDefault'),
      }));
    }
  },

  current: function() {
    let all = this.get('settings.asMap');
    let mode = this.get('app.mode');
    let isLocalDev = window.location.host === 'localhost:8000';

    return Object.keys(ALLOWED).filter((key) => {
      let details = ALLOWED[key];
      return  (!details['mode'] || details['mode'] === mode) &&
              (!details['devOnly'] || isLocalDev);
    }).map((key) => {
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
