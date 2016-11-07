var MKWidgets = MKWidgets || {};
MKWidgets.SelectNS = MKWidgets.SelectNS || {};
MKWidgets.MultiSelectNS = MKWidgets.MultiSelectNS || {};


MKWidgets.MultiSelect = Class({
	extends: MKWidgets.Select,

	constructor: function (elementSelector, options)
		{
		if(options.values == null)
			{
			options.values = [];
			}
		this.selectedOptions = new MK.Array;
		this.setOptions({
			values: [],
			selectAll: true,
			selectAllText: 'Выбрать все',
			delete: 'flag' //real, flag
		});
		MKWidgets.Select.prototype.constructor.apply(this, [elementSelector, options]);
		this.setOptions(options);

		},

	initSelect: function ()
		{
		this.getDict();
		this.optionsList = new MKWidgets.MultiSelectNS.SelectArray(this.dict, this);

		this.selectedOptions.realLength = 0;
		this.calcRealLength();
		this.on('options-changed', this.calcRealLength, this);

		this.binding();

		if (this.options.renderOnInit == true)
			{
			this.render();
			}
		},

	createDom: function ()
		{
		MKWidgets.Select.prototype.createDom.apply(this);

		this.domOptionsList.addClass('multi');
		},

	createInterfaces: function ()
		{
		if (this.options.inputField == true)
			{
			this.inputInterface = new MKWidgets.MultiSelectNS.SelectInputInterface(this, this.options.inputField);
			}
		else
			{
			this.headerInterface = new MKWidgets.MultiSelectNS.MultiSelectHeaderInterface(this, true);
			}
		this.listInterface = new MKWidgets.MultiSelectNS.SelectListInterface(this, true);
		this.allInterface = new MKWidgets.MultiSelectNS.SelectAllInterface(this, this.options.selectAll);
		this.addableInterface = new MKWidgets.SelectNS.AddInterface(this, this.options.addable);

		this.calcRealLength();
		},

	toggleOption: function (option)
		{
		if (option instanceof MKWidgets.MultiSelectNS.SelectModel)
			{
			if (option.selected == false)
				{
				this.selectOption(option);
				}
			else
				{
				this.unselectOption(option);
				}

			}
		},

	selectOption: function (option, silent)
		{
		if (option instanceof MKWidgets.MultiSelectNS.SelectModel)
			{
			if (option.selected == false)
				{
				this.addSelectedOption(option, silent);
				option.selected = true;
				}
			}
		},

	unselectOption: function (option, silent)
		{
		if (option instanceof MKWidgets.MultiSelectNS.SelectModel)
			{
			if (option.selected == true)
				{
				this.removeSelectedOption(option, silent);
				option.selected = false;
				}
			}
		},

	addSelectedOption: function (option, silent)
		{
		var index = this.selectedOptions.indexOf(option);
		if (index < 0)
			{
			this.selectedOptions.push(option);
			}
		else if(this.options.delete == 'flag')
			{
			this.selectedOptions[index].data['#delete'] = undefined;
			}
		if (silent !== true)
			{
			this.trigger('options-changed');
			}

		},

	removeSelectedOption: function (option, silent)
		{
		var index = this.selectedOptions.indexOf(option);
		if (index >= 0)
			{
			if (this.options.delete == 'flag')
				{
				this.selectedOptions[index].data['#delete'] = true;
				}
			else if (this.options.delete == 'real')
				{
				this.selectedOptions.splice(index, 1);
				}
			}
		if (silent !== true)
			{
			this.trigger('options-changed');
			}
		},

	toggleAll: function (select)
		{
		if (select === true)
			{
			for (var i = 0; i < this.optionsList.length; i++)
				{
				this.selectOption(this.optionsList[i], true);
				}
			}
		else
			{
			for (var i = 0; i < this.selectedOptions.length; i++)
				{
				this.unselectOption(this.selectedOptions[i], true);
				}
			}
		this.trigger('options-changed');
		},

	getValues: function ()
		{
		var values = [];
		for (var i = 0; i < this.selectedOptions.length; i++)
			{
			values.push(this.selectedOptions[i].data);
			}
		return values;
		},

	getDisplayValue: function ()
		{
		if (this.headerInterface != undefined)
			{
			return this.headerInterface.getDisplayValue();
			}
		if (this.inputInterface != undefined)
			{
			return this.inputInterface.getDisplayValue();
			}
		return '';
		},


	calcRealLength: function ()
		{
		var realLength = 0;

		if (this.options.delete == 'flag')
			{
			for (var i = 0; i < this.selectedOptions.length; i++)
				{
				if (this.selectedOptions[i].data['#delete'] != true)
					{
					realLength++;
					}
				}
			this.selectedOptions.realLength = realLength;
			}
		else if(this.options.delete == 'real')
			{
			this.selectedOptions.realLength = this.selectedOptions.length;
			}
		}
});

MKWidgets.MultiSelectNS.SelectAllInterface = Class({
	extends: WidgetInterface,

	constructor: function (widget, enable)
		{
		WidgetInterface.prototype.constructor.apply(this, [widget, enable]);
		},

	create: function ()
		{
		this.domSelectAll = $('<div class="custom-select-option select-all"></div>');
		this.displayValue = this.widget.options.selectAllText;
		this.selected = false;
		this.hover = false;

		this.bindNode('displayValue', this.domSelectAll, MK.binders.html());
		this.bindNode('displayValue', this.domSelectAll, MK.binders.attr("title"));
		this.bindNode('selected', this.domSelectAll, MK.binders.className('selected'));
		this.bindNode('hover', this.domSelectAll, MK.binders.className('hover'));

		this.widget.domOptionsList.prepend(this.domSelectAll);

		WidgetInterface.prototype.create.apply(this);
		},

	turnOn: function ()
		{
		this.domSelectAll.on('click', $.proxy(this.selectAllClickSlot, this));
		this.widget.selectedOptions.on('change:realLength', this.calcSelectState, true, this);
		},

	calcSelectState: function ()
		{
		if (this.widget.selectedOptions.realLength == this.widget.optionsList.length)
			{
			this.selected = true;
			}
		else
			{
			this.selected = false;
			}
		},

	selectAllClickSlot: function ()
		{
		this.selected = !this.selected;
		this.widget.toggleAll(this.selected);
		}

});

