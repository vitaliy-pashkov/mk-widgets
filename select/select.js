var MKWidgets = MKWidgets || {};
MKWidgets.SelectNS = MKWidgets.SelectNS || {};
MKWidgets.DependsSelectNS = MKWidgets.DependsSelectNS || {};


MKWidgets.Select = Class({
	extends: MKWidget,

	showList: false,
	selectedOption: null,
	nullSymbol: "-",
	enable: true,
	isRendered: false,

	constructor: function (elementSelector, options)
		{
		MKWidget.prototype.constructor.apply(this, [elementSelector, options]);
		this.setOptions({
			dictConfig: {
				dictIdIndex: 'value',
				dictDisplayIndex: 'text',
				nullValue: false,
			},
			renderOnInit: true,
			dict: null,
			value: null,
			inputField: false,
			customClass: null,
			defaultDisplayValue: 'Выберите значение',
			activeDisplayValue: 'Выберите значение', //
			defaultNoValues: 'Нет значений',
			popupOptions: {
				dynamicElement: $(),
				background: false,
				positioning: true,
				paddingCorrect: true,
				positionCorrections: {top: 0, left: 0},
				returnElementToDom: true,
				parentWidth: false
			}
		});

		this.setOptions(options);

		if (this.element.is('select'))
			{
			this.setupByDomSelect();
			}

		this.initSelect();
		},

	initSelect: function ()
		{
		this.getDict();
		this.optionsList = new MKWidgets.SelectNS.SelectArray(this.dict, this);

		if (this.options.renderOnInit == true)
			{
			this.render();
			}
		},

	render: function ()
		{
		this.isRendered = true;
		this.createDom();
		this.createInterfaces();

		if (this.selectedOptionByDom != undefined)
			{
			this.listInterface.setSelectedOption(this.selectedOptionByDom);
			}
		},

	setupByDomSelect: function ()
		{
		var dict = [];
		this.element.find("option").each($.proxy(
			function (index, value)
			{
			var dictRow = {
				id: $(value).val(),
				text: $(value).text()
			};

			$(value.attributes).each(
				function ()
				{
				if (this.name.indexOf('data-') == 0)
					{
					dictRow[this.name] = this.value;
					}
				});


			var dependId = this.options.dictConfig.dictDependIdIndex;

			if (dependId != undefined)
				{
				if ($(value).attr(dependId) != undefined)
					{
					dictRow[dependId] = $(value).attr(dependId);
					}
				}
			dict.push(dictRow);
			if ($(value).attr('selected') == 'selected')
				{
				this.selectedOptionByDom = dictRow;
				}
			}, this));
		this.options.dict = dict;
		this.options.dictConfig.dictIdIndex = 'id';
		this.options.dictConfig.dictDisplayIndex = 'text';

		this.domSelect = this.element;
		this.domSelect.hide();
		this.element = this.element.parent();
		},

	getDict: function ()
		{
		if (this.options.dict != null)
			{
			this.options.dictConfig.dictName = window.app.saveDict(this.options.dict, this.element.prop('id'));
			if (this.options.dictConfig.dictName == undefined && this.element.prop('id') != undefined)
				{
				this.options.dictConfig.dictName = this.element.prop('id');
				}
			}
		if (this.dictConfig == undefined)
			{
			this.dictConfig = this.options.dictConfig
			}

		this.dict = window.app.getDict(this.dictConfig);
		},

	renewDict: function ()
		{
		this.dict = window.app.getDict(this.dictConfig);
		},

	createDom: function ()
		{
		this.domSelect = $("<div>").addClass('custom-select');

		this.domImageBlock = $("<div>").addClass('custom-select-close-image');
		this.domInputBlock = $("<div>").addClass('custom-select-input-block');
		this.domHeaderBlock = $("<div>").addClass('custom-select-header');
		this.domHeaderBlock.append(this.domInputBlock);
		this.domHeaderBlock.append(this.domImageBlock);

		this.domOptionsList = $("<div>").addClass('custom-select-list');


		this.on('change:selectedOption',
			function ()
			{
			if (this.selectedOption != null)
				{
				if(this.selectedOption.value != null)
					{
					this.value = this.selectedOption[this.dictConfig.dictIdIndex];
					this.displayValue = this.selectedOption[this.dictConfig.dictDisplayIndex];
					//if(this.displayValue == null)
					//	{
					//	this.options.defaultDisplayValue;
					//	}
					//this[this.options.dictConfig.dictIdIndex] = this.selectedOption.value;
					this.trigger('option-changed');
					}
				}
				//else
				//{
				//this.value = null;
				//this.inputInterface.displayValue = this.options.defaultDisplayValue;
				//}
			}, this)

		//
		this.optionsList.render(this.domOptionsList);


		this.domOptionsScroll = $("<div>").addClass("custom-select-list-scroll")
			.append(this.domOptionsList);

		this.domSelect
			.append(this.domHeaderBlock)
			.append(this.domOptionsScroll)
		;

		this.options.popupOptions.dynamicElement = $(this.domOptionsScroll);

		this.element.append(this.domSelect);

		this.popup = new MKWidgets.PopupNS.Tooltip(this.domHeaderBlock, this.options.popupOptions);

		if (this.options.customClass != null)
			{
			this.domOptionsScroll.addClass(this.options.customClass);
			this.domHeaderBlock.addClass(this.options.customClass);
			}

		this.binding();
		},

	turnOff: function ()
		{
		this.set('enable', false, {
			silent: true
		});
		this.domInputBlock.addClass('disable');
		if(this.inputInterface != undefined)
			{
			this.inputInterface.domInput.prop( "disabled", true );
			}
		this.domImageBlock.addClass('disable');
		},

	turnOn: function ()
		{
		this.set('enable', true, {
			silent: true
		});
		if(this.inputInterface != undefined)
			{
			this.inputInterface.domInput.prop( "disabled", false );
			}
		this.domInputBlock.removeClass('disable');
		this.domImageBlock.removeClass('disable');
		},

	binding: function ()
		{
		this.popup.on('popup-close',
			function ()
			{
			this.showList = false;
			}, this);
		this.on('change:showList',
			function ()
			{
			if (this.enable == false && this.showList == true)
				{
				this.showList = false;
				}
			if (this.showList == true)
				{
				this.popup.openPopup();
				this.trigger('showList');
				}
			else
				{
				this.popup.closePopup();
				this.trigger('hideList');
				}
			}, this);
		this.on('change:enable',
			function ()
			{
			if (this.enable == true)
				{
				this.turnOn();
				}
			else
				{
				this.turnOff();
				}
			}, this);
		},

	setSelectedOptionById: function (selectedOptionId)
		{
		if (selectedOptionId != null)
			{
			this.dict.forEach(
				function (option)
				{
				if (option[this.options.dictConfig.dictIdIndex] == selectedOptionId)
					{
					this.selectedOption = option;
					return false;
					}
				}, this);
			}
		else
			{
			//this.set('selectedOption', null, {
			//	silent: true
			//});
			var selectedOption = {};
			selectedOption[this.dictConfig.dictIdIndex] = null;
			selectedOption[this.dictConfig.dictDisplayIndex] = "";//this.options.activeDisplayValue;
			this.selectedOption = selectedOption;
			}

		},

	setTitle: function (title)
		{
		if (this.options.inputField == true)
			{
			this.inputInterface.displayValue = title;
			}
		else
			{
			this.headerInterface.displayValue = title;
			}
		},

	getDisplayValue: function ()
		{
		if (this.selectedOption != null)
			{
			return this.selectedOption[this.options.dictConfig.dictIdIndex];
			}
		else
			{
			return 0;
			}
		},

	createInterfaces: function ()
		{
		if (this.options.inputField == true)
			{
			this.inputInterface = new MKWidgets.SelectNS.SelectInputInterface(this, this.options.inputField);
			}
		else
			{
			this.headerInterface = new MKWidgets.SelectNS.SelectHeaderInterface(this, true);
			}
		this.listInterface = new MKWidgets.SelectNS.SelectListInterface(this, true);
		},

	deleteSelect: function ()
		{
		this.popup.deletePopUp();
		},
});

