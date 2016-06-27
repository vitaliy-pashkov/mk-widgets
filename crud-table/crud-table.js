var MKWidgets = MKWidgets || {};
MKWidgets.CrudTableNS = MKWidgets.CrudTableNS || {};

MKWidgets.CrudTable = Class({
	extends: MKWidgets.Table,

	constructor: function (elementSelector, options)
		{
		MKWidgets.Table.prototype.constructor.apply(this, [elementSelector, options]);
		this.setOptions({
			saveUrl: null,
			deleteUrl: null,

			viewable: true,
			editable: true,
			creatable: true,
			deletable: true,
			addable: true,
		});
		this.setOptions(options);

		this.on('table_ready', this.crudTableCreateInterfaces);
		},

	crudTableCreateInterfaces: function ()
		{
		this.viewInterface = new MKWidgets.CrudTableNS.ViewInterface(this, this.options.viewable);
		this.editInterface = new MKWidgets.CrudTableNS.EditInterface(this, this.options.editable);

		this.selectInterface = new MKWidgets.CrudTableNS.SelectInterface(this, this.options.addable);
		this.addInterface = new MKWidgets.CrudTableNS.AddInterface(this, this.options.addable);
		this.deleteInterface = new MKWidgets.CrudTableNS.DeleteInterface(this, this.options.addable);
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

	changeSelectionSlot: function()
		{
		if(this.widget.selectInterface.selectRows.length == 0)
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
			//todo: add error to log
			}
		},

	deleteSuccess: function (responce, status, request)
		{
		//warning: another context! this = jqxhr, this.interface = interface, this.rows = deleted_rows
		if (responce.status == 'OK')
			{
			this.rows.each(
				function (row)
				{
				var index = this.interface.widget.rows.indexOf(row);
				this.interface.widget.rows.splice(index, 1);
				}, this);

			this.interface.widget.trigger('table-display-changed');
            this.interface.widget.log("change", "Данные успешно удалены");
			}
		else
			{
			this.interface.widget.deleteError(responce.error);
			}
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
		while (row = this.selectRows.pop())
			{
			this.unsetRow(row);
			}
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
		this.addRow(this.addGetNewLine());
		},

	addRow: function (rowData)
		{
		this.widget.rows.push(new MKWidgets.TableNS.Row(rowData));

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
		var pattern = {};
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
		if(this.editInputItem != undefined)
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
			if (!inputItem.preValidate())
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


			this.interface.widget.trigger('table-display-changed');

			this.interface.widget.log("success", "Данные успешно сохранены");
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
		if(this.widget.rows.length > 0)
			{
			this.enabled = true;
			this.bindNode('tableActive', this.widget.element, this.tableActiveBinder);
			this.bindNode('viewCell', this.widget.domBody.find('.tusur-csp-table-cell'), this.cellViewBinder);
			$(document).on('keydown', $.proxy(this.keypressSlot, this));
			}

		},
	turnOff: function ()
		{
		if(this.enabled)
			{
			this.enabled = false;
			this.unbindNode('tableActive', this.widget.element, this.tableActiveBinder);
			this.unbindNode('viewCell', this.widget.domBody.find('.tusur-csp-table-cell'), this.cellViewBinder);
			$(document).off('keydown', $.proxy(this.keypressSlot, this));
			}
		},

	setCell: function (cell)
		{
		this.setRow(cell.parent);
		if (this.viewCell != undefined)
			{
			this.viewCell.view = false;
			}
		this.viewCell = cell;
		this.viewCell.view = true;
		},
	setRow: function (row)
		{
		if (this.viewRow != undefined)
			{
			this.viewRow.view = false;
			}
		this.viewRow = row;
		this.viewRow.view = true;
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
});
