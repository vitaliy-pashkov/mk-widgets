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
			this.oldValue = this.options.formData[this.options.formIndex];
			this.value = this.options.formData[this.options.formIndex];
			this.on('change:value', this.changeValueSlot);
			},

		changeValueSlot: function ()
			{
			this.options.formData.jset(this.options.formIndex, this.value);
			},

		cancel: function ()
			{
			},

		save: function ()
			{
			},

		finaly: function ()
			{
			},

		init: function ()
			{
			},

		createField: function ()
			{
			},

		validate: function ()
			{
			this.errorCode = null;
			return this.itemValidate();
			},

		setValue: function (value)
			{
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
			this.finaly();
			},

		itemSave: function ()
			{
			this.save();
			this.finaly();
			return this.isValueChanged() && !this.options.support;
			},

		isValueChanged: function ()
			{
			return this.oldValue != this.value;
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
			else if (options.type == 'treeSelect')
				{
				inputItem = new MKWidgets.CrudTableNS.InputItemNS.TreeSelect(elementSelector, options);
				}
			else if (options.type == 'dependTreeSelect')
				{
				inputItem = new MKWidgets.CrudTableNS.InputItemNS.DependTreeSelect(elementSelector, options);
				}
			else if (options.type == 'date')
				{
				inputItem = new MKWidgets.CrudTableNS.InputItemNS.Date(elementSelector, options);
				}
			else if (options.type == 'address')
				{
				inputItem = new MKWidgets.CrudTableNS.InputItemNS.Address(elementSelector, options);
				}
			else if (options.type == 'cron')
				{
				inputItem = new MKWidgets.CrudTableNS.InputItemNS.Cron(elementSelector, options);
				}
			else if (inputItem == null)
				{
				inputItem = new MKWidgets.CrudTableNS.InputItem(elementSelector, options);
				}

			inputItem.init();
			inputItem.linkPropValue();

			return inputItem;
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
		this.domInput = $.emmet('input.input-item-varchar')
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

	setValue: function (value)
		{
		this.value = value;
		},

	//finaly: function ()
	//	{
	//	this.domInput.remove();
	//	this.domInput = null;
	//	}
});

