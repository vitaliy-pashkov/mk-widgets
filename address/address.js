var MKWidgets = MKWidgets || {};
MKWidgets.AddressNS = MKWidgets.AddressNS || {};

MKWidgets.Address = Class({
	extends: MKWidget,
	dict: {},
	selectLevels: {
		1: {
			id: "state",
			Title: "Область",
			SelectTitle: "Выберите область",
		},
		2: {
			id: "area",
			Title: "Город/округ",
			hideIfNull: false,
			SelectTitle: "Выберите город/округ",
		},
		3: {
			id: "city",
			Title: "Населенный пункт",
			hideIfNull: true,
			SelectTitle: "Выберите населенный пункт",
		},
		4: {
			id: "street",
			Title: "Улица",
			hideIfNull: false,
			SelectTitle: "Выберите улицу",
		}
	},
	inputLevels: {
		1: {
			id: "home",
			Title: "Дом",
			InputTitle: "Введите номер дома",
			nullText: "дом ",
			enable: true
		},
		2: {
			id: "flat",
			Title: "Квартира",
			InputTitle: "Введите номер квартиры",
			nullText: "квартира ",
			enable: true
		},
		3: {
			id: "entrance",
			Title: "Вход",
			InputTitle: "Введите данные входа",
			nullText: "подъезд ",
			enable: true
		},
		4: {
			id: "floor",
			Title: "Этаж",
			InputTitle: "Введите этаж",
			nullText: "этаж ",
			enable: true
		},
	},

	constructor: function (elementSelector, options)
		{
		this.options.inputField = true;
		MKWidget.prototype.constructor.apply(this, [elementSelector, options]);
		this.setOptions({
			//data: "/kladr/getinfo",
			dictConfig: {
				dictUrl: '/kladr/getinfo', //?level=2&prev=7700&prev_type=uu',//?level=2&prev=7000',
				dictIdIndex: 'kladr',
				dictDisplayIndex: 'displayValue',
				dictDisplayIndexType: 'type',
				nullValue: false,
			},
			//beginLevel: 2,
			//beginData: {kladr: 7000, type: 'обл'},
			beginLevel: 1,
			beginData: {},
			endLevel: 4,
			entrance: true,
			floor: true,
			title: "Выберите значение",
		});
		this.setOptions(options);
		this.init();
		this.initInterfaces();
		},

	init: function ()
		{
		this.inputLevels[3].enable = this.options.entrance;
		this.inputLevels[4].enable = this.options.floor;
		if (this.options.beginLevel == 1)
			{
			this.dict = JSON.parse(window.app.getDict(this.options.dictConfig));
			}
		else
			{
			var kladr = this.options.beginData.kladr,
				type = this.options.beginData.type;
			this.updateDict(this.options.beginLevel - 1, kladr, type);
			}
		},

	initInterfaces: function ()
		{
		this.createFieldsInterface = new MKWidgets.AddressNS.CreateFieldsInterface(this, true);
		this.headerInterface = new MKWidgets.AddressNS.HeaderInterface(this, true);
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

	focusMainInputSlot: function ()
		{
		this.popup.openPopup();
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
			level++;
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
			}
		this.level = level;
		},

	selectValueChangedSlot: function ()
		{
		//this.popup.closePopup();
		var level = this.options.level,
			type = this.selectedOption[this.options.dictConfig.dictDisplayIndexType],
			kladr = this.selectedOption[this.options.dictConfig.dictIdIndex];
		this.options.parent.updateDict(level, kladr, type);
		this.options.parent.trigger('dictionary-changed');
		//console.log(level, kladr, type);
		},

	inputValueChangedSlot: function ()
		{
		this.trigger('input-value-changed');
		},

	inputValueFocusSlot: function ()
		{
		var input = $(this);
		if (input.val().length == 0)
			{
			input.val(input.attr('nullText'));
			//this.setSelectionRange(input.val().length, input.val().length);
			}
		//console.log();
		},

	getValues: function ()
		{
		var addressFormValues = {};
		this.selects.forEach(function (select)
		{
		if (select.object.selectedOption != null)
			{
			addressFormValues[select.id] = {
				//"level": select.object.selectedOption.level,
				"value": select.object.selectedOption[this.options.dictConfig.dictIdIndex],
				"displayValue": select.object.selectedOption[this.options.dictConfig.dictDisplayIndex],
				//"type": select.object.selectedOption.type
			};
			}
		}, this);
		this.inputs.forEach(function (input)
		{
		var value = input.inputField.val();
		inputValue = {
			value: value,
			displayValue: value,
		};
		if (value != "")
			{
			addressFormValues[input.id] = inputValue;
			}
		});
		return addressFormValues;
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

})
;

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
		this.widget.on('dictionary-changed input-value-changed', this.updateInput, this);
		},

	updateInput: function ()
		{
		var values = this.widget.getValues()
		mainInputValue = '';
		MK.each(values, function (inputData)
		{
		if (inputData.displayValue != null && inputData.displayValue != "")
			{
			mainInputValue += inputData.displayValue + ', ';
			}
		});
		mainInputValue = mainInputValue.substr(0, mainInputValue.length - 2);
		this.widget.domMainInput.val(mainInputValue);
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
		this.widget.domMainInput = $("<input/>")
			.attr('placeholder', this.widget.options.title)
			.addClass('tusur-csp-address-input');

		this.domInputFieldsForm = $("<div/>").addClass('tusur-csp-address-form');
		this.widget.bindNode('sandbox', this.domInputFieldsForm);
		this.widget.element.append(this.widget.domMainInput); //test string!

		this.createMainSelect(this.widget.options.beginLevel);
		for (level = this.widget.options.beginLevel + 1; level <= this.widget.options.endLevel; level++)
			{
			var dependSelect = this.createDependSelect(level);
			}
		$.each(this.widget.inputLevels, $.proxy(function (index, inputSettings)
		{
		this.createInputFields(inputSettings);
		}, this));
		this.widget.popup = new MKWidgets.PopupNS.Tooltip(this.widget.domMainInput, {
			dynamicElement: this.domInputFieldsForm,
			returnElementToDom: true,
			indent: 10,
		});
		this.widget.domMainInput.on('focus', $.proxy(this.widget.focusMainInputSlot, this.widget));
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

	createInputFields: function (inputSettings)
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
					.on('focus', this.widget.inputValueFocusSlot);
			$(this.widget.sandbox).append(select.mainBlock);
			select.inputBlock.append(domInputField);
			this.widget.inputs.push({
				"id": inputSettings.id,
				"inputField": domInputField
			});
			}
		},

	createDependSelect: function (level)
		{
		var select = this.createFormSkin(this.widget.selectLevels[level].Title),
			dict = this.widget.dict[level] || [];
		$(this.widget.sandbox).append(select.mainBlock);
		if (this.widget.selectLevels[level].hideIfNull == true)
			{
			select.mainBlock.hide();
			}
		var dependSelect = new MKWidgets.DependsSelectNS.parentDict(select.inputBlock, {
			defaultDisplayValue: this.widget.selectLevels[level].SelectTitle,
			parent: this.widget,
			inputField: true,
			selectForm: select,
			hideIfNull: this.widget.selectLevels[level].hideIfNull,
			"level": level,
			"dictConfig": $.extend(this.widget.options.dictConfig, {depend: this.widget.selects}),
			"dict": dict,
		});
		dependSelect.on('hide-form', this.widget.hideFormSlot)
			.on('show-form', this.widget.showFormSlot);
		this.widget.selects.push({
			"object": dependSelect,
			"level": level,
			"objectIdIndex": this.widget.options.dictConfig.dictIdIndex,
			"id": this.widget.selectLevels[level].id
		});
		dependSelect.on('option-changed', this.widget.selectValueChangedSlot);
		},


	createMainSelect: function (level)
		{
		this.mainSelect = this.createFormSkin(this.widget.selectLevels[level].Title);
		$(this.widget.sandbox).append(this.mainSelect.mainBlock);
		this.beginSelect = new MKWidgets.Select(this.mainSelect.inputBlock, {
			defaultDisplayValue: this.widget.selectLevels[level].SelectTitle,
			parent: this.widget,
			inputField: true,
			"level": level,
			"dictConfig": this.widget.options.dictConfig,
			"dict": this.widget.dict[level]
		});
		this.widget.selects.push({
			"object": this.beginSelect,
			"level": level,
			"objectIdIndex": this.widget.options.dictConfig.dictIdIndex,
			"id": this.widget.selectLevels[level].id
		});
		this.beginSelect.on('option-changed', this.widget.selectValueChangedSlot);
		},
});

