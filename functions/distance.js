const distance = require('gps-distance/lib/distance');
 
function GetDistance(location, targetLocation){
    return distance(location[0], location[1], targetLocation[0],targetLocation[1] )
}

function rangeToKm(range){
    return range/1000; 
}


exports.IsInRange =  function IsInRange(location, targetLocation, range){
    const dis =  distance(location[0], location[1], targetLocation[0],targetLocation[1] )
    if(rangeToKm(range) < dis){
        return true; 
    }else{
        return false; 
    }
}