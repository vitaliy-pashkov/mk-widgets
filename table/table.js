var MKWidgets = MKWidgets || {};
MKWidgets.TableNS = MKWidgets.TableNS || {};

MKWidgets.Table = Class({
	extends: MKWidget,

	constructor: function (elementSelector, options)
		{
		MKWidget.prototype.constructor.apply(this, [elementSelector, options]);
		this.setOptions({
			title: "Название таблицы",
			dataSource: "remote", //local, remote
			data: [],       //url or $data
			dictUrl: null,
			dataParams: null,
			columnsModel: {},
			idIndex: "id",
			autoColumnWidth: true,
			autoTableHeight: true,
			skin: '',

			selectableRows: false,
			filters: {},
			filterable: true,
			export: true,
			settings: false,
			logsTypes: {
				'event': {name: 'Событие', class: 'tusur-csp-table-mk-logs-event'},
				'success': {name: 'Событие', class: 'tusur-csp-table-mk-logs-change'},
				'error': {name: 'Ошибка', class: 'tusur-csp-table-mk-logs-error'},
				'change': {name: 'Изменение', class: 'tusur-csp-table-mk-logs-change'}
			},
			pagination: null, // { pageSize: 100,  }
			deleteByFlag: false,
		});
		this.setOptions(options);
		this.logCounter = 0;


		this.on("table_data_ready", this.createDom);
		this.on('table_ready', this.tableCreateInterfaces);

		this.getData();
		},

	tableCreateInterfaces: function ()
		{
		this.logInterface = new MKWidgets.TableNS.LogInterface(this, true);
		this.displayInterface = new MKWidgets.TableNS.DisplayInterface(this, true);
		this.sortInterface = new MKWidgets.TableNS.SortInterface(this, true);
		this.searchInterface = new MKWidgets.TableNS.SearchInterface(this, true);
		this.exportInterface = new MKWidgets.TableNS.ExportInterface(this, this.options.export);
		this.drawInterface = new MKWidgets.TableNS.DrawInterface(this, true);
		this.copyInterface = new MKWidgets.TableNS.CopyInterface(this, true);
		this.tableReady = true;
		this.trigger("table_interface_ready");
		},
	getData: function getData()
		{
		if (this.options.dataSource == "remote")
			{
			$.ajax(
				{
					url: this.options.data,
					data: this.options.dataParams,
					type: "GET",
					cache: false,
					contentType: "application/json",
					success: $.proxy(this.setData, this),
					error: $.proxy(this.serverError, this),
				});
			}
		if (this.options.dataSource == "local")
			{
			this.rows = this.options.data;
			if (this.options.dictUrl != undefined)
				{
				$.ajax(
					{
						url: this.options.dictUrl,
						data: this.options.dataParams,
						type: "GET",
						cache: false,
						contentType: "application/json",
						success: $.proxy(this.setDicts, this),
						error: $.proxy(this.serverError, this),
					});
				}
			else
				{
				this.trigger("table_data_ready");
				}
			}
		},

	setDicts: function setData(data)
		{
		this.dicts = data;
		window.app.saveDicts(this.dicts);
		this.trigger('table_data_ready');
		},

	setData: function setData(data)
		{
		this.rows = data.data;
		this.dicts = data.dicts;
		window.app.saveDicts(this.dicts);
		//this.patternInsertData();
		this.trigger('table_data_ready');
		},

	serverError: function serverError(error)
		{
		alert("error: " + JSON.stringify(error));
		},

	createDom: function ()
		{
		var tempDiv = $('<div/>');
		this.element.addClass('tusur-csp-table-element').addClass(this.options.skin)
			.before(tempDiv);
		this.element.detach();
		this.bindNode('sandbox', this.element);
		//if ($('.tusur-csp-hide-popup-background').length == 0)
		//{
		//    $('body').append($('<div/>').addClass("tusur-csp-hide-popup-background"));
		//}
		this.popupContainer = $("<div/>").addClass('tusur-csp-table-popup-container');

		this.domTitle = $("<div/>")
			.text(this.options.title)
			.attr('title', this.options.title)
			.addClass("tusur-csp-table-title");
		this.domControlPanelRight = $("<div/>")
			.addClass("tusur-csp-table-control-panel-right-container")
		;

		this.domControlPanel = $("<div/>")
			.addClass("tusur-csp-table-control-panel")
			.append(this.domTitle)
			.append(this.domControlPanelRight)
		;

		this.domTable = $("<div/>").addClass("tusur-csp-table").append(this.domControlPanel);
		this.header = new MKWidgets.TableNS.Header(this.options.columnsModel, this.domTable, this);
		this.domHeader = this.domTable.find('.tusur-csp-table-row-header');

		this.domScrollNode = $("<div/>").addClass("tusur-csp-table-scroll-node")
		this.domBody = $("<div/>").addClass("tusur-csp-table-body");
		this.rows = new MKWidgets.TableNS.Rows(this, this.rows, this.options.columnsModel, this.domBody, this.header);

		this.domScrollNode.append(this.domBody);

		this.domTable.append(this.popupContainer)
			.append(this.domScrollNode);
		this.domTableContainer = $("<div/>").addClass("tusur-csp-table-container")
			.append(this.domTable);
		this.element.append(this.domTableContainer);
		tempDiv.after(this.element);
		tempDiv.remove();
		$(window).resize($.proxy(this.redrawEvent, this));
		this.on('table-display-changed', this.redrawEvent, this);
		this.on('table-reset-interfaces', this.displayChangedEvent, this);


		this.trigger('table-display-changed');
		this.trigger("table_ready");
		},

	redrawEvent: function ()
		{
		this.trigger('table_redraw');
		},

	displayChangedEvent: function ()
		{
		this.trigger('table-display-changed');
		},

	log: function (logMsgType, logMsg)
		{
		this.logInterface.log(logMsgType, logMsg);
		},

	destroy: function ()
		{
		this.element.empty();
		}
});

