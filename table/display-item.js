var MKWidgets = MKWidgets || {};
MKWidgets.TableNS = MKWidgets.TableNS || {};
MKWidgets.TableNS.DisplayItemNS = MKWidgets.TableNS.DisplayItemNS || {};

MKWidgets.TableNS.DisplayItem = Class({
		extends: MKWidget,
		createFlag: false,
		bindValue: true,

		constructor: function (elementSelector, options)
			{
			MKWidget.prototype.constructor.apply(this, [elementSelector, options]);
			this.setOptions({
				displayType: "",
				enable: true,
				domContainer: '',
				popupOn: true
			});
			this.setOptions(options);
			},

		init: function ()
			{

			},

		preprocess: function ()
			{

			},

		createPopup: function (domContainer, tabs)
			{
			this.popup = new MKWidgets.Popup(domContainer);
			this.domPopup = this.popup.domPopup;
			//$(domContainer).append(this.domPopup);
			},

		disable: function ()
			{
			this.popup.disable();
			this.options.enable = false;
			this.newValue = this.element.html();
			this.element.html(this.oldValue);
			},

		enable: function ()
			{
			this.popup.enable();
			this.options.enable = true;
			this.element.html(this.newValue);
			},

		openPopup: function ()
			{
			if (!this.createFlag)
				{
				this.create();
				this.createFlag = true;
				}
			if (this.options.enable)
				{
				this.popup.openPopup();
				}
			},
	},
	{
		factory: function (elementSelector, options)
			{
			var inputItem = null;
			if (options.columnModel.displayType == "text")
				{
				inputItem = new MKWidgets.TableNS.DisplayItemNS.Text(elementSelector, options);
				}
			else if (options.columnModel.displayType == "pattern")
				{
				inputItem = new MKWidgets.TableNS.DisplayItemNS.Pattern(elementSelector, options);
				}
			else if (options.columnModel.displayType == "details")
				{
				inputItem = new MKWidgets.TableNS.DisplayItemNS.Details(elementSelector, options);
				}
			else if (options.columnModel.displayType == "master")
				{
				inputItem = new MKWidgets.TableNS.DisplayItemNS.Master(elementSelector, options);
				}
			else if (options.columnModel.displayType == "sparkline")
				{
				inputItem = new MKWidgets.TableNS.DisplayItemNS.Sparkline(elementSelector, options);
				}
			//inputItem.init();
			return inputItem;
			}
	});

MKWidgets.TableNS.DisplayItemNS.Pattern = Class({
	extends: MKWidgets.TableNS.DisplayItem,
	constructor: function (elementSelector, options)
		{
		MKWidgets.TableNS.DisplayItem.prototype.constructor.apply(this, [elementSelector, options]);
		this.setOptions({
			default: "",
			maxLength: 150,
			popupOn: false
		});
		this.setOptions(options);
		},

	init: function ()
		{

		},

	preprocess: function ()
		{
		if (this.options.columnModel.pattern != undefined)
			{
			var pattern = this.options.columnModel.pattern;
			while (pattern.indexOf('{%') > -1)
				{
				var begin = pattern.indexOf('{%') + 2;
				var end = pattern.indexOf('%}');
				var index = pattern.substring(begin, end);
				var regexp = new RegExp("{%" + index + "%}", 'g');
				pattern = pattern.replace(regexp, this.options.rowData[index]);
				}
			//this.options.rowData[this.options.columnModel.index] = pattern;

			this.element.html(pattern);
			}


		},

	create: function ()
		{
		this.createField();
		},

	createField: function ()
		{

		}

});

