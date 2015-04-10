define(
    [
        'lib/news_special/bootstrap',
        'underscore',
        'data/maps/uk',
        'd3',
        'topojson'
    ],

    function (news, _, data, d3, topojson) {
        function Map (options) {
            this.options = options;
            this.el = this.options.el;
            this.$el = this.options.$el;

            this.width = this.options.width;
            this.height = this.options.height;

            this.features = topojson.feature(data, data.objects.boundaries).features;
            var offset = this.getOffset();

            // Need to adjust projection scale based on height of map area available
            this.scaleFn = d3.scale.linear()
                .domain([180, 486])
                .range([500, 1500]);

            this.projection = d3.geo.mercator()
                .center([-3.547855, 54.50366])
                .scale(this.scaleFn(this.height))
                .translate(this.getCenter());

            this._zoom = d3.behavior.zoom()
                .scaleExtent([1, Infinity])
                .on('zoom', _.bind(this.handleZoom, this));

            this.path = d3.geo.path()
                .projection(this.projection);

            this.svg = d3.select(this.el)
                .append('svg')
                .attr('preserveAspectRatio', 'xMinYMin meet')
                .attr('viewBox', '0 0 ' + this.width + ' ' + this.height);

            this.group = this.svg.append('g');

            this.scale = 1;
            this.translate = {x: 0, y: 0};

            this.hoverTooltip = $('<div class="map-tooltip"></div>');
            this.hoverTooltip.hide();
            this.$el.append(this.hoverTooltip);

            this.centered = null;
        }


        Map.prototype = {
            getCenter: function () {
                var offset = this.getOffset();
                var x = (this.width / 2) - (offset.x / 2);
                var y = (this.height / 2) - (offset.y / 2);

                // Slight adjustment for really short displays
                if (this.height < 200) {
                    y-= 30;
                }

                return [x, y];
            },

            getOffset: function () {
                var offset = {x: 0, y: 0};
                if (this.options.getOffset) {
                    _.extend(offset, this.options.getOffset());
                }
                return offset;
            },

            setCenter: function (elId) {
                var element = this.svg.select('path#' + elId);
                var d = element.datum();

                this.center(d);
            },

            resize: function () {
                this.projection
                    .scale(this.scaleFn(this.height))
                    .translate(this.getCenter());

                this.svg.attr('viewBox', '0 0 ' + this.width + ' ' + this.height);

                this.group.selectAll('.constituency').attr('d', this.path);

                if (this.centered) {
                    this.center(this.centered);
                }
            },

            // Remove centered class from path
            removeCenteredSVG: function (d) {
                this.svg.select('#' + d.properties.constituency_gssid).attr('class', _.bind(this.model.className, this.model));
            },

            // Adds centered class to path
            addCenteredSVG: function (d) {
                this.svg.select('#' + d.properties.constituency_gssid).attr('class', _.bind(function () {
                    return this.model.className(d) + ' centered';
                }, this));

                var el = $('#' + d.properties.constituency_gssid)[0];
                el.parentNode.appendChild(el);
            },

            center: function (d) {
                if (this.centered) {
                    this.removeCenteredSVG(this.centered);
                }

                this.addCenteredSVG(d);
                this.centered = d;
                var centroid = this.path.centroid(d);
                var bounds = this.path.bounds(d);
                var offset = this.getOffset();

                var xDiff =  bounds[1][0] - bounds[0][0];
                var yDiff =  bounds[1][1] - bounds[0][1];

                var scaleDiff = (xDiff > yDiff)? (this.width * 0.5 / xDiff) : (this.height * 0.5 / yDiff);

                this.scale = scaleDiff;

                this.translate.x = (((this.width / 2) - (offset.x) * 0.5) - (centroid[0] * this.scale));

                this.translate.y = (((this.height / 2) - (offset.y) * 0.5) - (centroid[1] * this.scale));
                this.hoverTooltip.hide();

                // When transform has finished show center tooltip
                return this._updateTransform();
            },

            _updateTransform: function (transDuration) {
                var stroke = Math.min(0.5, 1/this.scale);
                var transStr = '';
                transDuration = _.isUndefined(transDuration) ? 1000 : transDuration;

                transStr+= 'translate(' + this.translate.x + ',' + this.translate.y + ')';
                transStr+= ' scale(' + this.scale + ')';

                news.pubsub.emit('map:transform', this.scale);

                this._zoom.translate([this.translate.x, this.translate.y]).scale(this.scale);

                return this.group
                    .transition()
                    .duration(transDuration)
                    .attr('transform', transStr);
            },

            render: function (model) {
                this.model = model;
                var path = this.path;

                var clickListener = _.debounce(_.bind(this.onClickPath, this), 350, true);

                this.paths = this.group
                    .selectAll('path')
                    .data(this.features)
                    .enter().append('path')
                    .on('mouseenter', _.bind(this.mouseEnter, this))
                    .on('mousemove', _.bind(this.mouseMove, this))
                    .on('mouseleave', _.bind(this.mouseLeave, this))
                    .attr('id', _.bind(model.attrData, model))
                    .attr('class', _.bind(model.className, model))
                    .attr('d', path)
                    .on('click', clickListener)
                    .on('touchend', clickListener);


                this.svg
                    .call(this._zoom)
                    .call(this._zoom.event)
                    .on('dblclick.zoom', null);
            },

            handleZoom: function () {
                if (!d3) return;
                this.isDraggingZooming = true;

                this.translate.x = d3.event.translate[0];
                this.translate.y = d3.event.translate[1];
                this.scale = d3.event.scale;
                this._updateTransform(0);

                clearTimeout(this.zoomTimeout);
                this.zoomTimeout = setTimeout(_.bind(function () {
                    this.isDraggingZooming = false;
                }, this), 300);
            },

            onClickPath: function (d) {
                if (!this.isDraggingZooming) {
                    news.pubsub.emit('map:click', d);
                }
            },

            reset: function () {
                var center = this.getCenter();
                this.scale = 1;
                this.translate.x = 0;
                this.translate.y = 0;

                if (this.centered) {
                    this.removeCenteredSVG(this.centered);
                }

                this.centered = null;

                this._updateTransform();

                news.pubsub.emit('map:reset');
            },

            zoomIn: function () {
                this.zoom(1.5);
            },

            zoomOut: function () {
                this.zoom(1 / 1.5);
            },

            pan: function (xDir, yDir) {
                if (this.scale !== 1) {
                    var scale = (this.scale / 2);
                    this.translate.x-= (10 * xDir) * scale;
                    this.translate.y-= (10 * yDir) * scale;

                    this._updateTransform(400);
                }
            },


            zoom: function (scale) {
                var offset = this.getOffset()
                var center = [(this.width / 2) - (offset.x / 2), (this.height / 2) - (offset.y / 2)];

                this.translate.x = ((this.translate.x - center[0]) * scale) + center[0];
                this.translate.y = ((this.translate.y - center[1]) * scale) + center[1];
                this.scale = this.scale * scale;

                this.paths.attr('stroke-width', 0.01);

                this._updateTransform(400);
            },

            mouseEnter: function (d) {
                if (this.model.get(this.model.attrData(d))) {
                    this.updateTooltip(d);
                    this.hoverTooltip.show();
                } else {
                    this.hoverTooltip.hide();
                }
                clearTimeout(this.leaveTimeout);
            },

            mouseLeave: function (d) {
                if (d === this.centered) {
                    this.leaveTimeout = setTimeout(_.bind(function () {
                        if (this.centered) {
                            this.updateTooltip(this.centered);

                            var path = $('#' + this.centered.properties.constituency_gssid)[0].getBoundingClientRect();

                            this.hoverTooltip.css({
                                left: path.left + (path.width / 2) - ($(this.tooltip).outerWidth() / 2),
                                top: path.top + (path.height / 2) - 50
                            });
                        } else {
                            this.hoverTooltip.hide();
                        }
                    }, this), 300);
                }
            },

            mouseMove: function (d) {
                var offset = this.getOffset();
                var width = this.hoverTooltip.outerWidth();

                var left = d3.event.clientX + 20;
                var top = d3.event.clientY - 40;

                if (offset.left < left + width) {
                    left = (d3.event.clientX - width) - 10;
                }

                if (d3 && d3.event) {
                    this.hoverTooltip.css({
                        left: left,
                        top: top
                    });
                }
            },

            update: function (model) {
                this.model = model;

                this.paths
                    .attr('id', _.bind(this.model.attrData, this.model))
                    .attr('class', _.bind(this.model.className, this.model));

                if (this.centered) {
                    this.addCenteredSVG(this.centered);
                }
            },

            updateTooltip: function (d) {
                this.hoverTooltip.html(this.model.get(d.properties.constituency_gssid).bbc_full_name);
            }
        };

        return Map;
    }
);
