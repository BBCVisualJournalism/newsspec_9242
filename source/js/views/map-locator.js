define(
    [
        'lib/news_special/bootstrap',
        'backbone',
        'd3',
        'topojson',
        'data/maps/britain_topojson',
    ],

    function (news, Backbone, d3, topojson, data) {
        return Backbone.View.extend({
            className: 'locator-map--container',
            initialize: function (options) {
                this.map = options.map;
                this.features = topojson.feature(data, data.objects.boundaries).features;
                this.d3El = d3.select(this.el);

                this.width = 110;
                this.height = 110;

                this.initMap();

                /* Listeners */
                news.pubsub.on('map:transform', this.zoomBoxUpdate.bind(this));
            },
            initMap: function () {
                var translate = [];
                translate[0] = (this.map.translate.x - 270) * 0.18;
                translate[1] = (this.map.translate.y + 250) * 0.18;

                this.projection = d3.geo.mercator()
                    .scale(720 * 0.18)
                    .translate(translate);

                this.path = d3.geo.path()
                    .projection(this.projection);

                this.svg = d3.select(this.el)
                    .append('svg')
                    .attr('class', 'locator-map--svg')
                    .attr('preserveAspectRatio', 'xMinYMin meet')
                    .attr('viewBox', '0 0 ' + this.width  + ' ' + this.height);

                this.group = this.svg.append('g');

                this.addLocatorBox();

                this.scale = 1;
            },
            render: function () {
                this.group
                    .selectAll('path')
                    .data(this.features)
                    .enter().append('path')
                    .attr('class', 'constituency no-data')
                    .attr('d', this.path);

                return this.$el;
            },
            addLocatorBox: function () {
                this.svg.append('rect')
                    .attr({
                        'x' : 0,
                        'y' : 0,
                        'width' : this.width,
                        'height' : this.height,
                        'fill' : 'transparent',
                        'class' : 'locator-box'
                    });
            },
            zoomBoxUpdate: function (zoomBox, scale, animate) {
                var _this = this;

                var x = 0,
                    y = 0,
                    width = ((this.map.width - this.map.translate.x / this.map.scale) / 5) - x,
                    height = ((this.map.height - this.map.translate.y / this.map.scale) / 5) - y;

                var locatorEl = this.svg.select('.locator-box');
                var willHide = (scale <= this.map.scale);

                if(!willHide) {
                    this.$el.show();
                }

                var attr = {
                    'x' : x,
                    'y' : y,
                    'width' : width,
                    'height' : height,
                };

                if (animate) {
                    locatorEl.transition()
                        .attr(attr)
                        .duration(1000)
                    .each("end", function() {
                        if (willHide) {
                            _this.$el.fadeOut();
                            news.pubsub.emit('map:toggleShetland', true);
                        } else {
                            _this.$el.fadeIn();
                        }
                    });
                } else {
                    locatorEl.attr(attr);
                    if (willHide) {
                        this.$el.hide();
                    } else {
                        this.$el.show();
                    }
                }
            }
        });
    }
);
