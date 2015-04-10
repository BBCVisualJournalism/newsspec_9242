define(
    [
        'lib/news_special/bootstrap',
        'backbone',
        'underscore',
        'text!templates/controls.html'
    ],

    function (news, Backbone, _, html) {
        var ControlsView = Backbone.View.extend({
            el: '.map-controls',

            template: _.template(html),

            events: {
                'click .reset a': 'reset',
                'click .zoom-in a ': 'zoom',
                'click .zoom-out a': 'zoom',
                'click .pan-controls a': 'pan',
                'click .close a': 'reset'
            },

            initialize: function (options) {
                this.appModel = options.appModel;
                var panMouseDown = false;
                var intId;

                this.$el.on('click', '.pan-controls a', _.bind(function (e) {
                    this.pan(e);
                }, this));

                news.pubsub.on('map:transform', _.bind(function (scale) {
                    if (scale > 1) {
                        this.closeEl.removeClass('is-hidden');
                    } else {
                        this.closeEl.addClass('is-hidden');
                    }
                }, this));

                this.render();
            },

            getModel: function () {
                return this.appModel.toJSON();
            },

            render: function () {
                this.$el.html(this.template());

                this.closeEl = this.$el.find('.close');
            },

            reset: function (e) {
                e.preventDefault();
                news.pubsub.emit('controls:reset');
            },

            zoom: function (e) {
                e.preventDefault();
                news.pubsub.emit('controls:zoom-' + ($(e.target).closest('li').hasClass('zoom-in') ? 'in' : 'out'));
            },

            pan: function (e) {
                e.preventDefault();
                var dir = [0, 0];

                var parent = $(e.target).parent();

                if (parent.hasClass('pan-controls-top')) dir[1] = -1;
                if (parent.hasClass('pan-controls-right')) dir[0] = 1;
                if (parent.hasClass('pan-controls-bottom')) dir[1] = 1;
                if (parent.hasClass('pan-controls-left')) dir[0] = -1;

                news.pubsub.emit('controls:pan', dir);
            }
        });

        return ControlsView;
    }
);