MKWidgets.CrudTableNS.InputItemNS.Float = Class({
	extends: MKWidgets.CrudTableNS.InputItemNS.Varchar,

	constructor: function (elementSelector, options)
		{
		MKWidgets.CrudTableNS.InputItemNS.Varchar.prototype.constructor.apply(this, [elementSelector, options]);
		this.setOptions({
			default: "",
			validation: {
				minVal: -Infinity,
				maxVal: Infinity,
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
});

MKWidgets.CrudTableNS.InputItemNS.Integer = Class({
	extends: MKWidgets.CrudTableNS.InputItemNS.Varchar,

	constructor: function (elementSelector, options)
		{
		MKWidgets.CrudTableNS.InputItemNS.Varchar.prototype.constructor.apply(this, [elementSelector, options]);
		this.setOptions({
			default: "",
			validation: {
				minVal: -Infinity,
				maxVal: Infinity,
			},
		});
		this.setOptions(options);
		},

	init: function ()
		{
		this.errors = {
			minVal: "Значение должно быть больше или равно " + this.options.validation.minLen,
			maxVal: "Значение должно быть меньше или равно " + this.options.validation.maxLen,
			notInt: "Значение должно быть целым числом"
		};
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
			index: "",
		});
		this.setOptions(options);

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
		if (this.dictConfig.linkProp == undefined)
			{
			this.dictConfig.linkProp = [];
			}
		},

	init: function ()
		{
		this.selectWidget = new MKWidgets.Select(this.element, {
			dictConfig: this.dictConfig,
			value: this.options.formData[this.dictConfig.formIdIndex],
			renderOnInit: false,
			customClass: 'table-item',
			popupOptions: {
				positionCorrections: {top: -13, left: -11},
				background: true,
				parentWidth: true
			},
			inputField: true,
			context: this.options.formData,
			addable: this.options.addable,
		});

		this.errors = {
			noValue: "Не выбрано значение",
		};
		},

	linkPropValue: function ()
		{
		this.value = this.options.formData[this.dictConfig.formIdIndex];
		this.oldValue = this.options.formData[this.dictConfig.formIdIndex];
		this.displayValue = this.options.formData[this.dictConfig.formDisplayIndex] || '-';
		this.oldDisplayValue = this.options.formData[this.dictConfig.formDisplayIndex] || '-';

		this.selectWidget.on('option-changed', this.changeValueSlot, this);
		},

	changeValueSlot: function ()
		{
		var selectedItem = this.selectWidget.selectedOption;

		if (selectedItem != undefined)
			{
			this.value = selectedItem.data[this.dictConfig.dictIdIndex];
			this.displayValue = selectedItem.data[this.dictConfig.dictDisplayIndex];

			this.options.formData.jset(this.dictConfig.formIdIndex, selectedItem.data[this.dictConfig.dictIdIndex]);
			this.options.formData.jset(this.dictConfig.formDisplayIndex, selectedItem.data[this.dictConfig.dictDisplayIndex]);
			for (var i = 0; i < this.dictConfig.linkProp.length; i++)
				{
				this.options.formData.jset(this.dictConfig.linkProp[i].form, selectedItem.data[this.dictConfig.linkProp[i].dict]);
				}
			}
		},

	createField: function ()
		{
		this.element.empty();
		this.selectWidget.render();
		this.selectWidget.showList = true;
		this.selectWidget.on('hideList', this.hideListSlot, this);
		},

	hideListSlot: function ()
		{
		if (this.displayValue == this.oldDisplayValue)
			{
			this.trigger('cancelEvent');
			}
		else
			{
			this.trigger('saveEvent');
			}
		},

	validate: function ()
		{
		this.errorCode = null;

		this.selectedItem = this.selectWidget.selectedOption;

		if (this.selectedItem == null && this.dictConfig.allowNull !== true)
			{
			this.errorCode = 'noValue';
			this.displayValue = '-';
			}
		return this.itemValidate();
		},

	cancel: function ()
		{
		this.element.empty().html(this.oldDisplayValue);
		},

	save: function ()
		{
		this.element.empty().html(this.displayValue);
		},

	finaly: function ()
		{
		this.selectWidget.deleteSelect();
		},

	setValue: function (value)
		{
		this.selectWidget.setSelectedOptionByValue(value);
		},

});

MKWidgets.CrudTableNS.InputItemNS.DependsSelect = Class({
	extends: MKWidgets.CrudTableNS.InputItemNS.Select,
	noItem: {},

	constructor: function (elementSelector, options)
		{
		MKWidgets.CrudTableNS.InputItemNS.Select.prototype.constructor.apply(this, [elementSelector, options]);
		this.setOptions({});
		this.setOptions(options);
		},

	init: function ()
		{
		for (var i in this.dictConfig.depend)
			{
			this.dictConfig.depend[i].object = this.options.formData;
			}

		this.selectWidget = new MKWidgets.DependsSelect(this.element, {
			dictConfig: this.dictConfig,
			value: this.options.formData[this.dictConfig.formIdIndex],
			customClass: 'table-item',
			renderOnInit: false,
			popupOptions: {
				positionCorrections: {top: -13, left: -11},
				background: true,
				parentWidth: true,
				positionElement: this.element
			},
			inputField: true,
			context: this.options.formData,
			addable: this.options.addable,
		});

		this.errors = {
			noValue: "Не выбрано значение",
			notInParent: "Выбранное значение недоступно ввиду ограничения зависимостью"
		};
		},

	validate: function ()
		{
		this.errorCode = null;

		this.selectedItem = this.selectWidget.selectedOption;
		if (this.selectedItem != null)
			{
			if(! (this.selectedItem.data[ this.dictConfig.dictIdIndex ] == '-' && this.dictConfig.allowNull == true))
				{
				for (var i in this.options.dictConfig.depend)
					{
					var objectIndex = this.options.dictConfig.depend[i].objectIdIndex,
						dictIndex = this.options.dictConfig.depend[i].dictIdIndex,
						formDependId = this.options.formData[objectIndex],
						dictDependId = this.selectedItem.data[dictIndex];

					if (dictDependId != formDependId)
						{
						this.errorCode = 'notInParent';
						}
					}
				}
			}
		else if(this.dictConfig.allowNull !== true)
			{
			this.errorCode = 'noValue';
			this.displayValue = '-';
			}

		if (this.selectedItem != undefined)
			{

			}
		return this.itemValidate();
		},
});

MKWidgets.CrudTableNS.InputItemNS.TreeSelect = Class({
	extends: MKWidgets.CrudTableNS.InputItemNS.Select,
	noItem: {},

	constructor: function (elementSelector, options)
		{
		MKWidgets.CrudTableNS.InputItemNS.Select.prototype.constructor.apply(this, [elementSelector, options]);
		this.setOptions({
			treeConfig: {},
		});
		this.setOptions(options);
		},

	init: function ()
		{
		this.selectWidget = new MKWidgets.TreeSelect(this.domInputItem, {
			dictConfig: this.dictConfig,
			treeConfig: this.options.treeConfig,
			value: this.options.formData[this.dictConfig.formIdIndex],
			//customClass: 'table-item',
			popupOptions: {
				positionCorrections: {top: -13, left: -11},
				background: true,
				parentWidth: true,
				positionElement: this.element
			},
			context: this.options.formData,
			addable: this.options.addable,
		});

		this.errors = {
			noValue: "Не выбрано значение",
			notInParent: "Выбранное значение недоступно ввиду ограничения зависимостью"
		};
		},
});

MKWidgets.CrudTableNS.InputItemNS.DependTreeSelect = Class({
	extends: MKWidgets.CrudTableNS.InputItemNS.Select,
	noItem: {},

	constructor: function (elementSelector, options)
		{
		MKWidgets.CrudTableNS.InputItemNS.Select.prototype.constructor.apply(this, [elementSelector, options]);
		this.setOptions({
			treeConfig: {},
		});
		this.setOptions(options);
		},

	init: function ()
		{
		for (var i in this.dictConfig.depend)
			{
			if (this.dictConfig.depend[i].object === '../')
				{
				this.dictConfig.depend[i].object = this.options.formData['#parent'];
				}
			else if (this.dictConfig.depend[i].object === './' || this.dictConfig.depend[i].object == undefined)
				{
				this.dictConfig.depend[i].object = this.options.formData;
				}
			}

		this.selectWidget = new MKWidgets.DependTreeSelect(this.domInputItem, {
			dictConfig: this.dictConfig,
			treeConfig: this.options.treeConfig,
			value: this.options.formData[this.dictConfig.formIdIndex],
			context: this.options.formData,
			popupOptions: {
				positionCorrections: {top: -13, left: -11},
				background: true,
				parentWidth: true,
				positionElement: this.element
			},
			context: this.options.formData,
			addable: this.options.addable,
		});


		this.errors = {
			noValue: "Не выбрано значение",
			notInParent: "Выбранное значение недоступно ввиду ограничения зависимостью"
		};
		},
});

// not refactoring

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

	parseDates: function ()
		{
		var separator,
			startDate = '',
			endDate = '';
		if (this.options.dictConfig.separator != undefined)
			{
			separator = this.options.dictConfig.separator;
			}
		else
			{
			separator = ' - ';
			}
		var dates = this.oldValue.split(separator);
		startDate = dates[0];
		if (dates[1] != undefined)
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
		this.domInput = $.emmet('input.input-item-date');
		this.domInputContainer = $('<div/>').append(this.domInput);
		this.element.empty().append(this.domInputContainer);

		var dates = this.parseDates();

		this.datePicker = new MKWidgets.Date(this.domInput, $.extend({
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
		this.datePicker.on('calendar-hide',
			function ()
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
		},

	setValue: function (value)
		{
		this.value = value;
		},
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
		},

	setValue: function (value)
		{
		this.value = value;
		},
});

MKWidgets.CrudTableNS.InputItemNS.Address = Class({
	extends: MKWidgets.CrudTableNS.InputItem,

	constructor: function (elementSelector, options)
		{
		MKWidgets.CrudTableNS.InputItem.prototype.constructor.apply(this, [elementSelector, options]);
		this.setOptions({
			default: "",
			addressPrefix: 'address'
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
		this.element.empty();
		try
			{
			if (this.options.addressOptions.depend.object === './' || this.options.addressOptions.depend.object == undefined)
				{
				this.options.addressOptions.depend.object = this.options.formData;
				}
			if (!(this.options.addressOptions.depend.index in this.options.addressOptions.depend.object))
				{
				this.options.addressOptions.depend.object [this.options.addressOptions.depend.index] = 0;
				}
			}
		catch (exeption)
			{
			}

		this.addressWidget = new MKWidgets.Address(this.element, $.extend(this.options.addressOptions, {
			addressId: this.options.formData [this.options.addressIdIndex],
			popup: {
				positionCorrections: {top: 0, left: 0},
			}
		}));
		if (this.addressWidget.ready == true)
			{
			this.initAddressEvents();
			}
		else
			{
			this.addressWidget.on('address-ready', this.initAddressEvents, this);
			}

		},

	initAddressEvents: function ()
		{
		this.addressWidget.domMainInput.addClass('tusur-csp-crud-table-input-item');
		this.addressWidget.popup.openPopup();
		//this.addressWidget.on('value-changed', this.linearizeAddressValue, this);
		this.addressWidget.popup.on('close-popup',
			function ()
			{
			this.linearizeAddressValue();
			this.trigger('saveEvent');
			}, this);
		},

	linearizeAddressValue: function ()
		{
		var address = this.addressWidget.getValue();
		for (var index in address)
			{
			this.options.formData.jset(this.options.addressPrefix + '.' + index, address[index].value);
			}
		this.options.formData.jset(this.options.addressPrefix + '.text_full', this.addressWidget.fullTextValue);
		this.options.formData.jset(this.options.addressPrefix + '.text_point', this.addressWidget.getTextValue(4, 8, false, false));
		this.options.formData.jset(this.options.addressPrefix + '.text_home', this.addressWidget.getTextValue(6, 8, false, false));
		this.options.formData.jset(this.options.addressPrefix + '.text_home_detail', this.addressWidget.getTextValue(6, 8, true, true));
		},

	validate: function (silent)
		{
		this.errorCode = null;

		return this.itemValidate(silent);
		},

	cancel: function ()
		{
		this.element.empty().html(this.oldValue);
		},

	save: function ()
		{
		this.element.empty().html(this.value);
		},

	isValueChanged: function ()
		{
		return true;
		},

	setValue: function (value)
		{
		alert("not work for address field! kick developer's ass for that!");
		},
});