MKWidgets.SelectNS.SelectHeaderInterface = Class({
	extends: WidgetInterface,
	widget: null,
	enable: false,

	constructor: function (widget, enable)
		{
		WidgetInterface.prototype.constructor.apply(this, [widget, enable]);
		},

	create: function ()
		{
		WidgetInterface.prototype.create.apply(this);
		},

	turnOn: function ()
		{
		this.enabled = true;
		this.linkProps('displayValue', "widget.selectedOption", this.setDisplayValue);
		this.bindNode('displayValue', this.widget.domInputBlock, MK.binders.html());
		this.bindNode('displayValue', this.widget.domInputBlock, MK.binders.attr('title'));
		this.widget.bindNode('showList', this.widget.domSelect, MK.binders.className('open'))
			.bindNode('showList', this.widget.domHeaderBlock, MK.binders.className('open'));
		this.widget.domHeaderBlock.on('click', $.proxy(this.changeShowList, this));
		},

	setDisplayValue: function (selectedOption)
		{
		if (this.widget.dict == null)
			{
			this.widget.turnOff();
			return this.widget.options.defaultNoValues;
			}
		if (selectedOption === undefined && this.widget.optionsList.length > 0)
			{
			this.widget.turnOn();
			return this.widget.options.defaultDisplayValue;
			}
		else if (selectedOption === null && this.widget.optionsList.length > 0)
			{
			this.widget.turnOn();
			return this.widget.options.activeDisplayValue;
			}
		else if (this.widget.dict.length == 0)
			{
			this.widget.turnOff();
			return this.widget.options.defaultNoValues;
			}
		return selectedOption[this.widget.options.dictConfig.dictDisplayIndex];
		},

	changeShowList: function ()
		{
		this.widget.showList = !this.widget.showList;
		},
});

