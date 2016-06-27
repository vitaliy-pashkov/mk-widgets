/**
 * @version: 2.1.17
 * @author: Dan Grossman http://www.dangrossman.info/
 * @copyright: Copyright (c) 2012-2015 Dan Grossman. All rights reserved.
 * @license: Licensed under the MIT license. See http://www.opensource.org/licenses/mit-license.php
 * @website: https://www.improvely.com/
 *
 * @custom: vitaliy_pashkov@inbox.ru
 */

var MKWidgets = MKWidgets || {};

MKWidgets.DateRangePicker = Class({
		'extends': MKWidget,
		buttonClasses: 'btn btn-sm',
		applyClass: 'btn-success',
		cancelClass: 'btn-default',
		isShowing: false,
		positionFlag: true,


		constructor: function (element, options)
			{
			MKWidget.prototype.constructor.apply(this);
			this.setOptions({
				//defaultText: 'Выберите значение',
				//sandboxSelector: '',
				//containerSelector: '.custom-select-list',
				//domElement: '',
				//background: false,
				parentElement: $('body'),
				leftCalendar: {},
				rightCalendar: {},
				element: $(element),
				startDate: "",
				endDate: "",
				minDate: false,
				maxDate: false,
				dateLimit: false,
				autoApply: false,
				singleDatePicker: true,
				showDropdowns: false,
				showWeekNumbers: false,
				datePicker: true,
				timePicker: false,
				timePickerIncrement: 1,
				timePickerMinutes: false,
				timePickerSeconds: false,
				localeLang: 'ru',
                parentWidth: false,
                autoConfigs: true,
				linkedCalendars: true,
				autoUpdateInput: true,
				ranges: {},//['Сегодня', 'Вчера', '7 дней', '30 дней', 'Этот месяц', 'Этот год'],
				opens: 'right',
				template: true,
				locales: {
					en: {
						format: 'MM/DD/YYYY',
						separator: ' - ',
						applyLabel: 'Apply',
						cancelLabel: 'Cancel',
						weekLabel: 'W',
						customRangeLabel: 'Custom Range',
						startLabel: "Range start:",
						endLabel: "Range end:",
						hourLabel: "Hour",
						minuteLabel: "Minute",
						rangesLabel: "Fast choise",
						daysOfWeek: moment.weekdaysMin(),
						monthNames: moment.monthsShort(),
						firstDay: moment.localeData().firstDayOfWeek()
					},
					ru: {
						format: "DD.MM.YYYY",
						//format: "HH:mm:ss",
						separator: " - ",
						applyLabel: "Выбрать",
						cancelLabel: "Отмена",
						startLabel: "Начало периода:",
						startLabelSingle: "Выберите дату:",
						endLabel: "Конец периода:",
						hourLabel: "Часы:",
						minuteLabel: "Мин:",
						secondLabel: "Сек:",
						rangesLabel: "Быстрый выбор:",
						customRangeLabel: "Произвольный",
						daysOfWeek: [
							"Вс",
							"Пн",
							"Вт",
							"Ср",
							"Чт",
							"Пт",
							"Сб",
						],
						monthNames: [
							"Январь",
							"Февраль",
							"Март",
							"Апрель",
							"Май",
							"Июнь",
							"Июль",
							"Август",
							"Сентябрь",
							"Октябрь",
							"Ноябрь",
							"Декабрь"
						],
						firstDay: 1
					}
				},
			});

			this.element = $(element);
			this.setOptions(options);

            if(this.options.autoConfigs == true)
                {
                this.autoConfigs();
                }
			if (!moment(this.options.startDate).isValid())
				{
				this.options.startDate = moment().startOf('day');
				}
			if (!moment(this.options.endDate).isValid() && this.options.singleDatePicker == false)
				{
				this.options.endDate = moment().endOf('day');
				}

			this.options.locale = this.options.locales[this.options.localeLang];
			//console.log(this.options);
			this.setStartDate(this.options.startDate, true);
			this.setEndDate(this.options.endDate);
			this.init();
			},

		setStartDate: function (startDate, init)
			{

			if (typeof startDate === 'string')
				{
				this.options.startDate = moment(startDate, this.options.locale.format);
				}

			if (typeof startDate === 'object')
				{
				if(!moment.isMoment(startDate))
					{
					this.options.startDate = moment(startDate);
					}
				else
					{
					this.options.startDate = startDate;
					}
				}

			if (!this.options.timePicker)
				{
				this.options.startDate = this.options.startDate.startOf('day');
				}

			if (this.options.timePicker && this.options.timePickerIncrement)
				{
				this.options.startDate.minute(Math.round(this.options.startDate.minute() / this.options.timePickerIncrement) * this.options.timePickerIncrement);
				}

			if (this.options.minDate && this.options.startDate.isBefore(this.options.minDate))
				{
				this.options.startDate = this.options.minDate;
				}

			if (this.options.maxDate && this.options.startDate.isAfter(this.options.maxDate))
				{
				this.options.startDate = this.options.maxDate;
				}

			if (!this.isShowing && init != true)
				{
				this.updateElement();
				}

			this.updateMonthsInView();
			},

		setEndDate: function (endDate)
			{
			if (typeof endDate === 'string')
				{
				this.options.endDate = moment(endDate, this.options.locale.format);
				}

			if (typeof endDate === 'object')
				{
				if(!moment.isMoment(endDate))
					{
					this.options.endDate = moment(endDate);
					}
				else
					{
					this.options.endDate = endDate;
					}


				}

			if (!this.options.timePicker)
				{
				this.options.endDate = this.options.endDate.endOf('day');
				}

			if (this.options.timePicker && this.options.timePickerIncrement)
				{
				this.options.endDate.minute(Math.round(this.options.endDate.minute() / this.options.timePickerIncrement) * this.options.timePickerIncrement);
				}

			if (this.options.endDate.isBefore(this.options.startDate))
				{
				this.options.endDate = this.options.startDate.clone();
				}

			if (this.options.maxDate && this.options.endDate.isAfter(this.options.maxDate))
				{
				this.options.endDate = this.options.maxDate;
				}

			if (this.options.dateLimit && this.options.startDate.clone()
					.add(this.options.dateLimit)
					.isBefore(this.options.endDate))
				{
				this.options.endDate = this.options.startDate.clone().add(this.options.dateLimit);
				}

			this.options.previousRightTime = this.options.endDate.clone();

			if (!this.isShowing)
				{
				this.updateElement();
				}

			this.updateMonthsInView();
			},

        autoConfigs: function()
            {
            var tempOptions = {
                datePicker: false,
                timePicker: false,
                timePickerMinutes: false,
                timePickerSeconds: false,
            };
            var twice = {};
            var format = this.options.locales[this.options.localeLang].format;
            for(i = 0; i < format.length; i++)
                {
                var charts = format[i] + format[i+1];
                if(charts == 'MM' || charts == 'DD')
                    {
                    tempOptions.datePicker = true;
                    }
                else if(charts == 'HH')
                    {
                    tempOptions.timePicker = true;
                    }
                else if(charts == 'mm')
                    {
                    tempOptions.timePickerMinutes = true;
                    }
                else if(charts == 'ss')
                    {
                    tempOptions.timePickerSeconds = true;
                    }
                }
            this.options = $.extend(this.options, tempOptions);
            },

		isInvalidDate: function ()
			{
			return false;
			},

		updateView: function ()
			{
			if (this.options.timePicker)
				{
				this.renderTimePicker('left');
				if (this.options.singleDatePicker == false)
					{
					this.renderTimePicker('right');
					}
				if (!this.options.endDate)
					{
					// this.container.find('.right .calendar-time select').attr('disabled', 'disabled').addClass('disabled');
					}
				else
					{
					//this.container.find('.right .calendar-time select').removeAttr('disabled').removeClass('disabled');
					}
				}
			if (this.options.endDate)
				{
				this.container.find('input[name="daterangepicker_end"]').removeClass('active');
				this.container.find('input[name="daterangepicker_start"]').addClass('active');
				}
			else
				{
				this.container.find('input[name="daterangepicker_end"]').addClass('active');
				this.container.find('input[name="daterangepicker_start"]').removeClass('active');
				}
			this.updateMonthsInView();
			this.updateCalendars();
			this.updateFormInputs();

			},


		init: function ()
			{
			this.options.timePickerSeconds = this.options.timePickerSeconds && this.options.timePickerMinutes;
			this.setMinMaxDates();
			this.checkTemplateExist();
			this.setShowSettings();
			this.parentEl = $(this.options.parentEl);

			this.container = $(this.options.template);//.appendTo(this.parentEl);
			//this.blackout = $('<div class="daterangepicker-blackout"></div>');
			//this.container.after(this.blackout);

			if (this.options.singleDatePicker == false)
				{
				this.container.css('width', '537px');
				}
			else
				{
				this.container.css('width', '270px');
				}

            if(!$.isEmptyObject(this.options.ranges))
                {
                this.container.css('width', parseInt(this.container.css('width'))+ 165);
                }

			this.popup = new MKWidgets.PopupNS.Tooltip(this.element, $.extend(this.options.popupConfigs, {
                background: true,
                positioning: true,
                returnElementToDom: true,
                parentWidth: this.options.parentWidth,
                dynamicElement: this.container,
                positionElement: this.element,
                indent: 9,
                //manualDynamicWidth: true,
            }));

			this.popup.on('close-popup', this.hide, this);

			this.setFirstDay();
			this.setRanges();
			this.setConfigs();
			this.events();
            this.setControlPanel();
			},

        setControlPanel: function()
            {
            if(!$.isEmptyObject(this.options.ranges) && this.options.singleDatePicker == false)
                {
                this.domApplyBotton = $('<input>')
                    .prop('type', 'button')
                    .addClass('tusur-csp-date-picker-button')
                    .addClass('apply')
                    .val('Выбрать')
                    .on('click', $.proxy(this.clickApply, this))
                    ;
                this.domCancelBotton = $('<input>')
                    .prop('type', 'button')
                    .addClass('tusur-csp-date-picker-button')
                    .addClass('cancel')
                    .val('Отмена')
                    .on('click', $.proxy(this.clickCancel, this))
                    ;

                this.container.css('min-width', (parseInt(this.container.css('min-width')) + 180)+'px');
                this.domRangeButtonsTitle = $("<div>").addClass('tusur-csp-range-buttons-title').html("Быстрый выбор");
                this.domRangeButtons = $("<div>").addClass('tusur-csp-range-buttons')
                    .append(this.domApplyBotton)
                    .append(this.domCancelBotton)
                    .append(this.domRangeButtonsTitle);
                this.container.append(this.domRangeButtons);
                //var ranges = MKWidgets.DateRangePicker.predefineRange(this.options.ranges);
                $.each(this.options.ranges, $.proxy(function(index, value)
                    {
                    var button = $('<input>')
                        .prop('type', 'button')
                        .addClass('tusur-csp-date-picker-button')
                        .val(index);
                    button.on('click', $.proxy(this.clickRangeButtonSlot, this));
                    this.domRangeButtons.append(button);
                    }, this));
                }
            },

        clickRangeButtonSlot: function(event)
            {
            var buttonRange = $(event.target).val();
            this.options.startDate = this.options.ranges[buttonRange][0];
            this.options.endDate = this.options.ranges[buttonRange][1];
            this.clickApply();
            this.popup.closePopup();
            //this.updateView();
            },

		setMinMaxDates: function ()
			{
			if (typeof this.options.maxDate === 'number')
				{
				this.options.maxDate = moment().endOf('day').add(this.options.maxDate, 'days');
				}
			else if (typeof this.options.maxDate === 'string')
				{
				if (this.options.maxDate.split('+').length > 0)
					{
					var abbreviations = {
							y: 'year',
							m: 'month',
							w: 'week',
							d: 'days',
							h: 'hours',
						},
						addParts = this.options.maxDate.split(' ');
					var temporaryMaxTime = moment().startOf('day');
					for (var i in addParts)
						{
						if (addParts[i] != '')
							{
							var addPart = addParts[i].trim();
							var type = abbreviations[addPart[addPart.length - 1]],
								addValue = addPart.substr(1, addPart.length - 2);
							if (type != 'undefined' && addValue.length > 0 && addValue > 0)
								{
								temporaryMaxTime.add(addValue, type);
								}
							}
						}
					this.options.maxDate = temporaryMaxTime;
					}
				}
			},

		setShowSettings: function ()
			{
			this.opens = 'right';
			if (this.element.hasClass('pull-right'))
				{
				this.opens = 'left';
				}

			this.drops = 'down';
			if (this.element.hasClass('dropup'))
				{
				this.drops = 'up';
				}
			},

		setRanges: function ()
			{
			this.ranges = {};
			if (typeof this.options.ranges === 'object')
				{
				for (range in this.options.ranges)
					{

					if (typeof this.options.ranges[range][0] === 'string')
						{
						start = moment(this.options.ranges[range][0], this.options.locale.format);
						}
					else
						{
						start = moment(this.options.ranges[range][0]);
						}

					if (typeof this.options.ranges[range][1] === 'string')
						{
						end = moment(this.options.ranges[range][1], this.options.locale.format);
						}
					else
						{
						end = moment(this.options.ranges[range][1]);
						}

					// If the start or end date exceed those allowed by the minDate or dateLimit
					// options, shorten the range to the allowable period.
					if (this.options.minDate && start.isBefore(this.options.minDate))
						{
						start = this.options.minDate.clone();
						}

					var maxDate = this.options.maxDate;
					if (this.options.dateLimit && start.clone().add(this.options.dateLimit).isAfter(maxDate))
						{
						maxDate = start.clone().add(this.options.dateLimit);
						}
					if (maxDate && end.isAfter(maxDate))
						{
						end = maxDate.clone();
						}

					if ((this.options.minDate && end.isBefore(this.options.minDate)) || (maxDate && start.isAfter(maxDate)))
						{
						continue;
						}

					//Support unicode chars in the range names.
					var elem = document.createElement('textarea');
					elem.innerHTML = range;
					var rangeHtml = elem.value;
					this.ranges[rangeHtml] = [start, end];
					}

				var list = '<div class="range-footer"><p>' + this.options.locale.rangesLabel + '</p>' + '<ul>';
				for (range in this.ranges)
					{
					list += '<li><button class="gray">' + range + '</button></li>';
					}
				//list += '<li>' + this.locale.customRangeLabel + '</li>';
				list += '</ul></div>';
				this.container.find('.ranges').append(list);
				}

			if (!this.options.timePicker)
				{
				this.options.startDate = this.options.startDate.startOf('day');
				this.options.endDate = this.options.endDate.endOf('day');
				this.container.find('.calendar-time').hide();
				}
			},

		setConfigs: function ()
			{
			//can't be used together for now
			if (this.options.timePicker && this.options.autoApply)
				{
				this.options.autoApply = false;
				}

			if (this.options.autoApply && typeof options.ranges !== 'object')
				{
				this.container.find('.ranges').hide();
				}
			else if (this.autoApply)
				{
				this.container.find('.applyBtn, .cancelBtn').addClass('hide');
				}

			if (this.options.singleDatePicker)
				{
				this.container.addClass('single');
				this.container.find('.calendar.left').addClass('single');
				//this.container.find('.calendar.left').show();
				this.container.find('.calendar.right').hide();
				this.container.find('.daterangepicker_input input, .daterangepicker_input i').hide();
				if (!this.options.timePicker)
					{
					this.container.find('.ranges').hide();
					}
				}

			if (typeof this.options.ranges === 'undefined' && !this.options.singleDatePicker)
				{
				this.container.addClass('show-calendar');
				}

			this.container.addClass('opens' + this.options.opens);

			//swap the position of the predefined ranges if opens right
			if (typeof this.options.ranges !== 'undefined' && this.options.opens == 'right')
				{
				var ranges = this.container.find('.ranges');
				var html = ranges.clone();
				ranges.remove();
				this.container.find('.calendar.left').parent().prepend(html);
				}

			//apply CSS classes and labels to buttons
			this.container.find('.applyBtn, .cancelBtn').addClass(this.options.buttonClasses);
			if (this.applyClass.length)
				{
				this.container.find('.applyBtn').addClass(this.applyClass);
				}
			if (this.cancelClass.length)
				{
				this.container.find('.cancelBtn').addClass(this.cancelClass);
				}
			this.container.find('.applyBtn').html(this.options.locale.applyLabel);
			this.container.find('.cancelBtn').html(this.options.locale.cancelLabel);
			if (this.options.singleDatePicker == false)
				{
				this.container.find('.startLabel').html(this.options.locale.startLabel);
				}
			else
				{
				this.container.find('.startLabel').html(this.options.locale.startLabelSingle);
				}
			this.container.find('.endLabel').html(this.options.locale.endLabel);

			if (this.element.is('input'))
				{
				this.element.on({
					'click.daterangepicker': $.proxy(this.show, this),
					'focus.daterangepicker': $.proxy(this.show, this),
					'keyup.daterangepicker': $.proxy(this.elementChanged, this),
					'keydown.daterangepicker': $.proxy(this.keydown, this)
				});
				}
			else
				{
				this.element.on('click.daterangepicker', $.proxy(this.toggle, this));
				}

			//
			// if attached to a text input, set the initial value
			//

			if (this.element.is('input') && !this.options.singleDatePicker && this.options.autoUpdateInput)
				{
				this.element.val(this.options.startDate.format(this.options.locale.format) + this.options.locale.separator + this.options.endDate.format(this.options.locale.format));
				this.trigger('change');
				}
			else if (this.element.is('input') && this.options.autoUpdateInput)
				{
				this.element.val(this.options.startDate.format(this.options.locale.format));
				this.trigger('change');
				}
			},

		events: function ()
			{
			this.container.find('.calendar')
				.on('click.daterangepicker', '.control.left', $.proxy(this.clickPrev, this))
				.on('click.daterangepicker', '.control.right', $.proxy(this.clickNext, this))
				.on('click.daterangepicker', 'td.available', $.proxy(this.clickDate, this))
				.on('mouseenter.daterangepicker', 'td.available', $.proxy(this.hoverDate, this))
				.on('mouseleave.daterangepicker', 'td.available', $.proxy(this.updateFormInputs, this))
				.on('change.daterangepicker', 'select.yearselect', $.proxy(this.monthOrYearChanged, this))
				.on('change.daterangepicker', 'select.monthselect', $.proxy(this.monthOrYearChanged, this))
				//.on('change.daterangepicker', 'select.hourselect,select.minuteselect,select.secondselect,select.ampmselect', $.proxy(this.timeChanged, this))
				.on('click.daterangepicker', '.daterangepicker_input input', $.proxy(this.showCalendars, this))
				//.on('keyup.daterangepicker', '.daterangepicker_input input', $.proxy(this.formInputsChanged, this))
				.on('change.daterangepicker', '.daterangepicker_input input'/*:not(.custom-select-input-field)*/, $.proxy(this.formInputsChanged, this));
			this.container.find('.ranges')
				.on('click.daterangepicker', 'button.applyBtn', $.proxy(this.clickApply, this))
				.on('click.daterangepicker', 'button.cancelBtn', $.proxy(this.clickCancel, this))
				.on('click.daterangepicker', 'li', $.proxy(this.clickRange, this))
				.on('mouseenter.daterangepicker', 'li', $.proxy(this.hoverRange, this))
				.on('mouseleave.daterangepicker', 'li', $.proxy(this.updateFormInputs, this));
			},

		setFirstDay: function ()
			{
			// update day names order to firstDay
			if (this.options.locale.firstDay != 0)
				{
				var iterator = this.options.locale.firstDay;
				while (iterator > 0)
					{
					this.options.locale.daysOfWeek.push(this.options.locale.daysOfWeek.shift());
					iterator--;
					}
				}

			var start, end, range;

			if (typeof this.options.startDate === 'undefined' && typeof this.options.endDate === 'undefined')
				{
				if (this.element.is('input[type=text]'))
					{
					var val = $(this.element).val(),
						split = val.split(this.options.locale.separator);

					start = null;
					end = null;

					if (split.length == 2)
						{
						start = moment(split[0], this.options.locale.format);
						end = moment(split[1], this.options.locale.format);
						}
					else if (this.options.singleDatePicker && val !== "")
						{
						start = moment(val, this.options.locale.format);
						end = moment(val, this.options.locale.format);
						}
					if (start !== null && end !== null)
						{
						this.setStartDate(start);
						this.setEndDate(end);
						}
					}
				}
			},

		checkTemplateExist: function ()
			{
			if (typeof this.options.template !== 'string' && this.options.datePicker == true)
				{
				this.options.template = '<div class="daterangepicker dropdown-menu">' +
					'<div class="calendar left">' +
					'<label class="startLabel"></label>' +
					'<div class="daterangepicker_input">' +
                    '<input class="input-mini" type="text" name="daterangepicker_start" value="" />' +
                    '<i class="fa fa-calendar glyphicon glyphicon-calendar"></i>' +
                    '<div class="calendar-table"></div>' +
                    '<div class="calendar-time">' +
					'<div></div>' +
					'</div></div></div>' +
					'<div class="calendar right">' +
					'<label class="endLabel"></label>' +
					'<div class="daterangepicker_input">' +
                    '<input class="input-mini" type="text" name="daterangepicker_end" value="" />' +
                    '<i class="fa fa-calendar glyphicon glyphicon-calendar"></i>' +
                    '<div class="calendar-table"></div>' +
                    '<div class="calendar-time">' +
					'<div></div>' +
					'</div></div></div>' +
					'</div>';
				}
			else if (typeof this.options.template !== 'string')
				{
				this.options.template = '<div class="daterangepicker dropdown-menu">' +
					'<div class="calendar left">' +
					'<div class="daterangepicker_input">' +
					'<div class="calendar-time">' +
					'<div></div>' +
					'</div></div></div>' +
					'<div class="calendar right">' +
					'<div class="daterangepicker_input">' +
					'<div class="calendar-time">' +
					'<div></div>' +
					'</div></div></div>' +
					'</div>';
				}
			},

		updateMonthsInView: function ()
			{
			if (this.options.endDate != "" && this.options.endDate)
				{

				//if both dates are visible already, do nothing
				if (!this.options.singleDatePicker && this.options.leftCalendar.month && this.options.rightCalendar.month &&
					(this.options.startDate.format('YYYY-MM') == this.options.leftCalendar.month.format('YYYY-MM') || this.options.startDate.format('YYYY-MM') == this.options.rightCalendar.month.format('YYYY-MM'))
					&&
					(this.options.endDate.format('YYYY-MM') == this.options.leftCalendar.month.format('YYYY-MM') || this.options.endDate.format('YYYY-MM') == this.options.rightCalendar.month.format('YYYY-MM')))
					{
					return;
					}

				this.options.leftCalendar.month = this.options.startDate.clone().date(2);
				if (!this.options.linkedCalendars && (this.options.endDate.month() != this.options.startDate.month() || this.options.endDate.year() != this.options.startDate.year()))
					{
					this.options.rightCalendar.month = this.options.endDate.clone().date(2);
					}
				else
					{
					this.options.rightCalendar.month = this.options.startDate.clone().date(2).add(1, 'month');
					}

				}
			else if(this.options.leftCalendar.month != undefined)
				{
				if (this.options.leftCalendar.month.format('YYYY-MM') != this.options.startDate.format('YYYY-MM') && this.options.rightCalendar.month.format('YYYY-MM') != this.options.startDate.format('YYYY-MM'))
					{
					this.options.leftCalendar.month = this.options.startDate.clone().date(2);
					this.options.rightCalendar.month = this.options.startDate.clone().date(2).add(1, 'month');
					}
				}
			},

		updateCalendars: function ()
			{
			if (this.options.timePicker)
				{
				var hour, minute, second;
				if (this.options.endDate)
					{
					hour = this.domHoursSelectWidget['left'].getDisplayValue();
					minute = this.options.timePickerMinutes ? this.domMinutesSelectWidget['left'].getDisplayValue() : 0;
					second = this.options.timePickerSeconds ? this.domSecondSelectWidget['left'].getDisplayValue() : 0;
					}
				else
					{
					hour = this.domHoursSelectWidget['right'].getDisplayValue();
					minute = this.options.timePickerMinutes ? this.domMinutesSelectWidget['right'].getDisplayValue() : 0;
					second = this.options.timePickerSeconds ? this.domSecondSelectWidget['right'].getDisplayValue() : 0;
					}
				this.options.leftCalendar.month.hour(hour).minute(minute).second(second);
				this.options.rightCalendar.month.hour(hour).minute(minute).second(second);
				}

			this.renderCalendar('left');
			this.renderCalendar('right');

			//highlight any predefined range matching the current start and end dates
			this.container.find('.ranges li').removeClass('active');
			if (this.options.endDate == null)
				{
				return;
				}

			var customRange = true;
			var i = 0;
			for (var range in this.options.ranges)
				{
				if (this.options.timePicker)
					{
					if (this.options.startDate.isSame(this.options.ranges[range][0]) && this.options.endDate.isSame(this.options.ranges[range][1]))
						{
						customRange = false;
						this.options.chosenLabel = this.container.find('.ranges li:eq(' + i + ')')
							.addClass('active')
							.html();
						break;
						}
					}
				else
					{
					//ignore times when comparing dates if time picker is not enabled
					if (this.startDate.format('YYYY-MM-DD') == this.ranges[range][0].format('YYYY-MM-DD') && this.options.endDate.format('YYYY-MM-DD') == this.options.ranges[range][1].format('YYYY-MM-DD'))
						{
						customRange = false;
						this.options.chosenLabel = this.container.find('.ranges li:eq(' + i + ')')
							.addClass('active')
							.html();
						break;
						}
					}
				i++;
				}
			if (customRange)
				{
				//this.chosenLabel = this.container.find('.ranges li:last').addClass('active').html();
				this.showCalendars();
				}

			},

		renderCalendar: function (side)
			{
			var calendar = side == 'left' ? this.options.leftCalendar : this.options.rightCalendar;
			var month = calendar.month.month();
			var year = calendar.month.year();
			var hour = calendar.month.hour();
			var minute = calendar.month.minute();
			var second = calendar.month.second();
			var daysInMonth = moment([year, month]).daysInMonth();
			var firstDay = moment([year, month, 1]);
			var lastDay = moment([year, month, daysInMonth]);
			var lastMonth = moment(firstDay).subtract(1, 'month').month();
			var lastYear = moment(firstDay).subtract(1, 'month').year();
			var daysInLastMonth = moment([lastYear, lastMonth]).daysInMonth();
			var dayOfWeek = firstDay.day();

			//initialize a 6 rows x 7 columns array for the calendar
			var calendar = [];
			calendar.firstDay = firstDay;
			calendar.lastDay = lastDay;

			for (var i = 0; i < 6; i++)
				{
				calendar[i] = [];
				}

			//populate the calendar with date objects
			var startDay = daysInLastMonth - dayOfWeek + this.options.locale.firstDay + 1;
			if (startDay > daysInLastMonth)
				{
				startDay -= 7;
				}

			if (dayOfWeek == this.options.locale.firstDay)
				{
				startDay = daysInLastMonth - 6;
				}

			var curDate = moment([lastYear, lastMonth, startDay, 12, minute, second]);

			var col, row;
			for (var i = 0, col = 0, row = 0; i < 42; i++, col++, curDate = moment(curDate).add(24, 'hour'))
				{
				if (i > 0 && col % 7 === 0)
					{
					col = 0;
					row++;
					}
				calendar[row][col] = curDate.clone().hour(hour).minute(minute).second(second);
				curDate.hour(12);

				if (this.options.minDate && calendar[row][col].format('YYYY-MM-DD') == this.options.minDate.format('YYYY-MM-DD') && calendar[row][col].isBefore(this.options.minDate) && side == 'left')
					{
					calendar[row][col] = this.options.minDate.clone();
					}

				if (this.options.maxDate && calendar[row][col].format('YYYY-MM-DD') == this.options.maxDate.format('YYYY-MM-DD') && calendar[row][col].isAfter(this.options.maxDate) && side == 'right')
					{
					calendar[row][col] = this.options.maxDate.clone();
					}

				}

			//make the calendar object available to hoverDate/clickDate
			if (side == 'left')
				{
				this.options.leftCalendar.calendar = calendar;
				}
			else
				{
				this.options.rightCalendar.calendar = calendar;
				}

			//
			// Display the calendar
			//

			var minDate = (side == 'left') ? this.options.minDate : this.options.startDate;
			var maxDate = this.options.maxDate;
			var selected = (side == 'left') ? this.options.startDate : this.options.endDate;
			var html = '<table class="table-condensed">';
			html += '<thead>';
			html += '<tr>';

			// add empty cell for week number
			if (this.options.showWeekNumbers)
				{
				html += '<th></th>';
				}

			if ((!minDate || minDate.isBefore(calendar.firstDay)) && (!this.options.linkedCalendars || side == 'left'))
				{
				html += '<th class="control left available"></th>';
				}
			else
				{
				html += '<th></th>';
				}

			var dateHtml = this.options.locale.monthNames[calendar[1][1].month()] + calendar[1][1].format(" YYYY");

			if (this.options.showDropdowns)
				{
				var currentMonth = calendar[1][1].month();
				var currentYear = calendar[1][1].year();
				var maxYear = (maxDate && maxDate.year()) || (currentYear + 5);
				var minYear = (minDate && minDate.year()) || (currentYear - 50);
				var inMinYear = currentYear == minYear;
				var inMaxYear = currentYear == maxYear;

				var monthHtml = '<select class="monthselect">';
				for (var m = 0; m < 12; m++)
					{
					if ((!inMinYear || m >= minDate.month()) && (!inMaxYear || m <= maxDate.month()))
						{
						monthHtml += "<option value='" + m + "'" +
							(m === currentMonth ? " selected='selected'" : "") +
							">" + this.options.locale.monthNames[m] + "</option>";
						}
					else
						{
						monthHtml += "<option value='" + m + "'" +
							(m === currentMonth ? " selected='selected'" : "") +
							" disabled='disabled'>" + this.options.locale.monthNames[m] + "</option>";
						}
					}
				monthHtml += "</select>";

				var yearHtml = '<select class="yearselect">';
				for (var y = minYear; y <= maxYear; y++)
					{
					yearHtml += '<option value="' + y + '"' +
						(y === currentYear ? ' selected="selected"' : '') +
						'>' + y + '</option>';
					}
				yearHtml += '</select>';

				dateHtml = monthHtml + yearHtml;
				}

			html += '<th colspan="5" class="month">' + dateHtml + '</th>';
			if ((!maxDate || maxDate.isAfter(calendar.lastDay)) && (!this.options.linkedCalendars || side == 'right' || this.options.singleDatePicker))
				{
				html += '<th class="control right available">' +
						//'<i class="fa fa-chevron-right glyphicon' +
						//' glyphicon-chevron-right"></i>' +
					'</th>';
				}
			else
				{
				html += '<th></th>';
				}

			html += '</tr>';
			html += '<tr class="tusur-csp-date-range-picker-calendar-thead-weekLabels">';

			// add week number label
			if (this.options.showWeekNumbers)
				{
				html += '<th class="week">' + this.locale.weekLabel + '</th>';
				}

			$.each(this.options.locale.daysOfWeek, function (index, dayOfWeek)
			{
			html += '<th>' + dayOfWeek + '</th>';
			});

			html += '</tr>';
			html += '</thead>';
			html += '<tbody>';

			//adjust maxDate to reflect the dateLimit setting in order to
			//grey out end dates beyond the dateLimit
			if (this.options.endDate == null && this.options.dateLimit)
				{
				var maxLimit = this.options.startDate.clone().add(this.options.dateLimit).endOf('day');
				if (!maxDate || maxLimit.isBefore(maxDate))
					{
					maxDate = maxLimit;
					}
				}

			for (var row = 0; row < 6; row++)
				{
				html += '<tr>';

				// add week number
				if (this.options.showWeekNumbers)
					{
					html += '<td class="week">' + calendar[row][0].week() + '</td>';
					}

				for (var col = 0; col < 7; col++)
					{

					var classes = [];

					//highlight today's date
					if (calendar[row][col].isSame(new Date(), "day"))
						{
						classes.push('today');
						}

					//highlight weekends
					if (calendar[row][col].isoWeekday() > 5)
						{
						classes.push('weekend');
						}

					//grey out the dates in other months displayed at beginning and end of this calendar
					if (calendar[row][col].month() != calendar[1][1].month())
						{
						classes.push('off');
						}

					//don't allow selection of dates before the minimum date
					if (this.options.minDate && calendar[row][col].isBefore(this.options.minDate, 'day'))
						{
						classes.push('off', 'disabled');
						}

					//don't allow selection of dates after the maximum date
					if (maxDate && calendar[row][col].isAfter(maxDate, 'day'))
						{
						classes.push('off', 'disabled');
						}

					//don't allow selection of date if a custom function decides it's invalid
					if (this.isInvalidDate(calendar[row][col]))
						{
						classes.push('off', 'disabled');
						}

					//highlight the currently selected start date
					if (calendar[row][col].format('YYYY-MM-DD') == this.options.startDate.format('YYYY-MM-DD'))
						{
						classes.push('active', 'start-date');
						}

					//highlight the currently selected end date
					if (this.options.endDate != null && calendar[row][col].format('YYYY-MM-DD') == this.options.endDate.format('YYYY-MM-DD'))
						{
						classes.push('active', 'end-date');
						}

					//highlight dates in-between the selected dates
					if (this.options.endDate != null && calendar[row][col] > this.options.startDate && calendar[row][col] < this.options.endDate)
						{
						classes.push('in-range');
						}

					var cname = '', disabled = false;
					for (var i = 0; i < classes.length; i++)
						{
						cname += classes[i] + ' ';
						if (classes[i] == 'disabled')
							{
							disabled = true;
							}
						}
					if (!disabled)
						{
						cname += 'available';
						}

					html += '<td class="' + cname.replace(/^\s+|\s+$/g, '') + '" data-title="' + 'r' + row + 'c' + col + '">' + calendar[row][col].date() + '</td>';

					}
				html += '</tr>';
				}

			html += '</tbody>';
			html += '</table>';

			this.container.find('.calendar.' + side + ' .calendar-table').html(html);

			},


		getValue: function ()
			{
			return this.element.val();
			},

		renderTimePicker: function (side)
			{

			var html, selected, minDate, maxDate = this.options.maxDate;

			if (this.options.dateLimit && (!this.options.maxDate || this.options.startDate.clone()
					.add(this.options.dateLimit)
					.isAfter(this.options.maxDate)))
				{
				maxDate = this.options.startDate.clone().add(this.options.dateLimit);
				}

			if (side == 'left')
				{
				selected = this.options.startDate.clone();
				minDate = this.options.minDate;
				}
			else if (side == 'right')
				{
				selected = this.options.endDate ? this.options.endDate.clone() : this.options.previousRightTime.clone();
				minDate = this.options.startDate;

				//Preserve the time already selected
				var timeSelector = this.container.find('.calendar.right .calendar-time div');
				if (timeSelector.html() != '')
					{
					if (selected.isBefore(this.options.startDate))
						{
						selected = this.options.startDate.clone();
						}

					if (selected.isAfter(maxDate))
						{
						selected = maxDate.clone();
						}
					}
				}

			//
			// hours
			//

			var start = 0;
			var end = 23;
			var hoursData = [];
			for (var i = start; i <= end; i++)
				{
				var i_in_24 = i;

				var time = selected.clone().hour(i_in_24);
				var disabled = false;
				if (minDate && time.minute(59).isBefore(minDate))
					{
					disabled = true;
					}
				if (maxDate && time.minute(0).isAfter(maxDate))
					{
					disabled = true;
					}

				if (i_in_24 == selected.hour() && !disabled)
					{
					hoursData.push({text: i, value: i, selected: true});
					}
				else if (disabled)
					{
					//something
					}
				else
					{
					hoursData.push({text: i, value: i, selected: false});
					}

				}

			//
			// minutes
			//

			if (this.options.timePickerMinutes)
				{
				var minutesData = [];
				for (var i = 0; i < 60; i += this.options.timePickerIncrement)
					{
					var padded = i < 10 ? '0' + i : i;
					var time = selected.clone().minute(i);

					var disabled = false;
					if (minDate && time.second(59).isBefore(minDate))
						{
						disabled = true;
						}
					if (maxDate && time.second(0).isAfter(maxDate))
						{
						disabled = true;
						}

					if (selected.minute() == i && !disabled)
						{
						minutesData.push({text: i, value: i, selected: true});
						}
					else if (disabled)
						{
						//something
						}
					else
						{
						minutesData.push({text: i, value: i, selected: false});
						}
					}
				}


			//
			// seconds
			//

			if (this.options.timePickerSeconds)
				{
				var secondData = [];

				for (var i = 0; i < 60; i++)
					{
					var padded = i < 10 ? '0' + i : i;
					var time = selected.clone().second(i);

					var disabled = false;
					if (minDate && time.isBefore(minDate))
						{
						disabled = true;
						}
					if (maxDate && time.isAfter(maxDate))
						{
						disabled = true;
						}

					if (selected.second() == i && !disabled)
						{
						secondData.push({text: i, value: i, selected: true});
						}
					else if (disabled)
						{
						//something
						}
					else
						{
						secondData.push({text: i, value: i, selected: false});
						}
					}
				}

			this.domCurrentSide = this.container.find('.calendar.' + side).first();
			//this.domCurrentSide.html('');

			if (this.domCurrentSide.find('.hourContainer').length == 0)
				{
				if (this.domHoursSelectWidget == undefined)
					{
					this.domHoursSelectWidget = {};
					}
				this.domHoursLabel = $("<div/>").addClass("hourLabel");
				this.domHoursSelect = $("<div/>").addClass("hourselect");
				this.domHours = $("<div/>").attr('class', 'hourContainer timeContainer')
					.append(this.domHoursLabel)
					.append(this.domHoursSelect)
				;

				this.domCurrentSide.append(this.domHours);
				this.domHoursSelectWidget[side] = new MKWidgets.Select(this.domHoursSelect, {
					dict: hoursData,
					//customClasses: 'datapickerSelect',
					parentWidth: false,
                    customClass: 'datepickerSelect',
                    popupOptions: {
                        background: false
                    }
				});
				this.domHoursSelectWidget[side].on('change:selectedOption', this.timeChanged, this);
				}
			if (this.domCurrentSide.find('.minuteContainer').length == 0 && this.options.timePickerMinutes)
				{
				if (this.domMinutesSelectWidget == undefined)
					{
					this.domMinutesSelectWidget = {};
					}
				this.domMinuteLabel = $("<div/>").addClass("minuteLabel");
				this.domMinutesSelect = $("<div/>").addClass("minutesselect");
				this.domMinute = $("<div/>").attr('class', 'minuteContainer timeContainer')
					.append(this.domMinuteLabel)
					.append(this.domMinutesSelect)
				;
				this.domCurrentSide.append(this.domMinute);
				this.domMinutesSelectWidget[side] = new MKWidgets.Select(this.domMinutesSelect, {
					dict: minutesData,
					//customClasses: 'datapickerSelect',
					parentWidth: false,
                    customClass: 'datepickerSelect',
                    popupOptions: {
                        background: false
                    }
				});
				this.domMinutesSelectWidget[side].on('change:selectedOption', $.proxy(this.timeChanged, this));
				}
			if (this.domCurrentSide.find('.secondContainer').length == 0 && this.options.timePickerSeconds)
				{
				if (this.domSecondSelectWidget == undefined)
					{
					this.domSecondSelectWidget = {};
					}
				this.domSecondLabel = $("<div/>").addClass("secondLabel");
				this.domSecondSelect = $("<div/>").addClass("secondselect");
				this.domSecond = $("<div/>").attr('class', 'secondContainer timeContainer')
					.append(this.domSecondLabel)
					.append(this.domSecondSelect)
				;
				this.domCurrentSide.append(this.domSecond);
				this.domSecondSelectWidget[side] = new MKWidgets.Select(this.domSecondSelect, {
					dict: secondData,
					//customClasses: 'datapickerSelect',
					parentWidth: false,
                    customClass: 'datepickerSelect',
                    popupOptions: {
                        background: false
                    }
				});
				this.domSecondSelectWidget[side].on('change:selectedOption', $.proxy(this.timeChanged, this));
				}

			if (this.options.timePicker == true )
				{
				this.domHoursLabel.text(this.options.locale.hourLabel);
				}
			if (this.options.timePickerMinutes == true)
				{
				this.domMinuteLabel.text(this.options.locale.minuteLabel);
				}
			if (this.options.timePickerSeconds == true )
				{
				this.domSecondLabel.text(this.options.locale.secondLabel);
				}



			//this.container.find('.calendar-time select').select();
			if (this.oldElementValue == undefined)
				{
				this.oldElementValue = [];
				}
			if (this.oldElementValue[side] != this.element.val() || this.oldElementValue[side] == undefined)
				{
				this.oldElementValue[side] = this.element.val();
				var selectedHourValue = selected.hours();
				this.domHoursSelectWidget[side].setSelectedOptionById(selectedHourValue);
				if (this.options.timePickerMinutes == true)
					{
					var selectedMinutesValue = selected.minute();
					this.domMinutesSelectWidget[side].setSelectedOptionById(selectedMinutesValue);
					}
				if (this.options.timePickerSeconds == true && selected.seconds)
					{
					var selectedSecondValue = selected.seconds();
					this.domSecondSelectWidget[side].setSelectedOptionById(selectedSecondValue);
					}
				}
			},

		updateFormInputs: function ()
			{

			//ignore mouse movements while an above-calendar text input has focus
			if (this.container.find('input[name=daterangepicker_start]')
					.is(":focus") || this.container.find('input[name=daterangepicker_end]').is(":focus"))
				{
				return;
				}

			this.container.find('input[name=daterangepicker_start]')
				.val(this.options.startDate.format(this.options.locale.format));
			if (this.options.endDate)
				{
				this.container.find('input[name=daterangepicker_end]')
					.val(this.options.endDate.format(this.options.locale.format));
				}

			if (this.options.singleDatePicker || (this.options.endDate && (this.options.startDate.isBefore(this.options.endDate) || this.options.startDate.isSame(this.options.endDate))))
				{
				this.container.find('button.applyBtn').removeAttr('disabled');
				}
			else
				{
				this.container.find('button.applyBtn').attr('disabled', 'disabled');
				}
			},

		show: function (e)
			{
			if (this.isShowing)
				{
				return;
				}

			// Create a click proxy that is private to this instance of datepicker, for unbinding
			this._outsideClickProxy = $.proxy(function (e)
			{
			this.outsideClick(e);
			}, this);

			this.oldStartDate = this.options.startDate.clone();
			this.oldEndDate = this.options.endDate.clone();
			this.options.previousRightTime = this.options.endDate.clone();

			this.updateView();
			this.container.show();

			this.popup.openPopup();
			this.element.trigger('show.daterangepicker', this);
			var beginHeight = this.element.css('height')
			//beginPaddings = this.element.css('padding');
				;

			//this.elementPointer = $('<div class="daterangepicker-elementPointer"></div>');
			this.elementWidth = this.element.width();
			//this.element.after(this.elementPointer);
			//this.element.addClass("daterangepicker-input");

			var elementPosition = this.element.position();

			this.element.parent().width(this.element.outerWidth());
			this.element.parent().height(this.element.outerHeight());


			this.isShowing = true;
			this.popup.trigger('content-ready');
			},


		hide: function (e)
			{
			if (!this.isShowing)
				{
				return;
				}

			//incomplete date selection, revert to last values
			if (!this.options.endDate)
				{
				this.options.startDate = this.oldStartDate.clone();
				this.options.endDate = this.oldEndDate.clone();
				}

			//if picker is attached to a text input, update it
			this.updateElement();

			$(document).off('.daterangepicker');
			$(window).off('.daterangepicker');
			//this.element.removeClass("daterangepicker-input");
			this.trigger('calendar-hide');

			this.isShowing = false;
            this.popup.closePopup();
			},

		toggle: function (e)
			{
			if (this.isShowing)
				{
				this.hide();
				}
			else
				{
				this.show();
				}
			},

		showCalendars: function ()
			{
			this.container.addClass('show-calendar');
			this.element.trigger('showCalendar.daterangepicker', this);
			},

		hideCalendars: function ()
			{
			this.container.removeClass('show-calendar');
			this.element.trigger('hideCalendar.daterangepicker', this);
			},

		hoverRange: function (e)
			{
			//ignore mouse movements while an above-calendar text input has focus
			if (this.container.find('input[name=daterangepicker_start]')
					.is(":focus") || this.container.find('input[name=daterangepicker_end]').is(":focus"))
				{
				return;
				}

			var label = e.target.innerHTML;
			if (label == this.locale.customRangeLabel)
				{
				this.updateView();
				}
			else
				{
				var dates = this.options.ranges[label];
				this.container.find('input[name=daterangepicker_start]').val(dates[0].format(this.options.locale.format));
				this.container.find('input[name=daterangepicker_end]').val(dates[1].format(this.options.locale.format));
				}
			},

		clickRange: function (e)
			{
			var label = e.target.innerHTML;
			this.options.chosenLabel = label;
			var dates = this.options.ranges[label];
			this.options.startDate = dates[0];
			this.options.endDate = dates[1];

			if (!this.options.timePicker)
				{
				this.options.startDate.startOf('day');
				this.options.endDate.endOf('day');
				}
			this.clickApply();
			},

		clickPrev: function (e)
			{
			var cal = $(e.target).parents('.calendar');
			if (cal.hasClass('left'))
				{
				this.options.leftCalendar.month.subtract(1, 'month');
				if (this.options.linkedCalendars)
					{
					this.options.rightCalendar.month.subtract(1, 'month');
					}
				}
			else
				{
				this.options.rightCalendar.month.subtract(1, 'month');
				}
			this.updateCalendars();
			},

		clickNext: function (e)
			{
			var cal = $(e.target).parents('.calendar');
			if (cal.hasClass('left'))
				{
				this.options.leftCalendar.month.add(1, 'month');
				}
			else
				{
				this.options.rightCalendar.month.add(1, 'month');
				if (this.options.linkedCalendars)
					{
					this.options.leftCalendar.month.add(1, 'month');
					}
				}
			this.updateCalendars();
			},

		hoverDate: function (e)
			{

			//ignore mouse movements while an above-calendar text input has focus
			if (this.container.find('input[name=daterangepicker_start]')
					.is(":focus") || this.container.find('input[name=daterangepicker_end]').is(":focus"))
				{
				return;
				}

			//ignore dates that can't be selected
			if (!$(e.target).hasClass('available'))
				{
				return;
				}

			//have the text inputs above calendars reflect the date being hovered over
			var title = $(e.target).attr('data-title');
			var row = title.substr(1, 1);
			var col = title.substr(3, 1);
			var cal = $(e.target).parents('.calendar');
			var date = cal.hasClass('left') ? this.options.leftCalendar.calendar[row][col] : this.options.rightCalendar.calendar[row][col];

			if (this.options.endDate)
				{
				this.container.find('input[name=daterangepicker_start]').val(date.format(this.options.locale.format));
				}
			else
				{
				this.container.find('input[name=daterangepicker_end]').val(date.format(this.options.locale.format));
				}

			//highlight the dates between the start date and the date being hovered as a potential end date
			var leftCalendar = this.options.leftCalendar;
			var rightCalendar = this.options.rightCalendar;
			var startDate = this.options.startDate;
			if (!this.options.endDate)
				{
				this.container.find('.calendar td').each(function (index, el)
				{

				//skip week numbers, only look at dates
				if ($(el).hasClass('week'))
					{
					return;
					}

				var title = $(el).attr('data-title');
				var row = title.substr(1, 1);
				var col = title.substr(3, 1);
				var cal = $(el).parents('.calendar');
				var dt = cal.hasClass('left') ? leftCalendar.calendar[row][col] : rightCalendar.calendar[row][col];

				if (dt.isAfter(startDate) && dt.isBefore(date))
					{
					$(el).addClass('in-range');
					}
				else
					{
					$(el).removeClass('in-range');
					}

				});
				}
			},

		clickDate: function (e)
			{

			if (!$(e.target).hasClass('available'))
				{
				return;
				}

			var title = $(e.target).attr('data-title');
			var row = title.substr(1, 1);
			var col = title.substr(3, 1);
			var cal = $(e.target).parents('.calendar');
			var date = cal.hasClass('left') ? this.options.leftCalendar.calendar[row][col] : this.options.rightCalendar.calendar[row][col];

			if (this.options.endDate || date.isBefore(this.options.startDate, 'day'))
				{
				if (this.options.timePicker)
					{
					var hour = this.domHoursSelectWidget['left'].getDisplayValue();
					var minute = this.options.timePickerMinutes ? this.domMinutesSelectWidget['left'].getDisplayValue() : 0;
					var second = this.options.timePickerSeconds ? this.domSecondSelectWidget['left'].getDisplayValue() : 0;

					date = date.clone().hour(hour).minute(minute).second(second);
					}
				this.options.endDate = null;
				this.setStartDate(date.clone());
				}
			else if (!this.options.endDate && date.isBefore(this.options.startDate))
				{
				//special case: clicking the same date for start/end,
				//but the time of the end date is before the start date
				this.setEndDate(this.options.startDate.clone());
				}
			else
				{
				if (this.options.timePicker)
					{
					var hour = this.domHoursSelectWidget['right'].getDisplayValue();
					var minute = this.options.timePickerMinutes ? this.domMinutesSelectWidget['right'].getDisplayValue() : 0;
					var second = this.options.timePickerSeconds ? this.domSecondSelectWidget['right'].getDisplayValue() : 0;

					date = date.clone().hour(hour).minute(minute).second(second);
					}
				this.setEndDate(date.clone());
				if (this.options.autoApply)
					{
					this.clickApply();
					}
				}

			if (this.options.singleDatePicker)
				{
				this.setEndDate(this.options.startDate);
				if (!this.options.timePicker)
					{
					this.clickApply();
					}
				}
			this.updateView();
			},

		clickApply: function (e)
			{
			this.hide();
			this.trigger('apply.daterangepicker', this);
			},

		clickCancel: function (e)
			{
			this.options.startDate = this.oldStartDate;
			this.options.endDate = this.oldEndDate;
			this.hide();
			this.trigger('cancel.daterangepicker', this);
			},

		monthOrYearChanged: function (e)
			{
			var isLeft = $(e.target).closest('.calendar').hasClass('left'),
				leftOrRight = isLeft ? 'left' : 'right',
				cal = this.container.find('.calendar.' + leftOrRight);

			// Month must be Number for new moment versions
			var month = parseInt(cal.find('.monthselect').val(), 10);
			var year = cal.find('.yearselect').val();

			if (!isLeft)
				{
				if (year < this.options.startDate.year() || (year == this.options.startDate.year() && month < this.options.startDate.month()))
					{
					month = this.options.startDate.month();
					year = this.options.startDate.year();
					}
				}

			if (this.minDate)
				{
				if (year < this.options.minDate.year() || (year == this.options.minDate.year() && month < this.options.minDate.month()))
					{
					month = this.options.minDate.month();
					year = this.options.minDate.year();
					}
				}

			if (this.options.maxDate)
				{
				if (year > this.options.maxDate.year() || (year == this.options.maxDate.year() && month > this.options.maxDate.month()))
					{
					month = this.options.maxDate.month();
					year = this.options.maxDate.year();
					}
				}

			if (isLeft)
				{
				this.options.leftCalendar.month.month(month).year(year);
				if (this.options.linkedCalendars)
					{
					this.options.rightCalendar.month = this.options.leftCalendar.month.clone().add(1, 'month');
					}
				}
			else
				{
				this.options.rightCalendar.month.month(month).year(year);
				if (this.options.linkedCalendars)
					{
					this.options.leftCalendar.month = this.options.rightCalendar.month.clone().subtract(1, 'month');
					}
				}
			this.updateCalendars();
			},


		timeChanged: function (e)
			{
			if (e.target == undefined)
				{
				e.target = e.node;
				}
			var cal = $(e.self.element).closest('.calendar'),
				isLeft = cal.hasClass('left'),
				side = isLeft ? 'left' : 'right';

			if (this.domHoursSelectWidget[side] != undefined)
				{
				var hour = this.domHoursSelectWidget[side].getDisplayValue();
				}

			if (this.options.timePickerMinutes == true)
				{
				if (this.domMinutesSelectWidget[side] != undefined)
					{
					var minute = this.options.timePickerMinutes ? this.domMinutesSelectWidget[side].getDisplayValue() : 0;
					}
				}
			if (this.options.timePickerSeconds == true )
				{
				if (this.domSecondSelectWidget[side] != undefined)
					{
					var second = this.options.timePickerSeconds ? this.domSecondSelectWidget[side].getDisplayValue() : 0;
					}
				}

			if (isLeft)
				{
				var start = this.options.startDate.clone();
				start.hour(hour);
				start.minute(minute);
				start.second(second);
				this.setStartDate(start);
				if (this.options.singleDatePicker)
					{
					this.options.endDate = this.options.startDate.clone();
					}
				else if (this.options.endDate && this.options.endDate.format('YYYY-MM-DD') == start.format('YYYY-MM-DD') && this.options.endDate.isBefore(start))
					{
					this.setEndDate(start.clone());
					}
				}
			else if (this.options.endDate)
				{
				var end = this.options.endDate.clone();
				end.hour(hour);
				end.minute(minute);
				end.second(second);
				this.setEndDate(end);
				}

			//update the calendars so all clickable dates reflect the new time component
			this.updateCalendars();

			//update the form inputs above the calendars with the new time
			this.updateFormInputs();

			//re-render the time pickers because changing one selection can affect what's enabled in another
			this.renderTimePicker('left');
			this.renderTimePicker('right');

			this.updateElement();
			},

		formInputsChanged: function (e)
			{
			var isRight = $(e.target).closest('.calendar').hasClass('right');
			var start = moment(this.container.find('input[name="daterangepicker_start"]')
				.val(), this.options.locale.format);
			var end = moment(this.container.find('input[name="daterangepicker_end"]').val(), this.options.locale.format);

			if (start.isValid() && end.isValid())
				{
				if (isRight && end.isBefore(start))
					{
					start = end.clone();
					}

				this.setStartDate(start);
				this.setEndDate(end);

				if (isRight)
					{
					this.container.find('input[name="daterangepicker_start"]')
						.val(this.options.startDate.format(this.options.locale.format));
					}
				else
					{
					this.container.find('input[name="daterangepicker_end"]')
						.val(this.options.endDate.format(this.options.locale.format));
					}

				}

			this.updateCalendars();
			if (this.options.timePicker)
				{
				this.renderTimePicker('left');
				this.renderTimePicker('right');
				}
			},

		elementChanged: function ()
			{
			if (!this.element.is('input'))
				{
				return;
				}
			if (!this.element.val().length)
				{
				return;
				}
			if (this.element.val().length < this.options.locale.format.length)
				{
				return;
				}

			var dateString = this.element.val().split(this.options.locale.separator),
				start = null,
				end = null;

			if (dateString.length === 2)
				{
				start = moment(dateString[0], this.options.locale.format);
				end = moment(dateString[1], this.options.locale.format);
				}

			if (this.options.singleDatePicker || start === null || end === null)
				{
				start = moment(this.element.val(), this.options.locale.format);
				end = start;
				}

			if (!start.isValid() || !end.isValid())
				{
				return;
				}

			this.setStartDate(start);
			this.setEndDate(end);
			this.updateView();
			},

		keydown: function (e)
			{
			//hide on tab or enter
			if ((e.keyCode === 9) || (e.keyCode === 13))
				{
				this.hide();
				}
			},

		updateElement: function ()
			{
			if (this.element.is('input') && !this.options.singleDatePicker && this.options.autoUpdateInput)
				{
				this.element.val(this.options.startDate.format(this.options.locale.format) + this.options.locale.separator + this.options.endDate.format(this.options.locale.format));
				this.trigger('change');
				}
			else if (this.element.is('input') && this.options.autoUpdateInput)
				{
				this.element.val(this.options.startDate.format(this.options.locale.format));
				this.trigger('change');
				}
			this.oldElementValue = this.element.val();
			},

		getRangeText: function ()
			{
			if (this.options.startDate != undefined && this.options.endDate != undefined)
				{
				return this.options.startDate.format(this.options.locale.format) + this.options.locale.separator + this.options.endDate.format(this.options.locale.format);
				}
			return null;
			},

		getEndMoment: function ()
			{
			if (this.options.endDate != undefined)
				{
				return this.options.endDate;
				}
			return null;
			},

		remove: function ()
			{
			this.container.remove();
			this.element.off('.daterangepicker');
			this.element.removeData();
			}
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
				if (name == "Сегодня")
					{
					range = [
						moment([now.year(), now.month(), now.date(), 0, 0, 0, 0]),
						moment([now.year(), now.month(), now.date(), 23, 59, 59, 999]),
					];
					}
				if (name == "Вчера")
					{
					range = [
						moment([now.year(), now.month(), now.date() - 1, 0, 0, 0, 0]),
						moment([now.year(), now.month(), now.date() - 1, 23, 59, 59, 999]),
					];
					}
				if (name == "7 дней")
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
				if (name == "Этот месяц")
					{
					range = [
						moment([now.year(), now.month(), 1, 0, 0, 0, 0]),
						moment([now.year(), now.month(), now.date(), 23, 59, 59, 999]),
					];
					}
				if (name == "Этот год")
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