MKWidgets.TableNS.LogInterface = Class({
	extends: WidgetInterface,
	widget: null,
	enable: false,

	constructor: function (widget, enable)
		{
		WidgetInterface.prototype.constructor.apply(this, [widget, enable]);
		},

	create: function ()
		{
		this.logButton = $("<div/>").addClass("tusur-csp-show-table-log-button");
		this.domLogTextContainer = $("<div/>").addClass("tusur-csp-show-table-new-log-container");
		this.domLogLine = $("<div/>").addClass("tusur-csp-show-table-log-line");

		this.domLogContainer = $("<div/>").addClass("tusur-csp-show-table-log-container")
			.append(this.domLogLine)
			.append(this.logButton)
			.append(this.domLogTextContainer);
		this.domLogsTable = $("<div/>").addClass("tusur-csp-show-table-logs-container-table");
		this.domAllLogs = $("<div/>").addClass("tusur-csp-show-table-logs-container-title").text("Журнал событий")
			.append(this.domLogsTable)
		;
		this.logsPopup = new MKWidgets.Popup(this.domAllLogs, {
			background: true,
			positionElement: this.widget.domTable,
			linkVertical: 'center', //top, center, bottom
			linkHorizontal: 'center', //left, center, right
			linkingPoint: 'center', //center, topLeft, topRight, bottomLeft, bottomRight
		});
		this.widget.domTableContainer.append(this.domLogContainer);

		this.logsHeader = new MKWidgets.TableNS.Header([
			{
				index: 'date',
				title: 'Дата \ время'
			},
			{
				index: 'value',
				title: 'Значение'
			}
		], this.domLogsTable, this, false);
		this.logs = new MKWidgets.TableNS.LogLines(this.widget.domTableContainer, this.domAllLogs);

		this.messages();
		WidgetInterface.prototype.create.apply(this);
		},

	turnOn: function ()
		{
		this.enabled = true;
		this.logButton.on('click', $.proxy(this.logButtonClickSlot, this));
		},
	turnOff: function ()
		{
		this.enabled = false;
		this.logButton.off('click', $.proxy(this.logButtonClickSlot, this));
		},

	messages: function ()
		{
		this.widget.on('row-success-deleted', this.logSlot, this);
		},

	logButtonClickSlot: function ()
		{
		this.logsPopup.openPopup();
		},

	logSlot: function (event)
		{
		var msg = this.event;

		},

	log: function (logMsgType, logMsg)
		{
		if (this.logsClass != undefined)
			{
			this.domLogTextContainer.removeClass(this.logsClass);
			}
		this.logsClass = this.widget.options.logsTypes[logMsgType]['class'];
		this.domLogTextContainer.html(this.widget.options.logsTypes[logMsgType]['name'] + ': ' + logMsg)
			.addClass(this.logsClass);
		this.logCounter++;
		this.delay(
			function ()
			{
			if (this.logCounter == 1)
				{
				this.domLogTextContainer.empty();
				}
			else
				{
				this.logCounter--;
				}
			}, 15000, this);
		this.logs.push({'logMsg': logMsg, 'logMsgType': this.widget.options.logsTypes[logMsgType]['class']});
		},
});


MKWidgets.TableNS.ExportInterface = Class({
	extends: WidgetInterface,
	widget: null,
	enable: false,

	constructor: function (widget, enable)
		{
		WidgetInterface.prototype.constructor.apply(this, [widget, enable]);
		},

	create: function ()
		{
		if (this.widget.options.exportColumnsModel == undefined)
			{
			this.widget.options.exportColumnsModel = this.widget.options.columnsModel;
			}
		this.domExportButton = $("<button>").addClass("tusur-csp-table-export-input").html('Экспорт');
		//this.domExportLink = $("<a/>")
		//	.prepend(this.domExportButton);
		this.widget.domControlPanelRight.prepend(this.domExportButton);
		this.domExportButton.on('click', $.proxy(this.exportTableSlot, this));
		},

	exportTableSlot: function ()
		{
		this.exportForm = new MKWidgets.PopupCrudForm($('<div/>'), {
			dataSource: 'local',
			data: new MK.Object,
			action: 'changeFormData',
			title: 'Настройки экспорта',
			fieldsModel: [
				{
					title: 'Название файла',
					index: 'fileName',
					type: 'varchar',
					default: this.widget.options.title
				},
				{
					title: 'Формат',
					index: 'format',
					type: 'select',
					dictConfig: {
						dictIdIndex: 'code',
						dictDisplayIndex: 'name',
						formIdIndex: 'format',
						formDisplayIndex: 'formatName'
					},
					dict: [
						{
							code: 'xls',
							name: '.xls'
						},
						{
							code: 'xml',
							name: '.xml'
						},
						{
							code: 'csv',
							name: '.csv'
						},
						{
							code: 'pdf',
							name: '.pdf'
						},
					],
					default: 'xls'
				}
			]
		});
		this.exportForm.on('save-button-click', this.export, this);
		},

	export: function ()
		{
		var exportConfig = this.exportForm.formData;

		if (exportConfig.format == 'xls')
			{
			this.exportXls(exportConfig);
			}
		else if (exportConfig.format == 'xml')
			{
			this.exportXls(exportConfig);
			}
		else if (exportConfig.format == 'csv')
			{
			this.exportCsv(exportConfig);
			}
		else if (exportConfig.format == 'pdf')
			{
			this.exportPdf(exportConfig);
			}

		this.exportForm.controlInterface.canсelSlot();
		},

	exportPdf: function (exportConfig)
		{
		var table = this.formatForPdf(this.widget.options.exportColumnsModel, this.widget.rows, this.widget.options.title);
		var docDefinition = {
			content: [
				{
					text: this.widget.options.title,
					alignment: 'center'
				},
				table
			],
			styles: {
				tableHeader: {
					bold: true,
					fontSize: 13,
					color: 'black'
				}
			}
		};
		var pdfDoc = pdfMake.createPdf(docDefinition);
		pdfDoc.download(exportConfig.fileName + '.' + exportConfig.format);
		},

	formatForPdf: function (columns, data, title)
		{
		var header = [];
		for (var i in columns)
			{
			header.push({
				text: columns[i].title,
				style: 'tableHeader'
			});
			}
		var body = [header];

		for (var i = 0; i < data.length; i++)
			{
			var rowData = data[i].rowData;
			if (data[i].displayTotal == 1)
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

		var table = {
			table: {
				headerRows: 1,
				dontBreakRows: true,
				body: body
			}
		};
		return table;
		},

	exportCsv: function (exportConfig)
		{
		var data = this.formatForCsv(this.widget.options.exportColumnsModel, this.widget.rows, this.widget.options.title);
		MKWidgets.FileLoader.load(exportConfig.fileName + '.' + exportConfig.format, data);
		},

	formatForCsv: function (header, data, title)
		{
		var csvString = '';//"data:text/csv;charset=utf-8,";
		for (var i in header)
			{
			csvString += header[i].title + ';';
			}
		csvString += "\n";

		for (var i = 0; i < data.length; i++)
			{
			var rowData = data[i].rowData;
			if (data[i].displayTotal == 1)
				{
				for (var j = 0; j < header.length; j++)
					{
					var value = rowData[header[j].index]+'';
					if((value.match(/^-?\d*(\.\d+)?$/)))
						{
						value = (value+'').replace('.', ',');
						}
					if (value == undefined)
						{
						value = '-';
						}
					csvString += value + ';';
					}
				csvString += "\n";
				}
			}

		var uri = 'data:text/csv;charset=windows-1251,';
		return uri + escape(windows1251.encode(csvString));
		},

	exportXls: function (exportConfig)
		{
		var data = this.formatForXls(this.widget.options.exportColumnsModel, this.widget.rows, this.widget.options.title);
		var exporter = new MKWidgets.XlsExporter(null, {
			sheets: data,
			title: exportConfig.fileName + '.' + exportConfig.format
		});
		exporter.download();
		},

	formatForXls: function (header, data, title)
		{
		var sheetTitle = title;
		var columns = [];
		for (var i in header)
			{
			var column = {};
			column.headertext = header[i].title;
			column.datafield = header[i].index;
			columns.push(column);
			}
		var readyData = [];

		for (var i = 0; i < data.length; i++)
			{
			var rowData = data[i].rowData;
			if (data[i].displayTotal == 1)
				{
				var readyRow = {};
				for (var j = 0; j < header.length; j++)
					{
					var value = rowData[header[j].index];
					if (value == undefined)
						{
						value = '-';
						}
					readyRow[header[j].index] = {"value": value};
					}
				readyData.push(readyRow)

				}


			}

		var readyObject = {};
		readyObject[sheetTitle] = {
			"columns": columns,
			"data": readyData
		};

		return readyObject;
		},


});


MKWidgets.TableNS.CopyInterface = Class({
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
		this.widget.domTableContainer.on('copy', this.copySlot);
		},

	turnOff: function ()
		{
		this.enabled = false;
		},

	copySlot: function (event)
		{
		var text = $selection.getText();
		text = text.replace(/\u00A0/g, '\u0009');
		var html = '<table>';
		var lines = text.split('\n');
		for (var i = 0; i < lines.length; i++)
			{
			html += '<tr>';
			var cells = lines[i].split('\t');
			for (var j = 0; j < cells.length; j++)
				{
				html += '<td>';
				html += cells[j];
				html += '</td>';
				}
			html += '</tr>';
			}
		html += '</table>';
		event.originalEvent.clipboardData.setData('text/plain', text);
		event.originalEvent.clipboardData.setData('text/html', html);
		event.preventDefault();
		},


});

