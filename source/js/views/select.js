define(
    [
        'underscore',
        'backbone',
        'text!templates/select.html'
    ],

    function (_, Backbone, html) {
        var template = _.template(html);

        return Backbone.View.extend({
            className: 'select',
            events: {
                'change select': 'change'
            },

            initialize: function (options) {
                _.extend(this, { hasGroups: false }, options);
            },

            render: function () {
                this.$el.html(template(this));
                this.updateSelect();
            },

            updateSelect: function (value) {
                var selected;
                var text = '';

                this.$el.find('select')[0].selectedIndex = -1;

                if (value) {
                    selected = this.$el.find('option[value=' + value + ']');
                } else {
                    selected = this.$el.find('option[value=""]');
                }

                selected.attr('selected', 'selected');
                text = selected.text();

                this.$el.find('.select-value').html(text);
            },

            change: function (e) {
                this.trigger('change', e);
            }
        });
    }
);
