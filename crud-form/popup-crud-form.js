var MKWidgets = MKWidgets || {};
MKWidgets.CrudFormNS = MKWidgets.CrudFormNS || {};
MKWidgets.PopupCrudFormNS = MKWidgets.PopupCrudFormNS || {};

MKWidgets.PopupCrudForm = Class({
	extends: MKWidgets.CrudForm,

	constructor: function (elementSelector, options)
		{
		this.createDom();

		MKWidgets.CrudForm.prototype.constructor.apply(this, [this.domBody, options]);
		this.setOptions({
			title: 'Название',
			controlPanel: null,
			controls: {
				cancel: "Отменить",
				save: "Сохранить"
			},
			waitText: 'Сохранение данных. Пожалуйста подождите.'
		});
		this.setOptions(options);

		this.setupDom();
		},

	createDom: function()
		{
		this.domHeaderTitle = $('<span/>').addClass('tusur-csp-popup-crud-form-title');
		this.domHeader = $('<div/>').addClass('tusur-csp-popup-crud-form-header').append(this.domHeaderTitle);
		this.domBody = $('<div/>').addClass('tusur-csp-popup-crud-form-body');
		this.domFooter = $('<div/>').addClass('tusur-csp-popup-crud-form-footer');

		this.domPopupElement = $('<div/>').addClass('tusur-csp-popup-crud-form-popup-element');
		this.domPopupElement.append(this.domHeader);
		this.domPopupElement.append(this.domBody);
		this.domPopupElement.append(this.domFooter);

        this.controlInterface = new MKWidgets.PopupCrudFormNS.ControlInterface(this, true);

        this.popup = new MKWidgets.Popup(this.domPopupElement, {
			background: true,
            width: '50%',
			linkVertical: 'center',
			linkHorizontal: 'center',
			linkingPoint: 'center',
		});

		this.popup.openPopup();
        },

	setupDom: function()
		{
		this.domHeaderTitle.text(this.options.title);
		}
});

MKWidgets.PopupCrudFormNS.ControlInterface = Class({
    extends: WidgetInterface,
    widget: null,
    enable: false,

    constructor: function (widget, enable)
        {
        WidgetInterface.prototype.constructor.apply(this, [widget, enable]);
        this.createDom();
        },

    create: function ()
        {
        WidgetInterface.prototype.create.apply(this);
        },

    createDom: function()
        {
        this.domInputSave = $("<input>").attr('type', 'button')
            .addClass('tusur-csp-popup-crud-form-save-button')
            .val('Далее')
            ;
        this.domInputCancel = $("<input>").attr('type', 'button')
            .addClass('tusur-csp-popup-crud-form-cancel-button')
            .val('Отменить')
            ;
        this.widget.domFooter.append(this.domInputCancel)
            .append(this.domInputSave)
            ;
        this.events();
        },

    events: function()
        {
        this.domInputSave.on('click', $.proxy(this.saveSlot, this));
        this.domInputCancel.on('click', $.proxy(this.canсelSlot, this));

		this.widget.on('save-success', this.saveSuccessSlot, this);
		this.widget.on('save-process-error', this.saveProcessErrorSlot, this);
		this.widget.on('save-network-error', this.saveServerErrorSlot, this);
		this.widget.on('save-server-error', this.saveNetworkErrorSlot, this);
        },

    turnOn: function ()
        {
        },

    saveSlot: function()
        {
		this.waitPopup = new MKWidgets.PopupNS.WaitPopup($('<div/>').text(this.widget.options.waitText), {
			title: 'Выполнение запроса'
		});
		this.waitPopup.popup.openPopup();

        this.widget.trigger('save-button-click');
        },

	saveSuccessSlot: function()
		{
		this.widget.popup.closePopup();
		this.widget.destroy();

		this.waitPopup.popup.closePopup();

		this.statusPopup = new MKWidgets.PopupNS.InfoPopup($('<div/>').text(this.widget.options.statuses.saveSuccess.text), {
			title: this.widget.options.statuses.saveSuccess.title
		});
		this.statusPopup.popup.openPopup();
		},

	saveProcessErrorSlot: function()
		{
		this.widget.popup.closePopup();
		this.widget.destroy();

		this.waitPopup.popup.closePopup();

		this.statusPopup = new MKWidgets.PopupNS.InfoPopup($('<div/>').text(this.widget.options.statuses.saveProcessError.text), {
			title: this.widget.options.statuses.saveProcessError.title
		});
		this.statusPopup.popup.openPopup();
		},

	saveServerErrorSlot: function()
		{
		this.widget.popup.closePopup();
		this.widget.destroy();

		this.waitPopup.popup.closePopup();

		this.statusPopup = new MKWidgets.PopupNS.InfoPopup($('<div/>').text(this.widget.options.statuses.saveServerError.text), {
			title: this.widget.options.statuses.saveServerError.title
		});
		this.statusPopup.popup.openPopup();
		},

	saveNetworkErrorSlot: function()
		{
		this.widget.popup.closePopup();
		this.widget.destroy();

		this.waitPopup.popup.closePopup();

		this.statusPopup = new MKWidgets.PopupNS.InfoPopup($('<div/>').text(this.widget.options.statuses.saveNetworkError.text), {
			title: this.widget.options.statuses.saveNetworkError.title
		});
		this.statusPopup.popup.openPopup();
		},

    canсelSlot: function()
        {
        this.widget.popup.closePopup();
		this.widget.destroy();
        },

});