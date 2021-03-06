var MKWidgets = MKWidgets || {};
MKWidgets.CrudTableNS = MKWidgets.CrudTableNS || {};

MKWidgets.CrudTable = Class({
	extends: MKWidgets.Table,

	constructor: function (elementSelector, options)
		{
		this.on('table_interface_ready', this.initInterfacesSlot);

		MKWidgets.Table.prototype.constructor.apply(this, [elementSelector, options]);
		this.setOptions({
			saveUrl: null,
			deleteUrl: null,

			viewable: true,
			editable: true,
			creatable: true,
			deletable: true,
			addable: true,
			readable: false, // {index: 'read'}

			addByMaster: null, //{represent: 'represent/name/', title: ''}
			pattern: {},
		});
		this.setOptions(options);

		this.initDone = true;
		this.initInterfacesSlot();
		},

	initInterfacesSlot: function ()
		{
		if (this.initDone == true && this.tableReady == true && this.crudTableInterfacesInit != true)
			{
			this.crudTableCreateInterfaces();
			}
		},

	crudTableCreateInterfaces: function ()
		{
		this.viewInterface = new MKWidgets.CrudTableNS.ViewInterface(this, this.options.viewable);
		this.editInterface = new MKWidgets.CrudTableNS.EditInterface(this, this.options.editable);

		this.selectInterface = new MKWidgets.CrudTableNS.SelectInterface(this, this.options.addable);
		this.addInterface = new MKWidgets.CrudTableNS.AddInterface(this, this.options.addable);
		this.deleteInterface = new MKWidgets.CrudTableNS.DeleteInterface(this, this.options.deletable);

		this.readInterface = new MKWidgets.CrudTableNS.ReadInterface(this, this.options.readable);

		this.pasteInterface = new MKWidgets.CrudTableNS.PasteInterface(this, this.options.editable);

		this.crudTableInterfacesInit = true;
		// поменял местами add и delete интерфейсы!!!
		},

	go: function (direction, action)
		{
		var newCell = this.viewInterface.getCellByDirection(direction);
		if (newCell == undefined)
			{
			return;
			}
		if (action == 'view')
			{
			this.viewInterface.setCell(newCell);
			}
		if (action == 'edit')
			{
			this.editInterface.setCell(newCell);
			}
		if (action == 'save')
			{
			this.editInterface.save(newCell);
			}
		if (action == 'cancel')
			{
			this.editInterface.cancel(newCell);
			}
		},
});

MKWidgets.CrudTableNS.ReadInterface = Class({
	extends: WidgetInterface,
	widget: null,
	enable: false,

	constructor: function (widget, enable)
		{
		WidgetInterface.prototype.constructor.apply(this, [widget, enable]);
		},

	create: function ()
		{
		for (var i = 0; i < this.widget.rows.length; i++)
			{
			if (this.widget.rows[i].rowData[this.widget.options.readable.index] != true)
				{
				this.widget.rows[i].read = false;
				}
			}
		WidgetInterface.prototype.create.apply(this);
		},

	turnOn: function ()
		{
		this.widget.viewInterface.on('change:viewRow', this.viewRowChanged, this);
		},
	turnOff: function ()
		{
		this.widget.viewInterface.off('change:viewRow', this.viewRowChanged, this);
		},

	viewRowChanged: function ()
		{
		if (this.widget.viewInterface.viewRow != undefined)
			{
			if (this.widget.viewInterface.viewRow.rowData[this.widget.options.readable.index] != true)
				{
				this.widget.viewInterface.viewRow.rowData[this.widget.options.readable.index] = true;
				this.widget.editInterface.saveRow(this.widget.viewInterface.viewRow);
				//this.widget.viewInterface.viewRow.read = true;
				}
			}
		}

});