MKWidgets.SelectNS.SelectInputInterface = Class({
	extends: MKWidgets.SelectNS.SelectHeaderInterface,
	widget: null,
	enable: false,

	constructor: function (widget, enable)
		{
		MKWidgets.SelectNS.SelectHeaderInterface.prototype.constructor.apply(this, [widget, enable]);
		},

	create: function ()
		{
		MKWidgets.SelectNS.SelectHeaderInterface.prototype.create.apply(this);
		},

	turnOn: function ()
		{
		this.enabled = true;
		this.domInput = $("<input/>").attr('type', 'text').addClass('custom-select-input-field')
			.prop('placeholder', this.widget.options.defaultDisplayValue);
		this.widget.domInputBlock.append(this.domInput);
		this.domInput.on('click', $.proxy(this.inputClickSlot, this));

		this.domInput.on('input', $.proxy(this.inputChangeSlot, this));
		this.on('change:searchString', this.searchStringChangeSlot, this);
		this.on("widget.selectedOption@change:value", this.changeSelectedOptionSlot, this, true);	//widget@change:selectedOption

		this.widget.bindNode('showList', this.widget.domSelect, MK.binders.className('open'))
			.bindNode('showList', this.widget.domHeaderBlock, MK.binders.className('open'));

		this.widget.domHeaderBlock.on('click', $.proxy(this.changeShowList, this));
		this.widget.on('change:showList', this.changeShowListSlot, this);
		},

	turnOff: function ()
		{
		this.enabled = false;
		},

	inputChangeSlot: function (event)
		{
		this.searchString = $(event.target).val();
		},

	changeSelectedOptionSlot: function (event)
		{
		if (this.widget.selectedOption != null)
			{
			this.domInput.val(this.widget.selectedOption.displayValue);
			}
		},

	searchStringChangeSlot: function ()
		{
		this.widget.optionsList.each(
			function (option)
			{
			option.searchInput = this.searchString;
			}, this);
		this.widget.trigger('options-view-update');
		},

	changeShowListSlot: function ()
		{
		if (this.widget.showList == true)
			{
			this.domInput.focus();
			this.searchString = '';
			}
		else
			{
			if (this.widget.selectedOption != undefined)
				{
				this.domInput.val(this.widget.selectedOption.displayValue);
				}
			else
				{
				this.domInput.val('');
				}
			}
		},

	inputClickSlot: function (event)
		{
		if (this.widget.showList == true)
			{
			event.stopPropagation();
			}
		},


});

