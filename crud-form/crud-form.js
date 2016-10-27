var MKWidgets = MKWidgets || {};
MKWidgets.CrudFormNS = MKWidgets.CrudFormNS || {};


MKWidgets.CrudForm = Class({
	extends: MKWidget,
	formData: {},

	constructor: function (elementSelector, options)
		{
		MKWidget.prototype.constructor.apply(this, [elementSelector, options]);
		this.setOptions({
			dataSource: "local", //local, remote
			data: [],       //url or $data
			saveUrl: null,
			deleteUrl: null,
			dictsUrl: null,

			fieldsModel: {},
			idIndex: "id",

			parentFormData: null,
			action: "changeFormData", //create, read, update, delete, changeFormData

			viewable: true,
			editable: true,
			creatable: true,
			deletable: true,
			addable: true,

			reinitOnSave: true,

			saveOnChange: false,
			saveButton: false,
			saveButtonText: 'Сохранить',
			domStatus: null,

			controlPanel: null,
			controls: {
				cansel: "Отменить",
				save: "Сохранить"
			},

			statuses: {
				saveSuccess: {
					title: 'Операция заверена успешно',
					text: 'Данные сохранены успешно',
					class: 'success'
				},
				saveProcessError: {
					title: 'Операция заверена c ошибкой',
					text: 'Ошибка при обработке данных',
					class: 'error'
				},
				saveServerError: {
					title: 'Операция заверена c ошибкой',
					text: 'Ошибка при выполнении запроса',
					class: 'error'
				},
				saveNetworkError: {
					title: 'Операция не была выполнена',
					text: 'Ошибка связи с сервером',
					class: 'error'
				},
			},

			logsTypes: {
				'event': {name: 'Событие', class: 'tusur-csp-table-mk-logs-event'},
				'success': {name: 'Событие', class: 'tusur-csp-table-mk-logs-change'},
				'error': {name: 'Ошибка', class: 'tusur-csp-table-mk-logs-error'},
				'change': {name: 'Изменение', class: 'tusur-csp-table-mk-logs-change'}
			}
		});
		this.setOptions(options);

		this.fieldsModel = jQuery.extend(true, [], this.options.fieldsModel);
		this.on('form_data_ready', this.crudFormCreateInterfaces);

		if (this.options.action == 'read' || this.options.action == 'update')
			{
			this.getData();
			}
		if (this.options.action == 'create')
			{
			this.generatePattern();
			this.getDicts();
			}
		if (this.options.action == 'changeFormData')
			{
			this.getData();
			}

		},

	crudFormCreateInterfaces: function ()
		{
		this.renderInterface = new MKWidgets.CrudFormNS.RenderInterface(this, true);
		this.saveInterface = new MKWidgets.CrudFormNS.SaveInterface(this, true);

		this.formReady = true;
		this.trigger('crud-form-ready', this);
		},

	getDicts: function getDicts()
		{
		if (this.options.dictsUrl != null)
			{
			$.ajax(
				{
					url: this.options.dictsUrl,
					type: "GET",
					cache: false,
					contentType: "application/json",
					success: $.proxy(this.setDicts, this),
					error: $.proxy(this.serverError, this),
				});
			}
		else
			{
			this.trigger('form_data_ready');
			}
		},

	setDicts: function setDicts(data)
		{
		this.dicts = data;
		window.app.saveDicts(this.dicts);
		this.trigger('form_data_ready');
		},

	getData: function getData()
		{
		if (this.options.dataSource == "remote")
			{
			$.ajax(
				{
					url: this.options.data,
					type: "GET",
					cache: false,
					contentType: "application/json",
					success: $.proxy(this.setData, this),
					error: $.proxy(this.serverError, this),
				});
			}
		if (this.options.dataSource == "local")
			{
			this.formData = this.options.data;
			if (this.formData[this.options.idIndex] == undefined)
				{
				this.generatePattern();
				}
			//if(!(this.formData instanceof MK.Object))
			//	{
			//	this.formData = new MK.Object(this.formData);
			//	}
			this.trigger("form_data_ready");
			}
		},

	setData: function setData(data)
		{
		this.formData = new MK.Object(data.data);
		this.dicts = data.dicts;
		window.app.saveDicts(this.dicts);
		//this.patternInsertData();
		this.trigger('form_data_ready');
		},

	serverError: function serverError(error)
		{
		alert("error: " + JSON.stringify(error));
		},

	generatePattern: function ()
		{
		var pattern = {};
		for (var i in this.fieldsModel)
			{
			var field = this.fieldsModel[i];
			if ('default' in field)
				{
				pattern[field.index] = field.default;
				}
			else
				{
				pattern[field.index] = "-";
				}
			if (field.type == 'array')
				{
				pattern[field.index] = [];
				}
			if (field.type == 'table')
				{
				pattern[field.index] = [];
				}
			if (field.type == 'cron')
				{
				pattern[field.index] = '* * * * * *';
				}
			}
		for (var j in this.options.parents)
			{
			var parent = this.options.parents[j];
			pattern[parent.index] = parent.value;
			}

		pattern[this.options.idIndex] = -1;
		var parent = this.formData['#parent'];
		this.formData = new MK.Object(pattern);
		this.formData.set('#parent', parent);
		//this.addRowDataPattern = JSON.stringify(pattern);
		},

	formDataChangeSignal: function ()
		{
		this.trigger('form-data-change');
		},

	setStatus: function (status)
		{
		if (this.options.domStatus != undefined && this.options.statuses[status] != undefined)
			{
			this.options.domStatus.text(this.options.statuses[status].text);
			this.options.domStatus.addClass(this.options.statuses[status].class);
			this.options.domStatus.show();
			this.options.domStatus.fadeOut(
					1000,
					$.proxy(function ()
					{
					this.options.domStatus.removeClass(this.options.statuses[status].class);
					this.options.domStatus.hide();
					}, this)
				);

			}
		},

	destroy: function ()
		{
		this.element.empty();
		delete this;
		}

});


