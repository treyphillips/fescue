var Mandrill = require('mandrill');

function sendTemplate(templateName, params) {
  var promise = new Parse.Promise();

  Mandrill.initialize('Mx2WvDNwdDYIcYarJIxtPg');
  Mandrill.sendTemplate({
    template_name: templateName,
    template_content: [
      {
        name: "SUBJECT",
        content: params.subject
      },
      {
        name: "FName",
        content: params.firstName
      },
      {
        name: "LName",
        content: params.lastName
      }
    ],
    message: {
      from_email: "grass.app@gmail.com",
      to: [{
        email: params.toEmail,
        name: params.firstName + " " + params.lastName
      }]
    }
  }, {
    success: function (httpResponse) {
      console.log(httpResponse);
      promise.resolve("Email sent!");
    },
    error: function (httpResponse) {
      console.error(httpResponse);
      promise.reject("Uh oh, something went wrong");
    }
  });

  return promise;
}

Parse.Cloud.define('appointment', function(request, response) {
  sendTemplate('mandrill-app-test-2', {
    subject: 'YO',
    firstName: "Trey",
    lastName: "Phillips",
    toEmail: "tlphillipsjr@gmail.com"
  }).then(function(){
    response.success();
  }, function(error){
    response.error(error);
  });
});
