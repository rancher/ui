import { computed, get, set } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@ember/component';

export default Component.extend({

  setCodeBlockHeight() {
    const h = this.$('.additional-logging-configuration-content').height() + 12;
    this.$('.logging-format pre').height(h + 'px');
  },
  outputTagsChanged: function() {
    this.setCodeBlockHeight();
  }.observes('model.outputTags'),
});
