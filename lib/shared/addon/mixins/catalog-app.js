import Mixin from '@ember/object/mixin';
import {
  get, set, computed, setProperties, observer
} from '@ember/object';
import { next } from '@ember/runloop';
import { compare as compareVersion } from 'ui/utils/parse-version';
import { stringifyAnswer } from 'shared/utils/evaluate';
import C from 'ui/utils/constants';

export default Mixin.create({
  previewTabDidChange: observer('previewTab', function() {
    const files      = (get(this, 'selectedTemplateModel.filesAsArray') || []);
    const previewTab = get(this, 'previewTab');
    const found      = files.findBy('name', previewTab);

    if ( !found ) {
      return;
    }

    set(this, 'decoding', true);

    next(() => {
      if ( !found.decoded ) {
        setProperties(found, {
          body:    atob(found.body),
          decoded: true
        });
      }
      setProperties(this, {
        selectedFileContetnt: found.body,
        decoding:             false
      });
    });
  }),

  templateChanged: observer('selectedTemplateUrl', 'templateResource.defaultVersion', function() {
    return this.getTemplate.perform();
  }),

  filenames: computed('selectedTemplateModel', 'selectedTemplateModel.filesAsArray.[]', function(){
    const files = get(this, 'selectedTemplateModel.filesAsArray').map( (file) => ({
      label: file.name,
      value: file.name
    }));

    files.addObject({
      label: 'answers.yaml',
      value: 'answers'
    });

    return files.sortBy('label');
  }),

  sortedVersions: computed('versionsArray', 'templateResource.defaultVersion', function() {
    const out = get(this, 'versionsArray').sort((a, b) => {
      if ( a.sortVersion && b.sortVersion ) {
        return compareVersion(a.sortVersion, b.sortVersion);
      } else {
        return compareVersion(a.version, b.version);
      }
    });

    const def = get(this, 'templateResource.defaultVersion');

    if ( get(this, 'showDefaultVersionOption') && get(this, 'defaultUrl') ) {
      out.unshift({
        version: get(this, 'intl').t('newCatalog.version.default', { version: def }),
        link:    'default'
      });
    }

    return out;
  }),

  defaultUrl: computed('templateResource.defaultVersion', 'versionLinks', function() {
    const defaultVersion = get(this, 'templateResource.defaultVersion');
    const versionLinks   = get(this, 'versionLinks');

    if ( defaultVersion && versionLinks && versionLinks[defaultVersion] ) {
      return versionLinks[defaultVersion];
    }

    return null;
  }),

  answers: computed('selectedTemplateModel.questions.@each.{variable,answer}', function() {
    const out = {};

    (get(this, 'selectedTemplateModel.questions') || []).forEach((item) => {
      out[item.variable] = stringifyAnswer(item.answer);
      (get(item, 'subquestions') || []).forEach((sub) => {
        out[sub.variable] = stringifyAnswer(sub.answer);
      });
    });

    const customAnswers = get(this, 'selectedTemplateModel.customAnswers') || {};

    Object.keys(customAnswers).forEach((key) => {
      out[key] = stringifyAnswer(customAnswers[key]);
    });

    return out;
  }),

  newExternalId: computed('selectedTemplateModel.id', function() {
    return `${ C.EXTERNAL_ID.KIND_CATALOG }${ C.EXTERNAL_ID.KIND_SEPARATOR }${ get(this, 'selectedTemplateModel.id') }`;
  }),

  updateReadme() {
    const model = get(this, 'selectedTemplateModel');

    setProperties(this, {
      readmeContent:    null,
      appReadmeContent: null,
      noAppReadme:      false,
    });

    if ( model && model.hasLink('readme') ) {
      model.followLink('readme').then((response) => {
        if (this.isDestroyed || this.isDestroying) {
          return;
        }
        set(this, 'readmeContent', response);
      });
    }

    if ( model && model.hasLink('app-readme') ) {
      set(this, 'noAppReadme', false);

      model.followLink('app-readme').then((response) => {
        if (this.isDestroyed || this.isDestroying) {
          return;
        }
        set(this, 'appReadmeContent', response);
        if ( !response ) {
          set(this, 'noAppReadme', true);
        }
      });
    } else {
      set(this, 'noAppReadme', true);
    }
  },
});
