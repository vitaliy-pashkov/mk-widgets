var MKWidgets = MKWidgets || {};
MKWidgets.CrudMasterNS = MKWidgets.CrudMasterNS || {};

MKWidgets.CrudMaster = Class({
	extends: MKWidget,

	constructor: function (elementSelector, options)
		{
		MKWidget.prototype.constructor.apply(this, [this.domBody, options]);

		this.setOptions({
			dataSource: 'remote',
			title: 'Название',
			action: "create", //create, read, update, delete
			steps: [],
			deleteText: 'Подтвердите удаление',
			deleteSuccessText: 'Объект успешно удалён',
			saveSuccessText: 'Данные успешно сохранены',
		});
		this.setOptions(options);

		this.on('form_data_ready', this.crudMasterCreateInterfaces);
		if (this.options.action == 'update' || this.options.action == 'delete')
			{
			this.getData();
			}
		if (this.options.action == 'create')
			{
			this.generatePattern();
			this.getDicts();
			}
		},

	crudMasterCreateInterfaces: function ()
		{
		if (this.options.action == 'create' || this.options.action == 'update' )
			{
			this.renderInterface = new MKWidgets.CrudMasterNS.RenderInterface(this, true);
			this.saveInterface = new MKWidgets.CrudMasterNS.SaveInterface(this, true);
			}

		if(this.options.action == 'delete')
			{
			this.deleteInterface = new MKWidgets.CrudMasterNS.DeleteInterface(this, true);
			}
		},

	getDicts: function getDicts()
		{
		this.options.dictsUrl = Entity.applyContextValue(this.options.dictsUrl, this.formData);
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
			this.element.trigger("form_data_ready");
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
		for (var j in this.options.steps)
			{
			var fieldsModel = this.options.steps[j].fieldsModel;
			for (var i in fieldsModel)
				{
				var field = fieldsModel[i];
				if ('default' in field)
					{
					pattern[field.index] = field.default;
					}
				else
					{
					pattern[field.index] = "-";
					}
				if (field.type == 'select')
					{
					pattern[field.dictConfig.dictIdIndex] = -1;
					}
				if (field.type == 'array')
					{
					pattern[field.index] = [];
					}
				if (field.type == 'multiselect')
					{
					pattern[field.dictConfig.dictIdIndex] = [];
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
			}

		pattern = $.extend(pattern,this.options.pattern);


		for (var j in this.options.parents)
			{
			var parent = this.options.parents[j];
			pattern[parent.index] = parent.value;
			}

		pattern[this.options.idIndex] = -1;
		this.formData = new MK.Object(pattern);

		console.log(this.formData);
		//this.addRowDataPattern = JSON.stringify(pattern);
		}
});


MKWidgets.CrudMasterNS.SaveInterface = Class({
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

		this.widget.stepsPopup.on('try-next-step', this.tryNextStepSlot, this);
		this.widget.stepsPopup.on('try-done', this.tryDoneSlot, this);

		//this.widget.stepsPopup.on('activeStep.crudForm@form-data-change', this.silentValidate, this);
		this.widget.stepsPopup.on('change:activeStep', this.changeActiveForm, true, this);
		},
	turnOff: function ()
		{
		this.enabled = false;
		},

	changeActiveForm: function()
		{
		if(this.activeCrudForm != undefined)
			{
			this.activeCrudForm.off('form-data-change', this.silentValidate, this);
			}

		if(this.widget.stepsPopup.activeStep.step.crudForm == undefined)
			{
			this.activeCrudForm = this.widget.stepsPopup.activeStep.step.crudForms[ this.widget.formData[ this.widget.stepsPopup.activeStep.step.conditionIndex ]].crudForm;
			}
		else
			{
			this.activeCrudForm = this.widget.stepsPopup.activeStep.step.crudForm;
			}

		this.activeCrudForm.on('form-data-change', this.silentValidate,true , this);
		},

	silentValidate: function()
		{
		//alert();
		if(this.activeCrudForm.saveInterface.validateFields(true) == true)
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
		var formValid = this.validateActiveStep();
		if (formValid == true)
			{
			this.widget.stepsPopup.trigger('next-step');
			}
		},

	tryDoneSlot: function ()
		{
		var formValid = this.validateActiveStep();
		if (formValid == true)
			{
			this.saveFields();
			}
		},

	validateActiveStep: function ()
		{
		var activeStepNumber = this.widget.stepsPopup.activeStep.step.number;
		var activeCrudForm = null;
		this.widget.steps.forEach(
			function (step)
			{
			if (step.number == activeStepNumber)
				{
				activeCrudForm = step.crudForm;
				}
			});

		var formValid = activeCrudForm.saveInterface.validateFields(false);
		return formValid;
		},



	saveFields: function ()
		{
		console.log(this.widget.formData.toJSON());

		this.waitPopup = new MKWidgets.PopupNS.WaitPopup($('<div/>').text('Сохранение данных. Пожалуйста подождите.'), {
			title: 'Выполнение запроса'
		});
		this.waitPopup.popup.openPopup();

		$.ajax({
			url: this.widget.options.saveUrl,
			data: {row: JSON.stringify(this.widget.formData.toJSON())},
			type: "POST",
			cache: false,
			fields: this.widget.fields,
			interface: this,
			success: this.saveSuccess,
			error: this.saveError,
		});
		},

	saveSuccess: function (responce, status, request)
		{
		//warning: another context! this = jqxhr, this.interface = interface, this.row = current_edit_row
		this.interface.waitPopup.popup.closePopup();
		if (responce.status == 'OK')
			{
			this.formData = responce.row;
			this.interface.widget.stepsPopup.closePopup();

			var infoPopup = new MKWidgets.PopupNS.InfoPopup($('<div/>').text(this.interface.widget.options.saveSuccessText), {
				title: 'Операция завершена успешно'
			});
			infoPopup.popup.openPopup();

			this.interface.widget.trigger('master-success-save', this.formData);
			}
		else
			{
			var infoPopup = new MKWidgets.PopupNS.InfoPopup($('<div/>').text(responce.error), {
				title: 'Ошибка при выполнении запроса'
			});
			infoPopup.popup.openPopup();
			this.interface.widget.trigger('master-success-fail', this.formData);
			}
		},

	saveError: function (error)
		{
		this.interface.waitPopup.popup.closePopup();
		var infoPopup = new MKWidgets.PopupNS.InfoPopup($('<div/>').text(JSON.stringify(error)), {
			title: 'Ошибка при выполнении запроса'
		});
		infoPopup.popup.openPopup();
		},

});


MKWidgets.CrudMasterNS.DeleteInterface = Class({
	extends: WidgetInterface,
	widget: null,
	enable: false,

	constructor: function (widget, enable)
		{
		WidgetInterface.prototype.constructor.apply(this, [widget, enable]);
		},

	create: function ()
		{
		var deleteText = this.widget.options.deleteText;
		deleteText = Entity.applyContextValue(deleteText, this.widget.formData);

		this.domDeleteText = $("<div/>").text(deleteText);

		this.confirmPopup = new MKWidgets.PopupNS.ConfirmPopup( this.domDeleteText , {
			title: this.widget.options.title,
		});
		this.confirmPopup.popup.openPopup();


		WidgetInterface.prototype.create.apply(this);
		},

	turnOn: function ()
		{
		this.enabled = true;

		this.confirmPopup.on('confirm', this.delete, this);
		},
	turnOff: function ()
		{
		this.enabled = false;
		},

	delete: function (rows)
		{
		if(this.widget.options.dataSource == 'remote')
			{
			$.ajax({
				url: this.widget.options.deleteUrl,
				data: {row: this.widget.formData.toJSON()},
				type: "POST",
				cache: false,
				interface: this,
				success: this.deleteSuccess,
				error: this.deleteError,
			});
			}
		},

	deleteSuccess: function (responce, status, request)
		{
		//warning: another context! this = jqxhr, this.interface = interface, this.rows = deleted_rows
		if (responce.status == 'OK')
			{
			var deleteSuccessText = this.interface.widget.options.deleteSuccessText;
			deleteSuccessText = Entity.applyContextValue(deleteSuccessText, this.interface.widget.formData);

			this.interface.domDeleteSuccessText = $("<div/>").text(deleteSuccessText);

			this.interface.infoPopup = new MKWidgets.PopupNS.InfoPopup(this.interface.domDeleteSuccessText , {});
			this.interface.infoPopup.popup.openPopup();
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

MKWidgets.CrudMasterNS.RenderInterface = Class({
	extends: WidgetInterface,
	widget: null,
	enable: false,

	constructor: function (widget, enable)
		{
		WidgetInterface.prototype.constructor.apply(this, [widget, enable]);
		},

	create: function ()
		{
		this.widget.steps = [];
		for (var i in this.widget.options.steps)
			{
			this.widget.steps[i] = new MK.Object(this.widget.options.steps[i]);
			this.setupStep(this.widget.steps[i], i);
			}

		this.widget.stepsPopup = new MKWidgets.PopupNS.StepsPopup($("<div/>"), {
			width: '50%',
			linkVertical: 'center', //top, center, bottom
			linkHorizontal: 'center', //left, center, right
			linkingPoint: 'center', //center, topLeft, topRight, bottomLeft, bottomRight
			title: this.widget.options.title,
			steps: this.widget.steps,
			sizeRestrictions: true,
			cascade: true,
			customClass: 'tusur-csp-master-popup',
			//sizeRestrictionsScrollBar: true,
		});
		this.widget.stepsPopup.openPopup();


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

	setupStep: function (step, index)
		{
		step.number = parseInt(index) + 1;
		step.body = $("<div/>");
		if (step.conditionIndex != undefined)
			{
			step.crudForms = {};

			for (var conditionValue in step['fieldsConditionModel'])
				{
				step.crudForms[conditionValue] = {};
				var fieldsModel = step['fieldsConditionModel'][conditionValue];
				step.crudForms[conditionValue].body = $("<div/>");
				step.crudForms[conditionValue].crudForm = new MKWidgets.CrudForm(step.crudForms[conditionValue].body, {
					dataSource: 'local',
					data: this.widget.formData,
					actions: 'changeFormData',
					fieldsModel: fieldsModel,
					idIndex: this.widget.options.idIndex,
				});
				}

			step.formData = this.widget.formData;

			this.on('widget.formData@change:' + step.conditionIndex,
				function (event)
				{
				if(this.crudForms[this.formData[this.conditionIndex]] != undefined)
					{
					this.body = this.crudForms[this.formData[this.conditionIndex]].body;
					this.crudForm = this.crudForms[this.formData[this.conditionIndex]].crudForm;
					}
				}, true, step);
			}

		else if (step.fieldsModel != undefined)
			{
			step.crudForm = new MKWidgets.CrudForm(step.body, {
				dataSource: 'local',
				data: this.widget.formData,
				actions: 'changeFormData',
				fieldsModel: step.fieldsModel,
				idIndex: this.widget.options.idIndex,
			});
			}
		}

});