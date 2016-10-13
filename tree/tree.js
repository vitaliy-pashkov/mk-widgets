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

			indexes: {
				id: 'id', //{type1: type1_uid, type2: type2_uid,}
				value: 'value',
				type: 'type',
				selectable: 'selectable',
				childs: 'childs'
			},

			searchable: true,
			title: "defaultTreeName",
			filters: {
				//'debtors': {name: 'Задолжники', filter_type: 'boolean'},
				//'all': {name: 'Все', filter_type: 'boolean'},
				//'filter3': {name: 'Фильтр 3', filter_type: 'boolean'}
			},	//possible filters
			indications: {},
			debugLevel: "profile",
			NoFiltersTreeOpen: false,
			loadHtml: false,
			saveSelectStates: true,
		});
		this.setOptions(options);

		this.local_Storage = $.initNamespaceStorage('tusur-csp-tree').localStorage;
		this.createDom();

		this.on("tree_data_ready", this.treeCreate);
		this.getData();
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
		},

	treeCreate: function ()
		{
		this.scrollTop = 0;
		this.on('select-node', this.selectNodeSlot, this);
		this.selectedNodeCandidate = null;

		var rootData = {};
		rootData[this.options.indexes.childs] = this.data;
		rootData[this.options.indexes.value] = 'root';
		rootData[this.options.indexes.type] = 'root';

		this.root = new MKWidgets.TreeNS.TreeNodeObject(rootData, null, this, 0, this.domTreeContainer, null);

		$(window).resize($.proxy(this.treeRefresh, this));
		this.on('mkw-resize', this.treeRefresh, true, this);
		this.on('mkw-resize-silent', this.treeRefreshSilent, true, this);

		this.selectNode(this.selectedNodeCandidate);

		this.navigateInterface = new MKWidgets.TreeNS.NavigateInterface(this, this.options.navigation);
		},

	treeRefresh: function ()
		{
		this.root.refreshChildsDom();
		this.root.drawDepends(undefined);
		this.cookieRefresh();
		this.deleteScrollbar();
		this.createScrollbar();
		this.trigger("mkw-inside-resize");
		},

	treeRefreshSilent: function ()
		{
		this.root.refreshChildsDom();
		this.root.drawDepends(undefined);
		this.cookieRefresh();
		this.deleteScrollbar();
		this.createScrollbar();
		},

	cookieRefresh: function ()
		{
		if (this.domFiltersCheckbox != undefined)
			{
			$.each(this.domFiltersCheckbox, $.proxy(
				function (index, value)
				{
				this.cookieBaseNodes[$(value).attr('id')] = $(value).prop('checked');
				}, this));
			}
		if (this.options.searcable)
			{
			this.cookieBaseNodes["input"] = this.searchInput.val();
			}
		this.local_Storage.set("tree", this.cookieBaseNodes);
		},

	createScrollbar: function ()
		{
		if (this.listScroll == undefined)
			{
			this.elementHeight = this.element.outerHeight(true);
			this.element.css('height', 'auto');
			this.domTreeContainer.css('height', 'auto');

			var realContainerHeight = this.domTreeContainer.height();

			var deltaHeight = this.element.outerHeight(true) - this.domTreeContainer.outerHeight();
			this.element.css('height', this.elementHeight);
			var containerHeight = (parseInt(this.element.css('height')) - deltaHeight);
			this.domTreeContainer.height(containerHeight);//css('height', containerHeight + "px");

			if (realContainerHeight > containerHeight)
				{
				this.listScroll = this.domTreeContainer.addClass("thin-skin")
					.customScrollbar(CustomScrollbarSettings);

				this.domTreeContainer.customScrollbar("scrollToY", this.scrollTop);
				}
			}
		else
			{
			this.listScroll.customScrollbar("resize", true);
			}

		},

	deleteScrollbar: function ()
		{
		if (this.listScroll != undefined)
			{
			this.scrollTop = -1 * this.domTreeContainer.find('.overview').position().top;
			this.domTreeContainer.customScrollbar("remove");
			this.listScroll = null;

			this.domTreeContainer.css('max-height', 'none');
			this.domTreeContainer.css('height', 'auto');
			//this.element.css('height', 'auto');
			}
		},

	getTreeRealHeight: function ()
		{
		this.deleteScrollbar();
		var treeHeight = this.domTreeContainer.height();
		this.createScrollbar();
		return treeHeight;
		},

	filtersCreate: function ()
		{
		this.domFiltersContainer = $('<div/>').addClass("crudtree-filters-container");
		$.each(this.options.filters, $.proxy(
			function (index, value)
			{
			var checkBox = $('<input>')
				.addClass('crudtree-filter-checkbox')
				.attr('id', index)
				.attr('type', 'checkbox')
				.attr('checked', true);

			if (this.cookieBaseNodes != undefined)
				{
				if (this.cookieBaseNodes[index] == false)
					{
					checkBox.attr("checked", false);
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

		this.searchInput.on("input", $.proxy(this.searchChangeSlot, this));
		this.onDebounce("run-search", this.searchRun, 700, false, this);
		this.searchController.bind("click", $.proxy(this.searchControllerSlot, this));
		},

	searchChangeSlot: function ()
		{
		this.trigger('run-search');
		},

	searchRun: function ()
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
		this.trigger('search-complete');
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

	selectNodeSlot: function (node)
		{
		if (this.options.loadHtml)
			{
			this.loadHtml(node);
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

			if (this.domLoaderBG == undefined)
				{
				this.domLoaderBG = $('<div> <img src="/widgets/mk-widgets/tree/img/loader.gif" /> </div>')
					.addClass('tusur-csp-tree-loader-bg');
				$(this.options.loadHtml.target).prepend(this.domLoaderBG);
				}

			this.currentNodeData = JSON.stringify(node.nodeData);

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
					if (this.that.currentNodeData == JSON.stringify(this.nodeData))
						{
						$(this.that.options.loadHtml.target).html(html);
						this.that.options.loadHtml.onReady(this.nodeData);
						this.that.domLoaderBG = null;
						}

					},
				error: function (data)
					{
					alert("error: " + JSON.stringify(data));
					}
			});

			}
		},

	selectNode: function (node)
		{
		if (node instanceof MKWidgets.TreeNS.TreeNodeObject)
			{
			this.unselectNode();

			this.selectedNode = node;
			node.parent.goUpState("Select", "child_select");
			if (node.nodeData[this.options.indexes.selectable] != false)
				{
				node.states.selectState = "select";
				node.parent.goUpState("open", "open");
				this.trigger('select-node', node);
				}
			else
				{
				node.states.selectState = "fake_select";
				}
			node.refreshParentsDom();

			this.treeRefresh();
			}
		},

	unselectNode: function ()
		{
		if (this.selectedNode != undefined)
			{
			this.selectedNode.goUpState("Select", "not_select");
			this.selectedNode.refreshParentsDom();
			this.selectedNode = null;
			}

		},

	dataReadySignal: function ()
		{
		this.element.trigger('crudTree_data_ready');
		},

	destroy: function ()
		{
		this.element.empty();
		},
});