MKWidgets.CrudTableNS.DeleteInterface = Class({
	extends: WidgetInterface,
	widget: null,
	enable: false,

	constructor: function (widget, enable)
		{
		WidgetInterface.prototype.constructor.apply(this, [widget, enable]);
		},

	create: function ()
		{

		this.deleteDomButton = $('<button/>')
			.text('Удалить')
			.addClass('tusur-csp-table-delete-input');
		this.widget.searchInterface.domSearch.before(this.deleteDomButton);
		this.widget.selectInterface.on('table-rows-selection-changed', this.changeSelectionSlot, true, this);
		WidgetInterface.prototype.create.apply(this);
		},

	turnOn: function ()
		{
		this.deleteDomButton.on('click', $.proxy(this.deleteClickSlot, this));
		},
	turnOff: function ()
		{
		this.deleteDomButton.off('click', $.proxy(this.deleteClickSlot, this));
		},

	changeSelectionSlot: function ()
		{
		if (this.widget.selectInterface.selectRows.length == 0)
			{
			this.deleteDomButton.prop('disabled', true)
				.addClass('disable');
			}
		else
			{
			this.deleteDomButton.prop('disabled', false)
				.removeClass('disable');
			}
		},

	deleteClickSlot: function ()
		{
		this.deleteRows(this.widget.selectInterface.selectRows);
		},

	deleteRows: function (rows)
		{
		if (rows.length > 0)
			{
			if (this.widget.options.dataSource == 'remote')
				{
				$.ajax({
					url: this.widget.options.deleteUrl,
					data: {rows: rows.toJSON()},
					type: "POST",
					cache: false,
					interface: this,
					rows: rows,
					success: this.deleteSuccess,
					error: this.deleteError,
				});
				}
			else
				{
				this.deleteRowsDom(rows);
				}

			}
		else
			{
			//todo: add error to log
			}
		},

	deleteSuccess: function (responce, status, request)
		{
		//warning: another context! this = jqxhr, this.interface = interface, this.rows = deleted_rows
		if (responce.status == 'OK')
			{
			this.interface.deleteRowsDom(this.rows);
			}
		else
			{
			this.interface.widget.deleteError(responce.error);
			}
		},

	deleteRowsDom: function (rows)
		{
		this.widget.rows.deleteRows(rows);

		this.widget.selectInterface.clearAll();
		this.widget.trigger('table-changed');
		this.widget.trigger('table-display-changed');
		this.widget.log("change", "Данные успешно удалены");
		},

	deleteError: function (responce)
		{
		alert(JSON.stringify(responce));
		},
});

MKWidgets.CrudTableNS.SelectInterface = Class({
	extends: WidgetInterface,
	widget: null,
	enable: false,

	constructor: function (widget, enable)
		{
		WidgetInterface.prototype.constructor.apply(this, [widget, enable]);
		this.selectLastRow = null;
		this.selectRows = new MK.Array();
		},

	create: function ()
		{
		WidgetInterface.prototype.create.apply(this);
		},

	turnOn: function ()
		{
		this.widget.domBody.find('.tusur-csp-table-row').on('click', $.proxy(this.rowClickSlot, this));
		},
	turnOff: function ()
		{
		this.widget.domBody.find('.tusur-csp-table-row').off('click', $.proxy(this.rowClickSlot, this));
		},

	rowClickSlot: function (event)
		{
		var row = $(event.currentTarget).data('row');
		if (event.ctrlKey)
			{
			this.toogleRow(row);
			}

		if (event.button == 0)
			{
			if (!event.ctrlKey && !event.shiftKey)
				{
				this.clearAll();
				//this.toogleRow(row);
				}

			if (window.event.shiftKey)
				{
				this.selectRowsBetweenIndexes(this.selectLastRow, row);
				}
			}
		this.trigger('table-rows-selection-changed');
		},

	selectRowsBetweenIndexes: function (row1, row2)
		{
		var domVisibleRows = this.widget.domBody.find(".tusur-csp-table-row:visible");
		var indexes = [
			domVisibleRows.index($(row1.sandbox)),
			domVisibleRows.index($(row2.sandbox))
		];
		indexes.sort(
			function (a, b)
			{
			return a - b;
			});
		for (var i = indexes[0]; i <= indexes[1]; i++)
			{
			var row = $(domVisibleRows.get(i)).data('row');
			this.setRow(row);
			}
		},

	clearAll: function ()
		{
		var row;
		while (row = this.selectRows.pop())
			{
			}
		this.trigger('table-rows-selection-changed');
		},

	toogleRow: function (row)
		{
		if (row.select == true)
			{
			this.unsetRow(row);
			}
		else
			{
			this.setRow(row);
			}
		},

	setRow: function (row)
		{
		if (row.select == false)
			{
			row.select = true;
			this.selectRows.push(row);
			}
		this.selectLastRow = row;
		},

	unsetRow: function (row)
		{
		if (row.select == true)
			{
			row.select = false;
			this.selectRows.splice(row.selectPosition, 1);
			}
		},
});

