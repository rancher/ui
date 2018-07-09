import Component from '@ember/component';

export default Component.extend({

  outputTagsChanged: function() {

    this.setCodeBlockHeight();

  }.observes('model.outputTags'),
  setCodeBlockHeight() {

    const h = this.$('.additional-logging-configuration-content').height() + 12;

    this.$('.logging-format pre').height(`${ h  }px`);

  },
});
