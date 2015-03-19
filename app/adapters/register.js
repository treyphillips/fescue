import ajax from 'ic-ajax';
import Ember from 'ember';

export default Ember.Object.extend({

      save: function(register, record) {
        console.log('Gogogo');
        if (record.id) {
          return ajax({
            url: "https://api.parse.com/1/classes/user/" + record.id,
            type: "PUT",
            data: JSON.stringify(register)
          }).then(function(register) {
            register.id = register.objectId;
            delete register.objectId;
            return register;
          });

        } else {
          return ajax({
            url:  "https://api.parse.com/1/classes/user/",
            type: "POST",
            data: JSON.stringify(register)
          }).then(function(register) {
            record.updatedAt = register.updatedAt;
            return record;

          });
        }
      }
});