MKWidgets.SelectNS.SelectListInterface = Class({
	extends: WidgetInterface,
	widget: null,
	enable: false,

	constructor: function (widget, enable)
		{
		WidgetInterface.prototype.constructor.apply(this, [widget, enable]);
		this.initScrollbar();
		},

	create: function ()
		{
		WidgetInterface.prototype.create.apply(this);
		},

	turnOn: function ()
		{
		this.enabled = true;
		this.widget.bindNode('showList', this.widget.domOptionsScroll, MK.binders.display());
		this.widget.optionsList.on('*@click::sandbox', this.optionClickSlot, this);
		this.widget.optionsList.on('*@mouseenter::sandbox', this.optionHoverSlot, this);
		$(document).keydown($.proxy(this.keyPressSlot, this));
		},

	turnOff: function ()
		{
		this.enabled = false;
		},

	initScrollbar: function ()
		{
		if (this.listScroll == undefined)
			{
			this.listScroll = $(this.widget.domOptionsScroll)
				.addClass("thin-skin")
				.customScrollbar(CustomScrollbarSettings);
			//this.DomScrollOverview = $(this.widget.domOptionsScroll).find('.overview');
			//this.DomScrollScrollable = $(this.widget.domOptionsScroll).find('.scrollable');
			}
		this.listScroll.customScrollbar("resize", true);
		this.widget.on('change:showList options-view-update', this.optionsViewUpdate, this);
		//$(window).resize($.proxy(this.listHeight, this));
		},

	optionsViewUpdate: function ()
		{
		if (this.widget.showList == true)
			{
			this.listScroll.customScrollbar("resize", true);
			this.listHeight();
			this.widget.popup.trigger('content-ready');
			}
		},

	optionClickSlot: function (event)
		{
		var option = $(event.target).data('option');
		this.setSelectedOption(option);
		},

	setSelectedOption: function (newSelectedOption)
		{
		if (this.widget.selectedOption != undefined)
			{
			this.widget.selectedOption.selected = false;
			}
		newSelectedOption.selected = true;
		this.widget.selectedOption = newSelectedOption;

		this.widget.showList = false;
		},

	listHeight: function ()
		{
		var options = this.widget.domOptionsList.find('.custom-select-option:visible'),
			paddings = parseInt(this.widget.domOptionsList.css('padding-top')) + parseInt(this.widget.domOptionsList.css('padding-bottom')),
			listMaxSize = ($(window).outerHeight() - this.widget.domHeaderBlock.outerHeight() - paddings) / 2,
			optionsMaxSize = options.first().outerHeight() * options.length + paddings
			;

		if (listMaxSize > optionsMaxSize)
			{
			this.widget.domOptionsScroll.css('max-height', optionsMaxSize)
				.css('height', optionsMaxSize);
			this.widget.domOptionsScroll.parent().css('height', optionsMaxSize);
			}
		else
			{
			this.widget.domOptionsScroll.css('max-height', listMaxSize)
				.css('height', listMaxSize);
			this.widget.domOptionsScroll.parent().css('height', listMaxSize);
			}

		//if (options.length > 10)
		//	{
		//	var height = (options.first().outerHeight() * 10 + paddings) + 'px';
		//	this.widget.domOptionsScroll.css('max-height', height)
		//		.css('height', height);
		//	this.widget.domOptionsScroll.parent().css('height', height);
		//	}
		//else
		//	{
		//	var height = (options.first().outerHeight() * options.length + paddings) + 'px';
		//	this.widget.domOptionsScroll.css('max-height', height)
		//		.css('height', height);
		//	this.widget.domOptionsScroll.parent().css('height', height);
		//	}
		this.listScroll.customScrollbar("resize", true);
		},

	optionHoverSlot: function (event)
		{
		var option = $(event.target).data('option');
		this.setHoverOption(option);
		},

	setHoverOption: function (newHoverOption)
		{
		if (this.widget.hoverOption != undefined)
			{
			this.widget.hoverOption.hover = false;
			}
		newHoverOption.hover = true;
		this.widget.hoverOption = newHoverOption;
		},

	keyPressSlot: function (event)
		{
		if (this.widget.showList == true)
			{
			if (event.keyCode == 40)	//downkey, tab
				{
				event.preventDefault();
				event.stopPropagation();
				var option = this.nextHoverOption();
				this.setHoverOption(option);
				}
			else if (event.keyCode == 38)   //upkey
				{
				event.preventDefault();
				event.stopPropagation();
				var option = this.prevHoverOption();
				this.setHoverOption(option);
				}
			else if (event.keyCode == 13)   //enter
				{
				event.preventDefault();
				event.stopPropagation();
				this.setSelectedOption(this.widget.hoverOption);

				}
			else if (event.keyCode == 27)   //esc
				{
				event.preventDefault();
				event.stopPropagation();
				this.widget.showList = false;
				}
			}
		},

	nextHoverOption: function ()
		{
		var nextOption = null;
		if (this.widget.hoverOption == null)
			{
			nextOption = this.widget.domOptionsList.find('.custom-select-option:visible:first').data('option');
			}
		else
			{
			nextOption = $(this.widget.hoverOption.sandbox).next(':visible').data('option');
			if (nextOption == null)
				{
				nextOption = $(this.widget.hoverOption.sandbox)
					.parent()
					.find('.custom-select-option:visible:first')
					.data('option');
				}
			}
		return nextOption;
		},

	prevHoverOption: function ()
		{
		var nextOption = null;
		if (this.widget.hoverOption == null)
			{
			nextOption = this.widget.domOptionsList.find('.custom-select-option:visible:last').data('option');
			}
		else
			{
			nextOption = $(this.widget.hoverOption.sandbox).prev(':visible').data('option');
			if (nextOption == null)
				{
				nextOption = $(this.widget.hoverOption.sandbox)
					.parent()
					.find('.custom-select-option:visible:last')
					.data('option');
				}
			}

		return nextOption;
		},

});

