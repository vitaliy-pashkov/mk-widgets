var MKWidgets = MKWidgets || {};
MKWidgets.AddressNS = MKWidgets.AddressNS || {};

MKWidgets.Address = Class({
	extends: MKWidget,

	ready: false,

	initLevels: function ()
		{
		this.value = {
			kladr_state: {},
			kladr_area: {},
			kladr_city: {},
			kladr_street: {},
			home: {},
			entrance: {},
			floor: {},
			flat: {}
		};

		this.dict = [
			[],
			[],
			[],
			[],
			[],
		];
		this.levels = [
			{},
			{
				id: "kladr_state",
				type: 'select',
				Title: "Область",
				SelectTitle: "Выберите область",
			},
			{
				id: "kladr_area",
				type: 'select',
				Title: "Город/округ",
				hideIfNull: false,
				SelectTitle: "Выберите город/округ",
			},
			{
				id: "kladr_city",
				type: 'select',
				Title: "Населенный пункт",
				hideIfNull: true,
				SelectTitle: "Выберите населенный пункт",
			},
			{
				id: "kladr_street",
				type: 'select',
				Title: "Улица",
				hideIfNull: false,
				SelectTitle: "Выберите улицу",
			},
			{
				id: "home",
				type: 'input',
				Title: "Дом",
				InputTitle: "Введите номер дома",
				nullText: "дом ",
				enable: true
			},
			{
				id: "entrance",
				type: 'input',
				Title: "Вход",
				InputTitle: "Введите данные входа",
				nullText: "подъезд ",
				enable: true
			},
			{
				id: "floor",
				type: 'input',
				Title: "Этаж",
				InputTitle: "Введите этаж",
				nullText: "этаж ",
				enable: true
			},
			{
				id: "flat",
				type: 'input',
				Title: "Квартира",
				InputTitle: "Введите номер квартиры",
				nullText: "кв. ",
				enable: true
			},
		];
		},

	constructor: function Address(elementSelector, options)
		{
		this.options.inputField = true;
		MKWidget.prototype.constructor.apply(this, [elementSelector, options]);
		this.setOptions({
			//data: "/kladr/getinfo",
			value: null,
			addressId: null,
			dictConfig: {
				dictUrl: '/kladr/getinfo', //?level=2&prev=7700&prev_type=uu',//?level=2&prev=7000',
				dictIdIndex: 'kladr',
				dictDisplayIndex: 'displayValue',
				dictDisplayIndexType: 'type',
				nullValue: false,
			},
			getAddressUrl: '/kladr/get-address',
			beginLevel: 1,
			depend: null,
			parentAddressId: null,
			endLevel: 8,
			entrance: true,
			floor: true,
			defaultValue: "Выберите значение",
			dependNotSelect: 'Выберите значение родителя',

			popup: {},
		});
		this.setOptions(options);
		this.initLevels();
		this.once('data-ready', this.initInterfaces);

		this.init();
		},

	init: function ()
		{
		this.levels[6].enable = this.options.entrance;
		this.levels[7].enable = this.options.floor;

		this.enabledStatus = 'initiate'; //initiate, parentNotSelect, enabled

		if (this.options.addressId != null)
			{
			this.on('address-ready', this.initByAddress, this);
			this.loadAddress(this.options.addressId, this.setAddress);
			}
		else if (this.options.parentAddressId != undefined)
			{
			this.on('address-ready', this.initByAddress, this);
			this.loadAddress(this.options.parentAddressId, this.setAddress);
			}
		else if (this.options.depend != undefined)
			{
			this.on('address-ready', this.initByAddress, this);
			this.initAddressDepend(this.options.depend);
			}
		else if (this.options.beginLevel == 1)
			{
			this.dict = JSON.parse(window.app.getDict(this.options.dictConfig));
			this.trigger('data-ready');
			}
		else
			{
			console.log('address wrong config');
			}
		},

	initAddressDepend: function ()
		{
		this.options.depend.object.on('change:' + this.options.depend.index, this.getDependAddress, true, this);
		},

	getDependAddress: function ()
		{
		this.options.parentAddressId = this.options.depend.object[this.options.depend.index];

		if (this.options.parentAddressId == undefined)
			{
			this.enabledStatus = 'parentNotSelect';
			this.trigger('data-ready');
			}
		else
			{
			this.loadAddress(this.options.parentAddressId, this.setAddress);
			}

		},

	loadAddress: function (addressId, callBack)
		{
		$.ajax(
			{
				url: this.options.getAddressUrl,
				data: {address_id: addressId},
				type: "GET",
				widget: this,
				success: callBack,
				error: this.serverError,
			});

		},

	setAddress: function (data)
		{
		//warring! another context! this = jxhr, this.widget = widget
		for (var i = 1; i <= this.widget.options.endLevel; i++)
			{
			this.widget.value [this.widget.levels[i].id] = data[i];
			}
		this.widget.enabledStatus = 'enabled';
		this.widget.trigger('address-ready');
		},

	initByAddress: function ()
		{
		if (this.options.beginLevel < 5)
			{
			if (this.options.beginLevel == 1)
				{
				var value = this.value[this.levels[this.options.beginLevel].id].value;
				var type = this.value[this.levels[this.options.beginLevel].id].type;
				this.updateDict(this.options.beginLevel, value, type);
				}

			for (var i = 1; i < Math.min(5, this.options.endLevel); i++)
				{
				var beginLevel = i;
				var value = this.value[this.levels[beginLevel].id].value;
				var type = this.value[this.levels[beginLevel].id].type;
				if (value != undefined && type != undefined)
					{
					this.updateDict(beginLevel + 1, value, type);
					}
				}
			}
		this.trigger('data-ready');
		},

	initInterfaces: function ()
		{
		this.headerInterface = new MKWidgets.AddressNS.HeaderInterface(this, true);
		this.createFieldsInterface = new MKWidgets.AddressNS.CreateFieldsInterface(this, true);
		this.ready = true;
		this.trigger('address-ready');
		},

	getDict: function (level)
		{
		if (this.dict[level] != undefined)
			{
			return this.dict[level];
			}
		else
			{
			return [];
			}
		},

	generateLink: function (level)
		{
		if (level == 1)
			{
			return this.options.dictConfig.dictUrl;
			}
		else
			{
			var link = this.options.dictConfig.dictUrl + '?level=' + level + '&prev';
			}
		},

	updateDict: function (level, kladr, type)
		{
		if (level !== undefined && kladr !== undefined && type !== undefined)
			{
			var config = $.extend({}, this.options.dictConfig);
			config.dictUrl = config.dictUrl + '?level=' + level + '&prev=' + kladr + '&prev_type=' + type;
			config.dictName = config.dictUrl;
			if (window.app.getDict(config) != undefined)
				{
				this.setDict(level, JSON.parse(window.app.getDict(config)));
				}
			}
		},

	setDict: function (level, newDict)
		{
		for (levelCounter = level; levelCounter <= this.options.endLevel; levelCounter++)
			{
			if (newDict[levelCounter] != undefined)
				{
				this.dict[levelCounter] = newDict[levelCounter];
				}
			else
				{
				this.dict[levelCounter] = [];
				}

			if (this.levels[levelCounter].widget != undefined)
				{
				this.levels[levelCounter].widget.object.trigger('dictionary-changed');
				}
			}
		this.level = level;
		},

	selectValueChangedSlot: function ()
		{
		//warring! another context! this = select
		var level = this.options.level + 1,
			type = this.selectedOption[this.options.dictConfig.dictDisplayIndexType],
			kladr = this.selectedOption[this.options.dictConfig.dictIdIndex];
		this.options.parent.updateDict(level, kladr, type);
		this.options.parent.valueChangedSignal();
		},

	inputValueChangedSlot: function ()
		{
		this.trigger('input-value-changed');
		this.valueChangedSignal();
		},

	valueChangedSignal: function ()
		{
		this.setValue();
		this.trigger('value-changed');
		},

	inputValueFocusSlot: function ()
		{
		var input = $(this);
		if (input.val().length == 0)
			{
			input.val(input.attr('nullText'));
			}
		},

	setValue: function ()
		{
		for (var i = 1; i < this.levels.length; i++)
			{
			if (this.levels[i].widget != undefined)
				{
				if (this.levels[i].type == 'select' || this.levels[i].type == 'dependSelect')
					{
					var select = this.levels[i].widget;
					if (select.object.selectedOption != null)
						{
						this.value[select.id] = {
							value: select.object.selectedOption[this.options.dictConfig.dictIdIndex],
							displayValue: select.object.selectedOption[this.options.dictConfig.dictDisplayIndex],
						};
						}
					}
				else if (this.levels[i].type == 'input')
					{
					var input = this.levels[i].widget;
					var value = input.inputField.val();
					inputValue = {
						value: value,
						displayValue: value,
					};
					if (value != "")
						{
						this.value[input.id] = inputValue;
						}
					}
				}
			}

		this.setTextValues();
		},

	setTextValues: function ()
		{
		this.visibleTextValue = this.getTextValue();
		this.fullTextValue = this.getTextValue(1, this.levels.length - 1);
		},

	getTextValue: function (beginLevel, endLevel, includeEntrance, includeFloor)
		{
		beginLevel = beginLevel || this.options.beginLevel;
		endLevel = endLevel || this.options.endLevel;
		if (includeEntrance == null)
			{
			includeEntrance = true;
			}
		if (includeFloor == null)
			{
			includeFloor = true;
			}

		var textValue = "";
		for (var i = beginLevel; i <= endLevel; i++)
			{
			var id = this.levels[i].id;
			if (includeEntrance == false && id == 'entrance')
				{
				continue;
				}
			if (includeFloor == false && id == 'floor')
				{
				continue;
				}

			if (this.value[id].displayValue != null && this.value[id].displayValue != "")
				{
				textValue += this.value[id].displayValue + ', ';
				}
			}
		textValue = textValue.substr(0, textValue.length - 2);
		return textValue;
		},

	getValue: function ()
		{
		return this.value;
		},

	hideFormSlot: function ()
		{
		if (this.options.hideIfNull == true)
			{
			this.options.selectForm.mainBlock.hide();
			}
		},

	showFormSlot: function ()
		{
		if (this.options.hideIfNull == true)
			{
			this.options.selectForm.mainBlock.show();
			}
		},


});

