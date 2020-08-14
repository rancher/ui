import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { isSafari } from 'ui/utils/platform';
import layout from './template';
import { next } from '@ember/runloop';
import { get, set, observer, computed } from '@ember/object';
import { Promise as EmberPromise, all } from 'rsvp';
import ThrottledResize from 'shared/mixins/throttled-resize';
import { downloadFile } from 'shared/utils/download-files';
import CodeMirror from 'codemirror';
import jsyaml from 'js-yaml';
import $ from 'jquery';

export default Component.extend(ThrottledResize, {
  settings:         service(),
  growl:            service(),

  layout,
  mode:             'text',
  label:            null,
  namePlaceholder:  '',
  nameRequired:     false,
  name:             null,
  value:            null,
  placeholder:      '',
  accept:           'text/*, .yml, .yaml',
  multiple:         false,
  viewportMargin:   Infinity,
  autoResize:       false,
  resizeFooter:     130,
  minHeight:        50,
  inputName:        false,
  canChangeName:    true,
  canUpload:        true,
  showUploadLabel:  true,
  gutters:          ['CodeMirror-lint-markers'],
  tagName:          ['div'],
  showUpload:       true,
  showDownload:     true,
  showCopy:         false,
  shouldChangeName: true,

  _isEditorVisible:  false,

  init() {
    this._super(...arguments);

    // needed for code mirror???
    window.jsyaml || (window.jsyaml = jsyaml);
  },

  didRender() {
    this._super(...arguments);
    // We're using _isEditorVisible to trigger a refresh in the ivy-codemirror as
    // suggested by https://github.com/IvyApp/ivy-codemirror/issues/2. We do this
    // trigger inside of render to ensure the component is already rendered even
    // after 'loading' has changed.
    next(() => {
      set(this, '_isEditorVisible', !get(this, 'loading'));
    });
  },

  actions: {
    click() {
      $(this.element).find('INPUT[type=file]').click()
    },

    wantsChange() {
      set(this, 'shouldChangeName', true);
    },

    download() {
      let yaml = get(this, 'value');
      const lintError = [];

      jsyaml.safeLoadAll(yaml, (y) => {
        lintError.pushObjects(CodeMirror.lint.yaml(y));
      });

      if ( lintError.length ) {
        set(this, 'errors', [get(this, 'intl').t('yamlPage.errors')]);

        return;
      }

      downloadFile(get(this, 'filename'), yaml);
    },
  },

  loadingDidChange: observer('loading', function() {
    if ( !get(this, 'loading') && get(this, 'autoResize') ) {
      next(() => {
        this.fit();
      });
    }
  }),

  actualAccept: computed('accept', function() {
    if ( isSafari ) {
      return '';
    } else {
      return get(this, 'accept');
    }
  }),

  onResize() {
    if ( get(this, 'autoResize') ) {
      this.fit();
    }
  },

  fit() {
    if ( get(this, 'autoResize') ) {
      var container = $('.codemirror-container');

      if ( !container ) {
        return;
      }

      const position = container.position();

      if ( !position ) {
        return;
      }

      const desired = $(window).height() - position.top - get(this, 'resizeFooter');

      container.css('max-height', Math.max(get(this, 'minHeight'), desired));
    }
  },

  // fired on file change
  change(event) {
    var input = event.target;

    if ( !input.files || !input.files.length ) {
      return;
    }

    if ( get(this, 'canChangeName') ) {
      const firstName = input.files[0].name;

      if ( get(this, 'multiple') ) {
        const ext = firstName.replace(/.*\./, '');

        set(this, 'name', `multiple.${ ext }`);
      } else {
        set(this, 'name', firstName);
      }

      set(this, 'shouldChangeName', false);
    }

    const promises = [];
    let file;

    for ( let i = 0 ; i < input.files.length ; i++ ) {
      file = input.files[i];
      promises.push(new EmberPromise((resolve, reject) => {
        var reader = new FileReader();

        reader.onload = (res) => {
          var out = res.target.result;

          resolve(out);
        };

        reader.onerror = (err) => {
          get(this, 'growl').fromError(get(err, 'srcElement.error.message'));
          reject(err);
        };

        reader.readAsText(file);
      }));
    }

    all(promises).then((res) => {
      if ( this.isDestroyed || this.isDestroying ) {
        return;
      }

      let value = res.join('\n');

      set(this, 'value', value);

      if ( value ) {
        if (this.fileChosen) {
          this.fileChosen();
        }
      }
    }).finally(() => {
      input.value = '';
    });
  },

  tabReplacement(cm) {
    if (cm.somethingSelected()) {
      var sel = cm.doc.getSelection('\n');

      // Indent only if there are multiple lines selected, or if the selection spans a full line
      if (sel.length > 0 && (sel.indexOf('\n') > -1 || sel.length === cm.getLine(cm.getCursor().line).length)) {
        cm.indentSelection('add');

        return;
      }
    }

    if (cm.options.indentWithTabs) {
      cm.execCommand('insertTab');
    } else {
      cm.execCommand('insertSoftTab');
    }
  },

  shiftTabReplacement(cm) {
    cm.indentSelection('subtract');
  }

});
