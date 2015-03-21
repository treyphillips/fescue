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
  }
});
