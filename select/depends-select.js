var MKWidgets = MKWidgets || {};
MKWidgets.SelectNS = MKWidgets.SelectNS || {};
MKWidgets.DependsSelectNS = MKWidgets.DependsSelectNS || {};


MKWidgets.DependsSelect = Class({
	extends: MKWidgets.Select,
	dependValues: {},

	constructor: function (elementSelector, options)
		{
		MKWidgets.Select.prototype.constructor.apply(this, [elementSelector, options]);
		this.setOptions({
			dictConfig: {
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
				depend[i].object = new MK.Object(depend[i].object);
				}
			this.dependEvent(depend[i]);
			}
		this.updateDependValues();
		this.updateOptions();
		},

	dependEvent: function (depend)
		{
		depend.object.on('change:' + depend['objectIdIndex'], this.updatesOptionsSlot, this);
		},

	updatesOptionsSlot: function ()
		{
		this.updateDependValues();
		this.dict = window.app.getDict(this.dictConfig);
		this.setSelectedOptionById(null);
		this.updateOptions();
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
					this.setTitle(this.options.defaultNoValues);
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

MKWidgets.DependsSelectNS.ParentDict = Class({
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
		},

	updateDependValues: function ()
		{
		if (this.dict.length == 0)
			{
			this.allValuesFlag = false;
			this.trigger('hide-form');
			}
		else
			{
			this.allValuesFlag = true;
			this.trigger('show-form');
			}
		},

	dependEvent: function (depend)
		{
		this.on('dictionary-changed', this.updatesOptionsSlot, true, this);
		},

	updatesOptionsSlot: function ()
		{
		this.dict = this.options.parent.getDict(this.options.level);
		this.setSelectedOptionById(null);
		this.updateDependValues();
		this.updateOptions();
		},

	updateOptions: function ()
		{
		this.recreateOptions(this.dict);
		},

	getDict: function ()
		{
		if (this.options.parent != undefined)
			{
			this.dict = this.options.parent.getDict(this.options.level);
			}
		},
});