MKWidgets.TableNS.DisplayItemNS.Details = Class({
	extends: MKWidgets.TableNS.DisplayItem,
	constructor: function (elementSelector, options)
		{
		MKWidgets.TableNS.DisplayItem.prototype.constructor.apply(this, [elementSelector, options]);
		this.setOptions({
			default: "",
			columnModel: []
		});
		this.setOptions(options);
		this.domContainer = this.options.domContainer;

		},

	preprocess: function ()
		{
		var image = $('<div/>').addClass('tusur-csp-table-mk-details-img')
		this.element.append(image);
		},

	init: function ()
		{

		},

	create: function ()
		{
		this.createField();
		},

	createField: function ()
		{
		if (this.options.columnModel.details != undefined)
			{
			for (var i in this.options.columnModel.details)
				{
				var detail = this.options.columnModel.details[i];
				detail.body = $("<div/>").addClass('tusur-csp-tab-popup-table-element');
				}

			this.popup = new MKWidgets.PopupNS.TabPopup($('<div/>'), {
				tabs: this.options.columnModel.details,
				linkVertical: 'center', //top, center, bottom
				linkHorizontal: 'center', //left, center, right
				linkingPoint: 'center', //center, topLeft, topRight, bottomLeft, bottomRight
				setFullHeightOnRender: true,
			});

			}

		this.registrateWidgets();

		},

	registrateWidgets: function ()
		{
		for (var i in this.options.columnModel.details)
			{
			var detail = this.options.columnModel.details[i];

			var widgetConfig = this.applyRowContext(detail.widgetConfig);
			widgetConfig.element = detail.body;
			window.app.registrateWidget("display-item-details-" + detail.title + '-' + this.options.rowData[this.options.tableOptions.idIndex], widgetConfig);
			}
		},
	
	applyRowContext: function (configs)
		{
		var configStr = JSON.stringify(configs);
		var offset = 0;
		while (configStr.indexOf('`', offset) > -1)
			{
			var begin = configStr.indexOf('`', offset) + 1;
			var end = configStr.indexOf('`', begin);

			if (configStr.length - 1 > begin && begin < end)
				{
				var index = configStr.substring(begin, end);
				if (this.options.rowData[index] != undefined)
					{
					var regexp = new RegExp("`" + index + "`", 'g');
					configStr = configStr.replace(regexp, this.options.rowData[index]);
					}
				}
			offset = begin + 1;
			}
		var newConfigs = JSON.parse(configStr);
		newConfigs.config.parents = [];
		newConfigs.config.parents.push({
			index: this.options.tableOptions.idIndex,
			value: this.options.rowData[this.options.tableOptions.idIndex]
		});

		return newConfigs;
		},
});


MKWidgets.TableNS.DisplayItemNS.Master = Class({
	extends: MKWidgets.TableNS.DisplayItem,
	constructor: function (elementSelector, options)
		{
		MKWidgets.TableNS.DisplayItem.prototype.constructor.apply(this, [elementSelector, options]);
		this.setOptions({
			default: "",
			columnModel: []
		});
		this.setOptions(options);
		this.domContainer = this.options.domContainer;

		},

	preprocess: function ()
		{
		var image = $('<div/>').addClass('tusur-csp-table-mk-details-img')
		this.element.append(image);
		},

	init: function ()
		{

		},

	create: function ()
		{
		this.createField();
		},

	openPopup: function ()
		{
		this.create();
		},

	createField: function ()
		{
		var action = 'update';
		if (this.options.rowData[this.options.tableOptions.idIndex] < 0)
			{
			action = 'create';
			}
		var represent = this.options.columnModel.represent;
		app.registrateWidgetByRepresent(represent, 'master-' + represent, {}, {
			action: action,
			title: this.options.columnModel.masterTitle,
			context: this.options.rowData
		});
		},

});

MKWidgets.TableNS.DisplayItemNS.Text = Class({
	extends: MKWidgets.TableNS.DisplayItem,


	constructor: function (elementSelector, options)
		{
		MKWidgets.TableNS.DisplayItem.prototype.constructor.apply(this, [elementSelector, options]);
		this.setOptions({
			default: "",
			maxLength: 10
		});
		this.domContainer = this.options.domContainer;
		this.setOptions(options);
		},

	init: function ()
		{

		},

	preprocess: function ()
		{
		var index = this.options.columnModel.index;
		this.options.columnModel.displayIndex = index + '___short';
		var displayIndex = this.options.columnModel.displayIndex;

		if (this.options.rowData[index].length > this.options.maxLength)
			{
			this.options.rowData[displayIndex] = this.options.rowData[index].substr(0, this.options.maxLength) + '...';
			}
		else
			{
			this.options.rowData[displayIndex] = this.options.rowData[index];
			}
		},

	create: function ()
		{
		this.createField();
		},

	createField: function ()
		{
		var index = this.options.columnModel.index;
		this.createPopup(this.options.domContainer, this.element);
		this.domTextDiv = $("<div/>").addClass("tusur-csp-popup-text-div");
		this.domTextDiv.html(this.options.rowData[index]);

		this.domPopup.append(this.domTextDiv);
		}

});