MKWidgets.TableNS.SearchInterface = Class({
	extends: WidgetInterface,
	widget: null,
	enable: false,

	constructor: function (widget, enable)
		{
		WidgetInterface.prototype.constructor.apply(this, [widget, enable]);
		},

	create: function ()
		{
		this.domSearch = $('<input>')
			.addClass('tusur-csp-table-search-input')
			.attr('placeholder', 'Поиск')
			.attr('type', 'input');
		this.widget.domControlPanelRight.append(this.domSearch);

		WidgetInterface.prototype.create.apply(this);
		},

	turnOn: function ()
		{
		this.enabled = true;
		this.bindNode('searchString', this.domSearch);
		this.on('change:searchString', this.searchStringChangeSlot, this);
		},
	turnOff: function ()
		{
		this.enabled = false;
		this.unbindNode('searchString', this.domSearch);
		this.off('change:searchString', this.searchStringChangeSlot, this);
		},

	searchStringChangeSlot: function ()
		{
		this.widget.rows.each(
			function (index, value)
			{
			index.searchInput = this.searchString;
			}, this);
		this.widget.trigger('table-display-changed');
		this.domSearch.focus();
		}
});

MKWidgets.TableNS.SortInterface = Class({
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
		this.widget.header.on('*@click::sortDesc', $.proxy(this.sortTableSlot, this));
		this.widget.header.on('*@click::sortAsc', $.proxy(this.sortTableSlot, this));
		},
	turnOff: function ()
		{
		this.enabled = false;
		this.widget.header.off('*@click::sortDesc', $.proxy(this.sortTableSlot, this));
		this.widget.header.off('*@click::sortAsc', $.proxy(this.sortTableSlot, this));
		},

	sortTableSlot: function (event)
		{
		var sortColumnIndex = $(event.target)
			.parent()
			.data('tusur-csp-table-column');
		var sortDirection = $(event.target).data('sort-direction');
		this.sortTable(sortColumnIndex, sortDirection);
		},

	sortTable: function (sortColumnIndex, sortDirection)
		{
		this.widget.rows.sort(
			function (a, b)
			{
			if (sortColumnIndex in a.rowData && !(sortColumnIndex in b.rowData))
				{
				return -1;
				}
			if (!(sortColumnIndex in a.rowData) && sortColumnIndex in b.rowData)
				{
				return 1;
				}
			if (!(sortColumnIndex in a.rowData) && !(sortColumnIndex in b.rowData))
				{
				return 0;
				}

			if (a.rowData[sortColumnIndex].toString().toUpperCase() < b.rowData[sortColumnIndex].toString()
					.toUpperCase())
				{
				return sortDirection == 'desc' ? 1 : -1;
				}
			if (a.rowData[sortColumnIndex].toString().toUpperCase() > b.rowData[sortColumnIndex].toString()
					.toUpperCase())
				{
				return sortDirection == 'desc' ? -1 : 1;
				}
			return 0;
			});
		this.widget.trigger('table_redraw');
		},


});


