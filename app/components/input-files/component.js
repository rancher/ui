import { inject as service } from '@ember/service';
import { get, observer } from '@ember/object';
import Component from '@ember/component';
import { isSafari } from 'ui/utils/platform';
import layout from './template';

export default Component.extend({
  growl: service(),

  layout,
  initialFiles:      null,
  accept:            'text/*',
  addActionLabel:    'generic.emptyString',
  uploadActionLabel: 'generic.emptyString',
  namePlaceholder:   'generic.emptyString',
  valuePlaceholder:  'generic.emptyString',

  ary:              null,

  init() {
    this._super(...arguments);

    let ary = [];
    let files = this.get('initialFiles') || {};

    Object.keys(files).forEach((name) => {
      ary.push({
        name,
        value: files[name]
      });
    });

    this.set('ary', ary);
  },

  actions: {
    add() {
      this.get('ary').pushObject({
        name:  '',
        value: '',
      });
    },

    upload() {
      this.$('.input-files')[0].click();
    },

    remove(file) {
      this.get('ary').removeObject(file);
    }
  },

  onFilesChanged: observer('ary.@each.{name,value}', function() {
    let out = {};

    this.get('ary').forEach((file) => {
      if ( file.name && file.value ) {
        out[file.name] = file.value;
      }
    });

    this.sendAction('changed', out);
  }),

  actualAccept: function() {
    if ( isSafari ) {
      return '';
    } else {
      return this.get('accept');
    }
  }.property('accept'),

  change(event) {
    let ary = this.get('ary');
    var input = event.target;
    let handles = input.files;
    let names = [];

    if ( handles ) {
      // Remove empty files after a paste so config.yml goes away
      ary.slice().forEach((obj) => {
        if ( !obj.value.trim() ) {
          ary.removeObject(obj);
        }
      });

      for ( let i = 0 ; i < handles.length ; i++ ) {
        let reader = new FileReader();

        reader.onload = (event2) => {
          this.get('ary').pushObject({
            name:     names[i],
            value:    event2.target.result,
            uploaded: true,
          });
        };

        reader.onerror = (err) => {
          get(this, 'growl').fromError(get(err, 'srcElement.error.message'));
        };

        names[i] = handles[i].name;
        reader.readAsText(handles[i]);
      }

      input.value = '';
    }
  },
});
