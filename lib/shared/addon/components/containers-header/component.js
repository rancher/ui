import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { tagChoices } from 'ui/models/namespace';
import { uniqKeys } from 'shared/utils/util';
import { alias } from '@ember/object/computed';
import layout from './template';

export default Component.extend({
  layout,
  scope: service(),
  pipeline: service(),
  tags: null,
  simpleMode: false,
  showGroup: true,

  tagName: '',
  pipelineDeploy: alias('pipeline.deploy'),
  allStacks: null,
  init() {
    this._super(...arguments);
    this.set('allStacks', this.get('store').all('stack'));
    this.get('pipeline').isReady();
  },

  actions: {
    setTags(tags) {
      this.set('tags', tags);
    },
  },

  tagChoices: function() {
    let choices = uniqKeys(tagChoices(this.get('allStacks'))).sort();
    if ( !choices.length ) {
      return null;
    }

    return choices;
  }.property('allStacks.@each.tags'),
});
