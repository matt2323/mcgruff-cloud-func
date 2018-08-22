const GeoCords = require( './GeoCoder'); 



exports.buildIncidents = function buildIncidents(messages){

    const incidentsList = [];      

    messages.forEach(element => {
        incidentsList.push(getCords(element.title, element.link)); 
    }); 

    return Promise.all(incidentsList)

}

function getCords(title, link){
    return GeoCords.getCords(title, link);  
}