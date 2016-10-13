/*
 * This file is part of the Arnapou jqCron package.
 *
 * (c) Arnaud Buathier <arnaud@arnapou.net>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
var MKWidgets = MKWidgets || {};
MKWidgets.jqCronNS = MKWidgets.jqCronNS || {};

MKWidgets.jqCron = Class({
	extends: MKWidget,
	jqCronInstances: [],
	jqUID: 0,
	yearsCount: 20,

	constructor: function (elementSelector, options)
		{
		MKWidget.prototype.constructor.apply(this, [elementSelector, options]);
		this.setOptions(
			{
				texts: {
					ru: {
						empty: 'каждый',
						empty_minutes: 'каждую',
						empty_time_hours: 'каждый час',
						empty_time_minutes: 'каждую минуту',
						empty_day_of_week: 'каждый день недели',
						empty_day_of_month: 'каждый день месяца',
						empty_month: 'каждый месяц',
						empty_year: 'каждый год',
						name_minute: 'минуту',
						name_hour: 'час',
						name_day: 'день',
						name_week: 'неделю',
						name_month: 'месяц',
						name_year: 'год(ы)',
						text_period: 'Каждый(ую) <b />',
						text_mins: ' в <b /> минуты в течение часа',
						text_time: ' в <b />:<b />',
						text_dow: ' в <b />',
						text_month: ' в <b />',
						text_dom: ' в <b />',
						text_year: ' в <b />',
						error1: 'Тэг %s не поддерживается!',
						error2: 'Неверный номер элементов',
						error3: 'jquery_element не может быть установлен в настройки jqCron',
						error4: 'Некорректное выражение',
						weekdays: ['понедельник', 'вторник', 'среду', 'четверг', 'пятницу', 'субботу', 'воскресенье'],
						months: [
							'январь',
							'ферваль',
							'март',
							'апрель',
							'май',
							'июнь',
							'июль',
							'август',
							'сентябрь',
							'октябрь',
							'ноябрь',
							'декабрь'
						]
					},
				},
				monthdays: [
					1,
					2,
					3,
					4,
					5,
					6,
					7,
					8,
					9,
					10,
					11,
					12,
					13,
					14,
					15,
					16,
					17,
					18,
					19,
					20,
					21,
					22,
					23,
					24,
					25,
					26,
					27,
					28,
					29,
					30,
					31
				],
				hours: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23],
				minutes: [
					0,
					1,
					2,
					3,
					4,
					5,
					6,
					7,
					8,
					9,
					10,
					11,
					12,
					13,
					14,
					15,
					16,
					17,
					18,
					19,
					20,
					21,
					22,
					23,
					24,
					25,
					26,
					27,
					28,
					29,
					30,
					31,
					32,
					33,
					34,
					35,
					36,
					37,
					38,
					39,
					40,
					41,
					42,
					43,
					44,
					45,
					46,
					47,
					48,
					49,
					50,
					51,
					52,
					53,
					54,
					55,
					56,
					57,
					58,
					59
				],
				lang: 'ru',
				enabled_minute: false,
				enabled_hour: true,
				enabled_day: true,
				enabled_week: true,
				enabled_month: true,
				enabled_year: true,
				multiple_dom: false,
				multiple_month: false,
				multiple_mins: false,
				multiple_dow: false,
				multiple_year: true,
				multiple_time_hours: false,
				multiple_time_minutes: false,
				numeric_zero_pad: false,
				default_period: 'day',
				default_value: '',
				no_reset_button: true,
				disabled: false,
				bind_to: null,
			});
		this.setOptions(options);
		//this.cron;
		//this.saved;
		this.initTranslate();
		this.init();
		},


	jqGetUID: function (prefix)
		{
		var id;
		while (1)
			{
			this.jqUID++;
			id = ((prefix || 'JQUID') + '') + this.jqUID;
			if (!document.getElementById(id))
				{
				return id;
				}
			}
		},

	//bind_set: function($element, value) {
	//    $element.is(':input') ? $element.val(value) : $element.data('jqCronValue', value);
	//},

	bind_set: function (element, value)
		{
		this.value = value;
		this.trigger('value-changed');
		},

	bind_get: function ($element)
		{
		return $element.is(':input') ? $element.val() : $element.data('jqCronValue');
		},

	getValue: function ()
		{
		return this.value;
		},

	uniqueId: function (element, prefix)
		{
		_self = this;
		return element.each(function ()
		{
		if ($(element).attr('id'))
			{
			return;
			}
		var id = _self.jqGetUID(prefix);
		$(element).attr('id', id);
		});
		},

	initTranslate: function ()
		{
		this.translations = this.options.texts[this.options.lang];
		if (typeof(this.translations) !== 'object' || $.isEmptyObject(this.translations))
			{
			console && console.error(
				'Missing translations for language "' + this.options.lang + '". ' +
				'Please include jqCron.' + this.options.lang + '.js or manually provide ' +
				'the necessary translations when calling $.fn.jqCron().'
			);
			}
		},

	init: function ()
		{
		if (!this.options.jquery_container)
			{
			if (this.element.is(':container'))
				{
				this.options.jquery_element = this.uniqueId(this.element, 'jqCron');
				}
			else if (this.element.is(':autoclose'))
				{
				// delete already generated dom if exists
				if (this.element.next('.jqCron').length == 1)
					{
					this.element.next('.jqCron').remove();
					}
				// generate new
				this.options.jquery_element = uniqueId($('<span class="jqCron"></span>'), 'jqCron')
					.insertAfter(this.element);
				}
			else
				{
				console && console.error(this.options.texts[this.options.lang].error1.replace('%s', this.tagName));
				return;
				}
			}

		// autoset bind_to if it is an input
		if (this.element.is(':input'))
			{
			this.options.bind_to = this.options.bind_to || this.element;
			}

		// init cron object
		if (this.options.bind_to)
			{
			if (this.options.bind_to.is(':input'))
				{
				// auto bind from input to object if an input, textarea ...
				this.options.bind_to.blur(function ()
				{
				var value = this.bind_get(this.options.bind_to);
				this.element.jqCronGetInstance().setCron(value);
				});
				}
			this.saved = this.bind_get(this.options.bind_to);
			this.cron = new MKWidgets.jqCronNS.jqCron(this.options, this);
			this.cron.setCron(this.saved);
			}
		else
			{
			this.cron = new MKWidgets.jqCronNS.jqCron(this.options, this);
			}
		$(this.element).data('jqCron', this.cron);
		},

});

MKWidgets.jqCronNS.jqCron = Class({
	'extends': MK.Object,

	constructor: function (options, parent)
		{
		this.options = options;
		this.widget = parent;
		this.createDom();
		this.init();
		},

	init: function ()
		{
		var n, i, list;
		if (this.initializedFlag)
			{
			return;
			}

		this.options.jquery_element || this.error(this.getText('error3'));
		this.element = this.options.jquery_element;
		this.element.append(this.domObject);
		this.domObject.data('id', this.options.id);
		this.domObject.data('jqCron', this);
		this.domObject.append(this.domBlocks);
		this.options.no_reset_button || this.domObject.append(this.domCross);
		(!this.options.disable) || this.domObject.addClass('disable');
		this.domBlocks.append(this.domBlockPeriod);
		this.domBlocks.append(this.domBlockYear);
		this.domBlocks.append(this.domBlockDayOfMonth);
		this.domBlocks.append(this.domBlockMonth);
		this.domBlocks.append(this.domBlockMins);
		this.domBlocks.append(this.domBlockDaysOfWeek);
		this.domBlocks.append(this.domBlockTime);

		// various binding
		this.domCross.on('click', $.proxy(this.domCrossClickSlot, this));

		// binding from cron to target
		this.domObject.bind('cron:change', $.proxy(
			function (evt, value)
			{
			if (!this.options.bind_to)
				{
				return;
				}
			this.widget.bind_set(this.options.bind_to, value);
			this.clearError();
			}, this));

		// PERIOD
		this.domBlockPeriod.append(this.getText('text_period'));
		this.selectorPeriod = this.newSelector(this.domBlockPeriod, false, 'period');
		this.options.enabled_minute && this.selectorPeriod.add('minute', this.getText('name_minute'));
		this.options.enabled_hour && this.selectorPeriod.add('hour', this.getText('name_hour'));
		this.options.enabled_day && this.selectorPeriod.add('day', this.getText('name_day'));
		this.options.enabled_week && this.selectorPeriod.add('week', this.getText('name_week'));
		this.options.enabled_month && this.selectorPeriod.add('month', this.getText('name_month'));
		this.options.enabled_year && this.selectorPeriod.add('year', this.getText('name_year'));
		this.selectorPeriod.element.bind('selector:change', $.proxy(
			function (e, value)
			{
			this.domBlockDayOfMonth.hide();
			this.domBlockMonth.hide();
			this.domBlockMins.hide();
			this.domBlockDaysOfWeek.hide();
			this.domBlockTime.hide();
			this.domBlockYear.hide();
			if (value == 'hour')
				{
				this.domBlockMins.show();
				}
			else if (value == 'day')
				{
				this.domBlockTime.show();
				}
			else if (value == 'week')
				{
				this.domBlockDaysOfWeek.show();
				this.domBlockTime.show();
				}
			else if (value == 'month')
				{
				this.domBlockDayOfMonth.show();
				this.domBlockTime.show();
				}
			else if (value == 'year')
				{
				this.domBlockDayOfMonth.show();
				this.domBlockMonth.show();
				this.domBlockTime.show();
				this.domBlockYear.show();
				}
			}, this));
		this.selectorPeriod.setValue(this.options.default_period);

		// MINS  (minutes)
		this.domBlockMins.append(this.getText('text_mins'));
		this.selectorMins = this.newSelector(this.domBlockMins, this.options.multiple_mins, 'minutes');
		for (i = 0, list = this.options.minutes; i < list.length; i++)
			{
			this.selectorMins.add(list[i], list[i]);
			}

		// TIME  (hour:min)
		this.domBlockTime.append(this.getText('text_time'));
		this.selectorTimeH = this.newSelector(this.domBlockTime, this.options.multiple_time_hours, 'time_hours');
		for (i = 0, list = this.options.hours; i < list.length; i++)
			{
			this.selectorTimeH.add(list[i], list[i]);
			}
		this.selectorTimeM = this.newSelector(this.domBlockTime, this.options.multiple_time_minutes, 'time_minutes');
		for (i = 0, list = this.options.minutes; i < list.length; i++)
			{
			this.selectorTimeM.add(list[i], list[i]);
			}

		// DOW  (day of week)
		this.domBlockDaysOfWeek.append(this.getText('text_dow'));
		this.selectorDow = this.newSelector(this.domBlockDaysOfWeek, this.options.multiple_dow, 'day_of_week');
		for (i = 0, list = this.getText('weekdays'); i < list.length; i++)
			{
			this.selectorDow.add(i + 1, list[i]);
			}

		// DOM  (day of month)
		this.domBlockDayOfMonth.append(this.getText('text_dom'));
		this.selectorDom = this.newSelector(this.domBlockDayOfMonth, this.options.multiple_dom, 'day_of_month');
		for (i = 0, list = this.options.monthdays; i < list.length; i++)
			{
			this.selectorDom.add(list[i], list[i]);
			}

		// MONTH  (day of week)
		this.domBlockMonth.append(this.getText('text_month'));
		this.selectorMonth = this.newSelector(this.domBlockMonth, this.options.multiple_month, 'month');
		for (i = 0, list = this.getText('months'); i < list.length; i++)
			{
			this.selectorMonth.add(i + 1, list[i]);
			}

		// YEAR (years)
		this.domBlockYear.append(this.getText('text_year'));
		this.selectorYear = this.newSelector(this.domBlockYear, this.options.multiple_year, 'year');
		for (i = (new Date).getFullYear(), list = this.getYears(); i < list.length; i++)
			{
			this.selectorYear.add(i, list[i]);
			}

		// close all selectors when we click in body
		$('body').click(
			$.proxy(function ()
			{
			var i, n = this.selectors.length;
			for (i = 0; i < n; i++)
				{
				this.selectors[i].close();
				}
			}, this));
		this.initializedFlag = true;

		// default value
		if (this.options.default_value)
			{
			this.setCron(this.options.default_value);
			}

		this.widget.jqCronInstances.push(this);
		this.element = this.domObject;
		},

	createDom: function ()
		{
		this.initializedFlag = false;
		this.domObject = $('<span class="jqCron-container"></span>');
		this.domBlocks = $('<span class="jqCron-blocks"></span>');
		this.domBlockPeriod = $('<span class="jqCron-period"></span>');
		this.domBlockYear = $('<span class="jqCron-year"></span>');
		this.domBlockDayOfMonth = $('<span class="jqCron-dom"></span>');
		this.domBlockMonth = $('<span class="jqCron-month"></span>');
		this.domBlockMins = $('<span class="jqCron-mins"></span>');
		this.domBlockDaysOfWeek = $('<span class="jqCron-dow"></span>');
		this.domBlockTime = $('<span class="jqCron-time"></span>');
		this.domCross = $('<span class="jqCron-cross">&#10008;</span>');
		this.selectors = [];

		//this.selectorPeriod;
		//this.selectorMins;
		//this.selectorTimeH;
		//this.selectorTimeM;
		//this.selectorDow;
		//this.selectorDom;
		//this.selectorMonth;
		},

	newSelector: function (block, multiple, type)
		{
		var selector = new MKWidgets.jqCronNS.Selector(this, block, multiple, type);
		selector.element.bind('selector:open', $.proxy(function ()
		{
		for (var n = this.widget.jqCronInstances.length; n--;)
			{
			if (this.widget.jqCronInstances[n] != this)
				{
				this.widget.jqCronInstances[n].closeSelectors();
				}
			else
				{
				for (var o = this.selectors.length; o--;)
					{
					if (this.selectors[o] != selector)
						{
						this.selectors[o].close();
						}
					}
				}
			}
		}, this));

		selector.element.bind('selector:change', $.proxy(
			function ()
			{
			var boundChanged = false;
			// don't propagate if not initialized
			if (!this.initializedFlag)
				{
				return;
				}
			// bind data between two minute selectors (only if they have the same multiple settings)
			if (this.options.multiple_mins == this.options.multiple_time_minutes)
				{
				if (selector == this.selectorMins)
					{
					boundChanged = this.selectorTimeM.setValue(this.selectorMins.getValue());
					}
				else if (selector == this.selectorTimeM)
					{
					boundChanged = this.selectorMins.setValue(this.selectorTimeM.getValue());
					}
				}
			// we propagate the change event to the main object
			boundChanged || this.domObject.trigger('cron:change', this.getCron());
			}, this));
		this.selectors.push(selector);
		return selector;
		},

	disable: function ()
		{
		this.domObject.addClass('disable');
		this.options.disable = true;
		this.closeSelectors();
		},

	isDisabled: function ()
		{
		return this.options.disable == true;
		},

	enable: function ()
		{
		this.domObject.removeClass('disable');
		this.options.disable = false;
		},

	getCron: function ()
		{
		var period = this.selectorPeriod.getValue();
		var items = ['*', '*', '*', '*', '*', '*'];
		if (period == 'hour')
			{
			items[0] = this.selectorMins.getCronValue();
			}
		if (period == 'day' || period == 'week' || period == 'month' || period == 'year')
			{
			items[0] = this.selectorTimeM.getCronValue();
			items[1] = this.selectorTimeH.getCronValue();
			}
		if (period == 'month' || period == 'year')
			{
			items[2] = this.selectorDom.getCronValue();
			}
		if (period == 'year')
			{
			items[3] = this.selectorMonth.getCronValue();
			items[5] = this.selectorYear.getCronValue();
			}
		if (period == 'week')
			{
			items[4] = this.selectorDow.getCronValue();
			}
		return items.join(' ');
		},


	setCron: function (str)
		{
		if (!str)
			{
			return;
			}
		try
			{
			str = str.replace(/\s+/g, ' ').replace(/^ +/, '').replace(/ +$/, ''); // sanitize
			var mask = str.replace(/[^\* ]/g, '-').replace(/-+/g, '-').replace(/ +/g, '');
			var items = str.split(' ');
			if (items.length != 6)
				{
				this.error(this.getText('error2'));
				}
			if (mask == '******')
				{
				this.selectorPeriod.setValue('minute');
				}
			else if (mask == '-*****')
				{
				this.selectorPeriod.setValue('hour');
				this.selectorMins.setCronValue(items[0]);
				this.selectorTimeM.setCronValue(items[0]);
				}
			else if (mask.substring(2, mask.length) == '****')
				{
				this.selectorPeriod.setValue('day');
				this.selectorMins.setCronValue(items[0]);
				this.selectorTimeM.setCronValue(items[0]);
				this.selectorTimeH.setCronValue(items[1]);
				}
			else if (mask.substring(2, mask.length) == '-***')
				{
				this.selectorPeriod.setValue('month');
				this.selectorMins.setCronValue(items[0]);
				this.selectorTimeM.setCronValue(items[0]);
				this.selectorTimeH.setCronValue(items[1]);
				this.selectorDom.setCronValue(items[2]);
				}
			else if (mask.substring(2, mask.length) == '**-*')
				{			// 4 possibilities
				this.selectorPeriod.setValue('week');
				this.selectorMins.setCronValue(items[0]);
				this.selectorTimeM.setCronValue(items[0]);
				this.selectorTimeH.setCronValue(items[1]);
				this.selectorDow.setCronValue(items[4]);
				}
			else if (mask.substring(3, mask.length) == '-**' || mask.substring(5, mask.length) == '-')
				{			// 8 possibilities
				this.selectorPeriod.setValue('year');
				this.selectorMins.setCronValue(items[0]);
				this.selectorTimeM.setCronValue(items[0]);
				this.selectorTimeH.setCronValue(items[1]);
				this.selectorDom.setCronValue(items[2]);
				this.selectorMonth.setCronValue(items[3]);
				this.selectorYear.setCronValue(items[5]);
				}
			else
				{
				this.error(this.getText('error4'));
				}
			this.clearError();
			}
		catch (e)
			{
			}
		},

	closeSelectors: function ()
		{
		for (var n = this.selectors.length; n--;)
			{
			this.selectors[n].close();
			}
		},

	getId: function ()
		{
		return this.element.attr('id');
		},

	getText: function (key)
		{
		var text = this.options.texts[this.options.lang][key] || null;
		if (typeof(text) == "string" && text.match('<b'))
			{
			text = text.replace(/(<b *\/>)/gi, '</span><b /><span class="jqCron-text">');
			text = '<span class="jqCron-text">' + text + '</span>';
			}
		return text;
		},

	getYears: function ()
		{
		var currentYear = (new Date).getFullYear(),
			years = [];
		years[currentYear] = currentYear;
		for (i = 1; i < this.widget.yearsCount; i++)
			{
			years[currentYear + i] = currentYear + i;
			}
		return years;
		},

	getHumanText: function ()
		{
		var texts = [];
		this.domObject
			.find('> span > span:visible')
			.find('.jqCron-text, .jqCron-selector > span')
			.each(function ()
			{
			var text = $(this).text().replace(/\s+$/g, '').replace(/^\s+/g, '');
			text && texts.push(text);
			});
		return texts.join(' ').replace(/\s:\s/g, ':');
		},

	getSettings: function ()
		{
		return this.options;
		},

	error: function (msg)
		{
		console && console.error('[jqCron Error] ' + msg);
		this.domObject.addClass('jqCron-error').attr('title', msg);
		throw msg;
		},

	clearError: function ()
		{
		this.domObject.attr('title', '').removeClass('jqCron-error');
		},

	clear: function ()
		{
		this.selectorDom.setValue([]);
		this.selectorDow.setValue([]);
		this.selectorMins.setValue([]);
		this.selectorMonth.setValue([]);
		this.selectorTimeH.setValue([]);
		this.selectorTimeM.setValue([]);
		this.selectorYear.setValue([]);

		this.triggerChange();
		},

	domCrossClickSlot: function ()
		{
		this.isDisabled() || this.clear();
		},

	triggerChange: function ()
		{
		this.domObject.trigger('cron:change', this.getCron());
		},


});

/**
 * jqCronSelector class
 */