MKWidgets.MultiSelectNS.MultiSelectHeaderInterface = Class({
	extends: MKWidgets.SelectNS.SelectHeaderInterface,

	constructor: function (widget, enable)
		{
		MKWidgets.SelectNS.SelectHeaderInterface.prototype.constructor.apply(this, [widget, enable]);
		},

	create: function ()
		{
		MKWidgets.SelectNS.SelectHeaderInterface.prototype.create.apply(this);
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

		if (this.widget.selectedOptions.realLength == 0)
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

			}
		},

	getDisplayValue: function ()
		{
		var displayValue = '';
		for (var i = 0; i < this.widget.selectedOptions.length; i++)
			{
			if(this.widget.options.delete == 'flag' && this.widget.selectedOptions[i].data['#delete'] !== true)
				{
				displayValue += this.widget.selectedOptions[i].data[this.widget.options.dictConfig.dictDisplayIndex];
				displayValue += ' | ';
				}
			else if(this.widget.options.delete == 'real')
				{
				displayValue += this.widget.selectedOptions[i].data[this.widget.options.dictConfig.dictDisplayIndex];
				displayValue += ' | ';
				}
			}
		return displayValue;
		}

});

MKWidgets.MultiSelectNS.SelectInputInterface = Class({
	extends: MKWidgets.SelectNS.SelectInputInterface,

	constructor: function (widget, enable)
		{
		MKWidgets.SelectNS.SelectInputInterface.prototype.constructor.apply(this, [widget, enable]);
		},

	create: function ()
		{
		MKWidgets.SelectNS.SelectInputInterface.prototype.create.apply(this);
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
		this.on("widget.selectedOptions@change:realLength", this.changeSelectedOptionSlot, this, true);	//widget.selectedOption@change:value
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

	changeSelectedOptionSlot: function (event)
		{
		if (this.widget.selectedOptions.realLength > 0)
			{
			this.domInput.val(this.getDisplayValue());
			this.domInput.trigger('input');
			}
		else
			{
			this.domInput.val('');
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
			if (this.widget.selectedOptions.realLength > 0)
				{
				this.domInput.val(this.getDisplayValue());

				}
			else
				{
				this.domInput.val('');
				}
			}
		},

	inputChangeSlot: function (event)
		{
		var valueStr = $(event.target).val();
		if (valueStr != ' | ')
			{
			var parts = $(event.target).val().split(' | ');
			this.searchString = parts[parts.length - 1];
			}
		else
			{
			this.searchString = '';
			}

		},

	getDisplayValue: function ()
		{
		var displayValue = '';
		for (var i = 0; i < this.widget.selectedOptions.length; i++)
			{
			if(this.widget.options.delete == 'flag' && this.widget.selectedOptions[i].data['#delete'] !== true)
				{
				displayValue += this.widget.selectedOptions[i].data[this.widget.options.dictConfig.dictDisplayIndex];
				displayValue += ' | ';
				}
			else if(this.widget.options.delete == 'real')
				{
				displayValue += this.widget.selectedOptions[i].data[this.widget.options.dictConfig.dictDisplayIndex];
				displayValue += ' | ';
				}

			//if(i < this.widget.selectedOptions.length - 1)
			//	{
			//	displayValue += ' | ';
			//	}
			}
		return displayValue;
		},

});


MKWidgets.MultiSelectNS.SelectListInterface = Class({
	extends: MKWidgets.SelectNS.SelectListInterface,

	constructor: function (widget, enable)
		{
		MKWidgets.SelectNS.SelectListInterface.prototype.constructor.apply(this, [widget, enable]);
		},

	create: function ()
		{
		MKWidgets.SelectNS.SelectListInterface.prototype.create.apply(this);
		},

	//setSelectedOption: function (option)
	//	{
	//	this.widget.toggleOption(option);
	//	},

	optionClickSlot: function (event)
		{
		var option = $(event.target).data('option');
		this.widget.toggleOption(option);
		},
});


MKWidgets.MultiSelectNS.SelectModel = Class({
	extends: MKWidgets.SelectNS.SelectModel,

	constructor: function (data, parent)
		{
		MKWidgets.SelectNS.SelectModel.prototype.constructor.apply(this, [data, parent]);
		},

	isSelected: function ()
		{
		for (var i = 0; i < this.widget.options.values.length; i++)
			{
			if (this.widget.options.values[i][this.dictConfig.dictIdIndex] === this.data[this.dictConfig.dictIdIndex])
				{
				this.parent.parent.addSelectedOption(this);
				return true;
				}
			}
		return false;
		},
});

MKWidgets.MultiSelectNS.SelectArray = Class({
	extends: MKWidgets.SelectNS.SelectArray,
	Model: MKWidgets.MultiSelectNS.SelectModel,
	itemRenderer: '<div class="custom-select-option"></div>',

	constructor: function (data, parent)
		{
		MKWidgets.SelectNS.SelectArray.prototype.constructor.apply(this, [data, parent]);
		},

});
