import Ember from 'ember';
import YAML from 'npm:yamljs';
import { isSafari } from 'ui/utils/platform';

const {set} = Ember;

export default Ember.Component.extend({
  questions: Ember.computed.alias('selectedTemplate.questions'),
  pasteOrUpload: false,
  accept       : '.yml, .yaml',
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
  pastedAnswers: Ember.computed({
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
  actualAccept: Ember.computed('accept', function() {
    if ( isSafari ) {
      return '';
    } else {
      return this.get('accept');
    }
  }),
});
