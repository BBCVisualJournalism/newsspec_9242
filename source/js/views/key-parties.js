define(
    [
        'lib/news_special/bootstrap',
        'underscore',
        'backbone',
        'text!templates/key-parties.html'
    ],

    function (news, _, Backbone, partiesHtml) {
        var template = _.template(partiesHtml);

        var PartiesView = Backbone.View.extend({
            events: {
                'click a': 'clickParty'
            },

            render: function () {
                this.$el.html(template());
            },

            clickParty: function (e) {
                e.preventDefault();
                news.pubsub.emit('key:partyClick', $(e.target).data('party'));
            }
        });

        return PartiesView;
    }
);