MKWidgets.TableNS.DrawInterface = Class({
	extends: WidgetInterface,
	widget: null,
	enable: false,
	scrollbarWidth: 20,
	minTableWidth: 300,
	widthCalcType: 'byOuterWidth', // byOuterWidth, byMaxWidth
	heightCalcType: 'byOuterHeight', // byOuterHeight, byMaxHeight, byScreenHeight

	constructor: function (widget, enable)
		{
		WidgetInterface.prototype.constructor.apply(this, [widget, enable]);
		},

	create: function ()
		{
		WidgetInterface.prototype.create.apply(this);

		this.widget.on('turnOn-draw-interface', this.turnOn, this);
		this.widget.on('turnOff-draw-interface', this.turnOff, this);
		this.onDebounce('draw_table', this.drawTable, 100, true, this);
		},

	turnOn: function ()
		{
		this.enabled = true;
		this.widget.on('table_ready', this.drawTable, this, true);
		this.widget.on('table_redraw', this.drawTable, this);
		app.on('mkw_resize', $.proxy(this.drawTable, this));
		},
	turnOff: function ()
		{
		this.enabled = false;
		this.widget.off('table_ready', this.drawTable, this);
		this.widget.off('table_redraw', this.drawTable, this);
		this.widget.element.off('custom_resize', $.proxy(this.drawTable, this));
		},

	drawTableSlot: function ()
		{
		this.trigger('draw_table');
		},

	drawTable: function (event)
		{
		if (event != undefined && event.type == 'mkw_resize')
			{
			event.stopPropagation();
			}
		if (!this.widget.element.is(':visible'))
			{
			return;
			}

		this.detectSizingType();
		this.resetSizeToAuto();
		this.calcParametrs();
		this.drawAutoColumnWidth();
		this.alignCellsHeight();
		this.createScrollbar();
		//this.returnElementWidth();

		this.widget.trigger('rendering-over');
		},

	detectSizingType: function ()
		{
		this.elementWidth = this.widget.element.css('width');
		if (this.widget.element.css('max-width') != 'none')
			{
			this.widthCalcType = "byMaxWidth";
			}
		else if (this.widget.element.css('width') != 'none')
			{
			this.widthCalcType = "byOuterWidth";
			}

		this.elementHeight = this.widget.element.css('height');
		if (this.widget.element.css('max-height') != 'none')
			{
			this.heightCalcType = "byMaxHeight";
			}
		else if (this.widget.element.css('height') != 'none')
			{
			this.heightCalcType = "byOuterHeight";
			}
		else
			{
			this.heightCalcType = "byScreenHeight";

			}
		},


	returnElementWidth: function ()
		{
		if (this.elementHeight != undefined)
			{
			this.widget.element.css('height', this.elementHeight);
			}
		if (this.elementWidth != undefined)
			{
			this.widget.element.css('width', this.elementWidth);
			}
		},

	deleteScrollbar: function ()
		{
		if (this.scrollbar != undefined)
			{
			this.scrollTop = -1 * this.widget.domScrollNode.find('.overview').position().top;
			this.widget.domScrollNode.customScrollbar("remove");
			this.scrollbar = null;
			}
		},

	createScrollbar: function ()
		{
		if (this.needScroll == true)
			{
			this.widget.domScrollNode.height(this.domScrollNodeHeight);
			this.scrollbar = this.widget.domScrollNode.addClass("thin-skin").customScrollbar(CustomScrollbarSettings);
			this.widget.domScrollNode.customScrollbar("scrollToY", this.scrollTop);
			}
		},

	scrollDown: function ()
		{
		if (this.scrollbar != undefined)
			{
			this.scrollbar.customScrollbar("scrollToY", Infinity);
			}
		},

	resizeScrolbar: function ()
		{
		if (this.scrollbar != undefined)
			{
			this.scrollbar.customScrollbar("resize");
			}
		},

	resetSizeToAuto: function ()
		{
		this.deleteScrollbar();
		this.widget.domTable.find(".tusur-csp-table-cell").css({"width": "auto", "height": "auto"});
		this.widget.domTable.find(".tusur-csp-table-row").css({"height": "auto"})
		this.widget.domBody.css({"height": "auto"});
		this.widget.domScrollNode.css({"height": "auto"});
		},

	calcParametrs: function ()
		{
		this.columnsCount = this.widget.options.columnsModel.length;
		this.needScroll = false;
		this.cellsMargins = this.columnsCount *
			(this.widget.element.find(".tusur-csp-table-cell").innerWidth() -
			this.widget.element.find(".tusur-csp-table-cell").width());

		if (this.widthCalcType == 'byMaxWidth')
			{
			this.tableWidth = parseInt(this.widget.element.css('max-width')) - this.cellsMargins;
			}
		else if (this.widthCalcType == 'byOuterWidth')
			{
			this.tableWidth = this.widget.domTable.width() - this.cellsMargins;
			}

		if (this.tableWidth < this.minTableWidth)
			{
			this.tableWidth = this.minTableWidth;
			}
		for (var i in this.widget.options.columnsModel)
			{
			if (typeof this.widget.options.columnsModel[i].width == 'number')
				{
				this.tableWidth -= this.widget.options.columnsModel[i].width;
				this.columnsCount--;
				}
			else
				{
				this.widget.options.columnsModel[i].calcWidth = true;

				}
			}


		var widgetWitoutBodyHeight = this.widget.domTableContainer.outerHeight(true) - this.widget.domBody.height();
		var elementMarginHeight = this.widget.element.outerHeight(true) - this.widget.element.height();

		var realScrollNodeHeight = this.widget.domBody.height();
		if (this.heightCalcType == 'byOuterHeight')
			{
			this.domScrollNodeHeight = this.widget.element.height() - widgetWitoutBodyHeight - elementMarginHeight;
			}
		else if (this.heightCalcType == 'byMaxHeight')
			{
			var maxHeight = parseInt(this.widget.element.css('max-height'));
			if(this.widget.element.css('max-height').endsWith('%'))
				{
				maxHeight = this.widget.element.parent().height() * maxHeight * 0.01;
				}

			this.domScrollNodeHeight = maxHeight - widgetWitoutBodyHeight;// - elementMarginHeight;
			}
		else if (this.heightCalcType == 'byScreenHeight')
			{
			this.domScrollNodeHeight = $('window').height() - widgetWitoutBodyHeight - elementMarginHeight - 100;
			}
		this.domScrollNodeHeight -= this.widget.logInterface.domLogContainer.outerHeight();
		if (this.widget.options.autoTableHeight)
			{
			if (realScrollNodeHeight > this.domScrollNodeHeight)
				{
				this.needScroll = true;
				}
			else
				{
				this.needScroll = false;
				}
			}
		},

	alignCellsHeight: function ()
		{
		var height = [],
			rows = this.widget.domTable;
		rows.find(".tusur-csp-table-row").each(
			function ()
			{
			var cells = $(this).find(".tusur-csp-table-cell");
			height.push($(this).height() - (cells.outerHeight(true) - cells.height()));
			});
		var tempDiv = $('<div/>');
		rows.before(tempDiv);
		rows.detach();
		rows.find(".tusur-csp-table-row").each(
			function (index)
			{
			$(this).find(".tusur-csp-table-cell").height(height[index]);
			});
		tempDiv.after(rows);
		tempDiv.remove();
		},

	drawAutoColumnWidth: function ()
		{
		this.tableWidth -= this.scrollbarWidth;
		this.tableWidth -= 2;
		var columnMaxWidth = [];
		var columnAverageWidth = [];
		var columnResultWidth = [];
		var sumMaxWidth = 0;
		var sumAverageWidth = 0;
		var sumDelta = 0;

		for (var i in this.widget.options.columnsModel)
			{
			if (this.widget.options.columnsModel[i].calcWidth)
				{
				var maxWidth = 0;
				var averageWidthSum = 0;
				var count = 0;
				this.widget.domTable.find(".tusur-csp-table-cell[data-tusur-csp-table-column='" + this.widget.options.columnsModel[i].index + "']")
					.each(
						function ()
						{
						averageWidthSum += $(this).outerWidth(true);
						count++;
						if (maxWidth < $(this).outerWidth(true))
							{
							maxWidth = $(this).outerWidth(true);
							}

						});

				var averageWidth = averageWidthSum / count;
				columnMaxWidth.push(maxWidth);
				columnAverageWidth.push(averageWidth);
				sumMaxWidth += maxWidth;
				sumAverageWidth += averageWidth;
				sumDelta += maxWidth - averageWidth;
				//console.log(maxWidth + " " + averageWidth);
				}

			}

		columnResultWidth = this.calcColumnResultWidth(columnMaxWidth, columnAverageWidth, sumMaxWidth, sumAverageWidth, sumDelta);

		var j = 0;
		for (var i = 0; i < this.widget.options.columnsModel.length; i++)
			{
			if (this.widget.options.columnsModel[i].calcWidth)
				{
				this.widget.domTableContainer.find(".tusur-csp-table-cell[data-tusur-csp-table-column='" + this.widget.options.columnsModel[i].index + "']")
					.width(columnResultWidth[j]);
				j++;
				}
			else
				{
				this.widget.domTableContainer.find(".tusur-csp-table-cell[data-tusur-csp-table-column='" + this.widget.options.columnsModel[i].index + "']")
					.width(this.widget.options.columnsModel[i].width)

				}


			}

		var width = this.widget.domHeader.find(".tusur-csp-table-cell-header:last").width() + this.scrollbarWidth - 1;
		this.widget.domHeader.find(".tusur-csp-table-cell-header:last").width(width);

		var scrollbarWidth = this.scrollbarWidth;
		if (!this.needScroll)
			{
			this.widget.domBody.find(".tusur-csp-table-row").each(
				function ()
				{
				var width = $(this).find(".tusur-csp-table-cell:last").width() + scrollbarWidth;
				$(this).find(".tusur-csp-table-cell:last").width(width);
				});
			}
		},

	calcColumnResultWidth: function (columnMaxWidth, columnAverageWidth, sumMaxWidth, sumAverageWidth, sumDelta)
		{
		var columnResultWidth = [];
		if (sumAverageWidth <= this.tableWidth - this.columnsCount)
			{
			var resultSummWidth = 0;

			if (sumMaxWidth <= this.tableWidth - this.columnsCount)
				{
				var overColumn = 0;
				if (this.widthCalcType == 'byMaxWidth')
					{
					if (sumMaxWidth < this.minTableWidth)
						{
						overColumn = (this.minTableWidth - sumMaxWidth ) / this.columnsCount;
						}
					else
						{
						overColumn = 0;
						}
					}
				else if (this.widthCalcType == 'byOuterWidth')
					{
					overColumn = ((this.tableWidth - this.columnsCount) - sumMaxWidth ) / this.columnsCount;
					}

				for (var i = 0; i < this.columnsCount; i++)
					{
					var resultWidth = columnMaxWidth[i] + overColumn;
					columnResultWidth.push(resultWidth);
					resultSummWidth += resultWidth;
					}
				}

			else
				{
				var tableDelta = this.tableWidth - sumAverageWidth - this.columnsCount;
				// - this.draw.columnsCount  because + 1px on border
				var part = 1 / sumDelta;
				if (sumDelta == 0)
					{
					part = 1 / this.columnsCount;
					}


				//console.log("part = " + part);
				for (var i = 0; i < this.columnsCount; i++)
					{
					var delta = columnMaxWidth[i] - columnAverageWidth[i];
					var k = part * delta;
					//console.log("k = " + k);
					var resultWidth = columnAverageWidth[i] + tableDelta * k;
					columnResultWidth.push(resultWidth + 1);
					//console.log(columnAverageWidth[i] + " " + resultWidth);
					resultSummWidth += resultWidth;


					}
				}


			//console.log("table width:" + (this.tableWidth - this.columnsCount) + "   result width:" + resultSummWidth);
			if ((this.tableWidth - this.columnsCount) < resultSummWidth)
				{
				var delta = resultSummWidth - (this.tableWidth - this.columnsCount);
				for (var i = 0; i < this.columnsCount; i++)
					{
					columnResultWidth[i] -= delta;
					}
				}
			}
		else
			{
			var k = (this.tableWidth - this.columnsCount) / sumAverageWidth;
			for (var i = 0; i < this.columnsCount; i++)
				{
				var resultWidth = columnAverageWidth[i] * k;
				columnResultWidth.push(resultWidth + 1);
				//console.log(columnAverageWidth[i] + " " + resultWidth);
				}
			}
		return columnResultWidth;


		}
});


