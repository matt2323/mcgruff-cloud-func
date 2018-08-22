//const distance = require('gps-distance/lib/distance');
 
import distance  from 'gps-distance/lib/distance';

// Measure between two points:
//var result = distance(45.527517, -122.718766, 45.373373, -121.693604);

 export function GetDistance(location, targetLocation){
    return distance(location[0], location[1], targetLocation[0],targetLocation[1] )
}

export function IsInRange(location, targetLocation, range){
    const dis =  distance(location[0], location[1], targetLocation[0],targetLocation[1] )
    if(range < dis){
        return true; 
    }else{
        return false; 
    }
}