MKWidgets.SelectNS.SelectModel = Class({
	'extends': MK.Object,
	hover: false,
	show: true,
	searchInput: '',

	constructor: function (data, parent)
		{
		this.parent = parent;
		this.dictConfig = this.parent.parent.options.dictConfig;

		this.jset(data);
		this.value = this[this.dictConfig.dictIdIndex];
		this.displayValue = this[this.dictConfig.dictDisplayIndex];
		this.selected = this.isSelected();

		this.on('render', this.render, this);
		},

	render: function ()
		{
		$(this.sandbox).data('option', this);
		this.bindNode('displayValue', ':sandbox', MK.binders.html());
		this.bindNode('displayValue', ':sandbox', MK.binders.attr("title"));
		this.bindNode('selected', ':sandbox', MK.binders.className('selected'));
		this.bindNode('show', ':sandbox', MK.binders.display());
		this.bindNode('hover', ':sandbox', MK.binders.className('hover'));


		this.on('change:searchInput', this.searchDisplay, this);
		},

	isSelected: function ()
		{
		if (this.parent.parent.options.value === this[this.dictConfig.dictIdIndex])
			{
			this.parent.parent.selectedOption = this;
			return true;
			}
		return false;
		},

	searchDisplay: function ()
		{
		if (this.searchInput != '')
			{
			this.show = false;
			if (this[this.dictConfig.dictDisplayIndex].toLowerCase().indexOf(this.searchInput.toLowerCase()) > -1)
				{
				this.show = true;
				}
			}
		else
			{
			this.show = true;
			}
		},
});

MKWidgets.SelectNS.SelectArray = Class({
	'extends': MK.Array,
	Model: MKWidgets.SelectNS.SelectModel,
	itemRenderer: '<div class="custom-select-option"></div>',

	constructor: function (data, parent)
		{
		this.parent = parent;
		this.recreate(data, {dontRender: true});
		},

	render: function (domOptionsList)
		{
		this.bindNode('sandbox', domOptionsList);
		this.rerender();
		}

});

