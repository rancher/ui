import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { observer } from '@ember/object';
import { reads } from '@ember/object/computed';
import $ from 'jquery';

export default Component.extend({
  scope:                   service(),

  pageScope:               reads('scope.currentPageScope'),

  outputTagsChanged: observer('model.outputTags', function() {
    this.setCodeBlockHeight();
  }),

  setCodeBlockHeight() {
    const h = $('.additional-logging-configuration-content').height() + 12;

    $('.logging-format pre').height(`${ h  }px`);
  },
});
