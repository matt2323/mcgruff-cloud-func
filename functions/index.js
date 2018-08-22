'use strict';
const  fetch = require('node-fetch') ;
const functions = require('firebase-functions');
const admin = require("firebase-admin");
const Incidents = require('./IncidentBuilder')
const Range = require('./distance'); 
const Parser = require('rss-parser');
const parser = new Parser();

exports.run = functions.https.onRequest((request, response) => {

    admin.initializeApp(functions.config().firebase);

    const db = admin.database().ref("users")


      grab911Messages().then(incidents =>{
        const pushNotes = []; 
        db.once("value")
        .then(function(users) {
          users.forEach(user =>{
            var alerts = user.val().alerts;
            alerts.forEach(alert => {
                incidents.forEach(incident =>{
                    if(Range.IsInRange(incident.cords, [alert.latitude, alert.longitude], alert.range)){
                        console.log(`alert: ${alert.name}`)        
                    }else{
                        console.log("no alert"); 
                    }
                })  
    
            })
          })        
        })    
    }); 
});

  exports.getUsers = functions.https.onRequest(async (request, response) => {
    admin.initializeApp(functions.config().firebase);
    grab911Messages().then(incidents => {

      const db = admin.database().ref("users")
      db.once("value").then(users => {

        users.forEach((user) => {
          var alerts = user.val().alerts;

          incidents.forEach(incident => {
            const relevantAlerts = alerts.filter(alert => {
              return Range.IsInRange(incident.cords, [alert.latitude, alert.longitude], alert.range)
            })
            console.log(relevantAlerts)
            const alertNeedsNotifications = !!relevantAlerts.length;
            console.log(incident,alertNeedsNotifications)
            if (!alertNeedsNotifications) return
            console.log(incident)

            const token = `ExponentPushToken[${user.val().token}]`
            // const title = 'hey there'
            const title = incident.address
            const body = `Things are happening nearby ${relevantAlerts[0].name}!`

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
                console.log(`sent alert ${title}`);
            }).catch((x=>{
                console.log("failed");
            }))
        })
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
        // this.setState({incidents: inc})
      });
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


