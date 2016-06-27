var MKWidgets = MKWidgets || {};
MKWidgets.CrudTableNS = MKWidgets.CrudTableNS || {};
MKWidgets.CrudTableNS.InputItemNS = MKWidgets.CrudTableNS.InputItemNS || {};

MKWidgets.CrudTableNS.InputItem = Class({
		extends: MKWidget,
		value: null,
		oldValue: null,
		nullSymbol: "-",

		constructor: function (elementSelector, options)
			{
			MKWidget.prototype.constructor.apply(this, [elementSelector, options]);
			this.setOptions({
				type: "varchar",

				formData: {},
				formIndex: "",

				notNull: false,

				default: "",
				dict: {},				//select
				dictConfig: {},			//select
				validation: {
					min: -Infinity,		//int, float
					max: Infinity,		//int, float
					minLen: 0,			//varchar, text
					maxLen: Infinity,	//varchar, text
					minDate: "",		//date
					maxDate: "",		//date
				},
			});
			this.setOptions(options);

			this.bindNode('errorText', this.element, this.errorBinder);
			},

		errorBinder: {
			on: null,
			setValue: function (value, options)
				{
				if (value.length > 0)
					{
					$(this).attr('title', value);
					}
				else
					{
					$(this).removeAttr('title');
					}
				}
		},

		linkPropValue: function ()
			{
			this.value = this.options.formData[this.options.formIndex];
			//this.linkProps("value", [this.options.formData, this.options.formIndex]);
			//this.options.formData.linkProps(this.options.formIndex, [this, 'value']);
			this.on('change:value',
				function (event)
				{
				this.options.formData.jset(this.options.formIndex, this.value);
				var newValue = event.value;
				if (event.value != event.previousValue)
					{
					this.preValidate()
					}
				});
			this.value = this.options.formData[this.options.formIndex];
			},

		cancel: function ()
			{
			},

		save: function ()
			{
			},

		init: function ()
			{
			},

		createField: function ()
			{
			},

		preValidate: function ()
			{
			if (this.options.notNull == true || !(this.value == '' || this.value == undefined || this.value == this.nullSymbol))
				{
				return this.validate();
				}
			else
				{
				this.errorCode = null;
				return this.itemValidate();
				}
			},

		validate: function ()
			{
			this.errorCode = null;
			return this.itemValidate();
			},

		itemValidate: function ()
			{
			if (this.errorCode == null)
				{
				this.errorText = "";
				return true;
				}
			this.errorText = this.errors[this.errorCode];
			return false;
			},

		itemCancel: function ()
			{
			this.cancel();
			},

		itemSave: function ()
			{
			this.save();
			return this.isValueChanged();
			},

		isValueChanged: function ()
			{
			if (this.oldValue != this.value)
				{
				return true;
				}
			return false;
			},
	},
	{
		factory: function (elementSelector, options)
			{
			var inputItem = null;
			if (options.type == "varchar")
				{
				inputItem = new MKWidgets.CrudTableNS.InputItemNS.Varchar(elementSelector, options);
				}
			else if (options.type == 'integer')
				{
				inputItem = new MKWidgets.CrudTableNS.InputItemNS.Integer(elementSelector, options);
				}
			else if (options.type == 'select')
				{
				inputItem = new MKWidgets.CrudTableNS.InputItemNS.Select(elementSelector, options);
				}
			else if (options.type == 'float')
				{
				inputItem = new MKWidgets.CrudTableNS.InputItemNS.Float(elementSelector, options);
				}
			else if (options.type == 'dependsSelect')
				{
				inputItem = new MKWidgets.CrudTableNS.InputItemNS.DependsSelect(elementSelector, options);
				}
			else if (options.type == 'date')
				{
				inputItem = new MKWidgets.CrudTableNS.InputItemNS.Date(elementSelector, options);
				}
			else if (options.type == 'cron')
				{
				inputItem = new MKWidgets.CrudTableNS.InputItemNS.Cron(elementSelector, options);
				}
			else if (inputItem == null)
				{
				inputItem = new MKWidgets.CrudTableNS.InputItem(elementSelector, options);
				}

			inputItem.linkPropValue();
			inputItem.init();

			return inputItem;
			}
	});

