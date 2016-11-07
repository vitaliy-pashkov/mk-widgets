var MKWidgets = MKWidgets || {};
MKWidgets.ReportViewNS = MKWidgets.ReportViewNS || {};


MKWidgets.ReportView = Class({
	extends: MKWidget,

	constructor: function (element, options)
		{
		MKWidget.prototype.constructor.apply(this, [element, options]);

		this.setOptions({
			title: 'Название',
			form: true,
			table: true,
			plot: true,
			export: true,
			dummyText: 'Выберите значения параметров для отображения'
		});
		this.setOptions(options);

		this.parametrs = {
			trigger: false,
			tableData : null,
			plotSeriesData: null,
			plotDataParams: null,
			title: null,
		};

		this.createInterfaces();


		},

	createInterfaces: function ()
		{
		this.tabsInterface = new MKWidgets.ReportViewNS.TabsInterface(this, true);
		this.widgetsInterface = new MKWidgets.ReportViewNS.WidgetsInterface(this, true);
		},

	destroy: function ()
		{

		}
});

MKWidgets.ReportViewNS.WidgetsInterface = Class({
	extends: WidgetInterface,

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

		this.widget.on('parametrs@change:trigger', this.initWidgets, this);

		if(!this.widget.parametrs.trigger)
			{
			this.widget.tabsInterface.hide();
			}
		},

	initWidgets: function ()
		{
		this.plotReady = false;
		this.tableReady = false;

		if(! this.widget.parametrs.trigger)
			{
			return;
			}
		this.widget.parametrs.trigger = false;
		this.widget.tabsInterface.show();

		// plot
		if (this.plotWidget != undefined)
			{
			this.plotWidget.destroy();
			}

		this.domPlot = this.widget.tabsInterface.tabsConfig.plot.body;
		this.plotConfig = this.widget.options.plotConfig;
		this.plotConfig.dataParams = this.widget.parametrs.plotDataParams;
		this.plotConfig.plotConfig.xAxis['min-max'] = this.widget.parametrs.plotMinMax;
		for(var i =0; i< this.plotConfig.plotConfig.series.length; i++)
			{
			this.plotConfig.plotConfig.series[i].data = this.widget.parametrs.plotSeriesData[i];
			}
		this.plotWidget = new MKWidgets.HcPlot(this.domPlot, this.plotConfig);
		this.plotWidget.on('plot-ready', this.plotReadySlot, this);

		//table
		if (this.tableWidget != undefined)
			{
			this.tableWidget.destroy();
			}

		this.domTable = this.widget.tabsInterface.tabsConfig.table.body;

		this.tableConfig = this.widget.options.tableConfig;
		this.tableConfig.data =this.widget.parametrs.tableData;
		this.tableConfig.dataParams =this.widget.parametrs.tableDataParams;
		this.domTable.css('max-height', (parseInt(this.widget.element.css('max-height'))  ));

		this.tableWidget = new MKWidgets.Table(this.domTable, this.tableConfig);
		this.tableWidget.on('table_ready', this.tableReadySlot, this);

		//

		this.widget.tabsInterface.setTitle(this.widget.parametrs.title);

		},

	plotReadySlot: function()
		{
		this.plotReady = true;
		if(this.tableReady == true)
			{
			this.widget.trigger('widgets-ready');
			}

		},

	tableReadySlot: function()
		{
		this.tableReady = true;
		if(this.plotReady == true)
			{
			this.widget.trigger('widgets-ready');
			}
		},

});


MKWidgets.ReportViewNS.TabsInterface = Class({
	extends: WidgetInterface,

	constructor: function (widget, enable)
		{
		WidgetInterface.prototype.constructor.apply(this, [widget, enable]);
		},

	create: function ()
		{
		this.domDummy = $('<div/>').addClass('mkw-report-view-dummy').text(this.widget.options.dummyText);

		this.domContainer = $('<div/>').addClass('mkw-report-view-container');
		this.domHeader = $('<div/>').addClass('mkw-report-view-header');
		this.domDisplay = $('<div/>').addClass('mkw-report-view-display');

		this.domTitle = $('<div/>').addClass('mkw-report-view-title').text(this.widget.options.title);
		this.domMenuButton = $('<div/>').addClass('mkw-report-view-menu');

		this.domHeader.append(this.domTitle);
		this.domHeader.append(this.domMenuButton);

		this.domContainer.append(this.domHeader);
		this.domContainer.append(this.domDisplay);
		this.widget.element.append(this.domContainer);
		this.widget.element.append(this.domDummy);
		this.widget.element.addClass('mkw-report-view');


		this.tabs = [];

		this.tabsConfig = {
			plot: {
				title: 'График',
				body: $('<div/>').addClass('mkw-report-view-plot')
			},
			table: {
				title: 'Таблица',
				body: $('<div/>').addClass('mkw-report-view-table')
			},

		};
		this.tabs = new MKWidgets.Tabs($('<div/>'), {
			source: 'data',
			tabs: this.tabsConfig,
			domHeaderContainer: this.domHeader,
			domBodiesContainer: this.domDisplay,
			skin: 'url-skin'
		});

		WidgetInterface.prototype.create.apply(this);
		},

	turnOn: function ()
		{
		this.enabled = true;
		},

	show: function()
		{
		this.domContainer.show();
		this.domDummy.hide();
		},

	hide: function()
		{
		this.domContainer.hide();
		this.domDummy.show();
		},

	setTitle: function(title)
		{
		this.domTitle.text(title);
		}

});
