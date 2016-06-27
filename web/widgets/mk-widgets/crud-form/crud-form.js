var MKWidgets = MKWidgets || {};
MKWidgets.CrudFormNS = MKWidgets.CrudFormNS || {};
//MKWidgets.PopupCrudFormNS = MKWidgets.PopupCrudFormNS || {};

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

			controlPanel: null,
			controls: {
				cansel: "Отменить",
				save: "Сохранить"
			},

			logsTypes: {
				'event': {name: 'Событие', class: 'tusur-csp-table-mk-logs-event'},
				'success': {name: 'Событие', class: 'tusur-csp-table-mk-logs-change'},
				'error': {name: 'Ошибка', class: 'tusur-csp-table-mk-logs-error'},
				'change': {name: 'Изменение', class: 'tusur-csp-table-mk-logs-change'}
			}
		});
		this.setOptions(options);

		/*
		this.fieldsModel = Entity.assignObject({},  {array_: this.options.fieldsModel});
		this.fieldsModel = this.fieldsModel.array_;
		*/
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

		this.trigger('crud-form-ready');
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
			if(this.formData[this.options.idIndex] == undefined)
				{
				this.generatePattern();
				}
			this.trigger("form_data_ready");
			}
		},

	setData: function setData(data)
		{
		this.formData = MK.Object(data.data);
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
			//if (field.type == 'select')
			//	{
			//	pattern[field.dictConfig.dictIdIndex] = -1;
			//	}
			if (field.type == 'array')
				{
				pattern[field.index] = [];
				}
			//if (field.type == 'multiselect')
			//	{
			//	pattern[field.dictConfig.dictIdIndex] = [];
			//	}
			}
		for (var j in this.options.parents)
			{
			var parent = this.options.parents[j];
			pattern[parent.index] = parent.value;
			}

		pattern[this.options.idIndex] = -1;
		var parent = this.formData['#parent'];
		this.formData = new MK.Object(pattern);
		this.formData.set('#parent', parent) ;
		//this.addRowDataPattern = JSON.stringify(pattern);
		},

	formDataChangeSignal: function()
		{
		this.trigger('form-data-change');
		},

	destroy: function()
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
		this.widget.on('save-button-click', this.save, this);
		},

	createInputItem: function (field)
		{
		var config = field.toJSON();
		config.formData = field.fields.formData;
		config.formIndex = config.index;
		return MKWidgets.CrudFormNS.InputItem.factory($(field.sandbox), config);
		},

	cancel: function ()
		{
		if (this.editInputItem != undefined)
			{
			this.editInputItem.itemCancel();
			}
		},

	save: function ()
		{
		this.saveFields();
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
		//if (responce.status == 'OK')
		//	{
		//	this.interface.widget.popup.closePopup();
		//	this.domSuccess = $("<div/>").html('Данные успешно сохранены!')
		//		.css('background', '#FDFDFD')
		//		.css('padding', '30px');
		//	this.successPopup = new MKWidgets.Popup(this.domSuccess, {
		//		width: '250px',
		//		linkVertical: 'center', //top, center, bottom
		//		linkHorizontal: 'center', //left, center, right
		//		linkingPoint: 'center',
		//	});
		//	this.successPopup.openPopup();
		//	}
		//else
		//	{
		//	this.interface.editSaveError(responce.error);
		//	}
		},

	saveError: function (responce)
		{
		alert(JSON.stringify(responce));
		},

	editSaveError: function (responce)
		{
		alert(JSON.stringify(responce));
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
		this.widget.element.addClass('tusur-csp-crud-form-body');
		this.widget.fields = new MKWidgets.CrudFormNS.Fields(this.widget, this.widget.fieldsModel, this.widget.formData, this.widget.element);

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
		this.inputItem.on('change:value',this.fields.formWidget.formDataChangeSignal, this.fields.formWidget );
		this.inputItem.on('value-changed',this.fields.formWidget.formDataChangeSignal, this.fields.formWidget );
		},

	afterRender: function()
		{

		},

	createInputItem: function ()
		{
		var config = this.toJSON();
		config.formData = this.fields.formData;
		config.formIndex = config.index;
		config.formWidget = this.fields.formWidget;
		return MKWidgets.CrudFormNS.InputItem.factory($(this.sandbox), config);
		},

});

