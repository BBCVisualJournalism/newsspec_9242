define(
    [
        'lib/news_special/bootstrap',
        'backbone'
    ],

    function (news, Backbone) {
        var router = new Backbone.Router({
            routes: {
                '(from-:from)': 'index',
                'constituancy-:constituancy(/from-:from)': 'constituancy',

                'party-:party(/from-:from)': 'party',
                'party-:party(/constituancy-:constituancy)(/from-:from)': 'partyConstituancy'
            }
        });

        router.on('route', function (route, args) {
            news.pubsub.emit('routed:' + route, args);
        });

        return {
            router: router,
            buildURL: function (opts) {
                var party = opts.party;
                var constituancy = opts.constituancy;
                var from = opts.from;

                var path = '';

                if (party) {
                    path += 'party-' + party + '/';
                }

                if (constituancy) {
                    path += 'constituancy-' + constituancy + '/';
                }

                if (from) {
                    path += 'from-' + from;
                }

                return path;
            }
        };
    }
);