MKWidgets.AddressNS.HeaderInterface = Class({
	extends: WidgetInterface,
	widget: null,
	enable: false,

	constructor: function (widget, enable)
		{
		WidgetInterface.prototype.constructor.apply(this, [widget, enable]);
		this.init();
		},

	init: function ()
		{
		this.widget.domMainInput = $("<input/>");
		//this.widget.domMainInput.attr('placeholder', this.widget.options.title);
		this.widget.domMainInput.addClass('tusur-csp-address-input');

		this.widget.element.append(this.widget.domMainInput); //test string!
		this.widget.domMainInput.on('focus', $.proxy(this.focusMainInputSlot, this));

		//this.linkProps('displayText', 'widget.visibleTextValue');
		//this.mediate('displayText', this.mediateDisplayValue);


		this.bindNode('widget.visibleTextValue', this.widget.domMainInput, {
			setValue: $.proxy(this.setDisplayValue, this)
		});

		this.widget.on('change:enabledStatus', this.toggleEnabled, true, this);
		},

	setDisplayValue: function ()
		{
		var value =  this.widget.visibleTextValue;

		if (this.widget.enabledStatus == 'initiate') //initiate, parentNotSelect, enabled
			{
			this.widget.domMainInput.attr('placeholder', this.widget.options.defaultValue);
			}
		else if (this.widget.enabledStatus == 'parentNotSelect') //initiate, parentNotSelect, enabled
			{
			this.widget.domMainInput.attr('placeholder', this.widget.options.dependNotSelect);
			}
		else if (this.widget.enabledStatus == 'enabled')
			{
			if (value == undefined)
				{
				this.widget.domMainInput.attr('placeholder', this.widget.options.defaultValue);
				}
			else if (value.length == 0)
				{
				this.widget.domMainInput.attr('placeholder', this.widget.options.defaultValue);
				}
			else
				{
				this.widget.domMainInput.val(value);
				}
			}

		},

	focusMainInputSlot: function ()
		{
		this.widget.popup.openPopup();
		},

	toggleEnabled: function ()
		{
		if (this.widget.enabledStatus == 'enabled')
			{
			this.turnOnWidget();
			}
		else
			{
			this.turnOffWidget();
			}
		this.setDisplayValue()
		},

	turnOnWidget: function ()
		{
		this.widget.domMainInput.removeClass('disable');
		this.widget.domMainInput.prop("disabled", false);
		},

	turnOffWidget: function ()
		{
		this.widget.domMainInput.addClass('disable');
		this.widget.domMainInput.prop("disabled", true);
		},


});

