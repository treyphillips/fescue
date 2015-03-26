import Ember from 'ember';
import ajax from 'ic-ajax';

export default Ember.Object.extend({
  save: function(type, record) {
    if (record.id) {
      return ajax({
        url: "https://api.parse.com/1/classes/Request" + record.id,
        type: "PUT",
        data: JSON.stringify(record.toJSON())
      }).then(function(response) {
        record.updatedAt = response.updatedAt;
        return record;
      });

    } else {
      return ajax({
        url:  "https://api.parse.com/1/classes/Request",
        type: "POST",
        data: JSON.stringify(record.toJSON())
      }).then(function(response) {
        record.id = response.objectId;
        record.createdAt = response.createdAt;
        return record;
      });
    }
  },

  findQuery: function(name, query) {
  /* jshint unused: false */
  return ajax("https://api.parse.com/1/classes/Request?include=createdBy", {
    data: {
      where: JSON.stringify({
        createdBy: {
          "__type":"Pointer",
          "className":"_User",
          "objectId": query.user.id
        }
      })
    }
  }).then(function(response){
    return response.results.map(function(request) {
      request.id = request.objectId;
      delete request.objectId;
      return request;
    });
  });
  },

  findAll: function(name) {
  /* jshint unused: false */
  return ajax("https://api.parse.com/1/classes/Request?include=createdBy").then(function(response){
    return response.results.map(function(request) {
      request.id = request.objectId;
      delete request.objectId;
      return request;
    });
  });
  },
});