MKWidgets.TableNS.DisplayInterface = Class({
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

		this.widget.on('turnOn-display-interface', this.turnOn, this);
		this.widget.on('turnOff-display-interface', this.turnOff, this);
		},

	turnOn: function ()
		{
		this.enabled = true;
		//this.widget.domBody.find('.tusur-csp-table-cell').on("dblclick", $.proxy(this.cellDbclickSlot, this));
		this.widget.domBody.find('.tusur-csp-table-cell').on("click", $.proxy(this.cellDbclickSlot, this));
		},
	turnOff: function ()
		{
		this.enabled = false;
		//this.widget.domBody.find('.tusur-csp-table-cell').off("dblclick", $.proxy(this.cellDbclickSlot, this));
		this.widget.domBody.find('.tusur-csp-table-cell').off("click", $.proxy(this.cellDbclickSlot, this));
		},

	cellDbclickSlot: function (event)
		{
		//event.preventDefault();
		var cell = $(event.currentTarget).data("cell");
		if (cell.displayItem != null)
			{
			if (cell.displayItem.options.popupOn)
				{
				cell.displayItem.openPopup();
				}
			}
		},
});


MKWidgets.TableNS.LogLine = Class({
	'extends': MK.Object,
	constructor: function (logData)
		{
		this.jset(logData);
		this.on('render',
			function (event)
			{
			var currentDate = new Date();
			this.time = currentDate.getDate() + "/"
				+ (currentDate.getMonth() + 1) + "/"
				+ currentDate.getFullYear() + " @ "
				+ currentDate.getHours() + ":"
				+ currentDate.getMinutes() + ":"
				+ currentDate.getSeconds();
			this.logMsgTypeExist = true;
			this.bindNode('time', ':sandbox .tusur-csp-table-log-time', MK.binders.html())
				.bindNode('logMsg', ':sandbox .tusur-csp-table-log-msg', MK.binders.html())
				.bindNode('logMsgTypeExist', ':sandbox', MK.binders.className(this.logMsgType))
			;
			});
		}
});

