var MKWidgets = MKWidgets || {};
MKWidgets.CrudFormNS = MKWidgets.CrudFormNS || {};
MKWidgets.CrudFormNS.InputItemNS = MKWidgets.CrudFormNS.InputItemNS || {};

MKWidgets.CrudFormNS.InputItem = Class({
		extends: MKWidget,

		value: null,
		oldValue: null,
		allowValidate: false,

		constructor: function (elementSelector, options)
			{
			MKWidget.prototype.constructor.apply(this, [elementSelector, options]);
			this.setOptions({
				type: "varchar",

				formData: {},
				formIndex: "",

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

			this.createDom();

			this.bindNode('errorText', this.domInputItem, this.errorBinder);
			},

		createDom: function ()
			{
			this.domLabel = $('<label/>').addClass('tusur-csp-form-label').text(this.options.title);
			this.domInputItem = $('<div/>').addClass('tusur-csp-form-input-item');

			this.element.append(this.domLabel);
			this.element.append(this.domInputItem);

			var widthClass = 'form-columns-50-50';
			if (this.options.widthClass != undefined)
				{
				widthClass = this.options.widthClass;
				}
			this.element.addClass(widthClass);
			},

		errorBinder: {
			on: null,
			setValue: function (value, options)
				{
				if (value.length > 0)
					{
					$(this).parent('.tusur-csp-form-field').attr('title', value);
					$(this).parent('.tusur-csp-form-field').addClass('error');
					}
				else
					{
					$(this).parent('.tusur-csp-form-field').removeAttr('title');
					$(this).parent('.tusur-csp-form-field').removeClass('error');
					}
				}
		},

		linkPropValue: function ()
			{
			this.value = this.options.formData[this.options.formIndex];

			this.on('change:value',
				function (event)
				{
				this.options.formData.jset(this.options.formIndex, this.value);
				var newValue = event.value;
				if (event.value != event.previousValue && this.allowValidate)
					{
					this.validate()
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
			this.afterCreateField();
			},

		afterCreateField: function ()
			{
			this.allowValidate = true;
			},

		validate: function (silent)
			{
			this.errorCode = null;
			return this.itemValidate(silent);
			},
		itemValidate: function (silent)
			{
			if (this.errorCode == null)
				{
				if (!silent)
					{
					this.errorText = "";
					}
				return true;
				}
			if (!silent)
				{
				this.errorText = this.errors[this.errorCode];
				}
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
				inputItem = new MKWidgets.CrudFormNS.InputItemNS.Varchar(elementSelector, options);
				}
			else if (options.type == 'integer')
				{
				inputItem = new MKWidgets.CrudFormNS.InputItemNS.Integer(elementSelector, options);
				}
			else if (options.type == 'float')
				{
				inputItem = new MKWidgets.CrudFormNS.InputItemNS.Float(elementSelector, options);
				}
			else if (options.type == 'select')
				{
				inputItem = new MKWidgets.CrudFormNS.InputItemNS.Select(elementSelector, options);
				}
			else if (options.type == 'dependsSelect')
				{
				inputItem = new MKWidgets.CrudFormNS.InputItemNS.DependsSelect(elementSelector, options);
				}
			else if (options.type == 'date')
				{
				inputItem = new MKWidgets.CrudFormNS.InputItemNS.Date(elementSelector, options);
				}
			else if (options.type == 'radio')
				{
				inputItem = new MKWidgets.CrudFormNS.InputItemNS.Radio(elementSelector, options);
				}
			else if (options.type == 'array')
				{
				inputItem = new MKWidgets.CrudFormNS.InputItemNS.Array(elementSelector, options);
				}
			else if (options.type == 'cron')
				{
				inputItem = new MKWidgets.CrudFormNS.InputItemNS.Cron(elementSelector, options);
				}
			else if (inputItem == null)
				{
				inputItem = new MKWidgets.CrudFormNS.InputItem(elementSelector, options);
				}

			inputItem.init();
			inputItem.linkPropValue();

			return inputItem;
			}
	});

MKWidgets.CrudFormNS.InputItemNS.Varchar = Class({
	extends: MKWidgets.CrudFormNS.InputItem,

	constructor: function (elementSelector, options)
		{
		MKWidgets.CrudFormNS.InputItem.prototype.constructor.apply(this, [elementSelector, options]);
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
		this.domInputItem.empty().append(this.domInput);
		//this.domInput.focus();

		this.afterCreateField();
		},

	validate: function (silent)
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
		return this.itemValidate(silent);
		},

	cancel: function ()
		{
		this.domInputItem.empty().html(this.oldValue);
		},

	save: function ()
		{
		this.domInputItem.empty().html(this.value);
		},
});

MKWidgets.CrudFormNS.InputItemNS.Integer = Class({
	extends: MKWidgets.CrudFormNS.InputItem,

	constructor: function (elementSelector, options)
		{
		MKWidgets.CrudFormNS.InputItem.prototype.constructor.apply(this, [elementSelector, options]);
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
			notInt: "Введенные данные не являются числовым значением"
		};
		},

	createField: function ()
		{
		this.oldValue = this.value;
		this.domInput = $('<input />')
			.addClass('input-item-integer');
		this.bindNode("value", this.domInput);
		this.domInputItem.empty().append(this.domInput);
		//this.domInput.focus();

		this.afterCreateField();
		},

	validate: function (silent)
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
		return this.itemValidate(silent);
		},

	isInt: function (value)
		{
		var er = /^-?[0-9]+$/;
		return er.test(value);
		},

	cancel: function ()
		{
		this.domInputItem.empty().html(this.oldValue);
		},

	save: function ()
		{
		this.domInputItem.empty().html(this.value);
		}
});

MKWidgets.CrudFormNS.InputItemNS.Float = Class({
	extends: MKWidgets.CrudFormNS.InputItem,

	constructor: function (elementSelector, options)
		{
		MKWidgets.CrudFormNS.InputItem.prototype.constructor.apply(this, [elementSelector, options]);
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
			notFloat: "Введенные данные не являются вещественным значением"
		};
		},

	createField: function ()
		{
		this.oldValue = this.value;
		this.domInput = $('<input />')
			.addClass('input-item-float');
		this.bindNode("value", this.domInput);
		this.domInputItem.empty().append(this.domInput);
		//this.domInput.focus();
		this.afterCreateField();
		},

	validate: function (silent)
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
		return this.itemValidate(silent);
		},

	cancel: function ()
		{
		this.domInputItem.empty().html(this.oldValue);
		},

	save: function ()
		{
		this.domInputItem.empty().html(this.value);
		}
});

