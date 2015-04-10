define(
    [
        'lib/news_special/bootstrap',
        'underscore',
        'backbone',
        'models/constituency',
        'models/party',
        'views/key-parties',
        'views/key-party'
    ],

    function (news, _, Backbone, ConstituencyModel, PartyModel, PartiesView, PartyView) {
        var KeyView = Backbone.View.extend({
            el: '.map-key',

            initialize: function () {
                this.view = null;
                news.pubsub.on('map:modelChanged', _.bind(this.render, this));
            },

            render: function (model) {
                var template;

                if (this.view) {
                    this.view.remove();
                }

                if (model instanceof ConstituencyModel) {
                    this.view = new PartiesView({model: model});
                } else if (model instanceof PartyModel) {
                    this.view = new PartyView({model: model});
                }

                this.view.render();
                this.view.$el.appendTo(this.$el);
            }
        });

        return KeyView;
    }
);