MKWidgets.TableNS.LogLines = Class({
	'extends': MK.Array,
	Model: MKWidgets.TableNS.LogLine,
	itemRenderer: '<div class="tusur-csp-table-row"><div class="tusur-csp-table-cell tusur-csp-table-log-time"></div><div class="tusur-csp-table-cell tusur-csp-table-log-msg"></div></div>',
	constructor: function (sandbox, container)
		{
		container.find('.tusur-csp-show-table-logs-container-table')
			.append($("<div/>").addClass("tusur-csp-table-body"));
		this.bindNode('sandbox', sandbox)
			.bindNode('container', container.find('.tusur-csp-table-body'))
		;
		$(document).on('click', $.proxy(this.hideContainer, this));
		$(document).keydown($.proxy(this.bodyKeydownSlot, this));

		}
});

MKWidgets.TableNS.FilterLine = Class({
	'extends': MK.Object,
	constructor: function (filterData)
		{
		this.jset(filterData);
		this.on('render',
			function (event)
			{
			this.parent = event.parentArray;
			this.linkProps('filterDescription', 'index');
			this.linkProps('filterCount', 'count',
				function (count)
				{
				return '(' + count + ')';
				});
			this.linkProps('showFilterLine', 'count',
				function (count)
				{
				return (count > 0) ? true : false;
				});
			this.bindNode('filterDescription', ':sandbox label', MK.binders.html())
				.bindNode('filterCount', ':sandbox .data-tusur-csp-table-filter-counter', MK.binders.html())
				.bindNode('index', ':sandbox', MK.binders.attr('tusur-csp-table-cell-settings-filter'))
				.bindNode('showFilterLine', ':sandbox', MK.binders.display())
				.bindNode('inputValue', ':sandbox input')
				.bindNode('filterDescription', ':sandbox input', MK.binders.attr('id'))
				.bindNode('filterDescription', ':sandbox label', MK.binders.attr('id'))
				.bindNode('filterDescription', ':sandbox input', MK.binders.attr('title'))
			;
			//this.on('parent.parent@change:checkboxAll',
			//	function()
			//	{
			//	var value = this.parent.parent.checkboxAll;
			//	this.set('displayChanged', value, {silent:true});
			//	this.set('inputValue', value, {silent:true});
			//	},this);
			this.linkProps('displayChanged', 'inputValue');

			this.on("change:inputValue",
				function ()
				{
				this.parent.tableWidget.trigger('table-display-changed');
				}, this)
			});
		}
});

MKWidgets.TableNS.FilterLines = Class({
	'extends': MK.Array,
	Model: MKWidgets.TableNS.FilterLine,
	itemRenderer: '<div class="tusur-csp-table-cell-settings-filter-element">' +
	'<div class="tusur-csp-table-cell-filter-checkbox-container"><input type="checkbox" checked="checked"><label></label>' +
	'</div><div class="data-tusur-csp-table-filter-counter">' +
	'</div></div>',
	constructor: function (tableWidget, parent, sandbox)
		{
		this.parent = parent;
		this.tableWidget = tableWidget;
		this.columnIndex = parent.index;
		this.bindNode('sandbox', sandbox);
		this.tableWidget.onDebounce("table-display-changed", this.refresh, 1000, this);
		},

	initScrollbar: function ()
		{
		if (this.listScroll == undefined)
			{
			this.listScroll = $(this.sandbox).addClass("thin-skin").customScrollbar(
				{
					updateOnWindowResize: true,
					hScroll: false,
					fixedThumbHeight: 7,
					animationSpeed: 0
				});
			}
		},

	refresh: function ()
		{
		var filterObject = this.calcFilterObject();

		this.each(
			function (filterLine)
			{
			filterLine.off("change:inputValue");
			});

		this.each(
			function (filterLine)
			{
			var count = 0;
			if (filterObject[filterLine.index] != undefined)
				{
				count = filterObject[filterLine.index];
				}
			filterLine.count = count;
			delete filterObject[filterLine.index];
			}, this);

		for (var index in filterObject)
			{
			this.push({index: index, count: filterObject[index]});
			}

		this.tableWidget.rows.forEach(
			function (row)
			{
			var cell = null;
			row.each(
				function (propouseCell)
				{
				if (propouseCell.index == this.columnIndex)
					{
					cell = propouseCell;
					return;
					}
				}, this);

			if (cell == null)
				{
				return;
				}

			var filterLine = null;
			this.each(
				function (propouseFilterLine)
				{
				if (cell.value == propouseFilterLine.index)
					{
					filterLine = propouseFilterLine;
					return;
					}
				}, this);

			//if(filterLine != undefined)
			//	{
			//cell.linkProps('display', [filterLine, 'inputValue']);
			//}
			if (filterLine == null)
				{
				return;
				}
			filterLine.on("change:inputValue",
				function ()
				{
				cell.display = this.inputValue;
				}, filterLine);

			}, this);
		this.allCounter();
		},

	allCounter: function ()
		{
		var counter = 0;
		this.each(
			function (filterLine)
			{
			counter += filterLine.count;
			});
		this.parent.allCounter = counter;
		},

	calcFilterObject: function ()
		{
		var filterObject = {};
		this.tableWidget.rows.forEach(
			function (row)
			{
			if (row.displayTotal == false)
				{
				flag = false;
				if (row.displayCount == 1 && row.displayFilter == false && row.displaySearch == true)
					{
					row.each(
						function (cell)
						{
						if (cell.index == this.columnIndex && cell.display == false)
							{
							flag = true;
							return;
							}
						}, this);
					}
				if (flag == false)
					{
					return;
					}
				}

			if (filterObject[row.rowData[this.columnIndex]] == undefined)
				{
				filterObject[row.rowData[this.columnIndex]] = 1
				}
			else
				{
				filterObject[row.rowData[this.columnIndex]]++;
				}
			}, this);
		return filterObject;
		},
});

