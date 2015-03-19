
import ajax from 'ic-ajax';
import Ember from 'ember';



export default Ember.Object.extend({
  find: function(name, id){
  /* jshint unused: false */
    return ajax("https://api.parse.com/1/classes/user/" + id).then(function(user){
      user.id = user.objectId;
      delete user.objectId;
      return user;
    });
  },

  findAll: function(name) {
    /* jshint unused: false */
    return ajax("https://api.parse.com/1/classes/user").then(function(response){
      return response.results.map(function(user) {
        user.id = user.objectId;
        delete user.objectId;
        return user;
      });
    });
  },

  destroy: function(name, record) {
    return ajax({
      url: "https://api.parse.com/1/classes/user/" + record.id,
      type: "DELETE"
    });
  },

  save: function(name, record) {
    console.log(JSON.stringify(record));
    if(record.id) {
      return ajax({
        url: "https://api.parse.com/1/classes/user/" + record.id,
        type: "PUT",
        data: JSON.stringify(record)
      }).then(function(response) {
        response.id = response.objectId;
        delete response.objectId;
        return response;
      });
    } else {
      return ajax({

        url: "https://api.parse.com/1/classes/user",
        type: "POST",
        data: JSON.stringify(record)
      }).then(function(response) {
        record.updatedAt = response.updatedAt;
        return record;
      });
    }
  }
});
