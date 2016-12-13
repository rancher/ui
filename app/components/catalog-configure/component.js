import Ember from 'ember';
import ModalBase from 'lacsso/components/modal-base';

export default ModalBase.extend({
  classNames: ['lacsso', 'modal-container', 'generic', 'full-width-modal'],

  serviceChoices: Ember.computed.alias('modalService.modalOpts.serviceChoices'),
  originalModel: Ember.computed.alias('modalService.modalOpts.originalModel'),
  selectedTemplateUrl: Ember.computed.alias('modalService.modalOpts.selectedTemplateUrl'),

  model: null,

  onInit: function() {
    this._super();

    let orig = this.get('originalModel');
    let tpl = orig.get('tpl');
    let links = tpl.get('versionLinks');
    var verArr = Object.keys(links).filter((key) => {
      // Filter out empty values for rancher/rancher#5494
      return !!links[key];
    }).map((key) => {
      return {version: key, link: links[key]};
    });

    // New-Catalog wants answers as the environment property
    let stackish = orig.get('stack').clone();
    stackish.set('environment', stackish.get('answers'));
    stackish.set('answers', null);

    let out = {
      stack: stackish,
      serviceChoices: this.get('serviceChoices'),
      tpl: tpl,
      currentUrl: this.get('selectedTemplateUrl')||orig.get('tplVersion.links.self'),
      versionLinks: links,
      versionsArray: verArr,
    };

    this.set('model', out);
  }.on('init'),

  actions: {
    doSave(opt) {
      let orig = this.get('originalModel');
      let stack = orig.get('stack');

      stack.setProperties({
        templateId: opt.templateId,
        templateVersionId: opt.templateVersionId,
        answers: opt.answers
      });

      orig.set('enabled', true);
      this.send('cancel');
    },
  },
});
