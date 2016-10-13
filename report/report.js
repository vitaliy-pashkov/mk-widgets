var MKWidgets = MKWidgets || {};
MKWidgets.ReportNS = MKWidgets.ReportNS || {};

MKWidgets.Report = Class({
	extends: MKWidget,

	constructor: function (elementSelector, options)
		{
		MKWidget.prototype.constructor.apply(this, [this.domBody, options]);

		this.setOptions({
			title: 'Название',
			paramsFieldsModel: null,
			table: true,
			plot: true,
			export: true,
		});
		this.setOptions(options);

		this.createInterfaces();
		},

	createInterfaces: function ()
		{
		this.validateInterface = new MKWidgets.ReportNS.ValidateInterface(this, true);
		this.renderInterface = new MKWidgets.ReportNS.RenderInterface(this, true);
		this.reportInterface = new MKWidgets.ReportNS.ReportInterface(this, true);

		},


	closeSlot: function ()
		{
		this.validateInterface.turnOff();
		this.renderInterface.turnOff();
		this.reportInterface.turnOff();

		this.destroy();
		},

	destroy: function ()
		{
		if (this.reportInterface.tableWidget != undefined)
			{
			this.reportInterface.tableWidget.destroy();
			}

		if (this.reportInterface.plotWidget != undefined)
			{
			this.reportInterface.plotWidget.destroy();
			}

		if (this.stepsPopup != undefined)
			{
			this.stepsPopup.destroy();
			}

		if (this.renderInterface.paramsStep.crudForm != undefined)
			{
			this.renderInterface.paramsStep.crudForm.destroy();
			}
		delete this;
		}
});

MKWidgets.ReportNS.ValidateInterface = Class({
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
		this.widget.on('content-ready', this.turnOnEvents, this);
		},
	turnOff: function ()
		{
		this.enabled = false;
		},

	turnOnEvents: function ()
		{
		this.eventsEnabled = true;

		this.paramsCrudForm = this.widget.renderInterface.paramsStep.crudForm;

		this.widget.stepsPopup.on('try-next-step', this.tryNextStepSlot, this);
		this.widget.stepsPopup.on('try-done', this.tryDoneSlot, this);
		this.widget.stepsPopup.on('change:activeStep', this.changeActiveForm, true, this);
		},
	turnOffEvents: function ()
		{
		this.eventsEnabled = false;
		},

	changeActiveForm: function ()
		{
		if (this.paramsCrudForm != undefined)
			{
			this.paramsCrudForm.off('form-data-change', this.silentValidate, this);
			}

		if (this.paramsCrudForm != undefined)
			{
			this.paramsCrudForm.on('form-data-change', this.silentValidate, true, this);
			}
		},

	silentValidate: function ()
		{
		if (this.paramsCrudForm.saveInterface.validateFields(true) == true)
			{
			this.widget.stepsPopup.trigger('enable-next-button');
			}
		else
			{
			this.widget.stepsPopup.trigger('disable-next-button');
			}
		},

	tryNextStepSlot: function ()
		{
		var paramsFormValid = this.paramsCrudForm.saveInterface.validateFields(false);
		if (paramsFormValid == true)
			{
			this.widget.stepsPopup.trigger('next-step');
			this.widget.trigger('params-ready', this.paramsCrudForm.formData);
			}
		},

	tryDoneSlot: function ()
		{
		this.widget.destroy();
		},

});