MKWidgets.AddressNS.CreateFieldsInterface = Class({
	extends: WidgetInterface,
	widget: null,
	enable: false,

	constructor: function (widget, enable)
		{
		WidgetInterface.prototype.constructor.apply(this, [widget, enable]);
		this.init();
		this.createDom();
		},

	create: function ()
		{
		WidgetInterface.prototype.create.apply(this);
		},

	init: function ()
		{
		this.widget.selects = [];
		this.widget.inputs = [];
		},

	createDom: function ()
		{
		this.domInputFieldsForm = $("<div/>").addClass('tusur-csp-address-form');
		this.widget.bindNode('sandbox', this.domInputFieldsForm);

		var isFirstSelect = true;
		for (var level = this.widget.options.beginLevel; level <= this.widget.options.endLevel; level++)
			{
			var inputSettings = this.widget.levels[level];
			if (inputSettings.type == 'select' && !isFirstSelect)
				{
				inputSettings.type = 'dependSelect';
				}
			this.createField(inputSettings, level);
			if (inputSettings.type == 'select')
				{
				isFirstSelect = false;
				}
			}

		this.widget.popup = new MKWidgets.PopupNS.Tooltip(this.widget.domMainInput, $.extend(this.widget.options.popup, {
			dynamicElement: this.domInputFieldsForm,
			returnElementToDom: true,
			indent: 10,
		}));
		},

	createField: function (inputSettings, level)
		{
		if (inputSettings.type == 'select')
			{
			this.widget.levels[level].widget = this.createMainSelect(level, this.widget.value[this.widget.levels[level].id]);
			}
		else if (inputSettings.type == 'dependSelect')
			{
			this.widget.levels[level].widget = this.createDependSelect(level, this.widget.value[this.widget.levels[level].id]);
			}
		else if (inputSettings.type == 'input')
			{
			this.widget.levels[level].widget = this.createInputFields(inputSettings, this.widget.value[this.widget.levels[level].id]);
			}
		},

	createFormSkin: function (title)
		{
		var titleBlock = $("<div/>").addClass('tusur-csp-address-form-title-block').html(title),
			inputBlock = $("<div/>").addClass('tusur-csp-address-form-input-block'),
			selectForm = $("<div/>").addClass('tusur-csp-address-form-block')
				.append(titleBlock)
				.append(inputBlock)
			;
		return {mainBlock: selectForm, inputBlock: inputBlock};
		},

	createInputFields: function (inputSettings, levelValue)
		{
		if (inputSettings.enable == true)
			{
			var select = this.createFormSkin(inputSettings.Title),
				domInputField = $("<input/>")
					.prop('placeholder', inputSettings.InputTitle)
					.attr('type', 'text')
					.attr('nullText', inputSettings.nullText)
					.addClass('tusur-csp-address-form-input-field')
					.on('input change', $.proxy(this.widget.inputValueChangedSlot, this.widget))
					.on('focus', this.widget.inputValueFocusSlot)
					.val(levelValue.value);
			$(this.widget.sandbox).append(select.mainBlock);
			select.inputBlock.append(domInputField);

			var inputWidget = {
				"id": inputSettings.id,
				"inputField": domInputField,
				object: new MK
			};
			return inputWidget;
			}
		},

	createDependSelect: function (level, levelValue)
		{
		var select = this.createFormSkin(this.widget.levels[level].Title),
			dict = this.widget.dict[level] || [];
		$(this.widget.sandbox).append(select.mainBlock);
		if (this.widget.levels[level].hideIfNull == true)
			{
			select.mainBlock.hide();
			}
		var dependSelect = new MKWidgets.DependsSelectNS.ParentDict(select.inputBlock, {
			defaultDisplayValue: this.widget.levels[level].SelectTitle,
			parent: this.widget,
			inputField: true,
			selectForm: select,
			hideIfNull: this.widget.levels[level].hideIfNull,
			level: level,
			dictConfig: $.extend(this.widget.options.dictConfig, {depend: this.widget.selects}),
			dict: dict,
			value: levelValue.value,
		});
		dependSelect.on('hide-form', this.widget.hideFormSlot);
		dependSelect.on('show-form', this.widget.showFormSlot);
		dependSelect.on('option-changed', this.widget.selectValueChangedSlot);

		var inputWidget = {
			"object": dependSelect,
			"level": level,
			"objectIdIndex": this.widget.options.dictConfig.dictIdIndex,
			"id": this.widget.levels[level].id
		};

		this.widget.selects.push(inputWidget);
		return inputWidget;
		},

	createMainSelect: function (level, levelValue)
		{
		this.mainSelect = this.createFormSkin(this.widget.levels[level].Title);
		$(this.widget.sandbox).append(this.mainSelect.mainBlock);
		this.beginSelect = new MKWidgets.Select(this.mainSelect.inputBlock, {
			defaultDisplayValue: this.widget.levels[level].SelectTitle,
			parent: this.widget,
			inputField: true,
			level: level,
			dictConfig: this.widget.options.dictConfig,
			dict: this.widget.dict[level],
			value: levelValue.value,
		});
		this.beginSelect.on('option-changed', this.widget.selectValueChangedSlot);

		var inputWidget = {
			"object": this.beginSelect,
			"level": level,
			"objectIdIndex": this.widget.options.dictConfig.dictIdIndex,
			"id": this.widget.levels[level].id
		};
		this.widget.selects.push(inputWidget);
		return inputWidget;
		},
});

