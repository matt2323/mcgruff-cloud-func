'use strict';
const  fetch = require('node-fetch') ;
const functions = require('firebase-functions');
const admin = require("firebase-admin");
const Incidents = require('./IncidentBuilder')
const Range = require('./distance');
const Parser = require('rss-parser');
const parser = new Parser();

admin.initializeApp(functions.config().firebase);

  exports.getUsers = functions.https.onRequest((request, response) => {
    // admin.initializeApp(functions.config().firebase);
    grab911Messages().then(incidents => {

      let notifications = [];
      const db = admin.database().ref("users")

      db.once("value").then(users => {

        users.forEach((user) => {
          var alerts = user.val().alerts;
          const receivedNotifications = Object.keys(user.val().receivedNotifications || {})

          incidents.forEach(incident => {
            if (!incident) return;
            // console.log(incident)
            const incidentId = encodeURI((incident.guid || "").slice(46));
            if (receivedNotifications.includes(incidentId)) {
              console.log("already sent")
              return;
            }
            const relevantAlerts = alerts.map((alert, index) => Object.assign({}, alert, {index}))
              .filter(alert => {
                // return true
                return Range.IsInRange(incident.cords, [alert.latitude, alert.longitude], alert.range)
              })
            // console.log(relevantAlerts)
            const alertNeedsNotifications = !!relevantAlerts.length;
            // console.log(incident,alertNeedsNotifications)
            if (!alertNeedsNotifications) return
            // console.log(incident)

            admin.database().ref(`users/${user.key}/receivedNotifications/${incidentId}/`).set(true)
            // const list = db.ref(`/users/${user.key}/`).push("receivedNotifications")
              // list.set([])
              relevantAlerts.map(alert => {
                const newRef = admin.database().ref(`users/${user.key}/alerts/${alert.index}/receivedNotifications/${incidentId}`)
                .set({
                    title: incident.title,
                    link: incident.link,
                    pubDate: incident.pubDate,
                    content: incident.content,
                    pubDate: incident.pubDate,
                    cords: incident.cords,
                })
              })


            const token = `ExponentPushToken[${user.val().token}]`
            // const title = 'hey there'
            const title = `Alert near ${relevantAlerts[0].name}`
            const body = incident.title


            // send notification
            const request = fetch('https://exp.host/--/api/v2/push/send', {
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
                return;
                // response.status(200).end();
              }).catch((x=>{
                console.log(`failed ${x}`);
                // response.status(500).send('Failed');
              notifications.push(request)
            }))

          })
      })
    })
    console.log(notifications)
    return Promise.all(notifications).then(() => {
      console.log("SUCCESS")
      response.status(200).send("donezo");
    }).catch(e => {
        response.status(500).send('Failed');
    });
  })
})


exports.time = functions.https.onRequest((request, response) => {
  response.status(200).send(new Date().getTime().toString()) ;
});

function grab911Messages() {
  return parser.parseURL('https://www2.monroecounty.gov/911/rss.php')
    .then((rss) => Incidents.buildIncidents( rss.items.map(x => {
      return Object.assign({}, x, { link: x.guid, title: x.title });
    }))).then(inc => {
      return inc;
    });
}