MKWidgets.ReportNS.ReportInterface = Class({
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
		this.widget.on('params-ready', this.registrateReportWidgets, this);
		this.onDebounce('export-ready', this.exportReadySlot, 100);
		},
	turnOff: function ()
		{
		this.enabled = false;
		},

	registrateReportWidgets: function (paramsFormData)
		{
		this.paramsFormData = paramsFormData;

		this.plotReady = false;
		this.tableReady = false;
		this.docDefinitionStr = null;

		if (this.widget.options.table)
			{
			this.initTable();
			}
		if (this.widget.options.plot)
			{
			this.initPlot();
			}
		if (this.widget.options.export)
			{
			this.initExport();
			}
		},

	initExport: function ()
		{
		this.domExport = this.widget.renderInterface.presentStep.tabsObject.export.body;


		this.domExport.empty();
		this.domExportButton = $('<button/>').text('Сохранить PDF');
		this.domPreview = $('<iframe/>')
			.attr('id', 'pdfV')
			.attr("type", "application/pdf")
			.addClass('tusur-csp-report-pdfpreview');
		this.domPreview.height((parseInt(this.widget.renderInterface.presentStep.body.css('max-height')) ) - 100);
		this.domExport.append(this.domExportButton);
		this.domExport.append(this.domPreview);
		this.domExportButton.on('click', $.proxy(this.exportButtonClickSlot, this));
		},

	exportReadySlot: function ()
		{
		if (this.plotReady == true && this.tableReady == true)
			{
			this.docDefinitionStr = this.generatePdfDefinition();
			pdfMake.createPdf(JSON.parse(this.docDefinitionStr)).getDataUrl(
				function (outDoc)
				{
				$('#pdfV').get(0).src = outDoc;
				});
			}
		},

	exportButtonClickSlot: function ()
		{
		this.exportPdf();
		},

	exportPdf: function ()
		{
		if (this.docDefinitionStr == undefined)
			{
			this.docDefinitionStr = this.generatePdfDefinition();
			}

		var pdfDoc = pdfMake.createPdf(JSON.parse(this.docDefinitionStr));
		pdfDoc.download();
		},

	generatePdfDefinition: function ()
		{
		var docDefinition = this.widget.options.exportConfig.layout;
		var plot = this.formatPlotToPdf();
		var table = this.formatTableToPdf();

		var docDefinitionStr = JSON.stringify(docDefinition);
		docDefinitionStr = docDefinitionStr.replace(/"`plot`"/g, JSON.stringify(plot));
		docDefinitionStr = docDefinitionStr.replace(/"`table`"/g, JSON.stringify(table));
		//docDefinition = JSON.parse(docDefinitionStr);

		return docDefinitionStr;
		},

	formatPlotToPdf: function ()
		{
		var hc = this.plotWidget.element.highcharts();
		var context = this.preRenderImage(hc, 0.7);
		var canvas = this.svgToCanvas(context);
		var img = canvas.toDataURL("image/png");
		var plot = {
			image: img,
			width: 500,
			height: 285,
		};
		return plot;
		},

	formatTableToPdf: function ()
		{
		var header = [];

		var columns = this.tableWidget.options.columnsModel;
		for (var i in columns)
			{
			header.push({
				text: columns[i].title,
				style: 'tableHeader'
			})
			}

		var body = [header];
		var rows = this.tableWidget.rows;

		for (var i = 0; i < rows.length; i++)
			{
			var rowData = rows[i].rowData;
			if (rows[i].displayTotal == 1)
				{
				var pdfRow = [];
				for (var j = 0; j < header.length; j++)
					{
					var value = rowData[columns[j].index];
					if (value == undefined)
						{
						value = '-';
						}
					pdfRow.push({
						text: value,
					})
					}
				body.push(pdfRow);
				}
			}


		//rows.forEach(
		//	function (row)
		//	{
		//	var pdfRow = [];
		//	row.forEach(
		//		function (cell)
		//		{
		//		pdfRow.push({
		//			text: cell.value,
		//		})
		//		});
		//	body.push(pdfRow);
		//	});

		var table = {
			table: {
				headerRows: 1,
				dontBreakRows: true,
				body: body
			}
		};
		return table;
		},

	svgToCanvas: function (context)
		{
		var canvas = document.createElement('canvas');

		canvas.setAttribute('width', context.destWidth);
		canvas.setAttribute('height', context.destHeight);

		canvg(canvas, context.svg, {
			ignoreMouse: true,
			ignoreAnimation: true,
			ignoreDimensions: true,
			ignoreClear: true,
			offsetX: 0,
			offsetY: 0,
			scaleWidth: context.destWidth,
			scaleHeight: context.destHeight,
			/*renderCallback: function ()
			 {
			 callback(canvas);
			 }*/
		});

		return canvas;
		},

	preRenderImage: function (highChartsObject, scale)
		{
		var sourceWidth = highChartsObject.chartWidth,
			sourceHeight = highChartsObject.chartHeight,
			destWidth = sourceWidth * scale,
			destHeight = sourceHeight * scale;

		var cChartOptions = highChartsObject.options.exporting && highChartsObject.options.exporting.chartOptions || {};
		if (!cChartOptions.chart)
			{
			cChartOptions.chart = {width: destWidth, height: destHeight};
			}
		else
			{
			cChartOptions.chart.width = destWidth;
			cChartOptions.chart.height = destHeight;
			}

		var svg = highChartsObject.getSVG(cChartOptions);

		return {
			svg: svg,
			destWidth: destWidth,
			destHeight: destHeight
		};
		},

	initPlot: function ()
		{
		if (this.plotWidget != undefined)
			{
			this.plotWidget.destroy();
			}

		this.domPlot = this.widget.renderInterface.presentStep.tabsObject.plot.body;

		this.plotConfig = this.widget.options.plotConfig;
		this.plotConfig.dataParams = this.paramsFormData.toJSON();
		this.plotConfig.dataParams.processor = 'plot';
		this.plotConfig.context = this.paramsFormData;

		this.plotWidget = new MKWidgets.HcPlot(this.domPlot, this.plotConfig);
		this.plotWidget.on('plot-ready', this.plotReadySlot, this);
		},

	initTable: function ()
		{
		if (this.tableWidget != undefined)
			{
			this.tableWidget.destroy();
			}

		this.domTable = this.widget.renderInterface.presentStep.tabsObject.table.body;

		this.tableConfig = this.widget.options.tableConfig;
		this.tableConfig.dataParams = this.paramsFormData.toJSON();
		this.tableConfig.dataParams.processor = 'table';
		this.domTable.css('max-height', (parseInt(this.widget.renderInterface.presentStep.body.css('max-height'))  ));

		this.tableWidget = new MKWidgets.CrudTable(this.domTable, this.tableConfig);
		this.tableWidget.on('table_ready', this.tableReadySlot, this);
		},

	plotReadySlot: function ()
		{
		this.plotReady = true;
		this.trigger('export-ready');
		},

	tableReadySlot: function ()
		{
		this.tableReady = true;
		this.trigger('export-ready');
		},

});

