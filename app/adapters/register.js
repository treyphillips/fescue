import ajax from 'ic-ajax';
import Ember from 'ember';

export default Ember.Object.extend({

      save: function(type, record) {
        if (record.id) {
          return ajax({
            url: "https://api.parse.com/1/users" + record.id,
            type: "PUT",
            data: JSON.stringify(record)
          }).then(function(response) {
            record.updatedAt = response.updatedAt;
            return record;
          });

        } else {
          return ajax({
            url:  "https://api.parse.com/1/users",
            type: "POST",
            data: JSON.stringify(record)
          }).then(function(response) {
            record.id = response.objectId;
            record.createdAt = response.createdAt;
            record.sessionToken = response.sessionToken;
            return record;
          });
        }
      }
});
