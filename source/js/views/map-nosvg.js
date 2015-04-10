define(
    [
        'lib/news_special/bootstrap',
        'underscore',
        'router'
    ],
    function (news, _, router) {
        function Map (options) {
            this.options = options;
            this.appModel = options.appModel;

            this.appModel.on('change', _.bind(this.loadImage, this));
            this.offset = {x: 0, y: 0};
            this.img = $('<img class="nosvg-img">');

            $('.map-container').append(this.img);

            this.img.on('load', _.bind(this.positionImage, this));
        }

        Map.prototype = {
            getImagePath: function () {
                var route =  router.buildURL({
                    from: this.appModel.get('currentFrom'),
                    constituancy: this.appModel.get('constituancy'),
                    party: this.appModel.get('party')
                }).replace(/\//g, '_');

                return 'img/screens/' + route + '.jpg';
            },

            loadImage: function () {
                var path = this.getImagePath();
                this.img.attr('src', path);
            },

            positionImage: function () {
                var imgHeight = this.img.outerHeight();
                var contHeight = $('.map-container').outerHeight();
                var imgWidth = this.img.outerWidth();
                var contWidth = $('.map-container').outerWidth();
                var offset = this.getOffset();

                this.img.css({
                    //'margin-top': -(imgHeight / 2 - (contHeight - offset.y) / 2),
                    'margin-left': -(imgWidth / 2 - (contWidth - offset.x) / 2)
                });
            },

            getOffset: function () {
                var offset = {x: 0, y: 0};
                if (this.options.getOffset) {
                    _.extend(offset, this.options.getOffset());
                }
                return offset;
            },

            render: function () {
                this.loadImage();
            },

            update: function () {
                this.loadImage();
            },

            setCenter: function () {
            },

            resize: function () {
                this.positionImage();
            },
            reset: _.noop(),
            zoomIn: _.noop(),
            zoomOut: _.noop(),
            pan: _.noop(),

            reset: function () {
                news.pubsub.emit('map:reset');
            }
        };

        return Map;
    }
);
