'use strict';
const  fetch = require('node-fetch') ;
const functions = require('firebase-functions');
const admin = require("firebase-admin");
const Incidents = require('./IncidentBuilder')
const Range = require('./distance'); 
const Parser = require('rss-parser');
const parser = new Parser();

  exports.getUsers = functions.https.onRequest((request, response) => {
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
                response.status(200).end();
            }).catch((x=>{
                console.log(`failed ${x}`);
                response.status(500).send('Failed');
            }))
        })
      })
    })
  })
})


exports.time = functions.https.onRequest((request, response) => {
  response.status(200).send(new Date().getTime().toString()) ;
}); 

function grab911Messages() {
  return parser.parseURL('https://www2.monroecounty.gov/911/rss.php')
    .then((rss) => Incidents.buildIncidents( rss.items.map(x => {
      return { link: x.guid,title: x.title };
    }))).then(inc => {
      return inc; 
    });
}










