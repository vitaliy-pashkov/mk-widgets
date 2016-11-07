var MKWidgets = MKWidgets || {};
MKWidgets.SelectNS = MKWidgets.SelectNS || {};
MKWidgets.TreeSelectNS = MKWidgets.TreeSelectNS || {};


MKWidgets.TreeSelect = Class({
	extends: MKWidgets.Select,

	constructor: function (elementSelector, options)
		{
		MKWidgets.Select.prototype.constructor.apply(this, [elementSelector, options]);
		this.setOptions({

			treeData: null
		});
		this.setOptions(options);
		},

	initSelect: function ()
		{
		this.getDict();
		this.optionsList = new MKWidgets.TreeSelectNS.SelectTree(this.dict, this);

		this.binding();

		if (this.options.renderOnInit == true)
			{
			this.render();
			}
		},

	createInterfaces: function ()
		{
		if (this.options.inputField == true)
			{
			this.inputInterface = new MKWidgets.TreeSelectNS.InputInterface(this, this.options.inputField);
			}
		else
			{
			this.headerInterface = new MKWidgets.SelectNS.SelectHeaderInterface(this, true);
			}
		this.listInterface = new MKWidgets.TreeSelectNS.TreeInterface(this, true);
		this.addableInterface = new MKWidgets.SelectNS.AddInterface(this, this.options.addable);
		},

	setSelectedOptionByValue: function (value)
		{
		var node = this.optionsList.tree.root.findNodeByValue(value);
		this.listInterface.selectNodeSlot(node);
		},

});

//MKWidgets.TreeSelectNS.HeaderInterface = Class({
//	extends: MKWidgets.SelectNS.SelectHeaderInterface,
//
//	constructor: function (widget, enable)
//		{
//		WidgetInterface.prototype.constructor.apply(this, [widget, enable]);
//		},
//
//	create: function ()
//		{
//		WidgetInterface.prototype.create.apply(this);
//		},
//});

MKWidgets.TreeSelectNS.InputInterface = Class({
	extends: MKWidgets.SelectNS.SelectInputInterface,

	constructor: function (widget, enable)
		{
		MKWidgets.SelectNS.SelectInputInterface.prototype.constructor.apply(this, [widget, enable]);
		},

	create: function ()
		{
		MKWidgets.SelectNS.SelectInputInterface.prototype.create.apply(this);

		this.widget.optionsList.tree.on('search-complete', this.searchOptionsUpdateSlot, this);
		},

	inputChangeSlot: function (event)
		{
		this.widget.optionsList.tree.searchInput.val($(event.target).val());
		this.widget.optionsList.tree.trigger('run-search');
		},

	searchOptionsUpdateSlot: function ()
		{
		//this.widget.listInterface.toggleDummy(this.widget.optionsList.tree.root.childsHide);
		},
});


MKWidgets.TreeSelectNS.TreeInterface = Class({
	extends: MKWidgets.SelectNS.SelectListInterface,

	constructor: function (widget, enable)
		{
		WidgetInterface.prototype.constructor.apply(this, [widget, enable]);
		},

	create: function ()
		{
		this.widget.domOptionsList.addClass('tree');

		WidgetInterface.prototype.create.apply(this);
		},

	turnOn: function ()
		{
		this.widget.on('change:showList options-view-update', this.optionsViewUpdate, this);
		this.widget.optionsList.tree.on('mkw-inside-resize', this.optionsViewUpdate, this);
		this.widget.optionsList.tree.on('select-node', this.selectNodeSlot, this);

		if(this.widget.optionsList.tree.selectedNode != undefined)
			{
			this.selectNodeSlot( this.widget.optionsList.tree.selectedNode );
			}
		//this.widget.popup.on('popup-positioning-finish', this.resizeTree, this);
		},

	selectNodeSlot: function (node)
		{
		var option = new MKWidgets.SelectNS.SelectModel(node.nodeData, this.widget.optionsList);
		this.widget.setSelectedOption(option);
		this.widget.showList = false;
		},

	optionsViewUpdate: function ()
		{
		var paddings = parseInt(this.widget.domOptionsList.css('padding-top')) + parseInt(this.widget.domOptionsList.css('padding-bottom'));
		var treeMaxSize = ($(window).outerHeight() - this.widget.domHeaderBlock.outerHeight() - paddings) / 2;
		var treeRealSize = this.widget.optionsList.tree.getTreeRealHeight();

		var maxSize = Math.min(treeMaxSize, treeRealSize);
		this.widget.optionsList.tree.element.height(maxSize);

		this.widget.optionsList.tree.trigger('mkw-resize-silent');
		this.widget.optionsList.tree.element.css('height', 'auto');
		this.widget.optionsList.tree.domTreeContainer.css('height', 'auto');
		//this.widget.popup.trigger('set-position');
		this.widget.popup.trigger('content-ready');
		},

});


MKWidgets.TreeSelectNS.SelectTree = Class({
	extends: MK,

	constructor: function (dict, widget)
		{
		this.dict = dict;
		this.parent = widget;
		},

	render: function ()
		{
		this.tree = new MKWidgets.Tree(this.parent.domOptionsList, $.extend (this.parent.options.treeConfig, {
			dataSource: "local",
			data: this.dict,
			navigation: this.parent.options.navigation,
			saveSelectStates: false,
		}));

		if(this.parent.options.value != null)
			{
			var selectedNode = this.tree.root.findNodeById(this.parent.options.value);
			this.tree.selectNode(selectedNode);
			}
		},

	destroy: function ()
		{
		this.tree.destroy();
		},


})