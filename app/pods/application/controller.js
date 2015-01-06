import Ember from "ember";

export default Ember.Controller.extend({
  navExpand: (parseInt($.cookie('navExpand'),10) !== 0),
  error: null,
  pageName: '',

  navExpandChange: function() {
    var inAYear = new Date();
    inAYear.setYear(inAYear.getFullYear()+1);

    $.cookie('navExpand', (this.get('navExpand') ? 1 : 0), {
      expires: inAYear
    });
  }.observes('navExpand'),


  absoluteEndpoint: function() {
    var url = this.get('app.endpoint');
    if ( url.indexOf('http') !== 0 )
    {
      url = window.location.origin + '/' + url.replace(/^\/+/,'');
    }

    return url;
  }.property('app.endpoint'),
});
