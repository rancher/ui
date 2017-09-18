import Ember from 'ember';
import { parseExternalId } from 'ui/utils/parse-externalid';

export default Ember.Controller.extend({
  projects: Ember.inject.service(),
  catalog:      Ember.inject.service(),
  catalogItem: null,
  editCatalog: false,
  selectedTemplateUrl: null,
  actions: {
    templateEdited(tpl) {
      this.set('editCatalog', false);
      // this;
      // tpl;
      // debugger;
    },
    goToTemplate(templateId) {
      var extId = templateId;

      this.get('catalog').fetchTemplate(templateId).then((template) => {
        var stack = this.get('model.cluster.systemStacks').find((stack) => {
          if (stack.get('externalId').indexOf(extId) >= 0) {
            return stack;
          }
        });

        // @@TODO@@ - 09-18-17 - shouldn't the template have a default version in the setting?
        // parseExternalId(template.defaultTemplateVersionId);
        // this.set('selectedTemplateUrl', template.findBy('externalId', ));
        // debugger;

        this.set('catalogItem', Ember.Object.create({
          stack: stack,
          tpl: template,
          upgrade: false,
          versionLinks: template.versionLinks,
          versionsArray: Object.keys(template.versionLinks).filter((key) => {
            // Filter out empty values for rancher/rancher#5494
            return !!template.versionLinks[key];
          }).map((key) => {
            return {version: key, sortVersion: key, link: template.versionLinks[key]};
          }),
          allTemplates: this.get('model.allTemplates'),
          templateBase: "",
        }));
        this.set('editCatalog', true);
      });
    },
    done() {
      this.send('goToPrevious','authenticated.clusters');
    },

    cancel() {
      this.send('goToPrevious','authenticated.clusters');
    },
  },
});
