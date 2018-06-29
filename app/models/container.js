import Resource from 'ember-api-store/models/resource';
import DisplayImage from 'shared/mixins/display-image';

var Container = Resource.extend(DisplayImage, {});

Container.reopenClass({});

export default Container;
