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


			},

		createDom: function ()
			{
			this.domLabel = $('<label/>').addClass('tusur-csp-form-label').html(this.options.title);
			this.domInputItem = $('<div/>').addClass('tusur-csp-form-input-item');

			this.element.append(this.domLabel);
			this.element.append(this.domInputItem);

			var widthClass = 'form-columns-50-50';
			if (this.options.widthClass != undefined)
				{
				widthClass = this.options.widthClass;
				}
			this.element.addClass(widthClass);

			this.bindNode('errorText', this.domInputItem, this.errorBinder);
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

		reInit: function ()
			{
			this.options.formData = this.options.formWidget.formData;
			this.reInitItem();
			},

		reInitItem: function ()
			{
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
			if (options.type == "hidden")
				{
				inputItem = new MKWidgets.CrudFormNS.InputItemNS.Hidden(elementSelector, options);
				}
			if (options.type == "button")
				{
				inputItem = new MKWidgets.CrudFormNS.InputItemNS.Button(elementSelector, options);
				}
			if (options.type == "varchar")
				{
				inputItem = new MKWidgets.CrudFormNS.InputItemNS.Varchar(elementSelector, options);
				}
			if (options.type == "password")
				{
				inputItem = new MKWidgets.CrudFormNS.InputItemNS.Password(elementSelector, options);
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
			else if (options.type == 'multiSelect')
				{
				inputItem = new MKWidgets.CrudFormNS.InputItemNS.MultiSelect(elementSelector, options);
				}
			else if (options.type == 'treeSelect')
				{
				inputItem = new MKWidgets.CrudFormNS.InputItemNS.TreeSelect(elementSelector, options);
				}
			else if (options.type == 'dependTreeSelect')
				{
				inputItem = new MKWidgets.CrudFormNS.InputItemNS.DependTreeSelect(elementSelector, options);
				}
			else if (options.type == 'date')
				{
				inputItem = new MKWidgets.CrudFormNS.InputItemNS.Date(elementSelector, options);
				}
			else if (options.type == 'dateRange')
				{
				inputItem = new MKWidgets.CrudFormNS.InputItemNS.DateRange(elementSelector, options);
				}
			else if (options.type == 'address')
				{
				inputItem = new MKWidgets.CrudFormNS.InputItemNS.Address(elementSelector, options);
				}
			else if (options.type == 'radio')
				{
				inputItem = new MKWidgets.CrudFormNS.InputItemNS.Radio(elementSelector, options);
				}
			else if (options.type == 'checkbox')
				{
				inputItem = new MKWidgets.CrudFormNS.InputItemNS.Checkbox(elementSelector, options);
				}
			else if (options.type == 'array')
				{
				inputItem = new MKWidgets.CrudFormNS.InputItemNS.Array(elementSelector, options);
				}
			else if (options.type == 'cron')
				{
				inputItem = new MKWidgets.CrudFormNS.InputItemNS.Cron(elementSelector, options);
				}
			else if (options.type == 'dependForm')
				{
				inputItem = new MKWidgets.CrudFormNS.InputItemNS.DependForm(elementSelector, options);
				}
			else if (options.type == 'subForm')
				{
				inputItem = new MKWidgets.CrudFormNS.InputItemNS.SubForm(elementSelector, options);
				}
			else if (options.type == 'checkboxGroup')
				{
				inputItem = new MKWidgets.CrudFormNS.InputItemNS.CheckboxGroup(elementSelector, options);
				}
			else if (options.type == 'table')
				{
				inputItem = new MKWidgets.CrudFormNS.InputItemNS.Table(elementSelector, options);
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

MKWidgets.CrudFormNS.InputItemNS.Hidden = Class({
	extends: MKWidgets.CrudFormNS.InputItem,

	constructor: function (elementSelector, options)
		{
		MKWidgets.CrudFormNS.InputItem.prototype.constructor.apply(this, [elementSelector, options]);
		this.setOptions({});
		this.setOptions(options);
		},

	init: function ()
		{

		},

	createField: function ()
		{
		this.domInputItem.parent().hide();
		},

	validate: function (silent)
		{
		this.errorCode = null;
		return this.itemValidate(silent);
		},

	cancel: function ()
		{
		},

	save: function ()
		{
		},
});

MKWidgets.CrudFormNS.InputItemNS.Button = Class({
	extends: MKWidgets.CrudFormNS.InputItem,

	constructor: function (elementSelector, options)
		{
		MKWidgets.CrudFormNS.InputItem.prototype.constructor.apply(this, [elementSelector, options]);
		this.setOptions({
			callback: null,
		});
		this.setOptions(options);
		},

	init: function ()
		{
		this.errors = {};
		},

	createField: function ()
		{
		this.domButton = $('<button />')
			.addClass('input-item-button')
			.text(this.options.text);

		this.domInputItem.empty().append(this.domButton);
		this.domButton.on('click', $.proxy(this.clickSlot, this));

		this.afterCreateField();
		},

	clickSlot: function()
		{
		if(this.options.callback != undefined)
			{
			this.options.callback(this.options.formData, this);
			}
		},

	validate: function (silent)
		{
		this.errorCode = null;
		return this.itemValidate(silent);
		},
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

MKWidgets.CrudFormNS.InputItemNS.Password = Class({
	extends: MKWidgets.CrudFormNS.InputItem,

	constructor: function (elementSelector, options)
		{
		MKWidgets.CrudFormNS.InputItem.prototype.constructor.apply(this, [elementSelector, options]);
		this.setOptions({
			default: "",
			validation: {
				minLen: 0,			//varchar, text
				maxLen: Infinity,	//varchar, text
				equlalIndex: null,
			},
		});
		this.setOptions(options);
		},

	init: function ()
		{
		this.errors = {
			minLen: "Длина значения должна быть больше или равна " + this.options.validation.minLen + " символов",
			maxLen: "Длина значения должна быть меньше или равна " + this.options.validation.maxLen + " символов",
			notEqual: "Пароли не совпадают",
		};
		},

	createField: function ()
		{
		this.value = '';
		this.domInput = $('<input type="password"/>')
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
		if (this.options.validation.equalIndex != undefined)
			{
			if (this.value != this.options.formData[this.options.validation.equalIndex])
				{
				this.errorCode = 'notEqual';
				}
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

				for (var i = 0; i < this.dictConfig.linkProp.length; i++)
					{
					this.options.formData.jset(this.dictConfig.linkProp[i].form, displayItem[this.dictConfig.linkProp[i].dict]);
					}

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
		if (this.dictConfig.linkProp == undefined)
			{
			this.dictConfig.linkProp = [];
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
		if (this.selectWidget.selectedOption != undefined)
			{
			return this.selectWidget.selectedOption.data;
			}
		return null;
		//this.dict = this.selectWidget.dict;
		//for (var i in this.dict)
		//	{
		//	var dictItem = this.dict[i];
		//	if (dictItem[this.dictConfig.dictIdIndex] == id)
		//		{
		//		return dictItem;
		//		}
		//	}
		//return null;
		},

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
			dict: this.options.dict,
			value: this.options.formData[this.dictConfig.formIdIndex],
			popupOptions: {
				background: true,
				//parentWidth: false,
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

		if (this.dictConfig.linkProp == undefined)
			{
			this.dictConfig.linkProp = [];
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

MKWidgets.CrudFormNS.InputItemNS.MultiSelect = Class({
	extends: MKWidgets.CrudFormNS.InputItemNS.Select,
	noItem: {},

	constructor: function (elementSelector, options)
		{
		MKWidgets.CrudFormNS.InputItemNS.Select.prototype.constructor.apply(this, [elementSelector, options]);
		this.setOptions({});
		this.setOptions(options);

		},

	linkPropValue: function ()
		{

		},

	reInitItem: function ()
		{

		var formMap = {};
		for (var i = 0; i < this.options.formData[this.dictConfig.formIdIndex].length; i++)
			{
			formMap[this.options.formData[this.dictConfig.formIdIndex][i][this.dictConfig.dictIdIndex]] = this.options.formData[this.dictConfig.formIdIndex][i];
			}

		var dictMap = {};
		for (var i = 0; i < this.selectWidget.dict.length; i++)
			{
			dictMap[this.selectWidget.dict[i][this.dictConfig.dictIdIndex]] = this.selectWidget.dict[i];
			}

		for (var id in formMap)
			{
			var targetObj = dictMap [id];
			for (var key in formMap[id])
				{
				targetObj[key] = formMap[id][key];
				}
			}
		},

	linkPropValueSelect: function ()
		{
		if (this.options.formData[this.dictConfig.formIdIndex] == undefined)
			{
			this.options.formData.jset(this.dictConfig.formIdIndex, null);
			}
		this.values = this.options.formData[this.dictConfig.formIdIndex];
		},

	createField: function ()
		{
		this.domInputItem.empty();
		this.selectWidget = new MKWidgets.MultiSelect(this.domInputItem, {
			dictConfig: this.dictConfig,
			dict: this.options.dict,
			values: this.options.formData[this.dictConfig.formIdIndex],
			popupOptions: {
				background: true,
			}
		});

		this.selectWidget.on('options-changed', this.valuesChanged, this);
		//this.linkProps('value', 'selectWidget.value');


		//this.linkPropValueSelect();
		this.afterCreateField();
		},

	valuesChanged: function ()
		{
		this.values = this.selectWidget.getValues();
		this.displayValue = this.selectWidget.getDisplayValue();

		this.options.formData.jset(this.dictConfig.formIdIndex, this.values);
		//this.options.formData.jset(this.dictConfig.formDisplayIndex, this.displayValue);
		this.trigger('value-changed');
		if (this.allowValidate)
			{
			this.validate();
			}
		},

	validate: function (silent)
		{
		this.errorCode = null;

		return this.itemValidate(silent);
		},

});

MKWidgets.CrudFormNS.InputItemNS.TreeSelect = Class({
	extends: MKWidgets.CrudFormNS.InputItemNS.Select,

	noItem: {},

	constructor: function (elementSelector, options)
		{
		MKWidgets.CrudFormNS.InputItemNS.Select.prototype.constructor.apply(this, [elementSelector, options]);
		this.setOptions({
			treeConfig: {
				saveSelectStates: false
			}
		});
		this.setOptions(options);
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

				for (var i = 0; i < this.dictConfig.linkProp.length; i++)
					{
					this.options.formData.jset(this.dictConfig.linkProp[i].form, displayItem[this.dictConfig.linkProp[i].dict]);
					}

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


	findItemById: function ()
		{
		return this.selectWidget.selectedOption.data;
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

		this.domInputItem.empty();
		this.selectWidget = new MKWidgets.TreeSelect(this.domInputItem, {
			dictConfig: this.dictConfig,
			treeConfig: this.options.treeConfig,
			value: this.options.formData[this.dictConfig.formIdIndex]
		});

		this.linkProps('value', 'selectWidget.value');
		this.linkPropValueSelect();
		this.afterCreateField();
		},

	validate: function (silent)
		{
		this.errorCode = null;

		if (this.value == null)
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
		}
});

MKWidgets.CrudFormNS.InputItemNS.DependTreeSelect = Class({
	extends: MKWidgets.CrudFormNS.InputItemNS.TreeSelect,

	noItem: {},

	constructor: function (elementSelector, options)
		{
		MKWidgets.CrudFormNS.InputItemNS.TreeSelect.prototype.constructor.apply(this, [elementSelector, options]);
		this.setOptions({});
		this.setOptions(options);
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
		this.selectWidget = new MKWidgets.DependTreeSelect(this.domInputItem, {
			dictConfig: this.dictConfig,
			treeConfig: this.options.treeConfig,
			value: this.options.formData[this.dictConfig.formIdIndex],
			context: this.options.formData
		});

		this.linkProps('value', 'selectWidget.value');
		this.linkPropValueSelect();
		this.afterCreateField();
		},
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

	openPopup: function ()
		{
		this.popup.openPopup();
		this.domTitle
			.prop('disabled', true);
		this.updateTitle();
		},

	closePopup: function ()
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
			parentWidth: true,
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
			dictConfig: {
				locales: {
					ru: {
						format: "YYYY-MM-DD"
					}
				}
			}
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

		var startDate = this.oldValue;
		var m = moment(this.oldValue);
		if (!m.isValid())
			{
			startDate = moment().format(this.options.dictConfig.locales.ru.format);
			}


		this.domInput = $('<input />')
			.addClass('input-item-date');


		this.datePicker = new MKWidgets.Date(this.domInput, $.extend({
			parentElement: this.domInputItem,
			singleDatePicker: true,
			startDate: startDate,
			//locales: {
			//	ru: {
			//		format: "YYYY-MM-DD"
			//	},
			//},
		}, this.options.dictConfig));

		this.domInputItem.empty().append(this.domInput);
		//this.domInput.focus();

		this.bindNode("value", this.domInput);
		this.datePicker.on('calendar-hide',
			function ()
			{
			this.value = this.datePicker.element.val();
			}, true, this);

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

MKWidgets.CrudFormNS.InputItemNS.DateRange = Class({
	extends: MKWidgets.CrudFormNS.InputItem,

	constructor: function (elementSelector, options)
		{
		MKWidgets.CrudFormNS.InputItem.prototype.constructor.apply(this, [elementSelector, options]);
		this.setOptions({
			default: "",
			separator: ' - ',
			dictConfig: {
				format: 'DD.MM.YYYY HH:mm:ss'
			}
		});
		this.setOptions(options);
		},

	init: function ()
		{
		this.errors = {};
		},

	parseDates: function ()
		{
		var startDate = '-';
		var endDate = '-';

		if (this.oldValue != undefined)
			{
			var dates = this.oldValue.split(this.options.separator);
			startDate = dates[0];
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

		this.domRanges = $('<div/>').addClass('tusur-csp-form-date-range-ranges');
		this.element.append(this.domRanges);

		this.domInputItem.empty().append(this.domInput);

		this.dateRange = new MKWidgets.DateRange(this.domInput, $.extend({
			domRanges: this.domRanges,
			parentElement: this.domInputItem,
			startDate: dates.startDate,
			endDate: dates.endDate,
			format: this.options.dictConfig.format,
			ranges: MKWidgets.DateRange.predefineRange([
				"сегодня", "вчера", "неделя", "месяц", "год"
			])
		}, this.options.dictConfig));


		//this.domInput.focus();

		this.bindNode("value", this.domInput);
		this.dateRange.on('date-range-change',
			function ()
			{
			this.value = this.dateRange.getRangeText();
			if (this.validate())
				{
				//this.datePicker.hide();
				}
			}, true, this);

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

MKWidgets.CrudFormNS.InputItemNS.Address = Class({
	extends: MKWidgets.CrudFormNS.InputItem,

	constructor: function (elementSelector, options)
		{
		MKWidgets.CrudFormNS.InputItem.prototype.constructor.apply(this, [elementSelector, options]);
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

		try
			{
			if (this.options.addressOptions.depend.object === '../')
				{
				this.options.addressOptions.depend.object = this.options.formData['#parent']; //this.options.formWidget.options.parentFormData;
				}
			else if (this.options.addressOptions.depend.object === './' || this.options.addressOptions.depend.object == undefined)
				{
				this.options.addressOptions.depend.object = this.options.formData;
				}
			//if( ! (this.options.addressOptions.depend.index in this.options.addressOptions.depend.object) )
			//	{
			//	this.options.addressOptions.depend.object [ this.options.addressOptions.depend.index ] = 0;
			//	}
			}
		catch (exeption)
			{
			}


		this.addressWidget = new MKWidgets.Address(this.domInputItem, this.options.addressOptions);
		this.addressWidget.on('value-changed', this.linearizeAddressValue, this);
		this.afterCreateField();
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
		this.options.formData.jset(this.options.index, value);
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

MKWidgets.CrudFormNS.InputItemNS.Checkbox = Class({
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
		this.errors = {
			noValue: "Не выбрано значение",
		};
		},

	createDom: function ()
		{
		var widthClass = 'form-columns-33';
		if (this.options.widthClass != undefined)
			{
			widthClass = this.options.widthClass;
			}
		this.element.addClass(widthClass);
		},

	createField: function ()
		{
		this.oldValue = this.value;

		this.randomId = this.randomId();

		this.domContainer = $('<div/>').addClass('checkbox-container');
		this.domCheckbox = $('<input id="mkw-checkbox-' + this.randomId + '" type="checkbox"/>');
		this.domCheckbox.addClass('mkw-checkbox-input');

		this.domLabel = $('<label for="mkw-checkbox-' + this.randomId + '" />');
		this.domLabel.text(this.options.title);
		this.domLabel.addClass('mkw-checkbox-label');

		this.domContainer.append(this.domCheckbox);
		this.domContainer.append(this.domLabel);

		this.element.append(this.domContainer);

		this.bindNode('value', this.domCheckbox);
		this.on('change:value', this.changeSlot);

		this.afterCreateField();
		},

	changeSlot: function (event)
		{
		this.value = this.domCheckbox.is(':checked');
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
		},
});


MKWidgets.CrudFormNS.InputItemNS.Array = Class({
	extends: MKWidgets.CrudFormNS.InputItem,

	constructor: function (elementSelector, options)
		{
		MKWidgets.CrudFormNS.InputItem.prototype.constructor.apply(this, [elementSelector, options]);
		this.setOptions({
			default: "",
			arrayConfig: {
				addable: true,
				deletable: true,
				idIndex: 'id',
				fieldsModel: [],
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


		if (this.options.arrayConfig.addable)
			{
			this.domCreateButton = $('<div/>').addClass('create-button');
			this.domLabel.append(this.domCreateButton);
			this.domCreateButton.on('click', $.proxy(this.createButtonClickSlot, this));
			}
		},

	createButtonClickSlot: function ()
		{
		this.representArray.unshift({});
		this.trigger('array-changed');
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
		this.value = this.findValue();
		this.on('array-changed',
			function ()
			{
			this.jsetValue(this.representArray.toJSON());
			//this.validate(true);
			this.trigger('value-changed');
			});
		},

	findValue: function ()
		{
		if (this.options.formIndex == './')
			{
			return this.options.formData;
			}
		return this.options.formData[this.options.formIndex];
		},

	jsetValue: function (value)
		{
		if (this.options.formIndex == './')
			{
			this.options.formData = value;
			}
		else
			{
			this.options.formData.jset(this.options.formIndex, value);
			}

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
			if (item.display == true)
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
});

MKWidgets.CrudFormNS.InputItemNS.ArrayRepresent = Class({
	extends: MK.Object,

	display: true,
	constructor: function (arrayItem, parent)
		{
		//this.jset(arrayItem);
		this.represents = parent;

		this.arrayItem = arrayItem;
		this.set('#parent', this.represents.formData);
		//this.arrayItem.set['#parent'] = this.represents.formData;

		this.representConfig = jQuery.extend(true, {}, this.represents.representConfig);

		this.on('render', this.render);
		},
	render: function (event)
		{
		if (this.display == true)
			{
			this.represents.displayLength++;
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

		if (this.represents.inputItemArray.options.arrayConfig.deletable)
			{
			this.domDeleteButton = $('<div/>').addClass('delete-button');
			$(this.sandbox).append(this.domDeleteButton);
			this.domDeleteButton.on('click', $.proxy(this.deleteButtonClickSlot, this));
			}

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
		this.represents.displayLength--;

		this.represents.inputItemArray.trigger('array-changed');
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

		if (valueArray == undefined)
			{
			valueArray = [];
			}
		this.recreate(valueArray);

		this.on('change:displayLength', this.changeLengthSlot, this, true);
		},

	recreate: function (array)
		{
		for (var i = array.length - 1; i >= 0; i--)
			{
			var model = new this.Model(array[i], this, i);
			if(array[i]['#delete'] != true )
				{
				this.push(model);
				}
			}
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

	toJSON: function ()
		{
		var jsonArray = [];
		this.forEach(
			function (item)
			{
			//if (item.display == true)
			//	{
			jsonArray.push(item.toJSON());
			//}

			});
		return jsonArray;
		},
});

MKWidgets.CrudFormNS.InputItemNS.SubForm = Class({
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
		this.errors = {
			itemsNotValid: 'Элементы формы не валидны'
		};
		this.createForm();
		},

	createForm: function ()
		{
		this.representConfig = $.extend(true, {}, this.options.formWidget.options);

		this.representConfig.action = 'changeFormData';
		this.representConfig.dataSource = 'local';
		this.representConfig.data = this.options.formData;
		this.representConfig.subForm = true;
		this.representConfig.context = this.dependObject;
		this.representConfig.fieldsModel = this.options.fieldsModel;

		this.crudForm = new MKWidgets.CrudForm(this.element, this.representConfig);

		this.crudForm.on('form-data-change',
			function ()
			{
			this.trigger('value-changed');
			}, this);
		},

	destroyForm: function ()
		{
		this.element.empty();

		this.trigger('value-changed');
		},

	createField: function ()
		{
		this.afterCreateField();
		},

	linkPropValue: function ()
		{

		},

	validate: function (silent)
		{
		this.errorCode = null;


		if (this.crudForm != undefined)
			{
			var arrayValid = this.crudForm.saveInterface.validateFields(silent);
			if (!arrayValid)
				{
				this.errorCode = 'itemsNotValid';
				}
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

	createDom: function ()
		{
		this.element.removeClass('tusur-csp-form-field');
		},
});

MKWidgets.CrudFormNS.InputItemNS.DependForm = Class({
	extends: MKWidgets.CrudFormNS.InputItem,

	constructor: function (elementSelector, options)
		{
		MKWidgets.CrudFormNS.InputItem.prototype.constructor.apply(this, [elementSelector, options]);
		this.setOptions({
			default: "",
			dependObject: './',
			dependIndex: 'id',
			dependType: null,
			additionIndexes: [],
		});
		this.setOptions(options);
		},

	init: function ()
		{
		this.errors = {
			itemsNotValid: 'Элементы формы не валидны'
		};

		this.dependObject = this.options.dependObject;
		this.dependIndex = this.options.dependIndex;

		if (this.dependObject === '../')
			{
			this.dependObject = this.options.formData['#parent']; //this.options.formWidget.options.parentFormData;
			}
		else if (this.dependObject === './' || this.dependObject == undefined)
			{
			this.dependObject = this.options.formData;
			}

		this.dependObject.on('change:' + this.dependIndex, this.dependChangeSlot, this);
		for (var i = 0; i < this.options.additionIndexes.length; i++)
			{
			this.dependObject.on('change:' + this.options.additionIndexes[i], this.dependChangeSlot, this);
			}

		if (this.dependObject[this.dependIndex] != '-')
			{
			this.dependChangeSlot();
			}
		},

	calcFormData: function (context)
		{
		this.formData = this.options.formData;

		this.dependOptions = Entity.assignObject(this.options, this.options, context);

		if (this.dependOptions.formDataRoute != undefined)
			{
			var routeParts = this.dependOptions.formDataRoute.split('/');
			var target = this.formData;
			for (var i = 0; i < routeParts.length; i++)
				{
				var routePart = routeParts[i];
				if (routePart == '.')
					{
					continue;
					}
				else if ($.isNumeric(routePart) && target instanceof Array)
					{
					target = target[routePart];
					}
				else if (typeof routePart == 'string' && target instanceof Object)
					{
					target = target[routePart];
					}
				}
			this.formData = target;
			}
		},

	dependChangeSlot: function ()
		{
		if (this.options.dependType == 'bool')
			{
			if (this.dependObject[this.dependIndex] == true)
				{
				this.createForm();
				}
			else
				{
				this.destroyForm();
				}
			}

		if (this.options.dependType == 'index')
			{
			if (this.dependObject[this.dependIndex] == null)
				{
				this.destroyForm();
				}
			else
				{
				this.destroyForm();
				this.createForm();
				}
			}

		if (this.options.dependType == 'keyWord')
			{
			if (this.dependObject[this.dependIndex] == null)
				{
				this.destroyForm();
				}
			else
				{
				this.destroyForm();
				this.createForm(this.options.fieldsModels[this.dependObject[this.dependIndex]]);
				}
			}
		},

	createForm: function (fieldsModel)
		{
		if (fieldsModel == undefined)
			{
			fieldsModel = this.options.fieldsModel;
			}


		this.representConfig = $.extend(true, {}, this.options.formWidget.options);

		this.calcFormData(this.dependObject);

		this.representConfig.action = 'changeFormData';
		this.representConfig.dataSource = 'local';
		this.representConfig.data = this.formData;
		this.representConfig.dependForm = true;
		this.representConfig.context = this.dependObject;
		this.representConfig.fieldsModel = fieldsModel;
		this.representConfig.idIndex = this.options.idIndex;

		this.crudForm = new MKWidgets.CrudForm(this.element, this.representConfig);

		this.crudForm.on('form-data-change',
			function ()
			{
			//this.formData.jset(this.crudForm.fields.toJSON());
			this.trigger('value-changed');
			}, this);
		},

	destroyForm: function ()
		{
		this.element.empty();

		this.trigger('value-changed');
		},

	createField: function ()
		{

		this.afterCreateField();
		},

	linkPropValue: function ()
		{

		},

	validate: function (silent)
		{
		this.errorCode = null;


		if (this.crudForm != undefined)
			{
			var arrayValid = this.crudForm.saveInterface.validateFields(silent);
			if (!arrayValid)
				{
				this.errorCode = 'itemsNotValid';
				}
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

	createDom: function ()
		{
		this.element.removeClass('tusur-csp-form-field');
		},
});


MKWidgets.CrudFormNS.InputItemNS.CheckboxGroup = Class({
	extends: MKWidgets.CrudFormNS.InputItem,

	constructor: function (elementSelector, options)
		{
		MKWidgets.CrudFormNS.InputItem.prototype.constructor.apply(this, [elementSelector, options]);
		this.setOptions({
			configs: {}
		});
		this.setOptions(options);
		},

	init: function ()
		{
		this.errors = {};

		this.configs = this.options.config;

		this.setTarget();
		},

	setTarget: function ()
		{
		if (!(this.options.formData[this.options.index] instanceof Array))
			{
			this.options.formData.jset(this.options.index, new MK.Array());
			this.configs.target = this.options.formData[this.options.index];
			}

		this.configs.target = this.options.formData[this.options.index];
		},

	reInitItem: function ()
		{
		this.setTarget();
		this.cbg.options.target = this.configs.target;
		},

	createField: function ()
		{
		this.element.addClass('form-columns-100');
		//this.cbg = new MK;

		this.cbg = new MKWidgets.CheckboxGroup(this.domInputItem, this.configs);
		this.cbg.on('target-changed', this.targetChangedSlot, this);
		this.initDoneSlot();

		this.afterCreateField();
		},

	initDoneSlot: function ()
		{
		if (this.cbg.dict.length == 0)
			{
			this.element.hide();
			}
		},

	targetChangedSlot: function ()
		{
		this.options.formData.jset(this.options.index, this.cbg.options.target);
		this.trigger('value-changed');
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
		},
});

MKWidgets.CrudFormNS.InputItemNS.Table = Class({
	extends: MKWidgets.CrudFormNS.InputItem,

	constructor: function (elementSelector, options)
		{
		MKWidgets.CrudFormNS.InputItem.prototype.constructor.apply(this, [elementSelector, options]);
		this.setOptions({
			tableConfig: {
				dataSource: 'local',
				title: this.options.title,
				deleteByFlag: true,
			}
		});
		this.setOptions(options);
		},

	init: function ()
		{
		this.errors = {};

		this.configs = this.options.config;
		},

	createDom: function ()
		{
		var widthClass = 'form-columns-100';
		if (this.options.widthClass != undefined)
			{
			widthClass = this.options.widthClass;
			}
		this.element.addClass(widthClass);

		//this.bindNode('errorText', this.domInputItem, this.errorBinder);
		},

	createField: function ()
		{
		this.element.addClass('form-columns-100');
		this.element.css('max-height', ($(window).height() - 300) + 'px');
		this.table = new MKWidgets.CrudTable(this.element, $.extend({
			data: this.options.formData[this.options.index],
		}, this.options.tableConfig));

		this.table.on('table-changed', this.saveSlot, this);
		},

	saveSlot: function ()
		{
		this.options.formData.jset(this.options.index, this.table.rows.toJSON());
		this.trigger('value-changed');
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
		},
});