MKWidgets.CrudTableNS.InputItemNS.Float = Class({
	extends: MKWidgets.CrudTableNS.InputItem,

	constructor: function (elementSelector, options)
		{
		MKWidgets.CrudTableNS.InputItem.prototype.constructor.apply(this, [elementSelector, options]);
		this.setOptions({
			default: "",
			validation: {
				minVal: 0,			//varchar, text
				maxVal: Infinity,	//varchar, text
			},
		});
		this.setOptions(options);
		},

	init: function ()
		{
		this.errors = {
			minVal: "Значение должно быть больше или равно " + this.options.validation.minLen,
			maxVal: "Значение должно быть меньше или равно " + this.options.validation.maxLen,
			notFloat: "Значение должно быть вещественным числом"
		};
		},

	createField: function ()
		{
		this.oldValue = this.value;
		this.domInput = $('<input />')
			.addClass('input-item-float');
		if (this.value == '-')
			{
			this.value = '';
			}
		this.bindNode("value", this.domInput);
		this.element.empty().append(this.domInput);
		this.domInput.focus();
		},

	validate: function ()
		{
		this.errorCode = null;
		if (this.value < this.options.validation.minVal)
			{
			this.errorCode = 'minVal';
			}
		if (this.value > this.options.validation.maxVal)
			{
			this.errorCode = 'maxVal';
			}
		if (parseFloat(this.value.replace(",", ".")) == NaN)
			{
			this.errorCode = 'notFloat';
			}
		return this.itemValidate();
		},

	cancel: function ()
		{
		this.element.empty().html(this.oldValue);
		},

	save: function ()
		{
		this.element.empty().html(this.value);
		}
});


MKWidgets.CrudTableNS.InputItemNS.Varchar = Class({
	extends: MKWidgets.CrudTableNS.InputItem,

	constructor: function (elementSelector, options)
		{
		MKWidgets.CrudTableNS.InputItem.prototype.constructor.apply(this, [elementSelector, options]);
		this.setOptions({
			default: "",
			validation: {
				minLen: 0,			//varchar, text
				maxLen: Infinity,	//varchar, text
			},
		});
		this.setOptions(options);
		},

	init: function ()
		{
		this.errors = {
			minLen: "Длина значения должна быть больше или равна " + this.options.validation.minLen + " символов",
			maxLen: "Длина значения должна быть меньше или равна " + this.options.validation.maxLen + " символов",
		};
		},

	createField: function ()
		{
		this.oldValue = this.value;
		this.domInput = $('<input />')
			.addClass('input-item-varchar');
		this.bindNode("value", this.domInput);
		this.element.empty().append(this.domInput);
		this.domInput.focus();
		},

	validate: function ()
		{
		this.errorCode = null;
		if (this.value.length < this.options.validation.minLen)
			{
			this.errorCode = 'minLen';
			}
		if (this.value.length > this.options.validation.maxLen)
			{
			this.errorCode = 'maxLen';
			}
		return this.itemValidate();
		},

	cancel: function ()
		{
		this.element.empty().html(this.oldValue);
		},

	save: function ()
		{
		this.element.empty().html(this.value);
		},
});

MKWidgets.CrudTableNS.InputItemNS.Integer = Class({
	extends: MKWidgets.CrudTableNS.InputItem,

	constructor: function (elementSelector, options)
		{
		MKWidgets.CrudTableNS.InputItem.prototype.constructor.apply(this, [elementSelector, options]);
		this.setOptions({
			default: "",
			validation: {
				minVal: -Infinity,			//varchar, text
				maxVal: Infinity,	//varchar, text
			},
		});
		this.setOptions(options);
		},

	init: function ()
		{
		this.errors = {
			minVal: "Длина значения должна быть больше или равна " + this.options.validation.minLen + " символов",
			maxVal: "Длина значения должна быть меньше или равна " + this.options.validation.maxLen + " символов",
			notInt: "Введенные данные не являются числовым значением"
		};
		},

	createField: function ()
		{
		this.oldValue = this.value;
		this.domInput = $('<input />')
			.addClass('input-item-integer');
		this.bindNode("value", this.domInput);
		this.element.empty().append(this.domInput);
		this.domInput.focus();
		},

	validate: function ()
		{
		this.errorCode = null;
		if (this.value < this.options.validation.minVal)
			{
			this.errorCode = 'minVal';
			}
		if (this.value > this.options.validation.maxVal)
			{
			this.errorCode = 'maxVal';
			}
		if (!this.isInt(this.value))
			{
			this.errorCode = 'notInt';
			}
		return this.itemValidate();
		},

	isInt: function (value)
		{
		var er = /^-?[0-9]+$/;
		return er.test(value);
		},

	cancel: function ()
		{
		this.element.empty().html(this.oldValue);
		},

	save: function ()
		{
		this.element.empty().html(this.value);
		}
});