MKWidgets.CrudTableNS.PasteInterface = Class({
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
		this.widget.domBody[0].addEventListener("paste", $.proxy(this.pasteSlot, this), true);
		//this.widget.element.on('paste', $.proxy(this.pasteSlot, this));
		},
	turnOff: function ()
		{
		this.widget.domBody[0].removeEventListener("paste", $.proxy(this.pasteSlot, this), true);
		},

	pasteSlot: function (event)
		{
		if (this.widget.viewInterface.tableActive && this.widget.viewInterface.viewCell != undefined && this.widget.editInterface.editCell == undefined && event.processed == undefined)
			{
			var text = event.clipboardData.getData('Text');
			var table = this.parseTableText(text);
			if (table == null)
				{
				return;
				}

			//var currentCell = this.widget.viewInterface.viewCell;
			var nextCell, i, j, k;
			for (i = 0; i < table.length; i++)
				{

				k = 0;
				for (j = 0; j < table[i].length; j++)
					{
					var inputItem = this.widget.editInterface.createInputItem(this.widget.viewInterface.viewCell);
					inputItem.setValue(table[i][j]);

					k++;

					nextCell = this.widget.viewInterface.getCellByDirectionStrictly('right');
					if (nextCell == undefined)
						{
						break;
						}
					this.widget.viewInterface.setCell(nextCell);
					}
				this.widget.editInterface.saveRow(this.widget.viewInterface.viewCell.parent);

				if (i < table.length - 1)
					{
					for (j = 0; j < k; j++)
						{
						nextCell = this.widget.viewInterface.getCellByDirectionStrictly('left');
						this.widget.viewInterface.setCell(nextCell);
						}
					nextCell = this.widget.viewInterface.getCellByDirectionStrictly('down');
					if (nextCell == undefined)
						{
						this.addRow(this.addGetNewLine());
						nextCell = this.widget.viewInterface.getCellByDirectionStrictly('down');
						}
					this.widget.viewInterface.setCell(nextCell);
					}
				}

			console.log(table);
			event.processed = true;
			}
		},

	parseTableText: function (text)
		{
		text = text.replace(/\r/g, '');

		var table = [];
		var lines_raw = text.split(/\n/g);

		var countColumns = null;
		for (var i in lines_raw)
			{
			var line = [];
			if (lines_raw[i].length > 0)
				{
				var cells = lines_raw[i].split(/\t/g);

				for (var j = 0; j < cells.length; j++)
					{
					if (cells[j] == "")
						{
						cells[j] = '-';
						}
					}

				if (countColumns == null)
					{
					countColumns = cells.length;
					}
				else
					{
					if (countColumns != cells.length)
						{
						return null;
						}
					}


				table.push(cells);
				}
			}
		return table;
		},

});

