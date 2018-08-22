'use strict';
const  fetch = require('node-fetch') ;
const functions = require('firebase-functions');
const admin = require("firebase-admin");

exports.helloWorld = functions.https.onRequest((request, response) => {
// response.send("Take a bite out of crime");

    // let starCountRef = firebase.database().ref('users');
    // starCountRef.on('value', function(users) {
    //     response.send(users); 
    // });





});







function grab911Messages() {
    fetch('https://www2.monroecounty.gov/911/rss.php')
      .then((response) => response.text())
      .then((responseData) => rssParser.parse(responseData))
      .then((rss) => buildIncidents( rss.items.map(x => {
        return { link: x.id,title: x.title };
      }))).then(inc => {
         this.setState({incidents: inc});
      })
  }







exports.test = functions.https.onRequest((request, response) => {

    const token = ""
    console.log("token: ", token)
    if (!token) return;
    const title = "There's something happening!"
    const body = "check it out"
    fetch('https://exp.host/--/api/v2/push/send', {
      body: JSON.stringify({
        to: token,
        title: title,
        body: body,
        data: { message: `${title} - ${body}` },
      }),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    }).then((x)=>{
        console.log(x); 
        response.send("worked");
    }).catch((x=>{
        console.log(x); 
        response.send("failed");
    }))

});


