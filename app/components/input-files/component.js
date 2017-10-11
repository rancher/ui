import Ember from 'ember';
import { isSafari } from 'ui/utils/platform';

export default Ember.Component.extend({
  initialFiles:     null,
  accept:           "text/*",
  addActionLabel:   'generic.emptyString',
  uploadActionLabel: 'generic.emptyString',
  namePlaceholder:  'generic.emptyString',
  valuePlaceholder: 'generic.emptyString',

  ary:              null,

  actions: {
    add() {
      this.get('ary').pushObject({
        name: '',
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

  init() {
    this._super(...arguments);

    let ary = [];
    let files = this.get('initialFiles')||{};

    Object.keys(files).forEach((name) => {
      ary.push({
        name: name,
        value: files[name]
      });
    });

    this.set('ary', ary);
  },

  onFilesChanged: Ember.observer('ary.@each.{name,value}', function() {
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

  _boundChange : null,
  didInsertElement() {
    this.set('_boundChange', (event) => { this.change(event); });
    this.$('INPUT[type=file].input-files').on('change', this.get('_boundChange'));
  },

  willDestroyElement() {
    this.$('INPUT[type=file].input-files').off('change', this.get('_boundChange'));
  },

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
            name: names[i],
            value: event2.target.result,
            uploaded: true,
          });
        };

        names[i] = handles[i].name;
        reader.readAsText(handles[i]);
      }

      input.value = '';
    }
  },
});
