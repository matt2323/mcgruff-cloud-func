import GeoCords from './GeoCoder'; 



export default function buildIncidents(messages){

    const incidentsList = [];      

    messages.forEach(element => {
        incidentsList.push(getCords(element.title, element.link)); 
    }); 

    return Promise.all(incidentsList)

}

function getCords(title, link){
    return GeoCords(title, link);  
}