MKWidgets.ReportNS.RenderInterface = Class({
	extends: WidgetInterface,
	widget: null,
	enable: false,
	crudParamsReady: false,
	tabsReady: false,

	constructor: function (widget, enable)
		{
		WidgetInterface.prototype.constructor.apply(this, [widget, enable]);
		},

	create: function ()
		{
		this.steps = this.setupSteps();

		this.widget.stepsPopup = new MKWidgets.PopupNS.StepsPopup($("<div/>"), {
			width: '50%',
			linkVertical: 'top', //top, center, bottom
			linkHorizontal: 'center', //left, center, right
			linkingPoint: 'topCenter', //center, topLeft, topRight, bottomLeft, bottomRight
			positionCorrections: {top: 50, left: 0},
			title: this.widget.options.title,
			steps: this.steps,
			sizeRestrictions: true,
			cascade: true,
			//sizeRestrictionsScrollBar: true,
		});
		this.widget.stepsPopup.openPopup();

		this.widget.stepsPopup.domPopup.addClass('tusur-csp-report-popup');
		this.widget.stepsPopup.on('close-popup', this.widget.closeSlot, false, this.widget)


		WidgetInterface.prototype.create.apply(this);
		},

	setupSteps: function ()
		{
		this.paramsStep = {};
		this.paramsStep.number = 1;
		this.paramsStep.title = 'Параметры отчёта';
		this.paramsStep.body = $("<div/>");
		this.paramsStep.crudForm = new MKWidgets.CrudForm(this.paramsStep.body, {
			dataSource: 'local',
			action: 'create',
			idIndex: 'id',
			dictsUrl: this.widget.options.dictsUrl,
			fieldsModel: this.widget.options.paramsFieldsModel,
		});
		this.paramsStep.crudForm.on('crud-form-ready', this.widgetsReadySlot, false, {
			interface: this,
			event: 'crud-form-ready'
		});

		this.presentStep = {};
		this.presentStep.number = 2;
		this.presentStep.title = 'Результат';
		this.presentStep.body = $('<div/>');
		this.presentStep.tabsObject = {
			table: {
				title: 'Таблица',
				body: $('<div/>').addClass('tusur-csp-report-table')
			},
			plot: {
				title: 'График',
				body: $('<div/>').addClass('tusur-csp-report-plot')
			},
			export: {
				title: 'Экспорт',
				body: $('<div/>').addClass('tusur-csp-report-export')
			}
		};


		this.presentStep.tabs = new MKWidgets.Tabs(this.presentStep.body, {
			source: 'data',
			skin: 'report-skin',
			tabs: this.presentStep.tabsObject
		});

		return [this.paramsStep, this.presentStep];
		},

	widgetsReadySlot: function ()
		{
		if (this.event == 'crud-form-ready')
			{
			this.interface.crudParamsReady = true;
			}
		if (this.interface.crudParamsReady == true)
			{
			this.interface.widget.trigger('content-ready');
			}
		},

});