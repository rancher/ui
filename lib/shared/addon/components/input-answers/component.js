import { alias } from '@ember/object/computed';
import Component from '@ember/component';
import { set, computed } from '@ember/object';
import { isSafari } from 'ui/utils/platform';
import layout from './template';

export default Component.extend({
  layout,
  questions: alias('selectedTemplate.questions'),
  pasteOrUpload: false,
  accept       : '.yml, .yaml',
  showHeader: true,
  _boundChange : null,
  didInsertElement() {
    this.set('_boundChange', (event) => { this.change(event); });
    this.$('INPUT[type=file]').on('change', this.get('_boundChange'));
  },
  change(event) {
    var input = event.target;
    if ( input.files && input.files[0] ) {
      let file = input.files[0];

      var reader = new FileReader();
      reader.onload = (event2) => {
        var out = event2.target.result;

        this.set('pastedAnswers', out);
        input.value = '';
      };
      reader.readAsText(file);
    }
  },
  pastedAnswers: computed({
    get(/* key */) {
      var questions = this.get('questions');
      var out = {};
      questions.forEach((q) => {
        out[q.variable] = q.answer || q.default || '';
      });
      return YAML.stringify(out);
    },
    set(key, value) {
      let qa = YAML.parse(value);
      let questions = this.get('questions');
      if (qa) {
        Object.keys(qa).forEach((q) => {
          set(questions.findBy('variable', q), 'answer', qa[q]);
        });
      }
      return value;
    }
  }),
  actions: {
    upload() {
      this.$('INPUT[type=file]')[0].click();
    },
    showPaste() {
      this.set('pasteOrUpload', true);
    },
    cancel() {
      this.set('pasteOrUpload', false);
    }
  },
  actualAccept: computed('accept', function() {
    if ( isSafari ) {
      return '';
    } else {
      return this.get('accept');
    }
  }),
});
