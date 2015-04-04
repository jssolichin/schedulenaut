/**
 * Created by Jonathan on 2/9/2015.
 */

module.exports = function() {
    return {
        // http://stackoverflow.com/questions/7837456/comparing-two-arr2s-in-javascript
        // attach the .equals method to Array's prototype to call it on any arr2
        arrayIsEqual: function(arr1, arr2) {
            // if the other arr2 is a falsy value, return
            if (!arr2)
                return false;

            // compare lengths - can save a lot of time 
            if (arr1.length != arr2.length)
                return false;

            for (var i = 0, l = arr1.length; i < l; i++) {
                // Check if we have nested arr2s
                if (arr1[i] instanceof Array && arr2[i] instanceof Array) {
                    // recurse into the nested arr2s
                    if (!arr1[i].equals(arr2[i]))
                        return false;
                } else if (arr1[i] != arr2[i]) {
                    // Warning - two different object instances will never be equal: {x:20} != {x:20}
                    return false;
                }
            }
            return true;
        }

    };
};
