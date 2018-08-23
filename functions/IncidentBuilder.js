const GeoCords = require( './GeoCoder');



exports.buildIncidents = function buildIncidents (messages){
    const incidentsList = [];

    messages.forEach(element => {
        incidentsList.push(getCords(element));
    });

    return Promise.all(incidentsList)

    // return Promise.all(messages.map(message => getCords(message)))
}

function getCords(element){
    return GeoCords.getCords(element);
}