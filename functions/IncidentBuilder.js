const GeoCords = require( './GeoCoder');



exports.buildIncidents = async function buildIncidents (messages){
    return Promise.all(messages.map(async message => await getCords(message)))
}

function getCords(element){
    return GeoCords.getCords(element);
}