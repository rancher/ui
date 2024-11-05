import $ from 'jquery';
import { Promise } from 'rsvp';

export function ajaxPromise(opt, justBody) {
  var promise = new Promise(function(resolve,reject) {
    $.ajax(opt).then(success,fail);

    function success(body, textStatus, xhr) {
      if ( justBody === true )
      {
        resolve(body, 'AJAX Response: '+ opt.url + '(' + xhr.status + ')');
      }
      else
      {
        resolve({xhr: xhr, textStatus: textStatus},'AJAX Response: '+ opt.url + '(' + xhr.status + ')');
      }
    }

    function fail(xhr, textStatus, err) {
      reject({xhr: xhr, textStatus: textStatus, err: err}, 'AJAX Error:' + opt.url + '(' + xhr.status + ')');
    }
  },'Raw AJAX Request: '+ opt.url);

  return promise;
}

export default ajaxPromise;
