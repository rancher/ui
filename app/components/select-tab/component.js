import Ember from 'ember';
import SelectTab from 'ui/mixins/select-tab';

export default Ember.Component.extend(SelectTab, {
  tagName    : 'section',
  initialTab : '',
  init: function() {
    this._super(...arguments);
    Ember.run.scheduleOnce('afterRender', () => {
      this.send('selectTab', this.get('initialTab'));
    });
  }
});