MKWidgets.TreeNS.NavigateInterface = Class({
	extends: NavigateInterface,

	constructor: function (widget, enable)
		{
		NavigateInterface.prototype.constructor.apply(this, [widget, enable]);
		},

	binder: function ()
		{
		this.widget.on('select-node', this.setter, this);
		},

	setter: function ()
		{
		this.navData = {};
		this.navData['type'] = this.widget.selectedNode.nodeData[this.widget.options.indexes.type];
		var idIndex = this.widget.options.indexes.id;
		if(typeof idIndex == 'object')
			{
			idIndex = idIndex[this.navData['type']];
			}
		this.navData[idIndex] = this.widget.selectedNode.nodeData[idIndex];
		this.setNavData();
		},

	navigate: function ()
		{
		this.widget.selectNode(this.widget.root.findNodeByData(this.navData));
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
		this.indexes = $.extend({}, tree.options.indexes);
		if(typeof this.indexes.id == 'object')
			{
			this.indexes.id = this.indexes.id[ data[this.indexes.type] ];
			}

		this.level = level;
		this.nodeData = data;

		this.states = new MK.Object();
		this.states.jset(this.defaultStates);

		this.on('render', this.render, this);

		this.bindNode('sandbox', sandbox);

		this.calcIndications();
		this.createDom();

		if (this.level == 0)
			{
			this.states.openState = 'open';
			this.render();
			}

		if (this.nodeData[this.indexes.selectable] == undefined)
			{
			this.nodeData.selectable = false;
			}
		},

	render: function ()
		{
		if (this.level > 0)
			{
			this.domNode = $(this.sandbox);
			this.domNode.append(this.domNodeBody);
			this.domNode.append(this.domDependLine);
			this.domNode.data("crudtree-nodeStruct", this);

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
		this.domNodeBodyText = $("<div/>").html(this.nodeData[this.indexes.value]).addClass("crudtree-node-text");
		this.domIndicator = $("<div/>").addClass("crudtree-node-indicator");

		this.domNodeBody = $("<div/>").addClass("crudtree-node-body");
		this.domNodeBody.append(this.domManageIco);
		this.domNodeBody.append(this.domNodeBodyText);
		if (this.tree.options.indications.dataIndex != null)
			{
			this.domNodeBody.append(this.domIndicator);
			}

		this.domDependLine = $("<div/>").addClass("crudtree-depend-line");

		this.domManageIco.on("click", $.proxy(this.manageClickSlot, this));
		this.domNodeBodyText.on("click", $.proxy(this.textClickSlot, this));
		this.domNodeBody.on("dblclick", $.proxy(this.manageClickSlot, this));

		//this.domManageIco.on("mouseenter", $.proxy(this.mouseEnterSlot, this));
		//this.domManageIco.on("mouseleave", $.proxy(this.mouseLeaveSlot, this));

		this.createChilds();
		},

	createChilds: function ()
		{
		if (this.nodeData[this.indexes.childs] != undefined)
			{
			if (this.nodeData[this.indexes.childs].length != 0)
				{
				if (this.level > 0)
					{
					this.domChilds = $("<div/>").addClass("crudtree-childs");
					}
				else
					{
					this.domChilds = $(this.sandbox);
					}

				this.childs = new MKWidgets.TreeNS.TreeNodeArray(this.nodeData[this.indexes.childs], this, this.tree, this.domChilds, this.level + 1);
				}
			}
		},

	calcIndications: function ()
		{
		var indications = this.tree.options.indications;
		var value = this.nodeData[indications.dataIndex];
		if (value != undefined)
			{
			for (var i = 0; i < indications.order.length; i++)
				{
				if (value == indications.order[i].value)
					{
					this.indicator = indications.order[i];
					}
				}
			}
		if (this.indicator != undefined)
			{
			this.goUpIndicator(this.indicator);
			}
		},

	goUpIndicator: function (indicator)
		{
		if (this.indicator == undefined)
			{
			this.indicator = indicator;
			}
		else
			{
			var newIndex = this.tree.options.indications.order.indexOf(indicator);
			var thisIndex = this.tree.options.indications.order.indexOf(this.indicator);
			if (newIndex < thisIndex)
				{
				this.indicator = indicator;
				}
			}
		if (this.parent != null)
			{
			this.parent.goUpIndicator(this.indicator);
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

				if (this.states.selectState == "select" && this.tree.options.saveSelectStates)
					{
					//this.tree.selectNode(this)

					this.tree.selectedNodeCandidate = this;
					//this.tree.trigger('select-node', this);
					//this.tree.loadHtml(this);
					}


				//if(!this.tree.options.saveSelectStates)
				//	{
				this.states.selectState = this.defaultStates.selectState;
				//}
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

		this.tree.selectNode(this);
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
		this.tree.trigger('mkw-inside-resize');
		this.tree.treeRefresh();
		},

	mouseEnterSlot: function()
		{
		if (this.states.openState == "close")
			{
			this.states.openState = "open";
			this.openByHover = true;
			}
		this.tree.trigger('mkw-inside-resize');
		this.tree.treeRefresh();
		},

	mouseLeaveSlot: function()
		{
		if (this.states.openState == "open" && this.openByHover == true)
			{
			this.states.openState = "close";
			this.openByHover = false;
			}
		this.tree.trigger('mkw-inside-resize');
		this.tree.treeRefresh();
		},



	refreshDom: function ()
		{

		this.domNodeBodyText.addClass("crudtree-icon-" + this.nodeData[this.indexes.type]);

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
		this.refreshIndication();

		if (this.domNodeBodyText.css('background-image') == 'none')
			{
			this.domNodeBodyText.addClass('without-ico');
			}

		this.tree.cookieBaseNodes[this.states.hashId] = this.states;
		},

	refreshChildsDom: function ()
		{
		this.refreshDom();
		//for (var i in this.childs)
		//	{
		//	this.childs[i].refreshChildsDom();
		//	}
		this.childs.forEach(
			function (child)
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

	refreshIndication: function ()
		{
		if (this.indicator != undefined)
			{
			this.domIndicator.css('background', this.indicator.color);
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
					for (var j = i - 1; j >= 0; j--)
						{
						if (this.childs[j].states.searchState != 'hide' && this.childs[j].states.filterState != 'hide')
							{
							topNode = this.childs[j];
							break;
							}
						}
					}

				this.childs[i].drawDepends(topNode, activeDepend);

				if (this.childs[i].states.selectState == "child_select" || this.childs[i].states.selectState == "select" || this.childs[i].states.selectState == "fake_select")
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
				if (this.nodeData[i].toLowerCase().indexOf(searchStr.toLowerCase()) > -1)
					{
					flag = true;
					}
				}
			}

		this.childs.forEach(
			function (child)
			{
			child.search(searchStr);

			}, this);


		if (flag == true)
			{
			this.goDownState("Search", "display_by_parent");
			this.goUpState("Search", "display_by_child");
			this.states.searchState = "display";
			this.goUpState("Open", "open");
			this.setOpenState("close");

			return true;
			}
		return false;
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
		var flag = false;
		this.states.filterState = "hide";
		this.setOpenState("close");

		for (var index in this.tree.options.filters)
			{
			if ($("#" + index).prop('checked') == true)
				{
				if (this.nodeData[index] === true)
					{
					flag = true;
					}
				}
			}

		if (flag == true)
			{
			this.goUpState("Filter", "display_by_child");
			this.states.filterState = "display";

			this.goUpState("Open", "open");
			this.setOpenState("close");
			}
		for (var i = 0; i < this.childs.length; i++)
			{
			this.childs[i].filter();
			}
		},

	filterReset: function ()
		{
		this.goDownState("Filter", "display");
		this.goDownState("Open", "close");
		},

	findNodeById: function (id)
		{
		if (this.nodeData[this.indexes.id] == id)
			{
			return this;
			}
		var node = null;
		for (var i = 0; i < this.childs.length; i++)
			{
			node = this.childs[i].findNodeById(id);
			if (node != null)
				{
				break;
				}
			}
		return node;
		},

	findNodeByData: function (data)
		{
		if (data != undefined)
			{
			if (data[this.indexes.id] != undefined)
				{
				return this.findNodeById(data[this.indexes.id]);
				}
			}
		return null;
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