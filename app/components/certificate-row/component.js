import Ember from 'ember';
import FasterLinksAndMenus from 'ui/mixins/faster-links-and-menus';

export default Ember.Component.extend(FasterLinksAndMenus,{
  model: null,
  tagName: 'TR',
});
