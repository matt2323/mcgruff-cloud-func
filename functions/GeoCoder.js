const NodeGeocoder = require('node-geocoder');
const config =  {
    "provider": "google",
    "httpAdapter": "https",
    "apiKey": "AIzaSyBcmvsE1MkuWlTW05i3AWj7xvcqL2Yvm6U",
    "formatter": null
  }
const geocoder = NodeGeocoder(config);

exports.getCords = function getCords(element={}){
    return geocoder.geocode(cleanAddress((element || {}).title || ""))
    .then(function(res) {
        return {
          ...element,
          "cords" :  [res[0].latitude, res[0].longitude],
            address: element.title,
            link: element.link,
        }
    })
    .catch(function(err) {
      console.log(err);
    });
}


function cleanAddress(address){
  //  console.log(/([0-9]{0,} [A-Z][^a-z]+, [A-Z][a-z]*)/.exec(address));
    let fixedAddress =  (/([0-9]{0,} [A-Z][^a-z]+, [A-Z][a-z]*)/.exec(address) || [])[0];
    /// check for NB SB WB EB

    return fixedAddress || "";
}

