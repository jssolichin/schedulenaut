/**
 * Created by Jonathan on 2/9/2015.
 */

module.exports = function () {
    return {
        //getExtent is useful to get brush extent when we are not sure whether we are passing function or extent, since they get converted through the app
        getExtent: function (brushOrBrushExtent) {
            if (brushOrBrushExtent !== undefined) {
                if (Object.prototype.toString.call(brushOrBrushExtent) == '[object Function]')
                    return brushOrBrushExtent.extent();
                if (Object.prototype.toString.call(brushOrBrushExtent) == '[object Array]')
                    return brushOrBrushExtent;
                else
                    return 'unknown';
            }
            else
                return undefined;
        },
        getEdge: function (brush, brushWrappers) {
            var helpers = this;
            var edge = [];

            //go through each event blocks and look for the 2 closest one on both side to the current one and store that to edge
            brushWrappers.forEach(function (brushWrapper) {
                var otherBrush = brushWrapper.brush;
                var otherBrush_extent = helpers.getExtent(otherBrush);

                if (otherBrush !== brush) {
                    if (brush.extent.start !== undefined && otherBrush_extent[1].getTime() <= brush.extent.start[0].getTime()) {
                        if (edge[0] !== undefined && otherBrush_extent[1].getTime() > edge[0].getTime() || edge[0] === undefined)
                            edge[0] = otherBrush_extent[1];
                    }
                    else if (brush.extent.start !== undefined && otherBrush_extent[0].getTime() > brush.extent.start[0].getTime()) {
                        if (edge[1] !== undefined && otherBrush_extent[0].getTime() < edge[1].getTime() || edge[1] === undefined)
                            edge[1] = otherBrush_extent[0];
                    }
                }
            });
            return edge;
        },
        round: function (date, interval) {
            //d3 does not have interval between minutes and hours.
            //this function is a shim to get arbitrary minutes interval (e.g. 15 minutes, 30 minutes (half-hour)).
            //given a date object, round to the nearest minute interval.

            var minutes = date.getMinutes();
            var hours = date.getHours();
            var m, h;

            m = (((minutes + (interval / 2)) / interval | 0) * interval) % 60;
            h = ((((minutes / (120 - interval)) + 0.5) | 0) + hours) % 24;

            d0 = new Date(date);
            d0.setMinutes(m);
            d0.setHours(h);
            d0.setSeconds(0);

            return d0;
        }
    };
};
