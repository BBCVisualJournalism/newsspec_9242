define(
    [
        'lib/news_special/bootstrap',
        'backbone',
        'text!templates/info.html'
    ],

    function (news, Backbone, html) {
        var InfoView = Backbone.View.extend({
            el: '.map-info',
            template: _.template(html),

            initialize: function (options) {
                this.appModel = options.appModel;

                this.width = 0;
                this.height = 0;

                this.render();
                this.$el.addClass('is-hidden');
                this.appModel.on('change:constituancy', _.bind(this.update, this));
            },

            getModel: function () {
                var constId = this.appModel.get('constituancy');
                var from = this.appModel.get('from');
                var data;
                var d = this.model.get(constId);

                if (d) {
                    data = {
                        name: d.bbc_shorter_name,
                        notes: d.Notes,
                        type: d.Pollster,
                        date: d.Date.split('-').splice(1).join(' '),
                        hold_or_not: d['Hold or not'],
                        ashcroft: [
                            {
                                name: 'conservative',
                                short_name: 'Con',
                                percent: d.Con1
                            },
                            {
                                name: 'labour',
                                short_name: 'Lab',
                                percent: d.Lab2
                            },
                            {
                                name: 'lib_dem',
                                short_name: 'LD',
                                percent: d.Lib_Dem3
                            },
                            {
                                name: 'snp',
                                short_name: 'SNP',
                                percent: d.SNP7
                            },
                            {
                                name: 'ukip',
                                short_name: 'UKIP',
                                percent: d.Ukip4
                            },
                            {
                                name: 'green',
                                short_name: 'Grn',
                                percent: d.Green5
                            },
                            {
                                name: 'other',
                                short_name: 'Oth',
                                percent: d.Other6
                            },
                            {
                                name: 'pc',
                                short_name: 'PC',
                                percent: d.Plaid8
                            }
                        ],
                        results2010: [
                            {
                                name: 'conservative',
                                short_name: 'Con',
                                percent: d.Con10
                            },
                            {
                                name: 'labour',
                                short_name: 'Lab',
                                percent: d.Lab10
                            },
                            {
                                name: 'lib_dem',
                                short_name: 'LD',
                                percent: d.LD10
                            },
                            {
                                name: 'snp',
                                short_name: 'SNP',
                                percent: d.SNP10
                            },
                            {
                                name: 'ukip',
                                short_name: 'UKIP',
                                percent: d.UKIP10
                            },
                            {
                                name: 'green',
                                short_name: 'Grn',
                                percent: d.Grn10
                            },
                            {
                                name: 'other',
                                short_name: 'Oth',
                                percent: d.OTH10
                            },
                            {
                                name: 'pc',
                                short_name: 'PC',
                                percent: d.PC10
                            }
                        ]
                    };
                }

                return data;
            },

            update: function () {
                var data = this.getModel();

                if (this.animTimeout) {
                    clearTimeout(this.animTimeout);
                }

                this.$el.html(this.template(data));
                this.$el.addClass('anim-start');

                if (data) {
                    this.$el.removeClass('is-hidden');

                    this.width = this.$el.outerWidth();
                    this.height = this.$el.outerHeight();

                    news.pubsub.emit('info:open');
                } else {
                    this.$el.addClass('is-hidden');
                    news.pubsub.emit('info:close');
                }

                this.animTimeout = setTimeout(_.bind(function () {
                    this.$el.removeClass('anim-start');
                }, this), 500);
            },

            render: function () {
                var data = this.getModel();

                this.$el.html(this.template(data));

                if (data) {
                    this.isHidden = false;
                    this.$el.removeClass('is-hidden');
                } else {
                    this.isHidden = true;
                    this.$el.addClass('is-hidden');
                }

                this.updateDimensions();
            },

            updateDimensions: function () {
                this.width = this.$el.outerWidth();
                this.height = this.$el.outerHeight();
            }
        });

        return InfoView;
    }
);

