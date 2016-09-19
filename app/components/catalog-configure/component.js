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
  },

  actions: {
    doSave() {
      debugger;
    },
  },
});