MKWidgets.DependsSelect = Class({
	extends: MKWidgets.Select,
	dependValues: {},

	constructor: function (elementSelector, options)
		{
		MKWidgets.Select.prototype.constructor.apply(this, [elementSelector, options]);
		this.setOptions({
			dictConfig: {
				//dictDependIdIndex: undefined,
				//formDependIdIndex: undefined,
				dictIdIndex: 'value',
				dictDisplayIndex: 'text',
				nullValue: false,
				dictUrl: null,
				depend: [], //[{object, objectIdIndex, dictIdIndex},...{}]
				cache: true,
			},
			dict: null,
			defaultDisplayValue: 'Сначала выберите значение родителя',
			activeDisplayValue: 'Выберите значение',
			noValuesText: 'Нет значений',
			//parentElements: null,   //MK objects

		});

		this.setOptions(options);

		this.initDependSelect();
		},

	initSelect: function ()
		{
		},

	initDependSelect: function ()
		{
		this.initDepends();
		this.getDict();
		this.optionsList = new MKWidgets.SelectNS.SelectArray(this.dict, this);

		if (this.options.renderOnInit == true)
			{
			this.render();
			}
		},

	render: function ()
		{
		this.isRendered = true;
		this.createDom();
		this.createInterfaces();
		this.updateOptions();
		},

	initDepends: function ()
		{
		this.dictConfig = Entity.assignObject({}, this.options.dictConfig);

		if (this.dict != null)
			{
			this.dictConfig.dictName = window.app.saveDict(this.dict, this.element.prop('id'));
			}

		if (!this.dictConfig.depend instanceof Array)
			{
			this.dictConfig.depend = [this.dictConfig.depend];
			}
		var depend = this.dictConfig.depend;
		for (var i in depend)
			{
			if (depend[i]['dictIdIndex'] == undefined)
				{
				depend[i]['dictIdIndex'] = depend[i]['objectIdIndex'];
				}
			if (!(depend[i].object instanceof MK))
				{
				depend[i].object = new MK;
				}
			this.dependEvent(depend[i]);
			}
		this.updateDependValues();
		this.updateOptions();
		},

	dependEvent: function(depend)
		{
		depend.object.on('change:' + depend['objectIdIndex'], this.updatesOptionsSlot, this);
		},

	updatesOptionsSlot: function ()
		{
		this.updateDependValues();
		this.dict = window.app.getDict(this.dictConfig);
		this.updateOptions();
		this.setSelectedOptionById(null);
		},

	updateOptions: function ()
		{
		var depend = this.dictConfig.depend,
			newOptions = [];

		if (depend != undefined && this.dict != undefined)
			{
			this.dict.forEach(
				function (dictRow)
				{
				var pushFlag = true;
				for (var i in depend)
					{
					if (!(dictRow[depend[i]['dictIdIndex']] == depend[i]['object'][depend[i].objectIdIndex] ||
						dictRow[depend[i][depend[i].dictIdIndex]] == this.nullSymbol))
						{
						pushFlag = false;
						}
					}
				if (pushFlag == true)
					{
					newOptions.push(dictRow);
					}
				}, this);
			}
		this.recreateOptions(newOptions);
		},

		updateDependValues: function ()
			{
			this.allValuesFlag = true;
			var depend = this.dictConfig.depend;

		this.dependValues = {};
		for (var i in depend)
			{
			var dependValue = depend[i].object[depend[i].objectIdIndex];
			if (dependValue == undefined)
				{
				this.allValuesFlag = false;
				}
			this.dependValues[depend[i].objectIdIndex] = dependValue;
			}
		this.dictConfig.dictUrlData = this.dependValues;
		},

	recreateOptions: function (newOptions)
		{
		if (this.isRendered)
			{
			this.optionsList.recreate(newOptions);

			if (this.allValuesFlag == true)
				{
				if (newOptions.length > 0)
					{
					this.turnOn();

					if (this.selectedOption != null)
						{
						this.setTitle(this.displayValue);
						}
					else
						{
						this.setTitle(this.options.activeDisplayValue);
						}
					}
				else
					{
					//this.turnOff();
					this.setTitle(this.options.noValuesText);
					}
				}
			else
				{
				this.turnOff();
				this.setTitle(this.options.defaultDisplayValue);
				}
			}
		this.trigger('recreateArray');
		},
});

MKWidgets.DependsSelectNS.parentDict = Class({
	extends: MKWidgets.DependsSelect,
	dict: [],

	constructor: function (elementSelector, options)
		{
		MKWidgets.DependsSelect.prototype.constructor.apply(this, [elementSelector, options]);
		this.setOptions({
			parent: {},
			level: 1,
		});
		this.setOptions(options);
		//this.parent = this.options.parent;
		},

	render: function ()
		{
		this.isRendered = true;
		this.createDom();
		this.createInterfaces();
		this.updateOptions();
		},

	dependEvent: function(depend)
		{
		depend.object.options.parent.on('dictionary-changed', this.updatesOptionsSlot, true, this);
		},

	updatesOptionsSlot: function ()
		{
		if(this.options.parent.level <= this.options.level)
			{
			this.dict = this.options.parent.getDict(this.options.level);
			//this.setTitle(this.options.defaultDisplayValue);
			this.setSelectedOptionById(null);
			}
		if(this.dict.length == 0)
			{
			this.allValuesFlag = false;
			this.trigger('hide-form');
			}
		else
			{
			this.allValuesFlag = true;
			this.trigger('show-form');
			}
		this.recreateOptions(this.dict);
		},

	getDict: function ()
		{
		if(this.parent != undefined)
			{
			this.dict = this.parent.getDict(this.options.level);
			//if()
			}
		},
});