MKWidgets.TableNS.HeaderCell = Class({
	'extends': MK.Object,
	view: false,
	constructor: function (data)
		{
		this.jset(data);
		this.on('render', this.render);
		$(document).on('click', $.proxy(this.hideFiltersContainer, this));
		$(document).keydown($.proxy(this.bodyKeydownSlot, this));
		},

	render: function (event)
		{
		this.createPopup();
		this.parent = event.parentArray;
		this.title += '&nbsp;';
		this.bindNode('title', ':sandbox .tusur-csp-table-cell-text', MK.binders.html())
			.bindNode('index', ':sandbox', MK.binders.attr('data-tusur-csp-table-column'))
			.bindNode('all', this.domFilters.find('.tusur-csp-table-cell-settings-filter-element-all .data-tusur-csp-table-filter-counter'), MK.binders.html())
			.bindNode('buttonClose', this.domFilters.find('.tusur-csp-table-header-cell-filter-element-close-button'))
			.bindNode('checkboxAll', this.domFilters.find(".tusur-csp-table-cell-settings-filter-element-all input"))
		;

		this.linkProps('all', 'allCounter',
			function (a)
			{
			return '(' + a + ')';
			});

		this.on('click::buttonClose ', this.popup.closePopup, this.popup);
		this.domFilters.find('.tusur-csp-table-cell-settings-sort-asc')
			.on('click', $.proxy(this.popup.closePopup, this.popup));
		this.domFilters.find('.tusur-csp-table-cell-settings-sort-desc')
			.on('click', $.proxy(this.popup.closePopup, this.popup));

		if (this.parent.filterable)
			{
			this.selectAll(":sandbox .tusur-csp-table-cell-text").on('click', $.proxy(this.openSettings, this));
			this.domFilterContainer = this.domFilters.find('.tusur-csp-table-cell-settings-filter-container');
			this.settings = new MKWidgets.TableNS.FilterLines(this.parent.parent, this, this.domFilterContainer);

			this.on("change:checkboxAll",
				function ()
				{
				var value = this.checkboxAll;
				this.settings.each(function (setting)
				{
				setting.set('inputValue', value);
				});

				//this.parent.parent.trigger('table-display-changed');
				});
			}
		this.on('height-changed',
			function ()
			{
			if (this.popup.popupDisplay == true)
				{
				this.settings.initScrollbar();
				this.settings.listScroll.customScrollbar("resize", true);
				}
			}, this);

		this.popup.on('popup-positioning-finish', $.proxy(this.changeFilterContainerHeightSlot, this));

		this.bindNode('view', ':sandbox', MK.binders.className('view-state'));
		},

	createPopup: function ()
		{
		var filters =
			'<div class="tusur-csp-table-cell-settings-filter-element tusur-csp-table-cell-settings-filter-element-all">' +
			'<div class="tusur-csp-table-cell-filter-checkbox-container"><input type="checkbox" checked="checked"><label>Все</label></div><div class="data-tusur-csp-table-filter-counter"></div></div>' +
			'<div class="tusur-csp-table-cell-settings-filter-container"></div>' +
			'<input type="button" class="tusur-csp-table-header-cell-filter-element-close-button" value="Закрыть">';

		this.domSortAsc = $("<div/>").addClass('tusur-csp-table-cell-settings-sort-asc')
			.text('По возрастанию')
			.attr('data-sort-direction', 'asc');


		this.domSortDesc = $("<div/>").addClass('tusur-csp-table-cell-settings-sort-desc')
			.text('По убыванию')
			.attr('data-sort-direction', 'desc')
		;

		this.domSortContainer = $("<div/>").addClass('tusur-csp-sort-container')
			.append(this.domSortAsc)
			.append(this.domSortDesc)
		;
		this.domFilters = $("<div/>")
			.addClass('tusur-csp-table-cell-settings')
			.html(filters)
			.prepend(this.domSortContainer);

		this.popup = new MKWidgets.Popup(this.domFilters, {
			positionElement: $(this.sandbox),
			linkVertical: 'bottom', //top, center, bottom
			linkHorizontal: 'left', //left, center, right
			linkingPoint: 'topLeft', //center, topLeft, topRight, bottomLeft, bottomRight
			sizeRestrictions: false,
			reverceHorizontal: true,
			reverceHorizontalPositions: {horizontal: 'right', linkingPoint: 'topRight'}
		});

		this.bindNode('sortAsc', this.domSortAsc)
			.bindNode('sortDesc', this.domSortDesc)
			.bindNode('index', this.domSortContainer, MK.binders.attr('data-tusur-csp-table-column'))
		;
		},

	openSettings: function (event)
		{
		var show = this.popup.popupDisplay;
		this.parent.map(
			function (child)
			{
			child.popup.popupDisplay = false;
			return child;
			});
		this.popup.togglePopup();
		},

	changeFilterContainerHeightSlot: function ()
		{
		if (this.popup.popupDisplay == true)
			{
			this.changeFilterContainerHeight();
			}
		},

	changeFilterContainerHeight: function ()
		{
		var deltaHeight = this.domFilters.outerHeight() - this.domFilterContainer.outerHeight(),
			maxHeight = $(window).height() - this.domFilters.offset().top,
			containerHeight = maxHeight - deltaHeight - 20
			;
		if (containerHeight > 500)
			{
			containerHeight = 500;
			}
		this.domFilterContainer.css('max-height', containerHeight);
		this.trigger('height-changed');
		},
});

MKWidgets.TableNS.Header = Class({
	'extends': MK.Array,
	Model: MKWidgets.TableNS.HeaderCell,
	itemRenderer: '<span class="tusur-csp-table-cell tusur-csp-table-cell-header">' +
	'<span class="tusur-csp-table-cell-text"></span>' +
	'</span>',

	constructor: function (columnModel, domTable, parent, filterable)
		{
		if (filterable != undefined)
			{
			this.filterable = filterable;
			}
		else
			{
			this.filterable = parent.options.filterable;
			}
		this.parent = parent;
		//this.allCounter = this.parent.rows.length;
		this.domHeader = $("<div/>")
			.addClass("tusur-csp-table-row")
			.addClass("tusur-csp-table-row-header");
		domTable.append(this.domHeader);
		this.bindNode('sandbox', this.domHeader);
		this.recreate(columnModel);
		}
});