MKWidgets.CrudTableNS.AddInterface = Class({
	extends: WidgetInterface,
	widget: null,
	enable: false,

	constructor: function (widget, enable)
		{
		WidgetInterface.prototype.constructor.apply(this, [widget, enable]);
		},

	create: function ()
		{
		this.addDomButton = $('<button/>')
			.text('Добавить')
			.addClass('tusur-csp-table-add-input');
		this.widget.searchInterface.domSearch.before(this.addDomButton);
		this.addCreateRowDataPattern();
		WidgetInterface.prototype.create.apply(this);
		},

	turnOn: function ()
		{
		this.addDomButton.on('click', $.proxy(this.clickSlot, this));
		},
	turnOff: function ()
		{
		this.addDomButton.off('click', $.proxy(this.clickSlot, this));
		},

	clickSlot: function ()
		{
		if (this.widget.options.addByMaster != undefined)
			{
			var represent = this.widget.options.addByMaster.represent;
			app.registrateWidgetByRepresent(represent, 'master-' + represent, {}, {
				action: 'create',
				title: this.widget.options.addByMaster.masterTitle,
			}, $.proxy(this.afterMasterInit, this));
			}
		else
			{
			this.addRow(this.addGetNewLine());
			}

		},

	afterMasterInit: function (master)
		{
		this.master = master;
		this.master.on('master-success-save', this.masterSaveSlot, this);
		},

	masterSaveSlot: function (rowData)
		{
		this.addRow(rowData);
		},

	addRow: function (rowData)
		{
		//this.widget.rows.push(new MKWidgets.TableNS.Row(rowData));
		this.widget.rows.push(rowData);

		this.widget.trigger('reset-interfaces');
		this.widget.trigger('table-display-change');


		this.widget.drawInterface.scrollDown();
		},

	addGetNewLine: function ()
		{
		var newRowData = JSON.parse(this.addRowDataPattern);
		newRowData[this.widget.options.idIndex]--;
		this.addRowDataPattern = JSON.stringify(newRowData);
		return newRowData;
		},

	addCreateRowDataPattern: function ()
		{
		var pattern = $.extend({},this.widget.options.pattern);
		for (var i in this.widget.options.columnsModel)
			{
			var column = this.widget.options.columnsModel[i];
			if ('default' in column)
				{
				pattern[column.index] = column.default;
				}
			else
				{
				pattern[column.index] = "-";
				}
			if (column.type == 'select')
				{
				pattern[column.dictConfig.dictIdIndex] = -1;
				}
			if (column.type == 'multiselect')
				{
				pattern[column.dictConfig.dictIdIndex] = [];
				}
			}
		for (var j in this.widget.options.parents)
			{
			var parent = this.widget.options.parents[j];
			pattern[parent.index] = parent.value;
			}

		pattern[this.widget.options.idIndex] = -1;
		this.addRowDataPattern = JSON.stringify(pattern);
		},
});

