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
    template_content: [],
    message: {
      from_email: "grassy.app@gmail.com",
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

Parse.Cloud.afterSave('Request', function(request) {
  console.log('hi');
  if(request.object.existed() === false) {
    sendTemplate('customer-job-scheduled', {
      subject: '',
      firstName: request.object.get('firstName'),
      lastName: request.object.get('lastName'),
      toEmail: request.object.get('email')
    });
  }
});
