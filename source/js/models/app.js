define(
    [
        'lib/news_special/bootstrap',
        'backbone'
    ],

    function (news, Backbone) {
        return Backbone.Model.extend({
            defaults: {
                showFrom: true,
                currentFrom: 'polling'
            }
        });
    }
);
