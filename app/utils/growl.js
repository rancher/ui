var Growl = {};

Growl._jGrowl = function(title, body, opt)
{
  opt = opt || {};

  if ( title )
  {
    opt.header = title;
  }

  return $.jGrowl(body, opt);
};

Growl.success = function(title, body) {
  Growl._jGrowl(title, body, {
    theme: 'success'
  });
};

Growl.message = function(title,body)
{
  Growl._jGrowl(title, body, {
    theme: 'message'
  });
};

Growl.error = function(title,body)
{
  Growl._jGrowl(title, body, {
    sticky: true,
    theme: 'error'
  });
};

window.Growl = Growl;

// see also: initilizers/growl.js

export default Growl;
