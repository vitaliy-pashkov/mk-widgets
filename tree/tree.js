var MKWidgets = MKWidgets || {};
MKWidgets.TreeNS = MKWidgets.TreeNS || {};

MKWidgets.Tree = Class({
	extends: MKWidget,

	showList: false,
	selectedOption: null,
	nullSymbol: "-",

	constructor: function (elementSelector, options)
		{
		MKWidget.prototype.constructor.apply(this, [elementSelector, options]);
		this.setOptions({
			dataSource: "remote", //local, remote
			data: [],       //url or $data

			searchable: true,
			title: "defaultTreeName",
			filters: {
				//'debtors': {name: 'Задолжники', filter_type: 'boolean'},
				//'all': {name: 'Все', filter_type: 'boolean'},
				//'filter3': {name: 'Фильтр 3', filter_type: 'boolean'}
			},	//possible filters
			debugLevel: "profile",
			NoFiltersTreeOpen: false,
			loadHtml: false
		});
		this.setOptions(options);

		this.on("tree_data_ready", this.treeCreate);

		this.getData();
		this.local_Storage = $.initNamespaceStorage('tusur-csp-tree').localStorage;
		this.createDom();
		},

	getData: function ()
		{
		if (this.options.dataSource == "remote")
			{
			$.ajax(
				{
					url: this.options.data,
					type: "GET",
					cache: false,
					that: this,
					success: $.proxy(this.setData, this),
					error: $.proxy(this.serverError, this),
				});
			}
		if (this.options.dataSource == "local")
			{
			this.data = this.options.data;
			this.trigger("tree_data_ready");
			}
		},

	setData: function setData(data)
		{
		this.data = data;
		this.trigger('tree_data_ready');
		},

	serverError: function serverError(error)
		{
		alert("error: " + JSON.stringify(error));
		},

	createDom: function ()
		{
		this.cookieBaseNodes = {};
		if (this.local_Storage.get("tree") != undefined)
			{
			this.cookieBaseNodes = this.local_Storage.get("tree");
			}	//забираем сохраненные параметры дерева

		if (!$.isEmptyObject(this.options.filters))
			{
			this.filtersCreate();
			}
		if (this.options.searchable)
			{
			this.searchCreate();
			}

		this.domTreeContainer = $("<div/>").addClass("crudtree-tree-container");

		this.local_Storage.set("tree", this.cookieBaseNodes);

		this.element.append(this.domTreeContainer);


		//this.root.states.openState = "open";
		//this.treeContainer.append(this.root.domChilds.find(">.crudtree-node"));
		//
		//this.treeContainer.height(this.element.height() - this.searchContainer.height() - 35);
		//
		//this.treeRefresh();
		//this.element.trigger("crudTreeReady");
		},

	treeCreate: function ()
		{
		this.root = new MKWidgets.TreeNS.TreeNodeObject({
			childs: this.data,
			value: "root",
			type: "root",
		}, null, this, 0, this.domTreeContainer, null);
		this.treeRefresh();

		this.initScrollbar();
		},

	treeRefresh: function ()
		{
		this.root.refreshChildsDom();
		this.root.drawDepends(undefined);
		this.cookieRefresh();
		this.element.trigger("crudTreeResize");

		},

	cookieRefresh: function ()
		{
		if (this.domFiltersCheckbox != undefined)
			{
			$.each(this.domFiltersCheckbox, $.proxy(function (index, value)
			{
			this.cookieBaseNodes[$(value).attr('id')] = $(value).prop('checked');
			}, this));
			}
		this.cookieBaseNodes["input"] = this.searchInput.val();
		this.local_Storage.set("tree", this.cookieBaseNodes);
		},

	initScrollbar: function ()
		{
		this.setSizes();
		if (this.listScroll == undefined)
			{
			this.listScroll = this.domTreeContainer.addClass("thin-skin").customScrollbar(CustomScrollbarSettings);
			}
		this.listScroll.customScrollbar("resize", true);

		$(window).resize($.proxy(function ()
		{
		this.setSizes();
		this.listScroll.customScrollbar("resize", true);
		}, this));

		this.element.on('crudTreeResize', $.proxy(function ()
		{
		this.listScroll.customScrollbar("resize", true);
		}, this));
		},

	setSizes: function ()
		{
		var elementHeight = this.element.css('height'),
			elementCssHeight = window.getComputedStyle(this.element[0], null).getPropertyValue('height'),
			containerHeight = this.domTreeContainer.css('height');
		this.element.css('height', 'auto');
		this.domTreeContainer.css('height', 'auto');
		var deltaHeight = this.element.outerHeight(true) - this.domTreeContainer.outerHeight();
		this.element.css('height', '');
		this.domTreeContainer.css('max-height', (parseInt(this.element.css('height')) - deltaHeight) + "px");
		},

	filtersCreate: function ()
		{
		this.domFiltersContainer = $('<div/>').addClass("crudtree-filters-container");
		$.each(this.options.filters, $.proxy(function (index, value)
		{
		var checkBox = $('<input>')
			.addClass('crudtree-filter-checkbox')
			.attr('id', index)
			.attr('type', 'checkbox')
			.attr(value, true);
		if (this.cookieBaseNodes != undefined)
			{
			if (this.cookieBaseNodes[index] == true)
				{
				checkBox.attr("checked", true);
				}
			}
		var name = $('<label>')
			.addClass('crudtree-filter-p-name')
			.attr('for', index)
			.text(value['name']);
		var filter = $('<div>').addClass('crudtree-filter-block')
			.append(checkBox)
			.append(name);
		this.domFiltersContainer
			.append(filter);
		}, this));
		this.element.prepend(this.domFiltersContainer);
		this.domFiltersCheckbox = this.domFiltersContainer.find('.crudtree-filter-checkbox');
		this.domFiltersCheckbox.on("change", $.proxy(this.filtersControllerSlot, this));
		},

	filtersControllerSlot: function (event)
		{
		this.root.filter();
		this.treeRefresh();
		},

	searchCreate: function ()
		{
		this.searchInput = $("<input placeholder='Поиск'/>");

		if (this.cookieBaseNodes != undefined)
			{
			if (this.cookieBaseNodes["input"] != undefined)
				{
				if (this.cookieBaseNodes["input"].length > 0)
					{
					this.searchInput.val(this.cookieBaseNodes["input"]);
					}
				}
			}
		this.searchController = $("<div/>").addClass("crudtree-search-controller");
		this.searchContainer = $("<div/>")
			.addClass("tree-search-container")
			.append(this.searchInput)
			.append(this.searchController);
		this.element.prepend(this.searchContainer);

		this.searchInput.bind("propertychange change keyup input paste", $.proxy(this.searchChangeSlot, this));
		this.searchController.bind("click", $.proxy(this.searchControllerSlot, this));
		},

	searchChangeSlot: function (e)
		{
		if (this.searchInput.val().length > 0)
			{
			this.searchController.addClass("active");
			this.root.search(this.searchInput.val());
			}
		else
			{
			this.searchController.removeClass("active");
			this.root.searchReset();
			}
		this.treeRefresh();
		},

	searchControllerSlot: function (e)
		{
		if (this.searchController.hasClass("active"))
			{
			this.searchInput.val("");
			this.searchController.removeClass("active");
			this.root.searchReset();
			this.treeRefresh();
			}
		},

	loadHtml: function (node)
		{
		if (this.options.loadHtml)
			{
			var params = {};
			for (i in this.options.loadHtml.params)
				{
				params[this.options.loadHtml.params[i]] = node.nodeData[this.options.loadHtml.params[i]];
				}

			$.ajax({
				method: "GET",
				url: this.options.loadHtml.url,
				data: params,
				dataType: "html",
				cache: false,
				that: this,
				nodeData: node.nodeData,
				success: function (html, textStatus)
					{
					$(this.that.options.loadHtml.target).html(html);
					this.that.options.loadHtml.onReady(this.nodeData);
					},
				error: function (data)
					{
					alert("error: " + JSON.stringify(data));
					}
			});

			}
		},

	dataReadySignal: function ()
		{
		this.element.trigger('crudTree_data_ready');
		},

	destroy: function ()
		{
		$.Widget.prototype.destroy.call(this);
		},

});

