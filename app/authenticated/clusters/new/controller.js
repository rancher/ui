import Ember from 'ember';
import { parseExternalId } from 'ui/utils/parse-externalid';

export default Ember.Controller.extend({
  projects:            Ember.inject.service(),
  catalog:             Ember.inject.service(),
  catalogItem:         null,
  editCatalog:         false,
  selectedTemplateUrl: null,
  actions: {

    templateEdited() {
      this.cancelEdit();
    },

    goToTemplate(templateId) {
      var extId = templateId;
      var templateInfo =  parseExternalId(extId);

      this.get('catalog').fetchTemplate(templateInfo.templateId).then((template) => {
        var stack = this.get('model.cluster.systemStacks').find((stack) => {
          if (stack.get('externalId').indexOf(templateInfo.templateId) >= 0) {
            return stack;
          }
        });

        var neu = Ember.Object.create({
          stack:         stack,
          tpl:           template,
          upgrade:       false,
          versionLinks:  template.versionLinks,
          versionsArray: this.get('catalog').cleanVersionsArray(template),
          allTemplates:  this.get('model.allTemplates'),
          templateBase:  templateInfo.base,
        });

        this.setProperties({
          selectedTemplateUrl: template.versionLinks[templateInfo.version],
          catalogItem:         neu,
          editCatalog:         true,
        });
      });
    },

    done() {
      this.send('goToPrevious','authenticated.clusters');
    },

    cancelEdit() {
      this.setProperties({
        editCatalog:         false,
        selectedTemplateUrl: null,
        catalogItem:         null,
      });
    },

    cancel() {
      this.send('goToPrevious','authenticated.clusters');
    },
  },
});
