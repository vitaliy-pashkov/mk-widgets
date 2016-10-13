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
			saveSuccessText: 'Данные успешно сохранены!',
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
        },

    turnOn: function ()
        {
        },

    saveSlot: function()
        {
        this.widget.trigger('save-button-click');
        },

	saveSuccessSlot: function()
		{
		this.widget.popup.closePopup();
		this.domSuccess = $("<div/>").html(this.widget.options.saveSuccessText)
			.css('background', '#FDFDFD')
			.css('padding', '30px');
		this.successPopup = new MKWidgets.Popup(this.domSuccess, {
			width: '250px',
			linkVertical: 'center', //top, center, bottom
			linkHorizontal: 'center', //left, center, right
			linkingPoint: 'center',
		});
		this.successPopup.openPopup();
		},

    canсelSlot: function()
        {
        this.widget.popup.closePopup();
        },

});