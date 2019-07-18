import EmberObject from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { normalizeName } from 'shared/settings/service';
import { computed, get, set, setProperties } from '@ember/object';
import C from 'ui/utils/constants';
import layout from './template';

export default Component.extend({
  settings:        service(),
  modalService:    service('modal'),
  layout,
  loading:         false,
  show:            false,

  actions: {
    showNode(node) {
      node.toggleProperty('hide');
    },

    show() {
      set(this, 'loading', true);
      get(this, 'settings').loadAll().then(() => {
        setProperties(this, {
          loading: false,
          show:    true,
        });
      }).catch(() => {
        setProperties(this, {
          loading: false,
          show:    false,
        });
      });
    },
  },

  allowed: computed('settings.all.@each.{name,customized}', () => {
    let out = {};

    Object.keys(C.SETTING.ALLOWED).forEach((key) => {
      let val = Object.assign({}, C.SETTING.ALLOWED[key]);

      val.descriptionKey = `dangerZone.description.${  key }`;
      out[key] = val;
    });

    return out;
  }),

  current: computed('allowed.@each.{name,customized}', function() {
    let { settings: { asMap: all }, allowed } = this;
    let isLocalDev                            = window.location.host === 'localhost:8000';

    return Object.keys(allowed).filter((key) => {
      let details = allowed[key];

      return (!details['devOnly'] || isLocalDev);
    }).map((key) => {
      let obj     = all[normalizeName(key)];
      let details = allowed[key];

      let out =  EmberObject.create({
        key,
        obj,
      });

      if (get(details, 'kind') === 'multiline') {
        out.set('hide', true);
      }

      if (get(details, 'kind') === 'json') {
        setProperties(out, {
          hide:       true,
          parsedJSON: JSON.stringify(JSON.parse(out.get('obj.value')), undefined, 2),
        });
      }

      (Object.keys(details) || []).forEach((key2) => {
        out.set(key2, details[key2]);
      });

      return out;
    });
  }),
});
