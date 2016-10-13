var MKWidgets = MKWidgets || {};
MKWidgets.SelectNS = MKWidgets.SelectNS || {};

MKWidgets.Select = Class({
	extends: MKWidget,

	showList: false,
	selectedOption: null,
	nullSymbol: "-",
	enable: true,
	isRendered: false,


	constructor: function MKWidgets_Select(elementSelector, options)
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
			inputField: true,
			customClass: null,
			defaultDisplayValue: 'Выберите значение',
			activeDisplayValue: 'Выберите значение', //
			defaultNoValues: 'Нет значений',

			popupOptions: {
				dynamicElement: $(),
				background: true,
				positioning: true,
				paddingCorrect: true,
				positionCorrections: {top: 0, left: 0},
				indent: 10,
				returnElementToDom: true,
				parentWidth: true,

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
				this.options.value = dictRow.id ;
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
		this.domDummy = $('<div/>').addClass('custom-select-dummy').text(this.options.defaultNoValues).hide();


		this.on('change:selectedOption',
			function ()
			{
			if (this.selectedOption != null)
				{
				if (this.selectedOption.data[this.dictConfig.dictIdIndex] != null)
					{
					this.value = this.selectedOption.data[this.dictConfig.dictIdIndex];
					this.displayValue = this.selectedOption.data[this.dictConfig.dictDisplayIndex];
					this.trigger('option-changed');
					}
				}
			}, this)

		this.optionsList.render(this.domOptionsList);


		this.domOptionsScroll = $("<div>").addClass("custom-select-list-scroll")
			.append(this.domOptionsList)
			.append(this.domDummy);

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
		this.domHeaderBlock.addClass('disable');
		if (this.inputInterface != undefined)
			{
			this.inputInterface.domInput.prop("disabled", true);
			}
		},

	turnOn: function ()
		{
		this.set('enable', true, {
			silent: true
		});
		if (this.inputInterface != undefined)
			{
			this.inputInterface.domInput.prop("disabled", false);
			}
		this.domHeaderBlock.removeClass('disable');
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
			this.optionsList.forEach(
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
			this.selectedOption = null;
			}

		},

	setTitle: function (title)
		{
		if (this.options.inputField != undefined)
			{
			this.inputInterface.customTitleValue = title;
			}
		else
			{
			this.headerInterface.customTitleValue = title;
			}
		},

	getDisplayValue: function ()
		{
		if (this.selectedOption != null)
			{
			return this.selectedOption.data[this.options.dictConfig.dictIdIndex];
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

	customTitleValue: '',

	constructor: function MKWidgets_SelectNS_SelectHeaderInterface(widget, enable)
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

		this.on('change:customTitleValue', this.setDisplayValue, false, this);
		this.on('widget@change:selectedOption', this.setDisplayValue, true, this);

		this.bindNode('displayValue', this.widget.domInputBlock, MK.binders.text());
		this.bindNode('displayValue', this.widget.domInputBlock, MK.binders.attr('title'));
		this.widget.bindNode('showList', this.widget.domSelect, MK.binders.className('open'))
			.bindNode('showList', this.widget.domHeaderBlock, MK.binders.className('open'));
		this.widget.domHeaderBlock.on('click', $.proxy(this.changeShowList, this));
		},

	setDisplayValue: function ()
		{
		if (this.widget.dict == undefined)
			{
			this.widget.turnOff();
			this.displayValue = this.widget.options.defaultNoValues;
			}
		else if (this.widget.dict.length == 0)
			{
			this.widget.turnOff();
			this.displayValue = this.widget.options.defaultNoValues;
			}
		else
			{
			this.widget.turnOn();
			}

		if (this.widget.selectedOption == undefined)
			{
			if (this.customTitleValue.length > 0)
				{
				this.displayValue = this.customTitleValue;
				}
			else
				{
				this.displayValue = this.widget.options.defaultDisplayValue;
				}
			}
		else
			{
			this.displayValue = this.getDisplayValue();
			}
		},

	changeShowList: function ()
		{
		this.widget.showList = !this.widget.showList;
		},

	getDisplayValue: function()
		{
		return this.widget.selectedOption.data[this.widget.options.dictConfig.dictDisplayIndex];
		}
});

MKWidgets.SelectNS.SelectInputInterface = Class({
	extends: MKWidgets.SelectNS.SelectHeaderInterface,
	widget: null,
	enable: false,

	constructor: function MKWidgets_SelectNS_SelectInputInterface(widget, enable)
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
		this.on("widget@change:selectedOption", this.changeSelectedOptionSlot, this, true);	//widget.selectedOption@change:value
		this.linkProps('displayValue', "widget.selectedOption", this.setDisplayValue);

		this.widget.bindNode('showList', this.widget.domSelect, MK.binders.className('open'));
		this.widget.bindNode('showList', this.widget.domHeaderBlock, MK.binders.className('open'));

		this.widget.domHeaderBlock.on('click', $.proxy(this.changeShowList, this));
		this.widget.on('change:showList', this.changeShowListSlot, this);

		if (this.domInput.val() == '-')
			{
			this.domInput.val('');
			}
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
			this.domInput.val(this.getDisplayValue());
			}
		else
			{
			this.domInput.val('');
			}
		},

	searchStringChangeSlot: function ()
		{
		//this.widget.optionsList.each(
		//	function (option)
		//	{
		//	option.searchInput = this.searchString;
		//	}, this);

		this.widget.optionsList.searchInput = this.searchString;

		this.searchOptionsUpdateSlot();

		this.widget.trigger('options-view-update');
		},

	searchOptionsUpdateSlot: function ()
		{
		var countVisible = 0;
		var lastVisible = null;
		for (var i = 0; i < this.widget.optionsList.length; i++)
			{
			if (this.widget.optionsList[i].show == true)
				{
				countVisible++;
				lastVisible = this.widget.optionsList[i];
				}
			}
		if(this.widget.listInterface != undefined)
			{
			if (countVisible == 1)
				{
				this.widget.listInterface.setSelectedOption(lastVisible);
				}
			if (countVisible == 0)
				{
				this.widget.listInterface.toggleDummy(true);
				}
			else
				{
				this.widget.listInterface.toggleDummy(false);
				}
			}
		},

	changeShowListSlot: function ()
		{
		if (this.widget.showList == true)
			{
			this.domInput.focus();
			this.domInput.select();
			this.searchString = '';
			}
		else
			{
			if (this.widget.selectedOption != undefined)
				{
				this.domInput.val(this.getDisplayValue());
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
		//this.widget.bindNode('showList', this.widget.domOptionsScroll, MK.binders.display());
		this.widget.optionsList.on('*@click::sandbox', this.optionClickSlot, this);
		this.widget.optionsList.on('*@mouseenter::sandbox', this.optionHoverSlot, this);
		this.widget.optionsList.on('mouseout::sandbox', this.mouseOutSlot, this);
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
		this.widget.showList = false;
		},

	setSelectedOption: function (newSelectedOption)
		{
		if (this.widget.selectedOption != undefined)
			{
			this.widget.selectedOption.selected = false;
			}
		newSelectedOption.selected = true;
		this.widget.selectedOption = newSelectedOption;
		},

	listHeight: function ()
		{
		var options = this.widget.domOptionsList.find('.custom-select-option:visible'),
			paddings = parseInt(this.widget.domOptionsList.css('padding-top')) + parseInt(this.widget.domOptionsList.css('padding-bottom')),
			listMaxSize = ($(window).outerHeight() - this.widget.domHeaderBlock.outerHeight() - paddings) / 3,
			optionsMaxSize = options.first().outerHeight() * options.length + paddings
			;

		if (options.length == 0)
			{
			optionsMaxSize = this.widget.domDummy.outerHeight();
			}

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

	mouseOutSlot: function()
		{
		if (this.widget.hoverOption != undefined)
			{
			this.widget.hoverOption.hover = false;
			this.widget.hoverOption = null;
			}
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
				this.listScroll.customScrollbar('scrollTo', option.sandbox);
				}
			else if (event.keyCode == 38)   //upkey
				{
				event.preventDefault();
				event.stopPropagation();
				var option = this.prevHoverOption();
				this.setHoverOption(option);
				this.listScroll.customScrollbar('scrollTo', option.sandbox);
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
			nextOption = this.getFirstVisible(0, this.widget.optionsList.length);
			}
		else
			{
			nextOption = this.getFirstVisible(this.widget.optionsList.indexOf(this.widget.hoverOption) + 1, this.widget.optionsList.length);
			if (nextOption == null)
				{
				nextOption = this.getFirstVisible(0, this.widget.optionsList.length);
				}
			}
		return nextOption;
		},


	prevHoverOption: function ()
		{
		var nextOption = null;
		if (this.widget.hoverOption == null)
			{
			nextOption = this.getFirstVisible(this.widget.optionsList.length - 1, 0);
			}
		else
			{
			nextOption = this.getFirstVisible(this.widget.optionsList.indexOf(this.widget.hoverOption) - 1, 0);
			if (nextOption == null)
				{
				nextOption = this.getFirstVisible(this.widget.optionsList.length - 1, 0);
				}
			}
		return nextOption;
		},

	getFirstVisible: function (begin, end)
		{
		for (var i = begin; begin <= end ? i <= end && i >= 0 && i < this.widget.optionsList.length : i >= end && i >= 0 && i < this.widget.optionsList.length; begin <= end ? i++ : i--)
			{
			if (this.widget.optionsList[i].show == true)
				{
				return this.widget.optionsList[i];
				}
			}
		return null;
		},

	toggleDummy: function (show)
		{
		if (show)
			{
			this.widget.domOptionsList.hide();
			this.widget.domDummy.show();
			}
		else
			{
			this.widget.domOptionsList.show();
			this.widget.domDummy.hide();
			}
		this.widget.trigger('options-view-update');
		}

});

MKWidgets.SelectNS.SelectModel = Class({
	'extends': MK.Object,
	hover: false,
	show: true,
	searchInput: '',

	constructor: function (data, parent)
		{
		this.parent = parent;
		this.widget = parent.parent;
		this.dictConfig = this.parent.parent.options.dictConfig;

		//this.jset(data);
		this.data = data;
		this.value = this.data[this.dictConfig.dictIdIndex];
		this.displayValue = this.data[this.dictConfig.dictDisplayIndex];
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


		this.on('parent@change:searchInput', this.searchDisplay, this);
		},

	isSelected: function ()
		{
		if (this.widget.options.value === this.data[this.dictConfig.dictIdIndex])
			{
			this.widget.selectedOption = this;
			return true;
			}
		return false;
		},

	searchDisplay: function ()
		{
		if (this.parent.searchInput != '')
			{
			this.show = false;
			if ((this.data[this.dictConfig.dictDisplayIndex] + '').toLowerCase()
					.indexOf((this.parent.searchInput + '').toLowerCase()) > -1)
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

