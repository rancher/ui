export function initialize(/* container, application */) {
  $.jGrowl.defaults.pool = 6;
  $.jGrowl.defaults.closeTemplate = '<i class="ss-delete"></i>';
  $.jGrowl.defaults.closerTemplate = '<div><button type="button" class="btn btn-info btn-xs btn-block">Hide All Notifications</button></div>';
}

export default {
  name: 'growl',
  initialize: initialize
};