MKWidgets.jqCronNS.Selector = Class({
	'extends': MK.Object,
	constructor: function (widget, block, multiple, type)
		{
		//this.setOptions({
		//    disable: false,
		//
		//});
		this.options = widget.options;
		this.widget = widget;
		this.block = block;
		this.miltiple = multiple;
		this.type = type;
		this.createDom();
		this.init();
		},

	createDom: function ()
		{
		this.domList = $('<ul class="jqCron-selector-list"></ul>');
		this.domTitle = $('<span class="jqCron-selector-title"></span>');
		this.domSelector = $('<span class="jqCron-selector"></span>');
		this.values = {};
		this.value = [];
		this.hasNumericTexts = true;
		this.numericZeroPad = this.widget.getSettings().numeric_zero_pad;
		},

	init: function ()
		{
		this.element = this.domSelector;
		this.block.find('b:eq(0)').after(this.domSelector).remove();
		this.domSelector
			.addClass('jqCron-selector-' + this.block.find('.jqCron-selector').length)
			.append(this.domTitle)
			.append(this.domList)
			.bind('selector:open', $.proxy(function ()
			{
			if (this.hasNumericTexts)
				{
				var nbcols = 1, n = this.domList.find('li').length;
				if (n > 5 && n <= 16)
					{
					nbcols = 2;
					}
				else if (n > 16 && n <= 23)
					{
					nbcols = 3;
					}
				else if (n > 23 && n <= 40)
					{
					nbcols = 4;
					}
				else if (n > 40)
					{
					nbcols = 5;
					}
				this.domList.addClass('cols' + nbcols);
				}
			this.domList.show();
			}, this))
			.bind('selector:close', $.proxy(function ()
			{
			this.domList.hide();
			}, this))
			.bind('selector:change', $.proxy(function ()
			{
			this.domTitle.html(this.getTitleText());
			}, this))
			.click($.proxy(function (e)
			{
			e.stopPropagation();
			}, this))
			.trigger('selector:change')
		;
		$.fn.disableSelection && this.domSelector.disableSelection(); // only work with jQuery UI
		this.domTitle.click($.proxy(function (e)
		{
		(this.isOpened() || this.widget.isDisabled()) ? this.close() : this.open();
		}, this));
		this.close();
		this.clear();
		},

	array_unique: function (l)
		{
		var i = 0, n = l.length, k = {}, a = [];
		while (i < n)
			{
			k[l[i]] || (k[l[i]] = 1 && a.push(l[i]));
			i++;
			}
		return a;
		},

	getValue: function ()
		{
		return this.miltiple ? this.value : this.value[0];
		},

	// get a correct string for cron
	getCronValue: function ()
		{
		if (this.value.length == 0)
			{
			return '*';
			}
		var cron = [this.value[0]], i, s = this.value[0], c = this.value[0], n = this.value.length;
		for (i = 1; i < n; i++)
			{
			if (this.value[i] == c + 1)
				{
				c = this.value[i];
				cron[cron.length - 1] = s + '-' + c;
				}
			else
				{
				s = c = this.value[i];
				cron.push(c);
				}
			}
		return cron.join(',');
		},

	// set the cron value
	setCronValue: function (str)
		{
		var values = [], m, i, n;
		if (str !== '*')
			{
			while (str != '')
				{
				// test "*/n" expression
				m = str.match(/^\*\/([0-9]+),?/);
				if (m && m.length == 2)
					{
					for (i = 0; i <= 59; i += (m[1] | 0))
						{
						values.push(i);
						}
					str = str.replace(m[0], '');
					continue;
					}
				// test "a-b/n" expression
				m = str.match(/^([0-9]+)-([0-9]+)\/([0-9]+),?/);
				if (m && m.length == 4)
					{
					for (i = (m[1] | 0); i <= (m[2] | 0); i += (m[3] | 0))
						{
						values.push(i);
						}
					str = str.replace(m[0], '');
					continue;
					}
				// test "a-b" expression
				m = str.match(/^([0-9]+)-([0-9]+),?/);
				if (m && m.length == 3)
					{
					for (i = (m[1] | 0); i <= (m[2] | 0); i++)
						{
						values.push(i);
						}
					str = str.replace(m[0], '');
					continue;
					}
				// test "c" expression
				m = str.match(/^([0-9]+),?/);
				if (m && m.length == 2)
					{
					values.push(m[1] | 0);
					str = str.replace(m[0], '');
					continue;
					}
				// something goes wrong in the expression
				return;
				}
			}
		this.setValue(values);
		},

	// close the selector
	close: function ()
		{
		this.domSelector.trigger('selector:close');
		},

	// open the selector
	open: function ()
		{
		this.domSelector.trigger('selector:open');
		},

	// whether the selector is open
	isOpened: function ()
		{
		return this.domList.is(':visible');
		},

	// add a selected value to the list
	addValue: function (key)
		{
		var values = this.miltiple ? this.value.slice(0) : []; // clone array
		values.push(key);
		this.setValue(values);
		},

	// remove a selected value from the list
	removeValue: function (key)
		{
		if (this.miltiple)
			{
			var i, newValue = [];
			for (i = 0; i < this.value.length; i++)
				{
				if (key != [this.value[i]])
					{
					newValue.push(this.value[i]);
					}
				}
			this.setValue(newValue);
			}
		else
			{
			this.clear();
			}
		},

	// set the selected value(s) of the list
	setValue: function (keys)
		{
		var i, newKeys = [], saved = this.value.join(' ');
		if (!$.isArray(keys))
			{
			keys = [keys];
			}
		this.domList.find('li').removeClass('selected');
		keys = this.array_unique(keys);
		keys.sort(function (a, b)
		{
		var ta = typeof(a);
		var tb = typeof(b);
		if (ta == tb && ta == "number")
			{
			return a - b;
			}
		else
			{
			return String(a) == String(b) ? 0 : (String(a) < String(b) ? -1 : 1);
			}
		});
		if (this.miltiple)
			{
			for (i = 0; i < keys.length; i++)
				{
				if (keys[i] in this.values)
					{
					this.values[keys[i]].addClass('selected');
					newKeys.push(keys[i]);
					}
				}
			}
		else
			{
			if (keys[0] in this.values)
				{
				this.values[keys[0]].addClass('selected');
				newKeys.push(keys[0]);
				}
			}
		// remove unallowed values
		this.value = newKeys;
		if (saved != this.value.join(' '))
			{
			this.domSelector.trigger('selector:change', this.miltiple ? keys : keys[0]);
			return true;
			}
		return false;
		},

	getValueText: function (key)
		{
		return (key in this.values) ? this.values[key].text() : key;
		},

	// get the title text
	getTitleText: function ()
		{


		if (this.value.length == 0)
			{
			return this.widget.getText('empty_' + this.type) || this.widget.getText('empty');
			}
		var cron = [this.getValueText(this.value[0])], i, s = this.value[0], c = this.value[0], n = this.value.length;
		for (i = 1; i < n; i++)
			{
			if (this.value[i] == c + 1)
				{
				c = this.value[i];
				cron[cron.length - 1] = this.getValueText(s) + '-' + this.getValueText(c);
				}
			else
				{
				s = c = this.value[i];
				cron.push(this.getValueText(c));
				}
			}
		return cron.join(',');
		},

	// clear list
	clear: function ()
		{
		this.values = {};
		this.setValue([]);
		this.domList.empty();
		},

	// add a (key, value) pair
	add: function (key, value)
		{
		if (!(value + '').match(/^[0-9]+$/))
			{
			this.hasNumericTexts = false;
			}
		if (this.numericZeroPad && this.hasNumericTexts && value < 10)
			{
			value = '0' + value;
			}
		var $item = $('<li>' + value + '</li>');
		this.domList.append($item);
		this.values[key] = $item;
		$item.click($.proxy(function ()
		{
		if (this.miltiple && $(this).hasClass('selected'))
			{
			this.removeValue(key);
			}
		else
			{
			this.addValue(key);
			if (!this.miltiple)
				{
				this.close();
				}
			}
		}, this));
		},

});


