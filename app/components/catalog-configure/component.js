import Ember from 'ember';

export default Ember.Component.extend({
  model: null,

  didInitAttrs() {
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
      serviceChoices: orig.get('serviceChoices'),
      tpl: tpl,
      versionLinks: links,
      versionsArray: verArr,
    };

    this.set('model', out);
  },

  actions: {
    doSave(templateId, newStack, tpl) {
      let orig = this.get('originalModel');
      let stack = orig.get('stack');
      stack.merge(newStack);

      orig.setProperties({
        changed: true,
        enabled: true,
        stack: stack,
        tplVersion: tpl,
      });
      this.sendAction('dismiss');
    },

    outsideClick() {},

    cancel() {
      this.sendAction('dismiss');
    },
  },
});
