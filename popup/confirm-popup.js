var MKWidgets = MKWidgets || {};
MKWidgets.PopupNS = MKWidgets.PopupNS || {};

MKWidgets.PopupNS.ConfirmPopup = Class({
	extends: MKWidget,
	constructor: function (elementSelector, options)
		{
		MKWidget.prototype.constructor.apply(this, [elementSelector, options]);
		this.setOptions({
			class: '',
			title: 'Подтвердить действие',
			confirm: {
				text: 'Подтвердить',
				class: 'confirm'
			},
			cancel: {
				text: 'Отмена',
				class: 'cancel'
			}
		});
		this.setOptions(options);
		this.createDom();
		},

	createDom: function ()
		{
		this.popupBody = $("<div/>").addClass('mkw-confirm-popup');
		this.domTitle = $("<div/>").addClass('header').html(this.options.title);
		this.domFooter = $('<div/>').addClass('footer');
		this.createFooter();

		this.element.addClass('body');

		this.popupBody
			.append(this.domTitle)
			.append(this.element)
			.append(this.domFooter)
		;

		this.popup = new MKWidgets.Popup( this.popupBody, {
			width: '50%',
			linkVertical: 'center', //top, center, bottom
			linkHorizontal: 'center', //left, center, right
			linkingPoint: 'center', //center, topLeft, topRight, bottomLeft, bottomRight
			sizeRestrictions: true,
			cascade: true,
		});

		this.trigger('confirm-popup-ready');
		},

	createFooter: function ()
		{
		this.domConfirm = $("<button/>")
			.addClass(this.options.confirm.class)
			.text(this.options.confirm.text)
			.on('click', $.proxy(this.confirmClickSlot, this))
		;
		this.domCancel = $("<button/>")
			.addClass(this.options.cancel.class)
			.text(this.options.cancel.text)
			.on('click', $.proxy(this.cancelClickSlot, this))
		;

		this.domFooter
			.append(this.domCancel)
			.append(this.domConfirm)
		;
		},

	confirmClickSlot: function()
		{
		this.trigger('confirm');
		this.popup.closePopup();
		},

	cancelClickSlot: function()
		{
		this.trigger('cancel');
		this.popup.closePopup();
		},

});