MKWidgets.TableNS.Cell = Class({
	'extends': MK.Object,
	view: false,
	edit: false,
	error: false,
	constructor: function (columnModel, parent, indexInArray)
		{
		this.jset(columnModel);
		this.parent = parent;
		this.indexInArray = indexInArray;

		this.headerCell = this.findHeaderCell(this.parent.parent.header);

		this.columnModel = columnModel;
		this.display = true;
		this.on('render', this.render);
		this.on('change:display',
			function (event)
			{
			this.parent.calcDisplay(this.value);
			}, this);
		},

	findHeaderCell: function (header)
		{
		for (var i = 0; i < header.length; i++)
			{
			if (header[i].index == this.index)
				{
				return header[i];
				}
			}
		},

	render: function (event)
		{
		$(this.sandbox).data('cell', this);
		$(this.sandbox).addClass(this.skin);
		this.parent = event.parentArray;

		this.displayItem = MKWidgets.TableNS.DisplayItem.factory(this.sandbox, {
			columnModel: this,
			rowData: this.parent.rowData,
			domContainer: this.parent.parent.tableWidget.popupContainer,
			tableOptions: this.parent.parent.tableWidget.options,
		});
		if (this.displayItem != null)
			{
			this.displayItem.preprocess();
			}

		if (this.displayIndex == undefined)
			{
			this.displayIndex = this.index;
			}

		this.value = this.parent.rowData[this.displayIndex];
		//this.linkProps('value', [this.parent.rowData, this.index]);

		if(this.displayItem == undefined)
			{
			this.bindNode('value', ':sandbox', {
				setValue: function (value)
					{
					$(this).html(value + '&nbsp;');
					}
			});
			}

		this.bindNode('index', ':sandbox', MK.binders.attr('data-tusur-csp-table-column'))
		this.bindNode('view', ':sandbox', MK.binders.className('view-state'))
		this.bindNode('edit', ':sandbox', MK.binders.className('edit-state'))
		this.bindNode('error', ':sandbox', MK.binders.className('error-state'))

		this.headerCell.linkProps('view', [this, 'view']);
		}
});

MKWidgets.TableNS.Row = Class({
	'extends': MK.Array,
	Model: MKWidgets.TableNS.Cell,
	itemRenderer: '<span class="tusur-csp-table-cell"></span>',
	view: false,
	select: false,
	read: true,
	displayFilter: true,
	displaySearch: true,
	constructor: function (rowData, parent, indexInArray)
		{
		this.parent = parent;
		this.rowData = new MK.Object(rowData);
		this.indexInArray = indexInArray;
		this.once('render', this.renderCells);
		},

	renderCells: function (event)
		{
		this.bindNode('displayTotal', ':sandbox', MK.binders.display());
		this.parent = event.parentArray;
		this.tableWidget = this.parent.tableWidget;
		this.on('change:searchInput', this.searchDisplay, this);
		this.recreate(this.parent.columnsModel);
		this.bindNode('view', ':sandbox', MK.binders.className('view-state'));
		this.bindNode('select', ':sandbox', MK.binders.className('select-state'));
		this.bindNode('read', ':sandbox', MK.binders.className('!unread-state'));
		$(this.sandbox).data('row', this);
		this.linkProps('displayTotal', 'displayFilter displaySearch',
			function (displayFilter, displaySearch)
			{
			return displayFilter * displaySearch;
			});
		},


	recreateRow: function (rowData)
		{
		this.rowData = new MK.Object(rowData);
		this.recreate(this.parent.columnsModel);
		},

	calcDisplay: function (value)
		{
		var prevDisplay = this.displayTotal,
			prevCount = this.displayCount;
		this.displayFilter = true;
		this.displayCount = 0;
		if (this.searchInput != undefined)
			{
			this.searchDisplay();
			}
		this.each(
			function (item, index)
			{
			if (!item.display)
				{
				this.displayCount++;
				this.displayFilter = false;
				}
			}, this);

		if (this.displayCount > 0)
			{
			this.displayFilter = false;
			}
		else
			{
			this.displayFilter = true;
			}
		},

	searchDisplay: function ()
		{
		var displaySearch = this.displaySearch;
		if (this.searchInput != '')
			{
			displaySearch = false;
			this.each(
				function (index, value)
				{
				if ($.type(index.value) === "string")
					{
					if (index.value.indexOf(this.searchInput) > -1)
						{
						displaySearch = true;
						}
					}
				return false;
				}, this);
			}
		else
			{
			displaySearch = true;
			}
		this.displaySearch = displaySearch;
		},

	toJSON: function ()
		{
		return this.rowData.toJSON();
		}

});

MKWidgets.TableNS.Rows = Class({
	'extends': MK.Array,
	Model: MKWidgets.TableNS.Row,
	itemRenderer: '<div class="tusur-csp-table-row"></div>',
	constructor: function (tableWidget, data, columnsModel, domBody, header)
		{
		this.tableWidget = tableWidget;
		this.data = data;
		this.header = header;
		this.columnsModel = columnsModel;
		this.bindSandbox(domBody)

		this.recreate(data);
		this.on('change:length', this.changeLengthSlot, this, true);

		this.deletedRows = new MK.Array;
		},

	changeLengthSlot: function ()
		{
		if (this.length == 0)
			{
			this.createDummy();
			}
		else
			{
			if (this.domDummy != null)
				{
				this.domDummy.remove();
				this.domDummy = null;
				}
			}
		},

	createDummy: function ()
		{
		this.domDummy = $("<div/>").addClass("tusur-csp-table-dummy").text("Нет данных для отображения");
		$(this.sandbox).append(this.domDummy);
		},

	deleteRows: function (rows)
		{
		rows.each(this.deleteRow, this);
		},

	deleteRow: function (row)
		{
		if (this.tableWidget.options.deleteByFlag)
			{
			row.rowData.jset('#delete', true);
			this.deletedRows.push(row);
			}

		var index = this.indexOf(row);
		this.splice(index, 1);
		},

	toJSON: function ()
		{
		var result = MK.Array.prototype.toJSON.apply(this, []);

		if (this.tableWidget.options.deleteByFlag && this.deletedRows.length > 0)
			{
			var deletedRows = this.deletedRows.toJSON();
			result.push.apply(result, deletedRows)
			}
		return result;
		}


});