MKWidgets.CrudTableNS.EditInterface = Class({
	extends: WidgetInterface,
	widget: null,
	enable: false,

	constructor: function (widget, enable)
		{
		WidgetInterface.prototype.constructor.apply(this, [widget, enable]);
		},

	turnOn: function ()
		{
		this.enabled = true;
		this.widget.domBody.find('.tusur-csp-table-cell').on("dblclick", $.proxy(this.cellDbclickSlot, this));
		},
	turnOff: function ()
		{
		this.enabled = false;
		this.widget.domBody.find('.tusur-csp-table-cell').off("dblclick", $.proxy(this.cellDbclickSlot, this));
		},


	cellDbclickSlot: function (event)
		{
		window.getSelection().removeAllRanges();

		var cell = $(event.currentTarget).data("cell");
		if (this.editCell != cell)
			{
			this.setCell(cell);
			}
		else
			{
			this.save();
			}
		},

	setCell: function (cell)
		{
		if (this.editCell != null)
			{
			this.save();
			}
		this.widget.viewInterface.setCell(cell);

		if (cell.editable != false)
			{
			this.editCell = cell;
			this.editCell.edit = true;

			this.widget.trigger('turnOff-view-interface');

			this.editInputItem = this.createInputItem(this.editCell);
			this.editInputItem.createField();

			this.turnOnEvents();
			}
		},

	unsetCell: function ()
		{
		this.editCell.value = this.editCell.parent.rowData[this.editCell.index];

		this.turnOffEvents();

		this.editInputItem = null;
		this.editCell = null;

		this.widget.trigger('turnOn-view-interface');
		this.widget.trigger('table-display-changed');
		},

	createInputItem: function (cell)
		{
		var config = cell.toJSON();
		config.formData = cell.parent.rowData;
		config.formIndex = config.index;
		return MKWidgets.CrudTableNS.InputItem.factory($(cell.sandbox), config);
		},

	turnOnEvents: function ()
		{
		this.eventsEnabled = true;
		$(document).on('keydown', $.proxy(this.keypressSlot, this));
		this.editInputItem.on('saveEvent', this.save, this);
		this.editInputItem.on('cancelEvent', this.cancel, this);
		},

	turnOffEvents: function ()
		{
		this.eventsEnabled = false;
		$(document).off('keydown', $.proxy(this.keypressSlot, this));
		this.editInputItem.off('saveEvent', this.save, this);
		this.editInputItem.off('cancelEvent', this.cancel, this);

		},

	keypressSlot: function (event)
		{
		if (event.keyCode == 13) // enter
			{
			this.widget.go('current', 'save');
			event.preventDefault();
			}
		if (event.keyCode == 9) // tab
			{
			this.widget.go('right', 'edit');
			event.preventDefault();
			}
		if (event.keyCode == 27) // esc
			{
			this.widget.go('current', 'cancel');
			event.preventDefault();
			}
		},

	cancel: function ()
		{
		if (this.editInputItem != undefined)
			{
			this.editInputItem.itemCancel();
			this.unsetCell();
			}
		},

	save: function ()
		{
		if (this.editInputItem.itemSave())
			{
			this.saveRow(this.editCell.parent);
			}
		this.unsetCell();
		},

	saveRow: function (row)
		{
		if (this.validateRow(row))
			{
			if (this.widget.options.dataSource == 'remote')
				{
				$.ajax({
					url: this.widget.options.saveUrl,
					data: {row: JSON.stringify(row.rowData.toJSON())},
					type: "POST",
					cache: false,
					row: row,
					interface: this,
					success: this.saveSuccess,
					error: this.saveError,
				});
				}
			else
				{
				this.widget.trigger('save-success');
				this.widget.trigger('table-changed');
				}

			}
		else
			{
			//todo: add error to log
			}
		},

	validateRow: function (row)
		{
		var rowValid = true;
		row.each(
			function (cell)
			{
			var inputItem = this.createInputItem(cell);
			if (!inputItem.validate())
				{
				rowValid = false;
				cell.error = true;
				}
			else
				{
				cell.error = false;
				}
			}, this);

		return rowValid;
		},

	saveSuccess: function (responce, status, request)
		{
		//warning: another context! this = jqxhr, this.interface = interface, this.row = current_edit_row
		if (responce.status == 'OK')
			{
			this.row.recreateRow(responce.row);

			this.interface.widget.trigger('reset-interfaces');

			if (this.interface.editCell != undefined)
				{
				var editRowIndex = this.interface.editCell.parent.indexInArray;
				var editCellIndex = this.interface.editCell.indexInArray;

				this.interface.setCell(this.interface.widget.rows[editRowIndex][editCellIndex]);
				}
			else if (this.interface.widget.viewInterface.viewCell != undefined)
				{
				var viewRowIndex = this.interface.widget.viewInterface.viewCell.parent.indexInArray;
				var viewCellIndex = this.interface.widget.viewInterface.viewCell.indexInArray;
				this.interface.widget.viewInterface.setCell(this.interface.widget.rows[viewRowIndex][viewCellIndex]);
				}


			this.interface.widget.trigger('table-display-changed');

			this.interface.widget.log("success", "Данные успешно сохранены");

			this.interface.widget.trigger('save-success');
			}
		else
			{
			this.interface.editSaveError(responce.error);
			}
		},

	editSaveError: function (responce)
		{
		alert(JSON.stringify(responce));
		this.interface.widget.trigger('turnOn-view-interface');
		this.interface.widget.trigger('table-display-changed');
		},
});

