var MKWidgets = MKWidgets || {};
MKWidgets.SelectNS = MKWidgets.SelectNS || {};
MKWidgets.MultiSelectNS = MKWidgets.MultiSelectNS || {};


MKWidgets.MultiSelect = Class({
	extends: MKWidgets.Select,

	constructor: function (elementSelector, options)
		{
		MKWidgets.Select.prototype.constructor.apply(this, [elementSelector, options]);
		this.setOptions({

		});
		this.setOptions(options);
		},

	createInterfaces: function ()
		{
		if (this.options.inputField == true)
			{
			this.inputInterface = new MKWidgets.MultiSelectNS.SelectInputInterface(this, this.options.inputField);
			}
		else
			{
			this.headerInterface = new MKWidgets.MultiSelectNS.MultiSelectHeaderInterface(this, true);
			}
		this.listInterface = new MKWidgets.MultiSelectNS.SelectListInterface(this, true);
		},

});

MKWidgets.MultiSelectNS.MultiSelectHeaderInterface = Class({
	extends: MKWidgets.SelectNS.SelectHeaderInterface,

	constructor: function (widget, enable)
		{
		MKWidgets.SelectNS.SelectHeaderInterface.prototype.constructor.apply(this, [widget, enable]);
		},

	create: function ()
		{
		MKWidgets.SelectNS.SelectHeaderInterface.prototype.create.apply(this);
		},
});

MKWidgets.MultiSelectNS.SelectInputInterface = Class({
	extends: MKWidgets.SelectNS.SelectInputInterface,

	constructor: function (widget, enable)
		{
		MKWidgets.SelectNS.SelectInputInterface.prototype.constructor.apply(this, [widget, enable]);
		},

	create: function ()
		{
		MKWidgets.SelectNS.SelectInputInterface.prototype.create.apply(this);
		},
});


MKWidgets.MultiSelectNS.SelectListInterface = Class({
	extends: MKWidgets.SelectNS.SelectListInterface,

	constructor: function (widget, enable)
		{
		MKWidgets.SelectNS.SelectListInterface.prototype.constructor.apply(this, [widget, enable]);
		},

	create: function ()
		{
		MKWidgets.SelectNS.SelectListInterface.prototype.create.apply(this);
		},


});