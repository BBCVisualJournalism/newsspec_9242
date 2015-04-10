define(
    [
        'lib/news_special/bootstrap',
        'backbone',
        'underscore',
        'views/map-svg',
        'views/map-nosvg'
    ],

    function (news, Backbone, _, MapSVG, MapNoSVG) {
        var MapView = Backbone.View.extend({
            el: '.map-container',

            initialize: function (options) {
                this.appModel = options.appModel;

                this.width = this.$el.width();
                this.height = this.$el.height();

                var config = {
                    el: this.el,
                    $el: this.$el,
                    width: this.width,
                    height: this.height,
                    animate: !!options.debug,
                    getOffset: options.getOffset,
                    appModel: this.appModel
                };

                if (svgSupport) {
                    this.map = new MapSVG(config);
                } else {
                    this.map = new MapNoSVG(config);
                }

                this.appModel.on('change:currentFrom', _.bind(function (model, from) {
                    if (this.model) {
                        this.model.set('from', from);
                    }
                }, this));

                this.appModel.on('change:constituancy', _.bind(function (model, constituancy) {
                    if (constituancy) {
                        this.map.setCenter(constituancy);
                    } else {
                        this.map.reset();
                    }
                }, this));
            },

            resize: function () {
                setTimeout(_.bind(function () {
                    this.width = this.$el.width();
                    this.height = this.$el.height();

                    this.map.width = this.width;
                    this.map.height = this.height;

                    this.map.resize();
                }, this), 200);
            },

            reset: function () {
                this.map.reset();
            },

            zoomIn: function () {
                this.map.zoomIn();
            },

            zoomOut: function () {
                this.map.zoomOut();
            },

            pan: function (xDir, yDir) {
                this.map.pan(xDir, yDir);
            },

            /**
             * Updates the current active model, removes existing model listeners
             * and re-renders
             * @param {Backbone.Model} model instance to set
             */
            setModel: function (newModel) {
                var view = this;
                if (this.model) {
                    this.model.stopListening();
                }

                this.model = newModel;
                news.pubsub.emit('map:modelChanged', this.model);

                this.listenTo(this.model, 'change', _.bind(this.update, this));

                if (!this.map.paths) {
                    this.render(this.model);
                } else {
                    this.update(this.model);
                }
            },

            update: function () {
                this.map.update(this.model);
            },

            render: function () {
                this.map.render(this.model);
            }
        });

        return MapView;
    }
);
