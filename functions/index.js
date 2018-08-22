'use strict';
const  fetch = require('node-fetch') ;
const functions = require('firebase-functions');
const admin = require("firebase-admin");
const Incidents = require('./IncidentBuilder')
const Range = require('./distance');
const Parser = require('rss-parser');
const parser = new Parser();

//admin.initializeApp(functions.config().firebase);
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
          const receivedNotifications = Object.keys(user.val().receivedNotifications || {})

          incidents.forEach(incident => {
            if (!incident) return;
            console.log(incident)
            const incidentId = encodeURI((incident.guid || "").slice(46));
            if (receivedNotifications.includes(incidentId)) return;
            const relevantAlerts = alerts.map((alert, index) => Object.assign({}, alert, {index}))
              .filter(alert => {
                return Range.IsInRange(incident.cords, [alert.latitude, alert.longitude], alert.range)
              })
            // console.log(relevantAlerts)
            const alertNeedsNotifications = !!relevantAlerts.length;
            // console.log(incident,alertNeedsNotifications)
            if (!alertNeedsNotifications) return
            // console.log(incident)

            const token = `ExponentPushToken[${user.val().token}]`
            // const title = 'hey there'
            const title = `Alert near ${relevantAlerts[0].name}`
            const body = incident.title

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
      return { ...x, link: x.guid, title: x.title };
    }))).then(inc => {
      return inc;
    });
}










