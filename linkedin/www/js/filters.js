angular
  .module('linkedin')
  .filter('proximityFilter', proximityFilter);
 
function proximityFilter () {
  return function (proximity) {
    if (! proximity ) return;
 
    var distance = proximity.substring(9);
    return "Proximity: " + distance;

  };
}