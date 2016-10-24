import Ember from 'ember';
import ModalBase from 'lacsso/components/modal-base';

export default ModalBase.extend({
  classNames: ['lacsso', 'modal-container', 'generic', 'full-width-modal'],

  serviceChoices: Ember.computed.alias('modalService.modalOpts.serviceChoices'),
  originalModel: Ember.computed.alias('modalService.modalOpts.originalModel'),

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

    let out = {
      stack: orig.get('stack').clone(),
      serviceChoices: this.get('serviceChoices'),
      tpl: tpl,
      currentUrl: orig.get('tplVersion.links.self'),
      versionLinks: links,
      versionsArray: verArr,
    };

    this.set('model', out);
  }.on('init'),

  actions: {
    doSave(templateId, newStack, tpl) {
      let orig = this.get('originalModel');
      let stack = orig.get('stack');
      stack.merge(newStack);

      orig.setProperties({
        enabled: true,
        stack: stack,
        tplVersion: tpl,
      });
      this.send('cancel');
    },
  },
});
