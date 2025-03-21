export function getLatitude(location) {
    if (!location) return "";
    return location.split(",")[0].trim();
  }
  
  export function getLongitude(location) {
    if (!location) return "";
    return location.split(",")[1].trim();
  }