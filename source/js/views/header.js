define(
    [
        'lib/news_special/bootstrap',

        'backbone',
        'underscore',
        'text!templates/header.html',
        'views/select',

        'models/constituency',
        'models/party',
    ],
    function (news, Backbone, _, html, SelectView, ConstituencyModel, PartyModel) {
        var HeaderView =  Backbone.View.extend({
            el: '.map-header',

            template: _.template(html),

            events: {
                'click .map-header-from :not(.current)': 'clickFrom'
            },

            initialize: function (options) {
                this.appModel = options.appModel;
                this.constituencies = options.constituencies;

                news.pubsub.on('map:modelChanged', _.bind(this.modelChange, this));


                this.constSelectView = new SelectView({
                    emptyOption: 'Select a constituency',
                    hasGroups: true,
                    data: this.getSelectData()
                });

                this.constSelectView.on('change', _.bind(this.constSelectChange, this));

                this.appModel.on('change:currentFrom', _.bind(this.updateFrom, this));
                this.appModel.on('change:constituancy', _.bind(this.constSelectUpdate, this));
            },

            getSelectData: function () {
                var groups = {
                    Scotland: {},
                    'North East': {},
                    'North West': {},
                    'Yorks & Humber': {},
                    'East Mids': {},
                    'West Mids': {},
                    'East': {},
                    'London': {},
                    'South East': {},
                    'South West': {},
                    'Wales': {}
                };
                var data = [
                    groups.Scotland,
                    groups['North East'],
                    groups['North West'],
                    groups['Yorks & Humber'],
                    groups['East Mids'],
                    groups['West Mids'],
                    groups['East'],
                    groups['London'],
                    groups['South East'],
                    groups['South West'],
                    groups['Wales'],
                ];

                for (var i = 0, l = this.constituencies.length; i < l; i ++) {
                    var v = this.constituencies[i];
                    var group = groups[v.region];

                    if (!group.optgroup) {
                        group.optgroup = v.region;
                        group.options = [];
                    }

                    group.options.push({
                        value: v.code,
                        text: v.bbc_shorter_name
                    });
                }

                return data;
            },

            modelChange: function (model) {
                if (this.model) {
                    this.model.off('change:party');
                }
                this.model = model;
                this.render();
            },

            getModel: function () {
                return _.extend(this.appModel.toJSON(), {
                    constituencies: this.constituencies
                });
            },

            constSelectUpdate: function (e, constituancy) {
                this.constSelectView.updateSelect(constituancy);
            },

            render: function () {
                var tempModel = this.getModel();

                // Template requires different options based on the model type
                if (this.model instanceof ConstituencyModel) {
                    tempModel.showFrom = true;
                } else if (this.model instanceof PartyModel) {
                    tempModel.showFrom = false;
                }

                this.$el.html(this.template(tempModel));

                this.constSelectView.render();
                this.$el.find('.map-header-constituency').append(this.constSelectView.$el);

                if (this.model instanceof PartyModel) {
                    this.renderParty();
                }
            },

            renderParty: function () {
                this.partySelectView = new SelectView({
                    emptyOption: 'Select party',
                    data: [
                        {
                            text: 'Con',
                            value: 'con'
                        },
                        {
                            text: 'Lab',
                            value: 'lab'
                        },
                        {
                            text: 'LD',
                            value: 'lib_dem'
                        },
                        {
                            text: 'UKIP',
                            value: 'ukip'
                        },
                        {
                            text: 'Green',
                            value: 'green'
                        },
                        {
                            text: 'SNP',
                            value: 'snp'
                        },
                        {
                            text: 'PC',
                            value: 'pc'
                        },
                        {
                            text: 'Oth',
                            value: 'other'
                        }
                    ]
                });
                this.partySelectView.render();
                this.$el.find('.map-header-party').append(this.partySelectView.$el);
                this.model.on('change:party', _.bind(this.partyChange, this));
                this.partySelectView.on('change', _.bind(this.partySelectChange, this));

                this.partySelectView.updateSelect(this.model.get('party'));
            },

            clickFrom: function (e) {
                e.preventDefault();

                var from = $(e.target).closest('a').data('from');
                news.pubsub.emit('istats', ['header-change-from', 'newsspec-interaction', from]);
                this.appModel.set('currentFrom', from);
            },

            partyChange: function (e, party) {
                this.partySelectView.updateSelect(party);
            },

            partySelectChange: function (e) {
                var party = $(e.target).val();
                news.pubsub.emit('istats', ['header-change-party', 'newsspec-interaction', party]);
                this.model.set('party', party);
            },

            updateFrom: function () {
                var from = this.appModel.get('currentFrom');
                this.$el.find('ul .current').removeClass('current');
                this.$el.find('.from-' + from).addClass('current');
            },

            constSelectChange: function (e) {
                var constituancy = $(e.target).val();
                this.appModel.set('constituancy', constituancy);
            }
        });

        return HeaderView;
    }
);