(function ($)
	{
	$.extend($.expr[':'], {
		container: function (a)
			{
			return (a.tagName + '').toLowerCase() in {
					a: 1,
					abbr: 1,
					acronym: 1,
					address: 1,
					b: 1,
					big: 1,
					blockquote: 1,
					button: 1,
					cite: 1,
					code: 1,
					dd: 1,
					del: 1,
					dfn: 1,
					div: 1,
					dt: 1,
					em: 1,
					fieldset: 1,
					form: 1,
					h1: 1,
					h2: 1,
					h3: 1,
					h4: 1,
					h5: 1,
					h6: 1,
					i: 1,
					ins: 1,
					kbd: 1,
					label: 1,
					li: 1,
					p: 1,
					pre: 1,
					q: 1,
					samp: 1,
					small: 1,
					span: 1,
					strong: 1,
					sub: 1,
					sup: 1,
					td: 1,
					tt: 1
				};
			},
		autoclose: function (a)
			{
			return (a.tagName + '').toLowerCase() in {
					area: 1,
					base: 1,
					basefont: 1,
					br: 1,
					col: 1,
					frame: 1,
					hr: 1,
					img: 1,
					input: 1,
					link: 1,
					meta: 1,
					param: 1
				};
			}
	});
	}).call(this, jQuery);