const NodeGeocoder = require('node-geocoder');
const config =  {
    "provider": "google",
    "httpAdapter": "https", 
    "apiKey": "",
    "formatter": null   
  }     
const geocoder = NodeGeocoder(config);
 
exports.getCords = function getCords(address, link){
       return geocoder.geocode(cleanAddress(address))
        .then(function(res) {
            return {
              "cords" :  [res[0].latitude, res[0].longitude], 
               address,
               link     
            }
        })
        .catch(function(err) {
          console.log(err);
        });
    }
    

function cleanAddress(address){
  //  console.log(/([0-9]{0,} [A-Z][^a-z]+, [A-Z][a-z]*)/.exec(address)); 
    let fixedAddress =  /([0-9]{0,} [A-Z][^a-z]+, [A-Z][a-z]*)/.exec(address)[0]; 
    /// check for NB SB WB EB 

    return fixedAddress; 
}

