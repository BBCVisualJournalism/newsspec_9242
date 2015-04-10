define(
    [
        'lib/news_special/bootstrap',
        'underscore',
        'backbone',
        'text!templates/key-party.html',

        'views/select'
    ],

    function (news, _, Backbone, partyHtml, SelectView) {
        var template = _.template(partyHtml);

        var PartyView = Backbone.View.extend({
            className: 'map-key-party',

            initialize: function () {
                this.model.on('change:party', _.bind(this.update, this));
            },

            render: function () {
                this.$el.html(template({party: this.model.get('party')}));
            },

            update: function () {
                this.$el.find('.map-key-party-percentages')[0].outerHTML = template({party: this.model.get('party')});
            }
        });

        return PartyView;
    }
);

