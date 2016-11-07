var MKWidgets = MKWidgets || {};
MKWidgets.SelectNS = MKWidgets.SelectNS || {};
MKWidgets.TreeSelectNS = MKWidgets.TreeSelectNS || {};
MKWidgets.DependTreeSelectNS = MKWidgets.DependTreeSelectNS || {};


MKWidgets.DependTreeSelect = Class({
	extends: MKWidgets.TreeSelect,

	constructor: function (elementSelector, options)
		{
		MKWidgets.Select.prototype.constructor.apply(this, [elementSelector, options]);
		this.setOptions({
			depend: [],
			dependDisplayText: 'Выберите значение родителя'
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
		this.optionsList = new MKWidgets.TreeSelectNS.SelectTree(this.dict, this);

		this.binding();

		if (this.options.renderOnInit == true)
			{
			this.render();
			this.manageHeader();
			}
		},

	initDepends: function()
		{
		this.dictConfig = Entity.assignObject({}, this.options.dictConfig);
		if (!this.dictConfig.depend instanceof Array)
			{
			this.dictConfig.depend = [this.dictConfig.depend];
			}

		var depend = this.dictConfig.depend;
		for (var i in depend)
			{
			if (!(depend[i].object instanceof MK))
				{
				depend[i].object = new MK.Object(depend[i].object);
				}
			this.dependEvent(depend[i]);
			}

		},

	dependEvent: function (depend)
		{
		depend.object.on('change:' + depend['objectIdIndex'], this.updatesOptionsSlot, this);
		},

	updatesOptionsSlot: function ()
		{
		this.updateDependValues();
		this.dict = window.app.getDict(this.dictConfig);
		this.unsetSelectedOption();
		this.optionsList.tree.unselectNode();
		this.updateOptions();
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

	updateOptions: function()
		{
		if(this.optionsList != undefined)
			{
			this.optionsList.destroy();
			}
		this.optionsList = new MKWidgets.TreeSelectNS.SelectTree(this.dict, this);
		this.optionsList.render();
		this.listInterface.turnOn();

		this.manageHeader();

		},

	manageHeader: function()
		{
		if (this.isRendered)
			{
			if (this.allValuesFlag == true)
				{
				if (this.dict.length > 0)
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
					this.setTitle(this.options.defaultNoValues);
					}
				}
			else
				{
				this.turnOff();
				this.setTitle(this.options.dependDisplayText);
				}
			}
		this.inputInterface.setDisplayValue();
		},

	createInterfaces: function ()
		{
		if (this.options.inputField == true)
			{
			this.inputInterface = new MKWidgets.TreeSelectNS.InputInterface(this, this.options.inputField);
			}
		else
			{
			this.headerInterface = new MKWidgets.SelectNS.SelectHeaderInterface(this, true);
			}
		this.listInterface = new MKWidgets.TreeSelectNS.TreeInterface(this, true);
		},

});


