import Resource from 'ember-api-store/models/resource';
import C from 'ui/utils/constants';
import Serializable from 'ember-api-store/mixins/serializable';

function serialize(obj) {
  try {
    if ( Serializable.detect(obj) )
    {
      return obj.serialize();
    }
    else
    {
      return obj;
    }
  } catch (e) {
    return {
      message: "Error parsing JSON",
    };
  }
}

var auditLog = Resource.extend({});

auditLog.reopenClass({
  headers: {
    [C.HEADER.PROJECT]: undefined, // Requests for projects use the user's scope, not the project
  },

  mangleIn: function(data) {
    if ( data.requestObject )
    {
      data.requestObject = serialize(data.requestObject);
    }

    if ( data.responseObject )
    {
      data.responseObject = serialize(data.responseObject);
    }

    return data;
  },

});

export default auditLog;