MKWidgets.CrudTableNS.ViewInterface = Class({
	extends: WidgetInterface,
	widget: null,
	enable: false,

	tableActiveBinder: {
		on: 'mouseenter mouseleave',
		getValue: function (option)
			{
			if (option.originalEvent != undefined && option.originalEvent.type == 'mouseover')
				{
				return true;
				}
			return false;
			}
	},

	cellViewBinder: {
		on: 'mouseenter',
		getValue: function (option)
			{
			var cell = $(this).data('cell');
			option.self.setCell(cell);
			return cell;
			}
	},

	constructor: function (widget, enable)
		{
		WidgetInterface.prototype.constructor.apply(this, [widget, enable]);
		},

	create: function ()
		{
		WidgetInterface.prototype.create.apply(this);

		this.widget.on('turnOn-view-interface', this.turnOn, this);
		this.widget.on('turnOff-view-interface', this.turnOff, this);
		},

	turnOn: function ()
		{

		if (this.widget.rows.length > 0)
			{
			this.enabled = true;
			this.bindNode('tableActive', this.widget.domBody, this.tableActiveBinder);
			this.bindNode('viewCell', this.widget.domBody.find('.tusur-csp-table-cell'), this.cellViewBinder);
			this.on('change:tableActive', this.tableActiveChangeSlot, this);
			$(document).on('keydown', $.proxy(this.keypressSlot, this));
			}
		//this.setCell(undefined);
		//this.setRow(undefined);
		},
	turnOff: function ()
		{
		if (this.enabled)
			{
			this.enabled = false;
			this.unbindNode('tableActive', this.widget.domBody, this.tableActiveBinder);
			this.unbindNode('viewCell', this.widget.domBody.find('.tusur-csp-table-cell'), this.cellViewBinder);
			$(document).off('keydown', $.proxy(this.keypressSlot, this));
			}
		},

	tableActiveChangeSlot: function ()
		{
		if (this.tableActive == false)
			{
			this.setCell(undefined);
			this.setRow(undefined);
			}
		},

	setCell: function (cell)
		{
		if (this.viewCell != undefined)
			{
			this.viewCell.view = false;
			}

		if (cell != undefined)
			{
			this.setRow(cell.parent);
			this.viewCell = cell;
			this.viewCell.view = true;
			}
		else
			{
			this.viewCell = undefined;
			this.setRow(undefined);
			}
		},
	setRow: function (row)
		{
		if (this.viewRow != undefined)
			{
			this.viewRow.view = false;
			}
		this.viewRow = row;
		if (row != undefined)
			{
			this.viewRow.view = true;
			}
		},

	keypressSlot: function (event)
		{
		if (this.tableActive)
			{
			if (event.keyCode == 13) // enter
				{
				this.widget.go('current', 'edit');
				event.preventDefault();
				}
			if (event.keyCode == 9) // tab
				{
				this.widget.go('right', 'view');
				event.preventDefault();
				}
			if (event.keyCode == 38) // up
				{
				this.widget.go('up', 'view');
				event.preventDefault();
				}
			if (event.keyCode == 40) // down
				{
				this.widget.go('down', 'view');
				event.preventDefault();
				}
			if (event.keyCode == 37) // left
				{
				this.widget.go('left', 'view');
				event.preventDefault();
				}
			if (event.keyCode == 39) // right
				{
				this.widget.go('right', 'view');
				event.preventDefault();
				}
			}
		},

	getCellByDirection: function (direction)
		{
		var cell = null;
		if (direction == "right")
			{
			cell = $(this.viewCell.sandbox).next(':visible').data("cell");
			if (cell == undefined)
				{
				var row = $(this.viewRow.sandbox).next(':visible').data("row");
				if (row != undefined)
					{
					cell = $(row.sandbox).find('.tusur-csp-table-cell:visible:first').data("cell");
					}
				}
			}
		if (direction == "left")
			{
			cell = $(this.viewCell.sandbox).prev(':visible').data("cell");
			if (cell == undefined)
				{
				var row = $(this.viewRow.sandbox).prev(':visible').data("row");
				if (row != undefined)
					{
					cell = $(row.sandbox).find('.tusur-csp-table-cell:visible:last').data("cell");
					}
				}
			}
		if (direction == "down")
			{
			var row = $(this.viewRow.sandbox).next(':visible').data("row");
			var index = this.viewRow.indexOf(this.viewCell);
			if (row != undefined)
				{
				cell = row [index];
				}
			}
		if (direction == "up")
			{
			var row = $(this.viewRow.sandbox).prev(':visible').data("row");
			var index = this.viewRow.indexOf(this.viewCell);
			if (row != undefined)
				{
				cell = row [index];
				}
			}
		if (direction == "current")
			{
			cell = this.viewCell;
			}
		return cell;
		},

	getCellByDirectionStrictly: function (direction)
		{
		var cell = null;
		if (direction == "right")
			{
			cell = $(this.viewCell.sandbox).next(':visible').data("cell");
			}
		if (direction == "left")
			{
			cell = $(this.viewCell.sandbox).prev(':visible').data("cell");
			}
		if (direction == "down")
			{
			var row = $(this.viewRow.sandbox).next(':visible').data("row");
			var index = this.viewRow.indexOf(this.viewCell);
			if (row != undefined)
				{
				cell = row [index];
				}
			}
		if (direction == "up")
			{
			var row = $(this.viewRow.sandbox).prev(':visible').data("row");
			var index = this.viewRow.indexOf(this.viewCell);
			if (row != undefined)
				{
				cell = row [index];
				}
			}
		if (direction == "current")
			{
			cell = this.viewCell;
			}
		return cell;
		},
});