MKWidgets.CrudFormNS.InputItemNS.Select = Class({
	extends: MKWidgets.CrudFormNS.InputItem,
	noItem: {},

	constructor: function (elementSelector, options)
		{
		MKWidgets.CrudFormNS.InputItem.prototype.constructor.apply(this, [elementSelector, options]);
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
		if (this.options.formData[this.dictConfig.formIdIndex] == undefined)
			{
			this.options.formData.jset(this.dictConfig.formIdIndex, null);
			}
		this.value = this.options.formData[this.dictConfig.formIdIndex];
		this.displayValue = this.options.formData[this.dictConfig.formDisplayIndex];

		//this.dictItem = this.findItemById(this.value);
		//this.displayValue = this.dictItem[this.dictConfig.dictDisplayIndex];

		this.on('change:value',
			function (event)
			{
			this.options.formData.jset(this.dictConfig.formIdIndex, this.value);
			var displayItem = this.findItemById(this.value);
			if (displayItem != null)
				{
				this.displayValue = displayItem[this.dictConfig.dictDisplayIndex];
				this.options.formData.jset(this.dictConfig.formDisplayIndex, this.displayValue);
				}
			else
				{
				console.log('input item select - dict item not found');
				}

			var newValue = event.value;

			if (event.value != event.previousValue && this.allowValidate)
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

		//this.getDict();

		this.errors = {
			noValue: "Не выбрано значение",
		};

		if (this.options.addable != undefined)
			{
			if (this.dictConfig.addableIdIndex == undefined)
				{
				this.dictConfig.addableIdIndex = this.dictConfig.dictIdIndex;
				}

			this.domCreateButton = $('<div/>').addClass('create-button');
			this.domLabel.append(this.domCreateButton);

			this.domCreateButton.on('click', $.proxy(this.createButtonClickSlot, this));
			}
		},

	createButtonClickSlot: function ()
		{
		var represent = this.options.addable.represent;
		this.options.addable.options.action = 'create';
		if (this.options.addable.parametrs == undefined)
			{
			this.options.addable.parametrs = {};
			}
		app.registrateWidgetByRepresent(represent, 'input-item-select-master-' + represent, this.options.addable.parametrs, this.options.addable.options,
			$.proxy(function (widget)
			{
			widget.on('master-success-save', this.createSuccessSlot, this);
			}, this));
		},

	createSuccessSlot: function (addedFormData)
		{
		this.selectWidget.renewDict();

		var selectedId = addedFormData[this.dictConfig.addableIdIndex];

		this.selectWidget.setSelectedOptionById(selectedId);
		},

	findItemById: function (id)
		{
		this.dict = this.selectWidget.dict;
		for (var i in this.dict)
			{
			var dictItem = this.dict[i];
			if (dictItem[this.dictConfig.dictIdIndex] == id)
				{
				return dictItem;
				}
			}
		return null;
		},

	//getDict: function ()
	//	{
	//	if (Array.isArray(this.options.dict))
	//		{
	//		this.dict = this.options.dict;
	//		}
	//	else
	//		{
	//		this.dict = window.app.getDict(this.dictConfig);
	//		}
	//	},

	createField: function ()
		{
		//this.generateSelectData();
		if (this.displayValue != null)
			{
			this.oldDisplayValue = this.displayValue;
			}
		else
			{
			this.oldDisplayValue = '-';
			}

		this.domInputItem.empty();
		this.selectWidget = new MKWidgets.Select(this.domInputItem, {
			dictConfig: this.dictConfig,
			value: this.options.formData[this.dictConfig.formIdIndex],
			popupOptions: {
				background: true,
				parentWidth: false,
			}
		});

		this.linkProps('value', 'selectWidget.value');


		this.linkPropValueSelect();
		this.afterCreateField();
		},

	validate: function (silent)
		{
		this.errorCode = null;

		this.dictItem = this.findItemById(this.value);

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
		return this.itemValidate(silent);
		},

	cancel: function ()
		{
		this.selectWidget.deleteSelect();
		this.domInputItem.empty().html(this.oldDisplayValue);
		},

	save: function ()
		{
		this.domInputItem.empty().html(this.displayValue);
		this.selectWidget.deleteSelect();
		},

});

MKWidgets.CrudFormNS.InputItemNS.DependsSelect = Class({
	extends: MKWidgets.CrudFormNS.InputItemNS.Select,

	noItem: {},

	constructor: function (elementSelector, options)
		{
		MKWidgets.CrudFormNS.InputItemNS.Select.prototype.constructor.apply(this, [elementSelector, options]);
		this.setOptions({
			default: "",
			data: "",
			validation: {
				minVal: 0,			//varchar, text
				maxVal: Infinity,	//varchar, text
			},
			dict: null,
			dictConfig: {},
			formData: new MK.Object,
			formIndex: "",
			dict_url: "",
			index: "",
			defaultText: "Выберите значение"
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

		//this.getDict();

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

		//this.dependIdIndex = this.options.dictConfig.formDependIdIndex;
		//this.dependSelectWidget.updateOptions(this.dependId);


		for (var i in this.dictConfig.depend)
			{
			//todo: recursive getting path
			if (this.dictConfig.depend[i].object === '../')
				{
				this.dictConfig.depend[i].object = this.options.formData['#parent']; //this.options.formWidget.options.parentFormData;
				}
			else if (this.dictConfig.depend[i].object === './' || this.dictConfig.depend[i].object == undefined)
				{
				this.dictConfig.depend[i].object = this.options.formData;
				}
			}

		this.domInputItem.empty();
		this.selectWidget = new MKWidgets.DependsSelect(this.domInputItem, {
			dictConfig: this.dictConfig,
			value: this.options.formData[this.dictConfig.formIdIndex],
			popupOptions: {
				background: true,
			}
		});

		this.linkProps('value', 'selectWidget.value');

		this.linkPropValueSelect();
		this.afterCreateField();
		},

	validate: function (silent)
		{
		this.errorCode = null;

		this.dictItem = this.findItemById(this.value);

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

		//todo: validate by dict
		//var formDependIdIndex = this.options.dictConfig.formDependIdIndex,
		//	formDependId = this.options.formData[formDependIdIndex],
		//	dictDependId = this.dictItem[this.options.dictConfig.dictDependIdIndex];
		//
		//if (dictDependId != formDependId)
		//	{
		//	this.errorCode = 'noInParent';
		//	this.domInputItem.empty().html(this.options.defaultText);
		//
		//	}
		return this.itemValidate(silent);
		},

	cancel: function ()
		{
		this.selectWidget.deleteSelect();
		this.domInputItem.empty().html(this.oldDisplayValue);
		},

	save: function ()
		{
		this.domInputItem.empty().html(this.displayValue);
		this.selectWidget.deleteSelect();
		}
});

MKWidgets.CrudFormNS.InputItemNS.Cron = Class({
	extends: MKWidgets.CrudFormNS.InputItem,

	constructor: function (elementSelector, options)
		{
		MKWidgets.CrudFormNS.InputItem.prototype.constructor.apply(this, [elementSelector, options]);
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
		this.errors = {};
		},

	createField: function ()
		{
		this.oldValue = this.value;
		this.initWidgets();
		this.domTitle.on('click', $.proxy(this.openPopup, this));
		this.popup.on('close-popup', this.closePopup, this);
		this.cron.on('value-changed', this.updateTitle, true, this);
		},

	openPopup: function()
		{
		this.popup.openPopup();
		this.domTitle
			.prop('disabled', true);
		this.updateTitle();
		},

	closePopup: function()
		{
		//if(this.value != undefined)
		//	{
		//	this.domTitle.val(this.value);
		//	}
		//else
		//	{
		//	this.domTitle.val(this.oldValue);
		//	}
		this.domTitle.prop('disabled', false);
		},

	initWidgets: function ()
		{
		this.domCron = $('<div/>').addClass('tusur-csp-cron-container');
		this.domTitle = $("<input/>").addClass('tusur-csp-cron-popup-title');
		this.domInputItem.empty().append(this.domTitle);
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
		this.popup = new MKWidgets.PopupNS.Tooltip(this.domTitle, {
			dynamicElement: this.domCron,
			positionElement: this.domInputItem,
			//parentWidth: true,
			returnElementToDom: true,
			indent: 10,
			linkVertical: 'top', //top, center, bottom
			linkHorizontal: 'left', //left, center, right
			linkingPoint: 'topLeft',
			//returnElementToDom: true,
		});
		},

	updateTitle: function ()
		{
		this.value = this.cron.getValue();
		console.log('Значение крона: ' + this.value);
		var title = this.domCron.clone();
		title.find('ul').remove();
		this.domTitle.append(title);
		title.find('.jqCron-blocks').children('[style*="display: none"]').remove();
		title.find('.jqCron-cross').remove();
		title.hide();
			this.domTitle
				//.prop('disabled', true)
				.val(title.text())
				.attr('title', title.text())
				;
		},

	validate: function ()
		{
		this.errorCode = null;
		//if (this.value < this.options.validation.minVal)
		//{
		//    this.errorCode = 'minVal';
		//}
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

	deleteFields: function ()
		{

		},

	cancel: function ()
		{
		//this.element.empty().html(this.oldValue);
		this.domTitle.val(this.oldValue);
		},

	save: function ()
		{
		console.log('Значение крона при сохранении: ' + this.value);
		this.domTitle.val(this.value);
		//this.element.empty().html(this.value);
		}
});

MKWidgets.CrudFormNS.InputItemNS.Date = Class({
	extends: MKWidgets.CrudFormNS.InputItem,

	constructor: function (elementSelector, options)
		{
		MKWidgets.CrudFormNS.InputItem.prototype.constructor.apply(this, [elementSelector, options]);
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

		var dates = this.parseDates();

		this.datePicker = new MKWidgets.DateRangePicker(this.domInput, $.extend({
			parentElement: this.domInputItem,
			startDate: dates.startDate,
			endDate: dates.endDate,
			locales: {
				ru: {
					format: "YYYY-MM-DD"
				}
			},
		}, this.options.dictConfig));

		this.domInputItem.empty().append(this.domInput);
		//this.domInput.focus();

		this.bindNode("value", this.domInput);
		this.datePicker.on('calendar-hide',
			function ()
			{
			this.value = this.datePicker.element.val();
			if (this.validate())
				{
				//this.datePicker.hide();
				}
			}, this);

		this.afterCreateField();
		},

	validate: function (silent)
		{
		this.errorCode = null;

		return this.itemValidate(silent);
		},

	cancel: function ()
		{
		this.domInputItem.empty().html(this.oldValue);
		},

	save: function ()
		{
		this.domInputItem.empty().html(this.value);
		}
});


MKWidgets.CrudFormNS.InputItemNS.Radio = Class({
	extends: MKWidgets.CrudFormNS.InputItem,

	constructor: function (elementSelector, options)
		{
		MKWidgets.CrudFormNS.InputItem.prototype.constructor.apply(this, [elementSelector, options]);
		this.setOptions({
			default: "",
			radioConfig: {
				buttons: [],
			},
			validation: {},
		});
		this.setOptions(options);
		},

	init: function ()
		{
		this.errors = {
			noValue: "Не выбрано значение",
		};
		},

	createField: function ()
		{
		this.oldValue = this.value;

		this.domContainer = $('<div/>').addClass('tusur-csp-radio-container');
		//this.domButtons
		for (var i in this.options.radioConfig['buttons'])
			{
			var buttonConfig = this.options.radioConfig['buttons'][i];
			var domParagraph = $('<p/>');
			var button = $('<input id="radio-' + buttonConfig['value'] + '" name="radio" type="radio" value="' + buttonConfig['value'] + '"/>')
				.addClass('tusur-csp-crud-form-radio-input');

			var label = $('<label for="radio-' + buttonConfig['value'] + '">')
				.text(buttonConfig['text'])
				.addClass('tusur-csp-crud-form-radio-label');

			if (this.value == buttonConfig['value'])
				{
				button.attr('checked', 'checked');
				}

			domParagraph.append(button);
			domParagraph.append(label);

			this.domContainer.append(domParagraph);
			}

		this.domButtons = this.domContainer.find('input');
		this.domInputItem.append(this.domContainer);

		this.domButtons.on('change', $.proxy(this.changeSlot, this));

		this.afterCreateField();
		},

	changeSlot: function (event)
		{
		var value = $(event.target).val();
		this.value = value;
		},

	validate: function (silent)
		{
		this.errorCode = null;

		if (this.value == undefined || this.value == '-')
			{
			this.errorCode = 'noValue';
			}
		return this.itemValidate(silent);
		},

	cancel: function ()
		{
		this.domInputItem.empty().html(this.oldValue);
		},

	save: function ()
		{
		this.domInputItem.empty().html(this.value);
		},
});

MKWidgets.CrudFormNS.InputItemNS.Array = Class({
	extends: MKWidgets.CrudFormNS.InputItem,

	constructor: function (elementSelector, options)
		{
		MKWidgets.CrudFormNS.InputItem.prototype.constructor.apply(this, [elementSelector, options]);
		this.setOptions({
			default: "",
			radioConfig: {
				buttons: [],
			},
			validation: {},
		});
		this.setOptions(options);
		},

	init: function ()
		{
		this.errors = {
			itemsNotValid: 'Элементы массива не валидны'
		};


		this.domCreateButton = $('<div/>').addClass('create-button');
		this.domLabel.append(this.domCreateButton);

		this.domCreateButton.on('click', $.proxy(this.createButtonClickSlot, this));
		},

	createButtonClickSlot: function ()
		{
		this.representArray.push({});
		this.trigger('value-changed');
		},

	createField: function ()
		{
		this.linkPropValueArray();

		this.domInputItem.addClass('tusur-csp-form-input-item-array');
		this.representArray = new MKWidgets.CrudFormNS.InputItemNS.ArrayRepresents(this, this.value, this.options.arrayConfig, this.domInputItem, this.options.formData);

		this.afterCreateField();
		},

	linkPropValueArray: function ()
		{
		this.value = this.options.formData[this.options.formIndex];
		this.on('array-changed',
			function ()
			{
			this.options.formData.jset(this.options.formIndex, this.representArray.toJSON());
			//this.validate(true);
			this.trigger('value-changed');
			});


		//this.value = this.options.formData[this.options.formIndex];
		//
		//this.on('change:value',
		//	function (event)
		//	{
		//	this.options.formData.jset(this.options.formIndex, this.value);
		//	var newValue = event.value;
		//	if (event.value != event.previousValue && this.allowValidate)
		//		{
		//		this.validate()
		//		}
		//	});
		//this.value = this.options.formData[this.options.formIndex];
		},
	linkPropValue: function ()
		{

		},

	validate: function (silent)
		{
		this.errorCode = null;

		var arrayValid = true;
		this.representArray.forEach(
			function (item)
			{
			if(item.display == true)
				{
				arrayValid = arrayValid * item.crudForm.saveInterface.validateFields(silent);
				}

			});

		if (!arrayValid)
			{
			this.errorCode = 'itemsNotValid';
			}

		return this.itemValidate(silent);
		},

	cancel: function ()
		{
		this.domInputItem.empty().html(this.oldValue);
		},

	save: function ()
		{
		this.domInputItem.empty().html(this.value);
		},
});

MKWidgets.CrudFormNS.InputItemNS.ArrayRepresent = Class({
	extends: MK.Object,

	display: true,
	constructor: function (arrayItem , parent)
		{
		this.jset(arrayItem);
		this.represents = parent;

		this.arrayItem = arrayItem;
		this.set('#parent', this.represents.formData);
		//this.arrayItem.set['#parent'] = this.represents.formData;

		this.representConfig = jQuery.extend(true, {}, this.represents.representConfig);

		this.on('render', this.render);
		},
	render: function (event)
		{
		if(this.display == true)
			{
			this.represents.displayLength ++;
			}

		$(this.sandbox).data('arrayItem', this);

		this.representConfig.action = 'changeFormData';
		this.representConfig.dataSource = 'local';
		this.representConfig.data = new MK.Object(this.arrayItem);

		this.representConfig.data.set('#parent', this.represents.formData)

		//this.representConfig.parentFormData = this.represents.formData;
		this.crudForm = new MKWidgets.CrudForm($(this.sandbox), this.representConfig);

		this.crudForm.on('form-data-change',
			function ()
			{
			this.represents.inputItemArray.trigger('array-changed');
			}, this);

		this.domDeleteButton = $('<div/>').addClass('delete-button');
		$(this.sandbox).append(this.domDeleteButton);
		this.domDeleteButton.on('click', $.proxy(this.deleteButtonClickSlot, this));

		this.crudForm.on('form-data-change', this.arrayChangeSlot, this);
		},

	arrayChangeSlot: function ()
		{
		this.represents.inputItemArray.trigger('value-changed');
		},

	deleteButtonClickSlot: function ()
		{
		this.crudForm.formData.jset('#delete', true);

		$(this.sandbox).remove();
		this.display = false;
		this.represents.displayLength -- ;

		this.represents.inputItemArray.trigger('array-changed');
		//var index = this.represents.indexOf(this);
		//this.represents.splice(index, 1);
		//this.represents.inputItemArray.trigger('value-changed');
		},

	toJSON: function ()
		{
		return this.crudForm.formData.toJSON();
		},
});

MKWidgets.CrudFormNS.InputItemNS.ArrayRepresents = Class({
	'extends': MK.Array,
	Model: MKWidgets.CrudFormNS.InputItemNS.ArrayRepresent,
	itemRenderer: '<div class="tusur-csp-crud-form-array-item"></div>',

	constructor: function (inputItemArray, valueArray, representConfig, sandbox, formData)
		{
		this.representConfig = representConfig;
		this.formData = formData;
		this.inputItemArray = inputItemArray;

		this.bindSandbox(sandbox);

		this.displayLength = 0;

		this.recreate(valueArray);

		this.on('change:displayLength', this.changeLengthSlot, this, true);
		},

	changeLengthSlot: function ()
		{
		if (this.displayLength == 0)
			{
			this.createDummy();
			}
		else
			{
			if (this.domDummy != null)
				{
				this.domDummy.remove();
				this.domDummy = null;
				}
			}
		},

	createDummy: function ()
		{
		this.domDummy = $("<div/>").addClass("tusur-csp-crud-form-array-dummy").text("Нет данных для отображения");
		$(this.sandbox).append(this.domDummy);
		},

	toJSON: function()
		{
		var jsonArray = [];
		this.forEach(
			function(item)
			{
			if(item.display == true)
				{
				jsonArray.push(item.toJSON());
				}

			});
		return jsonArray;
		},
});