MKWidgets.CrudTableNS.InputItemNS.Cron = Class({
	extends: MKWidgets.CrudTableNS.InputItem,

	constructor: function (elementSelector, options)
		{
		MKWidgets.CrudTableNS.InputItem.prototype.constructor.apply(this, [elementSelector, options]);
		this.setOptions({
			default: "",
			validation: {
				minVal: 0,			//varchar, text
				maxVal: Infinity,	//varchar, text
			},
		});
		this.setOptions(options);
		},

	init: function ()
		{
		this.errors = {
			incFor: "Неверный формат крон выражения!",
		};
		},

	createField: function ()
		{
		this.oldValue = this.value;
		this.domCron = $('<div/>').addClass('tusur-csp-cron-container');

		if (this.oldValue == null || this.oldValue == undefined || this.oldValue == this.nullSymbol)
			{
			this.oldValue = '* * * * * *';
			}

		this.cron = new MKWidgets.jqCron(this.domCron, {
			enabled_minute: true,
			multiple_dom: true,
			multiple_month: true,
			multiple_mins: true,
			multiple_dow: true,
			multiple_time_hours: true,
			multiple_time_minutes: true,
			default_value: this.oldValue,
			default_period: 'week',
			no_reset_button: false,
			bind_to: $(this)
		});

		this.domTitle = $("<input/>").addClass('tusur-csp-cron-popup-title table-view');
		//$(this).on('value-changed', $.proxy(this.changeValueSlot, this));
		this.popup = new MKWidgets.PopupNS.Tooltip(this.domTitle, {
			dynamicElement: this.domCron,
			positionElement: this.element,
			parentWidth: true,
			indent: 10,
			linkVertical: 'top',
			linkHorizontal: 'left',
			linkingPoint: 'topLeft'
		});

		this.popup.openPopup();

		this.popup.on('close-popup',
			function ()
			{
			this.trigger('saveEvent');
			}, this);

		this.cron.on('value-changed', this.updateTitle, true, this);
		},

	updateTitle: function ()
		{
		this.value = this.cron.getValue();
		//console.log('Значение крона: ' + this.value);
		var title = this.domCron.clone();
		title.find('ul').remove();
		this.domTitle.append(title);
		//title.find('.jqCron-blocks').children('[style*="display: none"]').remove();
		title.find('.jqCron-cross').remove();
		title.hide();
		this.domTitle
			.prop('disabled', true)
			.val(title.text())
			.attr('title', title.text())
		;
		},

	validate: function ()
		{
		this.errorCode = null;
		//if(this.value == undefined)
		//	{
		//	this.errorCode = 'noCron';
		//	return this.itemValidate();
		//	}
		if (this.value.split(' ').length != 6)
			{
			this.errorCode = 'incFor';
			}
		//if (this.value > this.options.validation.maxVal)
		//{
		//    this.errorCode = 'maxVal';
		//}
		//if (parseInt(this.value) == NaN)
		//{
		//    this.errorCode = 'notInt';
		//}
		return this.itemValidate();
		},

	cancel: function ()
		{
		this.element.empty().html(this.oldValue);
		},

	save: function ()
		{
		this.element.empty().html(this.value);
		}
});

