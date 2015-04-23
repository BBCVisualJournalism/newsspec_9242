var svgSupport = (!!document.createElementNS && !!document.createElementNS('http://www.w3.org/2000/svg', 'svg').createSVGRect);
define(
    [
        'lib/news_special/bootstrap',
        'lib/news_special/share_tools/controller',
        'jquery',
        'backbone',

        'views/controls',
        'views/header',
        'views/info',
        'views/key',
        'views/map',

        'models/app',
        'models/constituency',
        'models/party',

        'router',
        'data/results/constituency_2015'
    ],

    function (news, shareTools, $, Backbone, ControlsView, HeaderView, InfoView, KeyView, MapView, AppModel, ConstituencyModel, PartyModel, router, data) {
        if (window.location.hash.match(/iframeUID/)) {
            var parts = window.location.hash.replace(/^\#/, '').split('&');
            var hash = parts.shift();
            window.location.hash = hash;
        }

        // Setup our application model this will be shared between views and is
        // used to represent application state
        var appModel =  new AppModel();

        news.sendMessageToremoveLoadingImage();
        //news.setStaticIframeHeight(800);

        // Listen to app model changes and update the router to reflect changes
        appModel.on('change', function (model) {
            var constituancy = appModel.get('constituancy');
            var from = appModel.get('currentFrom');
            var party = appModel.get('party');
            var country = appModel.get('country');

            var url = router.buildURL({
                from: from,
                party: party,
                country: country,
                constituancy: constituancy
            });

            if (constituancy) {
                $('body').addClass('constituancy-selected');
            } else {
                $('body').removeClass('constituancy-selected');
            }

            router.router.navigate('/' + url, { trigger: false });
        });

        appModel.on('change:constituancy', function (model, constituancy) {
            if (constituancy) {
                news.pubsub.emit('istats', ['view-constituancy', 'newsspec-interaction', constituancy]);
            }
        });

        appModel.on('change:currentFrom', function (model, from) {
            news.pubsub.emit('istats', ['view-from', 'newsspec-interaction', from]);
        });

        appModel.on('change:party', function (model, party) {
            news.pubsub.emit('istats', ['view-party', 'newsspec-interaction', party]);
        });

        // Listen to router events and then serialize to appModel
        news.pubsub.on('routed:index', function (from) {
            if (!mapView.model || !(mapView.model instanceof ConstituencyModel)) {
                var model = new ConstituencyModel(data.data);
                mapView.setModel(model);
            }

            appModel.set({
                currentFrom: from || 'polling'
            });
        });

        news.pubsub.on('routed:constituancy', function (constituancy, from) {
            if (!mapView.model || !(mapView.model instanceof ConstituencyModel)) {
                var model = new ConstituencyModel(data.data);
                mapView.setModel(model);
            }

            appModel.set({
                constituancy: constituancy,
                currentFrom: from || 'polling'
            });
        });

        news.pubsub.on('routed:party', function (party, from) {
            if (!mapView.model || !(mapView.model instanceof PartyModel)) {
                var model = new PartyModel(data.data);
                model.on('change:party', function (e, party) {
                    appModel.set({
                        party: party,
                        from: 'polling'
                    });
                });
                mapView.setModel(model);
            }

            mapView.model.set({
                party: party,
                from: from
            });

            appModel.set({
                currentFrom: from || 'polling',
                party: party
            });
        });

        news.pubsub.on('routed:partyConstituancy', function (party, constituancy, from) {
            if (!mapView.model || !(mapView.model instanceof PartyModel)) {
                model = new PartyModel(data.data);
                model.on('change:party', function (e, party) {
                    appModel.set({
                        party: party,
                        from: 'polling'
                    });
                });
                mapView.setModel(model);
            }

            mapView.model.set({
                party: party,
                from: from
            });

            appModel.set({
                constituancy: constituancy,
                currentFrom: from || 'polling',
                party: party
            });
        });

        news.pubsub.on('routed:country', function (country, constituancy, from) {
            if (!mapView.model || !(mapView.model instanceof ConstituencyModel)) {
                var model = new ConstituencyModel(data.data);
                mapView.setModel(model);
            }

            appModel.set({
                constituancy: constituancy,
                from: from || 'polling',
                country: country
            });
        });

        news.pubsub.on('map:click', function (d) {
            if (data.data[d.properties.constituency_gssid]) {
                appModel.set('constituancy', d.properties.constituency_gssid);
            }
        });

        // When map resets reset application state
        news.pubsub.on('map:reset', function () {
            appModel.set('constituancy', null);
        });

        // Control event bindings
        news.pubsub.on('controls:reset', function () {
            mapView.reset();
        });
        news.pubsub.on('controls:zoom-in', function () {
            news.pubsub.emit('istats', ['zoom-in', 'newsspec-interaction']);
            mapView.zoomIn();
        });
        news.pubsub.on('controls:zoom-out', function () {
            news.pubsub.emit('istats', ['zoom-out', 'newsspec-interaction']);
            mapView.zoomOut();
        });
        news.pubsub.on('controls:pan', function (xDir, yDir) {
            news.pubsub.emit('istats', ['pan', 'newsspec-interaction']);
            mapView.pan(xDir, yDir);
        });

        // When the page is ready load our data and start the router
        $(function () {
            if (!svgSupport) {
                $('body').addClass('no-svg-support');
            }

            headerView = new HeaderView({
                constituencies: data.haveResults,
                appModel: appModel
            });

            infoView = new InfoView({
                appModel: appModel,
                model: new Backbone.Model(data.data)
            });

            controlsView = new ControlsView({
                appModel: appModel
            });

            keyView = new KeyView({
                appModel: appModel
            });

            mapView = new MapView({
                appModel: appModel,
                getOffset: function () {
                    var offset = {x: 0, y: 0, left: infoView.el.offsetLeft};

                    if (infoView.$el.css('display') !== 'none') {
                        if (window.innerWidth <= infoView.$el.outerWidth()) {
                            offset.y = infoView.$el.outerHeight() - keyView.$el.outerHeight();
                        } else {
                            offset.x = infoView.$el.outerWidth();
                        }
                    }

                    return offset;
                }
            });

            $(window).on('resize', _.debounce(function () {
                news.setStaticIframeHeight($('.main').outerHeight());
                mapView.resize();
            }, 100));

            Backbone.history.start();

            news.setStaticIframeHeight($('.main').outerHeight());

            news.sendMessageToremoveLoadingImage();
        });
    }
);
