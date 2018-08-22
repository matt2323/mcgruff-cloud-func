import Geocoder from 'react-native-geocoding';
import * as config from './app.json'
console.log(config); 
Geocoder.init(config.expo.android.config.googleMaps.apiKey); 

 
export default function
    
    getCords(address, link){
        return Geocoder.from(address)
        .then(function(res) {
            return {
              "cords" :  [res.results[0].geometry.location.lat, res.results[0].geometry.location.lng], 
               address,
               link     
            }
        })
        .catch(function(err) {
          console.log(err);
        });
    }
    