MKWidgets.CrudFormNS.SaveInterface = Class({
	extends: WidgetInterface,
	widget: null,
	enable: false,

	constructor: function (widget, enable)
		{
		WidgetInterface.prototype.constructor.apply(this, [widget, enable]);
		if(this.widget.options.action != 'changeFormData')
			{
			this.widget.on('save-button-click', this.save, this);
			}
		},

	save: function ()
		{
		this.saveFields();
		},

	create: function ()
		{
		if (this.widget.options.saveButton == true)
			{
			this.domSaveButton = $('<button/>').text(this.widget.options.saveButtonText);
			var container = $('<div class="tusur-csp-form-field form-columns-50-50"></div>');
			container.append(this.domSaveButton);
			this.widget.element.append(container)
			}

		WidgetInterface.prototype.create.apply(this);
		},

	turnOn: function ()
		{
		this.enabled = true;
		if (this.widget.options.saveButton == true)
			{
			this.domSaveButton.on('click', $.proxy(this.save, this));
			}
		if (this.widget.options.saveOnChange == true)
			{
			this.widget.onDebounce('form-data-change', $.proxy(this.save, this), 100);
			}
		},

	saveFields: function ()
		{
		if (this.validateFields(false))
			{
			$.ajax({
				url: this.widget.options.saveUrl,
				data: {row: JSON.stringify(this.widget.fields.toJSON())},
				type: "POST",
				cache: false,
				fields: this.widget.fields,
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

	validateFields: function (silent)
		{
		var fieldsValid = true;
		this.widget.fields.each(
			function (field)
			{
			//var inputItem = this.createInputItem(field);
			if (!field.inputItem.validate(silent))
				{
				fieldsValid = false;
				field.error = true;
				}
			else
				{
				field.error = false;
				}
			}, this);
		return fieldsValid;
		},

	saveSuccess: function (responce, status, request)
		{
		//warning: another context! this = jqxhr, this.interface = interface, this.row = current_edit_row
		if (responce.status == 'OK')
			{
			//alert('Данные сохранены успешно');

			if(this.interface.widget.options.reinitOnSave)
				{
				this.interface.widget.formData = new MK.Object(responce.row);
				this.fields.reInit();
				}

			this.interface.widget.setStatus('saveSuccess');
			this.interface.widget.trigger('save-success');
			}
		else
			{
			this.interface.widget.setStatus('saveProcessError');
			this.interface.widget.trigger('save-process-error');
			}
		},

	saveError: function (jqXhr, error)
		{
		if(error.status == 'timeout')
			{
			this.interface.widget.setStatus('saveNetworkError');
			this.interface.widget.trigger('save-network-error');
			}
		else
			{
			this.interface.widget.setStatus('saveServerError');
			this.interface.widget.trigger('save-server-error');
			}
		},
});

MKWidgets.CrudFormNS.RenderInterface = Class({
	extends: WidgetInterface,
	widget: null,
	enable: false,

	constructor: function (widget, enable)
		{
		WidgetInterface.prototype.constructor.apply(this, [widget, enable]);
		},

	create: function ()
		{
		if (this.widget.options.dependForm == true)
			{
			this.widget.element.addClass('tusur-csp-crud-depend-form');
			}
		else if (this.widget.options.subForm == true)
			{
			this.widget.element.addClass('tusur-csp-crud-sub-form');
			}
		else
			{
			this.widget.element.addClass('tusur-csp-crud-form-body');
			}

		this.widget.fields = new MKWidgets.CrudFormNS.Fields(this.widget, this.widget.fieldsModel, this.widget.element);

		WidgetInterface.prototype.create.apply(this);
		},

	turnOn: function ()
		{
		this.enabled = true;
		},
	turnOff: function ()
		{
		this.enabled = false;
		},

});

MKWidgets.CrudFormNS.Field = Class({
	extends: MK.Object,
	view: false,
	edit: false,
	error: false,
	constructor: function (fieldModel)
		{
		this.jset(fieldModel);
		this.fieldModel = fieldModel;
		this.on('render', this.render);
		this.on('afterrender', this.afterRender);
		},
	render: function (event)
		{
		$(this.sandbox).data('cell', this);
		this.fields = event.parentArray;

		//this.bindNode('type', ':sandbox', MK.binders.html());
		this.inputItem = this.createInputItem();
		this.inputItem.createField();
		this.inputItem.on('change:value', this.fields.formWidget.formDataChangeSignal, this.fields.formWidget);
		this.inputItem.on('value-changed', this.fields.formWidget.formDataChangeSignal, this.fields.formWidget);
		},

	reInit: function ()
		{
		this.inputItem.reInit();
		},

	afterRender: function ()
		{

		},

	createInputItem: function ()
		{
		var config = this.toJSON();
		config.formData = this.fields.formWidget.formData;
		config.formIndex = config.index;
		config.formWidget = this.fields.formWidget;
		return MKWidgets.CrudFormNS.InputItem.factory($(this.sandbox), config);
		},

});

MKWidgets.CrudFormNS.Fields = Class({
	'extends': MK.Array,
	Model: MKWidgets.CrudFormNS.Field,
	itemRenderer: '<div class="tusur-csp-form-field"></div>',

	constructor: function (formWidget, fieldsModel, domBody)
		{
		this.formWidget = formWidget;
		this.fieldsModel = fieldsModel;
		this.bindSandbox(domBody);

		this.recreate(fieldsModel);
		},

	reInit: function ()
		{
		for (var i = 0; i < this.length; i++)
			{
			this[i].reInit();
			}
		},

	toJSON: function ()
		{
		return this.formWidget.formData.toJSON();
		}

});