MKWidgets.CrudTableNS.InputItemNS.Select = Class({
	extends: MKWidgets.CrudTableNS.InputItem,
	noItem: {},

	constructor: function (elementSelector, options)
		{
		MKWidgets.CrudTableNS.InputItem.prototype.constructor.apply(this, [elementSelector, options]);
		this.setOptions({
			default: "",
			data: "",
			validation: {
				minVal: 0,			//varchar, text
				maxVal: Infinity,	//varchar, text
			},
			dict: null,
			dictConfig: {},
			formData: {},
			formIndex: "",
			dict_url: "",
			index: "",
		});
		this.setOptions(options);

		},

	linkPropValue: function ()
		{
		},

	linkPropValueSelect: function ()
		{
		this.value = this.options.formData[this.dictConfig.formIdIndex];
		this.displayValue = this.options.formData[this.dictConfig.formDisplayIndex]
		//this.dictItem = this.findItemById(this.value);
		//this.displayValue = this.dictItem[this.dictConfig.dictDisplayIndex];

		this.on('change:value',
			function (event)
			{
			this.options.formData.jset(this.dictConfig.formIdIndex, this.value);
			var displayItem = this.selectWidget.selectedOption;
			if (displayItem != null)
				{
				this.displayValue = displayItem[this.dictConfig.dictDisplayIndex];
				this.options.formData.jset(this.dictConfig.formDisplayIndex, this.displayValue);
				}

			var newValue = event.value;

			if (event.value != event.previousValue)
				{
				this.validate();
				}
			}, this);
		},

	init: function ()
		{
		this.dictConfig = this.options.dictConfig;
		if (this.dictConfig.formIdIndex == undefined)
			{
			this.dictConfig.formIdIndex = this.dictConfig.dictIdIndex;
			}
		if (this.dictConfig.formDisplayIndex == undefined)
			{
			this.dictConfig.formDisplayIndex = this.options.formIndex;
			}
		if (this.dictConfig.dictName == undefined)
			{
			this.dictConfig.dictName = this.options.formIndex;
			}

		this.linkPropValueSelect();

		this.selectWidget = new MKWidgets.Select(this.element, {
			dictConfig: this.dictConfig,
			value: this.value,
			renderOnInit: false,
			customClass: 'table-item',
			popupOptions: {
				positionCorrections: {top: -13, left: -11},
				background: true,
				parentWidth: true
			}
		});

		this.errors = {
			noValue: "Не выбрано значение",
		};
		},

	createField: function ()
		{
		if (this.displayValue != null)
			{
			this.oldDisplayValue = this.displayValue;
			}
		else
			{
			this.oldDisplayValue = '-';
			}

		this.element.empty();
		this.selectWidget.render();
		this.selectWidget.showList = true;

		this.linkProps('value', 'selectWidget.value');

		this.selectWidget.on('change:showList',
			function ()
			{
			if (this.selectWidget.showList == false && this.displayValue == this.oldDisplayValue)
				{
				this.cancel();
				}
			}, this);
		this.on('selectWidget@hideList',
			function ()
			{
			this.trigger('saveEvent');
			});
		},

	validate: function ()
		{
		this.errorCode = null;

		//this.dictItem = this.findItemById(this.value);
		this.dictItem = this.selectWidget.selectedOption;

		if (this.dictItem != null)
			{
			this.displayValue = this.dictItem[this.dictConfig.dictDisplayIndex];
			}
		else
			{
			this.errorCode = 'noValue';
			this.displayValue = '-';
			}

		if (this.value == undefined)
			{
			this.errorCode = 'noValue';
			}
		return this.itemValidate();
		},

	cancel: function ()
		{
		this.selectWidget.deleteSelect();
		this.element.empty().html(this.oldDisplayValue);
		},

	save: function ()
		{
		this.element.empty().html(this.displayValue);
		this.selectWidget.deleteSelect();
		},

});

