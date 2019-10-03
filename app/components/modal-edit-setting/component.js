import { alias } from '@ember/object/computed';
import { next } from '@ember/runloop';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { normalizeName } from 'shared/settings/service';
import ModalBase from 'shared/mixins/modal-base';
import layout from './template';
import { get, set } from '@ember/object';
import $ from 'jquery';

const cmOpts = {
  autofocus:       true,
  gutters:          ['CodeMirror-lint-markers'],
  lineNumbers:     true,
  lineWrapping:    true,
  lint:            true,
  mode:            {
    name:          'javascript',
    json:          true,
  },
  theme:           'monokai',
  viewportMargin:   Infinity,
};

export default Component.extend(ModalBase, {
  settings:          service(),
  growl:             service(),
  layout,
  classNames:        ['modal-edit-setting', 'span-8', 'offset-2'],

  codeMirrorOptions: cmOpts,
  value:             null,
  formattedValue:    null,
  removing:          false,

  model:             alias('modalService.modalOpts'),

  init() {
    this._super(...arguments);

    if (get(this, 'model.kind') === 'json') {
      set(this, 'formattedValue', JSON.stringify(JSON.parse(get(this, 'model.obj.value')), undefined, 2));
    } else {
      set(this, 'value', get(this, 'model.obj.value') || '');
    }
  },

  didInsertElement() {
    next(() => {
      if ( this.isDestroyed || this.isDestroying ) {
        return;
      }

      const elem = $('.form-control')[0]

      if ( elem ) {
        setTimeout(() => {
          elem.focus();
        }, 250);
      }
    });
  },

  actions: {
    save(btnCb) {
      get(this, 'settings').set(normalizeName(get(this, 'model.key')), get(this, 'value'));
      get(this, 'settings').one('settingsPromisesResolved', () => {
        btnCb(true);
        this.send('done');
      });
    },

    done() {
      this.send('cancel');
      window.location.href = window.location.href; // eslint-disable-line no-self-assign
    },

    updateJson(json) {
      set(this, 'value', json);
    }
  },
});
