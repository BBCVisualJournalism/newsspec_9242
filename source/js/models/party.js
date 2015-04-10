define(
    [
        'backbone',
        'jquery'
    ],

    function (Backbone, $) {
        var PROP_MAP = {
            polling: {
                con: 'Con1',
                lib_dem: 'Lib_Dem3',
                ukip: 'Ukip4',
                lab: 'Lab2',
                green: 'Green5',
                snp: 'SNP7',
                pc: 'Plaid8',
                other: 'Other6'
            },

            2010: {
                con: 'Con10',
                lib_dem: 'LD10',
                ukip: 'UKIP10',
                lab: 'Lab10',
                green: 'Grn10',
                snp: 'SNP10',
                pc: 'PC10',
                other: 'OTH10'
            }
        };
        return Backbone.Model.extend({
            attrData: function (d) {
                return d.properties.constituency_gssid;
            },

            className: function (d) {
                var id = this.attrData(d);
                var cls = 'constituency ';
                var boundryData = this.get(d.properties.constituency_gssid);
                var from = this.get('from') || 'polling';
                var party = this.get('party');

                if (!id) {
                    cls+= 'no-id ';
                }

                if (!boundryData) {
                    cls+= 'no-data ';
                    return cls;
                }

                cls+= party + ' ';

                var prop = boundryData[PROP_MAP[from][party]];

                if (prop) {
                    var percent = Math.ceil(parseInt(prop) / 10) * 10;
                    cls+= 'per-' + percent;
                }

                return cls;
            }
        });
    }
);
