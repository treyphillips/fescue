// import Ember from "ember";
// import ajax from "ic-ajax";
// //import ApplicationAdapter from './application';
//
// //export default ApplicationAdapter.extend({
// export default Ember.Object.extend({
//   find: function(parseClass, id) {
//     return ajax("https://api.parse.com/1/user/" + id)
//     .then(function(data) {
//       data.id = data.objectId;
//       delete data.objectId;
//       return data;
//     });
//   },
//
//   findAll: function(parseClass) {
//     return ajax("https://api.parse.com/1/user/")
//     .then(function(data) {
//       return data.results.map(function(obj) {
//         obj.id = obj.objectId;
//         delete obj.objectId;
//         return obj;
//       });
//     });
//   },
//
//   push: function(parseClass, object) {
//     return ajax({
//       url: "https://api.parse.com/1/user/",
//       type: "POST",
//       data: JSON.stringify(object)
//     })
//     .then(function(data) {
//        return data;
//     });
//   },
//
//   update: function(parseClass, object) {
//     return ajax({
//       url: "https://api.parse.com/1/user/" + object.id,
//       type: "PUT",
//       data: JSON.stringify(object)
//     })
//     .then(function(data){
//       console.log(data);
//       return data;
//     });
//   },
//
//   destroy: function(parseClass, object) {
//     return ajax({
//       url: "https://api.parse.com/1/user/" + object.id,
//       type: "DELETE"
//     })
//     .then(function(data) {
//       console.log(data);
//       return data;
//     });
//   }
// });


import ajax from 'ic-ajax';
import Ember from 'ember';

export default Ember.Object.extend({
  find: function(name, id){
    /* jshint unused: false */
    return ajax("https://api.parse.com/1/user/" + id).then(function(user){
      user.id = user.objectId;
      delete user.objectId;
      delete user.sessionToken;
      return user;
    });
  }
});