MKWidgets.TreeNS.TreeNodeObject = Class({
	'extends': MK.Object,
	widget: null,
	enable: false,
	childs: new MK.Array(),
	defaultStates: {
		openState: "close",			//open, close
		selectState: "not_select",	//select, not_select, child_select, fake_select
		manageState: "normal",		//zero, normal, last, lastZero
		searchState: "display",		//display, display_by_parent, display_by_child, hide
		filterState: "display",
		hashId: undefined,
	},

	constructor: function (data, parentArray, tree, level, sandbox, parentNode)
		{
		MK.Object.prototype.constructor.apply(this, [this.widget, this.enable]);
		this.parent = parentNode;
		this.parentArray = parentArray;
		//this.tree = parentArray.tree;
		this.tree = tree;
		this.level = level;
		this.nodeData = data;

		this.states = new MK.Object();
		this.states.jset(this.defaultStates);

		this.on('render', this.render, this);

		this.bindNode('sandbox', sandbox);
		this.createDom();

		if (this.level == 0)
			{
			this.states.openState = 'open';
			this.render();
			}


		if (this.nodeData.selectable == undefined)
			{
			this.selectable = false;
			}

		},

	render: function ()
		{
		if (this.level > 0)
			{
			this.domNode = $(this.sandbox);
			$(this.sandbox).append(this.domNodeBody);
			$(this.sandbox).append(this.domDependLine);
			$(this.sandbox).data("crudtree-nodeStruct", this);
			this.initLocalStorage();
			}
		$(this.sandbox).append(this.domChilds);

		},

	createDom: function ()
		{
		this.domNode = $();
		this.domNodeBody = $();
		this.domChilds = $();
		this.domManageIco = $();
		this.domNodeBodyText = $();
		this.domDependLine = $();
		this.childs = [];

		this.domManageIco = $("<div/>").addClass("crudtree-node-manage-ico");
		this.domNodeBodyText = $("<div/>").html(this.nodeData.value).addClass("crudtree-node-text");
		this.domNodeBody = $("<div/>").addClass("crudtree-node-body")
			.append(this.domManageIco)
			.append(this.domNodeBodyText);
		this.domDependLine = $("<div/>").addClass("crudtree-depend-line");

		this.domManageIco.on("click", $.proxy(this.manageClickSlot, this));
		this.domNodeBodyText.on("click", $.proxy(this.textClickSlot, this));
		this.domNodeBody.on("dblclick", $.proxy(this.manageClickSlot, this));

		this.createChilds();
		},

	createChilds: function ()
		{
		if (this.nodeData.childs != undefined)
			{
			if (this.nodeData.childs.length != 0)
				{
				if(this.level > 0)
					{
					this.domChilds = $("<div/>").addClass("crudtree-childs");
					}
				else
					{
					this.domChilds = $(this.sandbox);
					}

				this.childs = new MKWidgets.TreeNS.TreeNodeArray(this.nodeData.childs, this, this.tree, this.domChilds, this.level + 1);
				}
			}
		},

	initLocalStorage: function ()
		{
		this.states.hashId = this.calcHashid(this.getString(this.nodeData));
		if (this.tree.cookieBaseNodes != undefined)
			{
			if (this.tree.cookieBaseNodes[this.states.hashId] != undefined)
				{
				this.states.jset(this.tree.cookieBaseNodes[this.states.hashId]);
				if (this.states.selectState == "select" || this.states.selectState == "fake_select")
					{
					this.tree.selectedNode = this;
					if (this.states.selectState == "select")
						{
						this.tree.loadHtml(this);
						}
					}
				}
			else
				{
				this.tree.cookieBaseNodes[this.states.hashId] = this.states.toJSON();
				}
			}	//добавляем параметры в cookie при отсутствии и забираем данные в прототип в случае их наличия
		this.states.onDebounce('modify', function ()
		{
		this.tree.cookieBaseNodes[this.states.hashId] = this.states.toJSON();
		}, 100, this);
		},

	textClickSlot: function (e)
		{
		e.stopPropagation();
		if (this.tree.selectedNode != undefined)
			{
			this.tree.selectedNode.goUpState("Select", "not_select");
			this.tree.selectedNode.refreshParentsDom();
			}
		this.tree.selectedNode = this;
		this.parent.goUpState("Select", "child_select");
		if (this.nodeData.selectable == true)
			{
			this.states.selectState = "select";
			this.tree.loadHtml(this);
			}
		else
			{
			this.states.selectState = "fake_select";
			}
		this.refreshParentsDom();

		this.tree.treeRefresh();
		},

	manageClickSlot: function (e)
		{
		e.stopPropagation();
		if (this.states.openState == "close")
			{
			this.states.openState = "open";
			}
		else
			{
			if (this.states.openState == "open")
				{
				this.states.openState = "close";
				}
			}
		this.tree.treeRefresh();
		},

	refreshDom: function ()
		{

		this.domNodeBodyText.addClass("crudtree-icon-" + this.nodeData.type);

		this.states.manageState = "normal";
		if (this.childs.length == 0)
			{
			this.states.manageState = "last";
			}
		if (this.level == 1)
			{
			this.states.manageState = "zero";
			}
		if (this.childs.length == 0 && this.level == 1)
			{
			this.states.manageState = "lastZero";
			}

		this.refreshManageState();
		this.refreshActiveState();
		this.refreshOpenState();
		this.refreshSearchState();
		this.refreshFilterState();

		this.tree.cookieBaseNodes[this.states.hashId] = this.states;
		},

	refreshChildsDom: function ()
		{
		this.refreshDom();
		//for (var i in this.childs)
		//	{
		//	this.childs[i].refreshChildsDom();
		//	}
		this.childs.forEach(function (child)
		{
		child.refreshChildsDom();
		});
		},

	refreshParentsDom: function ()
		{
		this.refreshDom();
		if (this.parent != null)
			{
			this.parent.refreshParentsDom();
			}
		},

	refreshSearchState: function ()
		{
		if (this.states.searchState == "display" || this.states.searchState == "display_by_parent" || this.states.searchState == "display_by_child")
			{
			this.domNode.show();
			}
		if (this.states.searchState == "hide")
			{
			this.domNode.hide();
			}
		},

	refreshFilterState: function ()
		{
		if ((this.states.filterState == "display" || this.states.filterState == "display_by_parent" || this.states.filterState == "display_by_child") && (this.states.searchState != "hide"))
			{
			this.domNode.show();
			}
		if (this.states.filterState == "hide")
			{
			this.domNode.hide();
			}
		},

	refreshManageState: function ()
		{
		if (this.states.manageState == "normal")
			{
			this.domManageIco.css('display', 'inline-block');
			}
		if (this.states.manageState == "zero")
			{
			this.domNode.addClass("crudtree-node-zero");
			//this.domManageIco.hide();
			this.domDependLine.hide();
			}
		if (this.states.manageState == "last")
			{
			this.domNode.addClass("crudtree-node-last");
			this.domManageIco.hide();
			this.domDependLine.show();
			}
		if (this.states.manageState == "lastZero")
			{
			this.domNode.addClass("crudtree-node-zero")
				.addClass("crudtree-node-last");
			this.domDependLine.hide();
			this.domManageIco.hide();
			}
		},

	refreshActiveState: function ()
		{
		this.domNodeBody.removeClass("active")
			.removeClass("select")
			.removeClass("child-select")
			.removeClass("fake-select");
		if (this.states.selectState == "select")
			{
			this.domNodeBody.addClass("active")
				.addClass("select");
			}
		if (this.states.selectState == "child_select")
			{
			this.domNodeBody.addClass("active")
				.addClass("child-select");
			}
		if (this.states.selectState == "fake_select")
			{
			this.domNodeBody.addClass("active")
				.addClass("fake-select");
			}
		},

	refreshOpenState: function ()
		{
		if (this.states.openState == "open")
			{
			this.domManageIco.addClass("crudtree-manage-icon-minus");
			this.domManageIco.removeClass("crudtree-manage-icon-plus");
			this.domChilds.show();
			}
		if (this.states.openState == "close")
			{
			this.domManageIco.addClass("crudtree-manage-icon-plus");
			this.domManageIco.removeClass("crudtree-manage-icon-minus");
			this.domChilds.hide();
			}
		},

	drawDepends: function (topNode, parentActiveDepand)
		{
		//this.debugStartCall(arguments, this);
		if (this.states.manageState == "normal" || this.states.manageState == "last")
			{
			if (topNode == undefined)
				{
				var marginTop = 4; ////!!!!!!!!!!! css crudtree-childs margin-top
				this.domDependLine.css({top: -marginTop});
				this.domDependLine.height(this.domNodeBody.height() / 2 + marginTop);
				}
			else
				{
				this.domDependLine.height(topNode.domNode.height());
				this.domDependLine.css({top: (-topNode.domNode.height() + this.domNodeBody.height() / 2 ) + "px"});
				}
			}
		if (this.states.manageState == "zero")
			{
			this.domDependLine.hide();
			}

		this.domDependLine.removeClass("active-depend");
		this.domDependLine.removeClass("active-through-depend");
		if (parentActiveDepand == true)
			{
			if (this.states.selectState == "not_select")
				{
				this.domDependLine.addClass("active-through-depend");
				}
			if (this.states.selectState == "select" || this.states.selectState == "child_select" || this.states.selectState == "fake_select")
				{
				this.domDependLine.addClass("active-depend");
				}
			}

		if (this.states.openState == "open")
			{
			var activeDepend = false;
			if (this.states.selectState == "child_select")
				{
				activeDepend = true;
				}

			for (var i = 0; i < this.childs.length; i++)
				{
				if (this.states.searchState == "hide")
					{
					break;
					}
				var topNode = undefined;
				if (i > 0)
					{
					topNode = this.childs[i - 1];
					}

				this.childs[i].drawDepends(topNode, activeDepend);

				if (this.childs[i].selectState == "child_select" || this.childs[i].selectState == "select" || this.childs[i].selectState == "fake_select")
					{
					activeDepend = false;
					}
				}
			}
		},

	search: function (searchStr)
		{
		var flag = false;
		this.states.searchState = "hide";
		this.setOpenState("close");
		for (var i in this.nodeData)
			{
			if ($.type(this.nodeData[i]) === "string")
				{
				if (this.nodeData[i].indexOf(searchStr) > -1)
					{
					flag = true;
					}
				}
			}
		this.childs.forEach(function (child)
		{
		//if(child.states.searchState != 'display_by_parent')
		//    {
		child.search(searchStr);
		//    }
		}, this);
		if (flag == true)
			{
			this.goDownState("Search", "display_by_parent");
			this.goUpState("Search", "display_by_child");
			this.states.searchState = "display";
			this.goUpState("Open", "open");
			this.setOpenState("close");
			}
		//for (var i in this.childs)
		//{
		//    this.childs[i].search(searchStr);
		//}

		},

	setOpenState: function (state)
		{
		if (this.parent != null)
			{
			this.states.openState = state;
			}
		},

	goUpState: function (type, state)
		{
		if (this.states[type.toLowerCase() + 'State'] != undefined)
			{
			this.states[type.toLowerCase() + 'State'] = state;
			if (this.parent != null)
				{
				this.parent.goUpState(type, state);
				}
			}
		},

	goDownState: function (type, state)
		{
		if (this.states[type.toLowerCase() + 'State'] != undefined)
			{
			if (type == "Open")
				{
				this.setOpenState(state);
				}
			else
				{
				this.states[type.toLowerCase() + 'State'] = state;
				}
			this.childs.forEach(
				function (child)
				{
				child.goDownState(type, state);
				});
			}
		},

	searchReset: function ()
		{
		this.goDownState("Search", "display");
		this.goDownState("Open", "close");
		},

	filter: function ()
		{
		var flag = false,
			filters = [];
		this.states.filterState = "hide";
		this.setOpenState("close");
		$.each(this.tree.options.filters, function (index, val)
		{
		if ($("#" + index).prop('checked'))
			{
			filters.push(index);
			}
		});
		if (filters.length == 0)
			{
			flag = true;
			}
		else
			{
			for (var i in this.nodeData)
				{
				if (($.inArray(i, filters) != -1) && this.nodeData[i])
					{
					flag = true;
					}
				}
			}
		if (flag == true)
			{
			this.goDownState("Filter", "display_by_parent");
			this.goUpState("Filter", "display_by_child");
			this.states.filterState = "display";
			if ((filters.length == 0) && !this.tree.options.NoFiltersTreeOpen)
				{
				this.goUpState("Open", "close");
				}
			else
				{
				this.goUpState("Open", "open");
				}
			this.setOpenState("close");
			//this.refreshFilterState();
			}
		for (var i in this.childs)
			{
			this.childs[i].filter();
			}
		//this.debugFinishCall(arguments, this);
		},

	filterReset: function ()
		{
		this.goDownState("Filter", "display");
		this.goDownState("Open", "close");
		},

	getString: function (nodeData)
		{
		return JSON.stringify(nodeData);
		},

	calcHashid: function (str)
		{
		var hash = 0;
		if (str.length == 0)
			{
			return hash;
			}
		for (i = 0; i < str.length; i++)
			{
			char = str.charCodeAt(i);
			hash = ((hash << 5) - hash) + char;
			hash = hash & hash;
			}
		return hash;
		},

});

MKWidgets.TreeNS.TreeNodeArray = Class({
	'extends': MK.Array,
	Model: MKWidgets.TreeNS.TreeNodeObject,
	itemRenderer: '<div class="crudtree-node"></div>',
	constructor: function (data, parentNode, tree, domSandbox, level)
		{
		this.parentNode = parentNode;
		this.tree = tree;
		this.level = level;
		this.bindNode('sandbox', domSandbox);
		this.createChilds1(data);
		},

	createChilds1: function (data)
		{
		for (var i in data)
			{
			var node = new MKWidgets.TreeNS.TreeNodeObject(data[i], this, this.tree, this.level, $('<div/>'), this.parentNode);
			this.push(node);
			}
		},
});