MKWidgets.CrudFormNS.Fields = Class({
	'extends': MK.Array,
	Model: MKWidgets.CrudFormNS.Field,
	itemRenderer: '<div class="tusur-csp-form-field"></div>',

	constructor: function (formWidget, fieldsModel, data, domBody)
		{
		this.formWidget = formWidget;
		this.formData = data;
		this.fieldsModel = fieldsModel;
		this.bindSandbox(domBody);

		this.recreate(fieldsModel);
		},

	toJSON: function ()
		{
		return this.formData.toJSON();
		}

});


//MKWidgets.PopupCrudForm = Class({
//	extends: MKWidgets.CrudForm,
//
//	constructor: function (elementSelector, options)
//		{
//		this.createDom();
//
//		MKWidgets.CrudForm.prototype.constructor.apply(this, [this.domBody, options]);
//		this.setOptions({
//			title: 'Название',
//			controlPanel: null,
//			controls: {
//				cansel: "Отменить",
//				save: "Сохранить"
//			},
//		});
//		this.setOptions(options);
//
//		this.setupDom();
//		},
//
//	createDom: function()
//		{
//		this.domHeaderTitle = $('<span/>').addClass('tusur-csp-popup-crud-form-title');
//		this.domHeader = $('<div/>').addClass('tusur-csp-popup-crud-form-header').append(this.domHeaderTitle);
//		this.domBody = $('<div/>').addClass('tusur-csp-popup-crud-form-body');
//		this.domFooter = $('<div/>').addClass('tusur-csp-popup-crud-form-footer');
//
//		this.domPopupElement = $('<div/>').addClass('tusur-csp-popup-crud-form-popup-element');
//		this.domPopupElement.append(this.domHeader);
//		this.domPopupElement.append(this.domBody);
//		this.domPopupElement.append(this.domFooter);
//
//        this.controlInterface = new MKWidgets.PopupCrudFormNS.ControlInterface(this, true);
//
//        this.popup = new MKWidgets.Popup(this.domPopupElement, {
//			background: true,
//            width: '50%',
//			linkVertical: 'center',
//			linkHorizontal: 'center',
//			linkingPoint: 'center',
//		});
//
//		this.popup.openPopup();
//        },
//
//	setupDom: function()
//		{
//		this.domHeaderTitle.text(this.options.title);
//		}
//});
//
//MKWidgets.PopupCrudFormNS.ControlInterface = Class({
//    extends: WidgetInterface,
//    widget: null,
//    enable: false,
//
//    constructor: function (widget, enable)
//        {
//        WidgetInterface.prototype.constructor.apply(this, [widget, enable]);
//        this.createDom();
//        },
//
//    create: function ()
//        {
//        WidgetInterface.prototype.create.apply(this);
//        },
//
//    createDom: function()
//        {
//        this.domInputSave = $("<input>").attr('type', 'button')
//            .addClass('tusur-csp-popup-crud-form-save-button')
//            .val('Далее')
//            ;
//        this.domInputCancel = $("<input>").attr('type', 'button')
//            .addClass('tusur-csp-popup-crud-form-cancel-button')
//            .val('Отменить')
//            ;
//        this.widget.domFooter.append(this.domInputCancel)
//            .append(this.domInputSave)
//            ;
//        this.events();
//        },
//
//    events: function()
//        {
//        this.domInputSave.on('click', $.proxy(this.saveSlot, this));
//        this.domInputCancel.on('click', $.proxy(this.canсelSlot, this));
//        },
//
//    turnOn: function ()
//        {
//        },
//
//    saveSlot: function()
//        {
//        this.widget.trigger('save-button-click');
//        },
//
//    canсelSlot: function()
//        {
//        this.widget.popup.closePopup();
//        },
//
//});
