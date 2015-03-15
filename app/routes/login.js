import Ember from 'ember';

export default Ember.Route.extend({
 actions: {
   createUser: function(newfirstName, newLastName, newEmail, newAddress, newCity, newState, newZipCode, newPhoneNum) {

     var data = {firstName: newfirstName, lastName: newLastName, email: newEmail, address: newAddress, city: newCity, state: newState, zipCode: newZipCode, phone: newPhoneNum};

     Ember.$.ajax("https://api.parse.com/1/classes/user/", {
       type: "POST",
       data: JSON.stringify(data)
     }).done(function() {
       console.log(data);
     });

   }
 }
});
