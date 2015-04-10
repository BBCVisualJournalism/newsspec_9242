define(
    [
        'backbone',
        'jquery'
    ],

    function (Backbone, $) {
        return Backbone.Model.extend({
            defaults: {
                from: 'polling'
            },

            getWinnerClass: function (data) {
                var from = this.get('from');
                var attr = (from === 'polling') ? 'Winner_code' : '2010 result';
                return data[attr].replace(' ', '_').toLowerCase();
            },

            attrData: function (d) {
                return d.properties.constituency_gssid;
            },

            className: function (d) {
                var id = this.attrData(d);
                var cls = 'constituency ';
                var boundryData = this.get(this.attrData(d));

                if (!id) {
                    cls+= 'no-id ';
                }

                if (boundryData) {
                    cls+= this.getWinnerClass(boundryData);
                } else {
                    cls+= 'no-data';
                }

                return cls;
            }
        });
    }
);