MKWidgets.TableNS.DisplayItemNS.Sparkline = Class({
	extends: MKWidgets.TableNS.DisplayItem,

	bindValue: false,


	constructor: function (elementSelector, options)
		{
		MKWidgets.TableNS.DisplayItem.prototype.constructor.apply(this, [elementSelector, options]);
		this.setOptions({
			default: "",
			popupOn: false,
		});
		this.domContainer = this.options.domContainer;
		this.setOptions(options);

		//this.init();
		},

	preprocess: function ()
		{
		Highcharts.SparkLine = function (a, b, c)
			{
			var hasRenderToArg = typeof a === 'string' || a.nodeName,
				options = arguments[hasRenderToArg ? 1 : 0];
			var defaultOptions = {
				exporting: {
					enabled: false,
				},
				chart: {
					renderTo: (options.chart && options.chart.renderTo) || this,
					backgroundColor: 'rgba(255,255,255,0)',
					plotBackgroundColor: 'rgba(255,255,255,0)',
					borderWidth: 0,
					type: 'area',
					margin: [0, 0, 0, 0],
					width: 400,
					height: 20,
					style: {
						overflow: 'visible'
					},
					skipClone: true
				},
				title: {
					text: ''
				},
				credits: {
					enabled: false
				},
				xAxis: {
					type: 'datetime',
					labels: {
						enabled: false
					},
					title: {
						text: null
					},
					startOnTick: false,
					endOnTick: false,
					tickPositions: [],
					visible: false,
				},
				yAxis: {
					endOnTick: false,
					startOnTick: false,
					labels: {
						enabled: false
					},
					title: {
						text: null
					},
					tickPositions: [],
					visible: false,
				},
				legend: {
					enabled: false
				},
				tooltip: {
					//	backgroundColor: null,
					//	borderWidth: 0,
					//	shadow: false,
					//	useHTML: true,
					hideDelay: 0,
					//	shared: true,
					//	padding: 0,
					positioner: function (w, h, point)
						{
						return {x: point.plotX - w / 2, y: point.plotY - h - 20};
						}
				},
				plotOptions: {
					series: {
						animation: false,
						lineWidth: 0,
						shadow: false,
						states: {
							hover: {
								lineWidth: 1
							}
						},
						marker: {
							radius: 2,
							states: {
								hover: {
									radius: 3
								}
							}
						},
						fillOpacity: 0.25
					},
					column: {
						negativeColor: '#910000',
						borderColor: 'silver'
					}
				}
			};

			options = Highcharts.merge(defaultOptions, options);

			return hasRenderToArg ?
				new Highcharts.Chart(a, options, c) :
				new Highcharts.Chart(options, b);
			};

		Highcharts.setOptions({
			lang: {
				weekdays: ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'],
				shortMonths: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'],
			},
			chart: {
				style: {
					fontFamily: 'GothamPro',
				},
				backgroundColor: "#FDFDFD",
				plotBackgroundColor: '#FDFDFD'
			}
		});

		var data = [];
		for (var i = 0; i < this.options.rowData[this.options.columnModel.index].length; i++)
			{
			var value = parseInt(this.options.rowData[this.options.columnModel.index][i][this.options.columnModel.valueIndex]);

			if(this.options.rowData[this.options.columnModel.index][i][this.options.columnModel.valueIndex] == '-')
				{
				value = null;
				}
			var dt = moment(this.options.rowData[this.options.columnModel.index][i][this.options.columnModel.dtIndex]);

			data.push([
				dt.valueOf() + 25200000,
				value
			]);
			}
		this.element.empty();

		this.element.highcharts('SparkLine', {
			series: [
				{
					data: data,
					pointStart: 1
				}
			],
			tooltip: {
			//	headerFormat: '',
				pointFormat: '{point.y}'
			},
			chart: {}
		});
		},

	//preprocess: function ()
	//	{
	//
	//	},

	create: function ()
		{
		this.createField();
		},

	createField: function ()
		{
		}


});




