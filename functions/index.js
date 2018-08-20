const functions = require('firebase-functions');

// Create and Deploy Your First Cloud Functions
// https://firebase.google.com/docs/functions/write-firebase-functions

exports.helloWorld = functions.https.onRequest((request, response) => {
 response.send("Take a bite out of crime");
});


exports.test = functions.https.onRequest((request, response) => {
    response.send("EZPZ");
});