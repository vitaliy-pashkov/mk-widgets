var MKWidgets = MKWidgets || {};
MKWidgets.PopupNS = MKWidgets.PopupNS || {};

MKWidgets.PopupNS.WaitPopup = Class({
	extends: MKWidget,
	constructor: function (elementSelector, options)
		{
		MKWidget.prototype.constructor.apply(this, [elementSelector, options]);
		this.setOptions({
			class: '',
			title: 'Пожалуйста подождите',

		});
		this.setOptions(options);
		this.createDom();
		},

	createDom: function ()
		{
		this.popupBody = $("<div/>").addClass('mkw-info-popup');
		this.domTitle = $("<div/>").addClass('header').html(this.options.title);

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

		this.trigger('info-popup-ready');
		},
});