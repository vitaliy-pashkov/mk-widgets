var MKWidgets = MKWidgets || {};
MKWidgets.CheckboxNS = MKWidgets.CheckboxNS || {};

MKWidgets.CheckboxGroup = Class({
	extends: MKWidget,

	constructor: function MKWidgets_Select(element, options)
		{
		MKWidget.prototype.constructor.apply(this, [element, options]);
		this.setOptions({
			dictConfig: {},
			renderOnInit: true,
			dict: null,
			target: new MK.Array,
			selectAllText: 'Выбрать все',
			checkOnInit: 'byTarget', //all, none
			parent: null, //{index: 'id', value: -1}
			delete: 'flag' //real, flag
		});
		this.setOptions(options);

		this.init();
		},

	init: function ()
		{
		this.getDict();

		this.checkboxList = new MKWidgets.CheckboxNS.Checkboxes(this.dict, this);

		if (this.options.renderOnInit == true)
			{
			this.render();
			}

		this.trigger('init');
		},

	render: function ()
		{
		this.isRendered = true;
		this.createDom();
		//this.createInterfaces();

		this.checkOnInit();
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
		this.element.addClass('mkw-checkbox-group');

		this.domContainer = $('<div/>').addClass('mkw-checkbox-group-container');
		this.checkboxList.render(this.domContainer);

		this.element.append(this.domContainer);
		},

	toggleValue: function(checkbox, value, silent)
		{
		if(value == true)
			{
			this.options.target.push(checkbox.dictItem);
			}
		else
			{
			//this.options.target.indexOf(checkbox.dictItem);
			var index = this.findTargetIndex(checkbox.dictItem);
			if(index >=0)
				{

				if(this.options.delete == 'flag')
					{
					this.options.target[index]['#delete'] = true;
					}
				else if(this.options.delete == 'real')
					{
					this.options.target.splice(index, 1);
					}
				}
			}
		this.calcCountSelected();

		this.trigger('target-changed');
		},

	calcCountSelected: function()
		{
		this.countSelected = 0;
		for(var i=0;i<this.options.target.length; i++)
			{
			if(this.options.target[i]['#delete'] != true)
				{
				this.countSelected++;
				}
			}
		},

	toggleAll: function(value)
		{
		for(var i=0; i< this.checkboxList.length; i++)
			{
			this.checkboxList[i].value = value;
			}
		},

	findTargetIndex: function(dictItem)
		{
		var idIndex = this.options.dictConfig.dictIdIndex;
		for(var i=0;i< this.options.target.length; i++)
			{
			if(this.options.target[i][idIndex] == dictItem[idIndex])
				{
				return i;
				}
			}
		return -1;
		},

	checkOnInit: function()
		{
		if(this.options.checkOnInit == 'byTarget')
			{
			for(var i = 0; i < this.checkboxList.length; i++)
				{
				var index = this.findTargetIndex( this.checkboxList[i].dictItem );
				if(index >= 0)
					{
					this.checkboxList[i].set('value', true, {silent: true});
					}
				}
			}
		else if (this.options.checkOnInit == 'all')
			{
			this.checkboxList.checkboxAll.value = true;
			}
		else if (this.options.checkOnInit == 'none')
			{
			this.checkboxList.checkboxAll.value = false;
			}
		this.calcCountSelected();
		}
});



MKWidgets.CheckboxNS.Checkbox = Class({
	extends: MK.Object,

	constructor: function (data, parent)
		{
		this.parent = parent;
		this.widget = parent.widget;
		this.dictConfig = this.widget.options.dictConfig;
		this.dictItem = data;

		this.jset(data);

		this.on('render', this.render, this);
		},

	render: function ()
		{
		this.domCheckbox = $('<input id="mkw-checkbox-group-' + this[this.dictConfig.dictIdIndex] + '" type="checkbox"/>');
		this.domCheckbox.addClass('mkw-checkbox-group-input');

		this.domLabel = $('<label for="mkw-checkbox-group-' + this[this.dictConfig.dictIdIndex] + '" />');
		this.domLabel.text(this[this.dictConfig.dictDisplayIndex]);
		this.domLabel.addClass('mkw-checkbox-group-label');

		$(this.sandbox).append(this.domCheckbox);
		$(this.sandbox).append(this.domLabel);

		this.bindNode('value', this.domCheckbox);
		this.on('change:value', this.inputSlot);
		},

	inputSlot: function()
		{
		this.value = this.domCheckbox.is(':checked');
		this.widget.toggleValue(this, this.value);
		}
});

MKWidgets.CheckboxNS.CheckboxAll = Class({
	extends: MK.Object,

	constructor: function (nullData, parent)
		{
		this.parent = parent;
		this.widget = parent.widget;

		this.on('render', this.render, this);
		},

	render: function ()
		{
		this.value = false;
		var id = this.widget.randomId();

		this.domCheckbox = $('<input id="mkw-checkbox-group-all-'+ id + '" type="checkbox"/>');
		this.domCheckbox.addClass('mkw-checkbox-group-input');

		this.domLabel = $('<label for="mkw-checkbox-group-all-' + id + '" />');
		this.domLabel.text(this.widget.options.selectAllText);
		this.domLabel.addClass('mkw-checkbox-group-label');
		this.domLabel.addClass('mkw-checkbox-group-label-all');

		$(this.sandbox).append(this.domCheckbox);
		$(this.sandbox).append(this.domLabel);

		this.bindNode('value', this.domCheckbox);
		this.on('change:value', this.inputSlot);

		this.widget.on('change:countSelected', this.checkSelectAll, this);
		},

	checkSelectAll: function()
		{
		if(this.widget.countSelected == this.widget.dict.length)
			{
			this.set('value', true, {silent: true});
			}
		else
			{
			this.set('value', false, {silent: true});
			}
		},

	inputSlot: function()
		{
		this.value = this.domCheckbox.is(':checked');
		this.widget.toggleAll(this.value);
		}
});

MKWidgets.CheckboxNS.Checkboxes = Class({
	'extends': MK.Array,
	Model: MKWidgets.CheckboxNS.Checkbox,
	itemRenderer: '<div class="mkw-checkbox-group-checkbox-container checkbox-container"></div>',

	constructor: function (data, parent)
		{
		this.widget = parent;
		this.recreate(data, {dontRender: true});
		this.checkboxAll = new MKWidgets.CheckboxNS.CheckboxAll(null, this);
		},

	render: function (domOptionsList)
		{
		this.bindNode('sandbox', domOptionsList);

		this.renderCheckboxAll();
		this.rerender();
		},

	renderCheckboxAll: function()
		{
		this.domCheckboxAll = $(this.itemRenderer);
		this.domCheckboxAll.addClass('all');
		$(this.sandbox).append( this.domCheckboxAll );
		this.checkboxAll.bindNode( 'sandbox', this.domCheckboxAll );
		this.checkboxAll.trigger('render');
		}

});