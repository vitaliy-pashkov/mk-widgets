var MKWidgets = MKWidgets || {};

MKWidgets.DateRange = Class({
		extends: MKWidget,

		constructor: function (element, options)
			{
			MKWidget.prototype.constructor.apply(this, [element, options]);
			this.setOptions({
				domRanges: $('<div/>'),
				ranges: MKWidgets.DateRange.predefineRange([
					"сегодня", "вчера", "неделя", "месяц", "год"
				]),
				minDate: false,
				maxDate: false,
				startDate: "",
				endDate: "",
				separator: " - ",
				format: "DD.MM.YYYY HH:mm:ss",
				startApplyLabel: 'Далее',
				finishApplyLabel: 'Готово',
			});
			this.setOptions(options);

			this.startDate = this.options.startDate;
			this.endDate = this.options.endDate;

			this.createDom();
			this.initStartDate();
			this.initEndDate();

			},

		createDom: function ()
			{
			this.domContainer = $('<div/>').addClass('mk-widgets-date-range-container');

			this.domStartInput = $('<input/>').addClass('mk-widgets-date-range-input').addClass('start');
			this.domEndInput = $('<input/>').addClass('mk-widgets-date-range-input').addClass('end');

			this.domContainer.append(this.domStartInput);
			this.domContainer.append(this.domEndInput);

			this.element.hide();
			this.element.after(this.domContainer);

			this.createPredefineRangesDom();
			},

		createPredefineRangesDom: function ()
			{
			this.domRangesContainer = $('<div/>').addClass('mk-widgets-date-range-ranges');
			this.options.domRanges.append(this.domRangesContainer);

			this.ranges = [];
			var i = 0;
			for (range in this.options.ranges)
				{
				var range = {
					start: moment(this.options.ranges[range][0], this.options.format),
					end: moment(this.options.ranges[range][1], this.options.format),
					name: range,
					dom: $('<div/>').text(range).data('range-index', i),
					index: i,
				};

				range.dom.on('click', $.proxy(this.predefineRangeClickSlot, this));
				this.domRangesContainer.append(range.dom);

				this.ranges.push(range);
				i++;
				}
			},

		predefineRangeClickSlot: function (event)
			{
			var index = $(event.target).data('range-index');
			var range = this.ranges[index];

			this.startDateWidget.setStartDate( range.start );
			this.endDateWidget.setStartDate( range.end );
			this.trigger('date-range-change');
			},

		initStartDate: function ()
			{
			this.startDateWidget = new MKWidgets.Date(this.domStartInput, {
				parentElement: this.options.parentElement,
				startDate: this.startDate,
				//endDate: this.endDate,
				dateRange: 'start',
				locales: {
					ru: {
						format: this.options.format,
						applyLabel: this.options.startApplyLabel
					}
				}
			});
			this.startDateWidget.on('apply.daterangepicker', this.startDateReady, this);
			},

		initEndDate: function ()
			{
			this.endDateWidget = new MKWidgets.Date(this.domEndInput, {
				parentElement: this.options.parentElement,
				startDate: this.endDate,
				//endDate: this.endDate,
				dateRange: 'end',
				locales: {
					ru: {
						format: this.options.format,
						applyLabel: this.options.finishApplyLabel
					}
				}
			});
			this.endDateWidget.on('apply.daterangepicker', this.endDateReady, this);
			},

		startDateReady: function ()
			{
			this.startDateText = this.startDateWidget.getStartMoment().format(this.options.format);
			this.endDateWidget.options.minDate = this.startDateText;
			this.endDateWidget.setMinMaxDates();
			this.endDateWidget.show();
			},

		endDateReady: function ()
			{
			this.endDateText = this.startDateWidget.getStartMoment().format(this.options.format);
			this.trigger('date-range-change');
			},

		getRangeText: function ()
			{
			return this.startDateWidget.getStartMoment().format(this.options.format) + this.options.separator + this.endDateWidget.getStartMoment().format(this.options.format);
			},

		getStartMoment: function()
			{
			this.startDateWidget.getStartMoment();
			},

		getEndMoment: function()
			{
			this.endDateWidget.getStartMoment();
			},
	},
	{
		predefineRange: function (names)
			{
			var ranges = {};
			for (var i in names)
				{
				var now = moment();
				var range = [];
				var name = names[i];
				if (name == "сегодня")
					{
					range = [
						moment([now.year(), now.month(), now.date(), 0, 0, 0, 0]),
						moment([now.year(), now.month(), now.date(), 23, 59, 59, 999]),
					];
					}
				if (name == "вчера")
					{
					range = [
						moment([now.year(), now.month(), now.date() - 1, 0, 0, 0, 0]),
						moment([now.year(), now.month(), now.date() - 1, 23, 59, 59, 999]),
					];
					}
				if (name == "неделя")
					{
					var begin = moment(now);
					begin.subtract(6, 'days');
					range = [
						moment([begin.year(), begin.month(), begin.date(), 0, 0, 0, 0]),
						moment([now.year(), now.month(), now.date(), 23, 59, 59, 999]),
					];
					}
				if (name == "30 дней")
					{
					var begin = moment(now);
					begin.subtract(29, 'days');
					range = [
						moment([begin.year(), begin.month(), begin.date(), 0, 0, 0, 0]),
						moment([now.year(), now.month(), now.date(), 23, 59, 59, 999]),
					];
					}
				if (name == "месяц")
					{
					range = [
						moment([now.year(), now.month(), 1, 0, 0, 0, 0]),
						moment([now.year(), now.month(), now.date(), 23, 59, 59, 999]),
					];
					}
				if (name == "год")
					{
					range = [
						moment([now.year(), 0, 1, 0, 0, 0, 0]),
						moment([now.year(), 11, 31, 23, 59, 59, 999]),
					];
					}
				ranges[name] = range;
				}
			return ranges;
			},


	});