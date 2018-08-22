'use strict';
const  fetch = require('node-fetch') ;
const functions = require('firebase-functions');
const admin = require("firebase-admin");
const Incidents = require('./IncidentBuilder')
const Range = require('./distance'); 
const Parser = require('rss-parser');
const parser = new Parser();

//admin.initializeApp(functions.config().firebase);






const users =[ {
    "X-ta1WJkHNsdI8JA8-xuM_" : {
      "alerts" : [ {
        "latitude" : 43.14221103144518,
        "longitude" : -77.60554868727922,
        "name" : "Home",
        "range" : 2777.890625
      }, {
        "latitude" : 43.16276516802986,
        "longitude" : -77.5878095626831,
        "name" : "Alert 5",
        "range" : 2349.0625
      }, {
        "latitude" : 43.12232491468803,
        "longitude" : -77.60772731155157,
        "name" : "Alert 6",
        "range" : 3518.59375
      } ],
      "token" : "X-ta1WJkHNsdI8JA8-xuM_"
    }
  }]
exports.run = functions.https.onRequest((request, response) => {


    // there a better way to do this... Hackaton! 
    grab911Messages().then(incidents =>{
        const pushNotes = []; 
        users.forEach(user =>{
            user.alerts.forEach(alert=>{
                incidents.forEach(incident =>{
                    if(Range.IsInRange(incident.cords, [alert.latitude, alert.longitude], alert.range)){
                        console.log(`alert: ${alert.name}`)        
                    }else{
                        console.log("no alert"); 
                    }
                })    
            })
        })
    }); 


    // const db = admin.database();
    // const ref = db.ref("users");
    // ref.on("value", function(users) {
    //     console.log(users);

    //     users.forEach(user =>{






    //     })






    //   }, function (errorObject) {
    //     console.log("The read failed: " + errorObject.code);
    //   });





});

  exports.getUsers = functions.https.onRequest((request, response) => {
    admin.initializeApp(functions.config().firebase);

    const db = admin.database().ref("users")
    db.once("value").then(function(users) {
      users.forEach((user) =>{
        var alerts = user.val().alerts;
        alerts.forEach(alert => {
          console.log(alert)
          const alertNeedsNotifications = true
          if (!alertNeedsNotifications) return

          const token = `ExponentPushToken[${user.val().token}]`
          const title = 'hey there'
          const body = `Things are happening nearby ${alert.name}!`

          // send notification
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
          }).catch((x=>{
              console.log(x);
          }))
        })
      })
    })
  })


function grab911Messages() {
   return parser.parseURL('https://www2.monroecounty.gov/911/rss.php')
     // .then((response) => response.text())
      //.then((responseData) => rssParser.parse(responseData))
      .then((rss) => Incidents.buildIncidents( rss.items.map(x => {
        return { link: x.guid,title: x.title };
      }))).then(inc => {
        return inc;
     //   console.log(inc);
        // this.setState({incidents: inc});
      })
  }

//   exports.getUsers = functions.https.onRequest((request, response) => {
//     // functions.auth.UserRecord({uid: '34eNMx71mpdJR4DZtXTUODOlllA2'})
//     admin.initializeApp(functions.config().firebase);

//     const db = admin.database().ref("users")
//     db.once("value")
//     .then(function(users) {
//       users.forEach(user =>{
//         var alerts = user.val().alerts;
//         alerts.forEach(alert => {
//           console.log(alert)

//         })
//       })
//     })
//   })
  




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


