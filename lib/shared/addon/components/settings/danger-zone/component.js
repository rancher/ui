import EmberObject from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { normalizeName } from 'shared/settings/service';
import { get, set } from '@ember/object';
// import C from 'ui/utils/constants';
import layout from './template';

const ALLOWED = {
  'cacerts': {kind: 'multiline'},
  'engine-install-url': {},
  'engine-newest-version': {},
  'engine-supported-range': {},
  'server-url': {},
  'ui-index': {},
  'ui-pl': {},
//   'access.log': {},
//   'api.auth.jwt.token.expiry': {kind: 'int'},
//   'api.auth.realm': {},
//   'api.auth.restrict.concurrent.sessions': {kind: 'boolean'},
//   'api.interceptor.config': {kind: 'multiline'},
//   'api.proxy.allow': {kind: 'boolean'},
//   'api.proxy.whitelist': {},
//   'api.ui.css.url': {},
//   'api.ui.js.url': {},
//   'audit_log.purge.after.seconds': {kind: 'int'},
//   'catalog.refresh.interval.seconds': {kind: 'int'},
//   'container.event.max.size': {kind: 'int'},
//   'default.cluster.template': {kind: 'multiline'},
//   'db.cattle.maxidle': {kind: 'int'},
//   'db.cattle.maxtotal': {kind: 'int'},
//   'db.prep.stmt.cache.size': {kind: 'int'},
//   'events.purge.after.seconds': {kind: 'int'},
//   'graphite.host': {},
//   'graphite.options': {},
//   'graphite.port': {kind: 'int'},
//   'host.remove.delay.seconds': {kind: 'int'},
//   'lb.instance.image': {},
//   'main_tables.purge.after.seconds': {kind: 'int'},
//   'newest.docker.version': {},
//   'project.create.default': {kind: 'boolean'},
//   'registry.default': {},
//   'registry.whitelist': {},
//   'secrets.backend': {kind: 'enum', options: ['localkey','vault']},
//   'service_log.purge.after.seconds': {kind: 'int'},
//   'settings.public': {devOnly: true},
//   'supported.docker.range': {},
//   'ui.pl': {},
//   'ui.show.custom.host': {kind: 'boolean'},
//   'ui.show.system': {'never']},
//   'ui.sendgrid.api_key': {mode: C.MODE.CAAS},
//   'ui.sendgrid.template.password_reset': {mode: C.MODE.CAAS},
//   'ui.sendgrid.template.create_user': {mode: C.MODE.CAAS},
//   'ui.sendgrid.template.verify_password': {mode: C.MODE.CAAS},
//   'upgrade.manager': {kind: 'enum', options: ['all','mandatory','none']},
};

export default Component.extend({
  layout,
  settings: service(),
  modalService: service('modal'),

  loading: false,
  show: false,

  actions: {
    showNode(node) {
      node.toggleProperty('hide');
    },
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
      let details = this.get('allowed')[key];

      this.get('modalService').toggleModal('modal-edit-setting', EmberObject.create({
        key: key,
        descriptionKey: details.descriptionKey,
        kind: details.kind,
        options: details.options,
        obj: obj,
        canDelete: obj && !obj.get('isDefault'),
      }));
    }
  },

  allowed: function() {
    let out = {};
    Object.keys(ALLOWED).forEach((key) => {
      let val = Object.assign({}, ALLOWED[key]);
      val.descriptionKey = 'dangerZone.description.' + key;
      out[key] = val;
    });

    return out;
  }.property(),

  current: function() {
    let all = this.get('settings.asMap');
    let allowed = this.get('allowed');
    let mode = this.get('app.mode');
    let isLocalDev = window.location.host === 'localhost:8000';

    return Object.keys(allowed).filter((key) => {
      let details = allowed[key];
      return  (!details['mode'] || details['mode'] === mode) &&
              (!details['devOnly'] || isLocalDev);
    }).map((key) => {
      let obj = all[normalizeName(key)];
      let details = allowed[key];

      let out =  EmberObject.create({
        key: key,
        obj: obj,
      });

      if (get(details, 'kind') === 'multiline') {
        out.set('hide', true);
      }

      (Object.keys(details)||[]).forEach((key2) => {
        out.set(key2, details[key2]);
      });

      return out;
    });
  }.property('settings.all.@each.{name,source}'),
});
