/**
 * Created by Jonathan on 2/9/2015.
 */

module.exports = function (){
    return {
        round: function (date, interval){
            //d3 does not have interval between minutes and hours.
            //this function is a shim to get arbitrary minutes interval (e.g. 15 minutes, 30 minutes (half-hour)).
            //given a date object, round to the nearest minute interval.

            var minutes = date.getMinutes();
            var hours = date.getHours();
            var m,h;

            m = (((minutes + (interval/2))/interval | 0) * interval) % 60;
            h = ((((minutes/(120-interval)) + .5) | 0) + hours) % 24;

            d0 = new Date(date);
            d0.setMinutes(m);
            d0.setHours(h);
            d0.setSeconds(0);

            return d0;
        }
    }
};