MKWidgets.CrudTableNS.InputItemNS.DependsSelect = Class({
	extends: MKWidgets.CrudTableNS.InputItemNS.Select,
	noItem: {},

	constructor: function (elementSelector, options)
		{
		MKWidgets.CrudTableNS.InputItemNS.Select.prototype.constructor.apply(this, [elementSelector, options]);
		this.setOptions({
			default: "",
			data: "",
			validation: {
				minVal: 0,			//varchar, text
				maxVal: Infinity,	//varchar, text
			},
			dict: null,
			dictConfig: {},
			formData: {},
			formIndex: "",
			dict_url: "",
			index: "",
			defaultText: "Выберите значение",
			noValues: "Нет значений"
		});
		this.setOptions(options);
		},

	init: function ()
		{
		this.dictConfig = this.options.dictConfig;
		if (this.dictConfig.formIdIndex == undefined)
			{
			this.dictConfig.formIdIndex = this.dictConfig.dictIdIndex;
			}
		if (this.dictConfig.formDisplayIndex == undefined)
			{
			this.dictConfig.formDisplayIndex = this.options.formIndex;
			}
		if (this.dictConfig.dictName == undefined)
			{
			this.dictConfig.dictName = this.options.formIndex;
			}

		this.linkPropValueSelect();

		for (var i in this.dictConfig.depend)
			{
			this.dictConfig.depend[i].object = this.options.formData;
			}

		this.selectWidget = new MKWidgets.DependsSelect(this.element, {
			dictConfig: this.dictConfig,
			value: this.value,
			customClass: 'table-item',
			renderOnInit: false,
			popupOptions: {
				positionCorrections: {top: -13, left: -11},
				background: true,
				parentWidth: true,
				positionElement: this.element
			}
		});

		//this.selectWidget.on('recreateArray', function(){
		//	if(this.selectWidget.optionsList.length == 0)
		//		{
		//		this.element.empty().html(this.options.noValues);
		//		}
		//}, this);


		this.errors = {
			noValue: "Не выбрано значение",
			notInParent: "Выбранное значение недоступно ввиду ограничения зависимостью"
		};
		},

	createField: function ()
		{
		if (this.displayValue != null)
			{
			this.oldDisplayValue = this.displayValue;
			}
		else
			{
			this.oldDisplayValue = '-';
			}

		this.element.empty();
		this.selectWidget.render();
		this.selectWidget.showList = true;

		this.linkProps('value', 'selectWidget.value');

		this.selectWidget.on('change:showList',
			function ()
			{
			if (this.selectWidget.showList == false && this.displayValue == this.oldDisplayValue)
				{
				this.trigger('cancelEvent');
				//this.cancel();
				}
			}, this);
		this.on('selectWidget@hideList',
			function ()
			{
			this.trigger('saveEvent');
			});
		},

	validate: function ()
		{
		this.errorCode = null;

		this.dictItem = this.selectWidget.selectedOption;

		if (this.dictItem != null)
			{
			this.displayValue = this.dictItem[this.dictConfig.dictDisplayIndex];
			}
		else
			{
			this.errorCode = 'noValue';
			this.displayValue = '-';
			}

		if (this.value == undefined)
			{
			this.errorCode = 'noValue';
			}
		if (this.dictItem != undefined)
			{
			for (i in this.options.dictConfig.depend)
				{
				var objectIndex = this.options.dictConfig.depend[i].objectIdIndex,
					dictIndex = this.options.dictConfig.depend[i].dictIdIndex,
					formDependId = this.options.formData[objectIndex],
					dictDependId = this.dictItem[dictIndex];

				//var formDependIdIndex = this.options.dictConfig.formDependIdIndex,
				//	formDependId = this.options.formData[formDependIdIndex],
				//	dictDependId = this.dictItem[this.options.dictConfig.dictDependIdIndex];
				if (dictDependId != formDependId)
					{
					this.errorCode = 'noInParent';
					//this.element.empty().html(this.options.defaultText);
					}
				}
			}

		return this.itemValidate();
		},

	cancel: function ()
		{
		this.selectWidget.deleteSelect();
		this.element.empty().html(this.oldDisplayValue);
		},

	save: function ()
		{
		this.element.empty().html(this.displayValue);
		this.selectWidget.deleteSelect();
		}
});

MKWidgets.CrudTableNS.InputItemNS.Date = Class({
	extends: MKWidgets.CrudTableNS.InputItem,

	constructor: function (elementSelector, options)
		{
		MKWidgets.CrudTableNS.InputItem.prototype.constructor.apply(this, [elementSelector, options]);
		this.setOptions({
			default: "",
		});
		this.setOptions(options);
		},

	init: function ()
		{
		this.errors = {};
		},

	parseDates: function()
		{
		var separator,
			startDate = '',
			endDate = '';
		if(this.options.dictConfig.separator != undefined)
			{
			separator = this.options.dictConfig.separator;
			}
		else
			{
			separator = ' - ';
			}
		var dates = this.oldValue.split(separator);
		startDate = dates[0];
		if(dates[1] != undefined)
			{
			endDate = dates[1];
			}
		return {
			"startDate": startDate,
			"endDate": endDate
		};
		},

	createField: function ()
		{
		this.oldValue = this.value;
		this.domInput = $('<input />')
			.addClass('input-item-date');
		this.bindNode("value", this.domInput);
		this.domInputContainer = $('<div/>').append(this.domInput);
		this.element.empty().append(this.domInputContainer);

		var dates = this.parseDates();

		this.datePicker = new MKWidgets.DateRangePicker(this.domInput, $.extend({
			parentElement: this.element,
			parentWidth: true,
			startDate: this.oldValue,
			endDate: dates.endDate,

			locales: {
				ru: {
					format: "YYYY-MM-DD"
				}
			},
			popupConfigs: {
				positionCorrections: {top: -6, left: -7},
			}
		}, this.options.dictConfig));

		this.domInput.focus();
		this.bindNode("value", this.domInput);
		this.datePicker.on('calendar-hide', function ()
		{
		this.value = this.domInput.val();
		this.trigger('saveEvent');
		}, this);
		},

	validate: function ()
		{
		this.errorCode = null;

		return this.itemValidate();
		},

	cancel: function ()
		{
		this.element.empty().html(this.oldValue);
		},

	save: function ()
		{
		this.element.empty().html(this.value);
		}
});
