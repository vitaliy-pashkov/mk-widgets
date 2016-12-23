var MKWidgets = MKWidgets || {};
MKWidgets.TabsNS = MKWidgets.TabsNS || {};

MKWidgets.Tabs = Class({
	extends: MKWidget,

	constructor: function (elementSelector, options)
		{
		MKWidget.prototype.constructor.apply(this, [elementSelector, options]);

		this.setOptions({
			source: 'dom', // data, dom
			tabs: [], // [ {name='', title: '', body: $ | '' },... ]
			domHeaderContainer: this.element,
			domBodiesContainer: this.element,
			skin: 'default-skin'
		});
		this.setOptions(options);

		if (this.options.source == 'data')
			{
			this.createDom();
			}
		else if (this.options.source == 'dom')
			{
			this.setupByDom();
			}

		this.navigateInterface = new MKWidgets.TabsNS.NavigateInterface(this, this.options.navigation);

		if(this.activeTab == undefined && this.tabs.length > 0)
			{
			this.switchTab(this.tabs[0]);
			}
				
		this.trigger('tabs-ready');
		},

	setupByDom: function ()
		{
		this.domTabs = this.element.find('ul.tabs');
		this.domBodies = this.element.find('.tab-bodies');

		this.element.addClass(this.options.skin);

		this.tabs = new MKWidgets.TabsNS.TabArray(this, [], this.domTabs, this.domBodies);
		this.tabs.restore(this.domTabs);
		},

	createDom: function ()
		{
		this.domTabs = $("<ul/>").addClass('tusur-csp-tabs');
		this.domBodies = $("<div/>").addClass('tusur-csp-tabs-bodies');

		this.options.domHeaderContainer.append(this.domTabs);
		this.options.domBodiesContainer.append(this.domBodies);

		this.options.domHeaderContainer.addClass('tusur-csp-tabs-container');
		this.options.domBodiesContainer.addClass('tusur-csp-tabs-container');

		this.options.domHeaderContainer.addClass(this.options.skin);
		this.options.domBodiesContainer.addClass(this.options.skin);

		if (this.options.tabs instanceof Object)
			{
			this.tabsObject = this.options.tabs;
			this.tabsArray = [];
			for (var name in this.tabsObject)
				{
				this.tabsObject[name].name = name;
				this.tabsArray.push(this.tabsObject[name]);
				}
			}
		else if (this.options.tabs instanceof Array)
			{
			this.tabsArray = this.options.tabs;
			}
		this.tabs = new MKWidgets.TabsNS.TabArray(this, this.tabsArray, this.domTabs, this.domBodies);
		},

	switchTab: function (newTab)
		{
		if (newTab instanceof MKWidgets.TabsNS.TabObject)
			{
			if (this.activeTab != newTab)
				{
				if (this.activeTab != undefined)
					{
					this.activeTab.display = false;
					this.activeTab.domTabBody.hide();
					}
				newTab.display = true;
				newTab.domTabBody.show();
				this.activeTab = newTab;

				this.trigger('open-tab');
				this.trigger('open-tab-' + newTab.tab.name);
				app.trigger('mkw_resize');
				}
			}
		},

	findTabByData: function (data)
		{
		if (data != undefined)
			{
			if (data.name != undefined)
				{
				return this.findTabByName(data.name);
				}
			}
		},

	findTabByName: function (name)
		{
		for (var i = 0; i < this.tabs.length; i++)
			{
			if (this.tabs[i].tab.name == name)
				{
				return this.tabs[i];
				}
			}
		return null;
		},

});


MKWidgets.TabsNS.TabObject = Class({
	extends: MK.Object,

	constructor: function (tab, tabArray)
		{
		this.tabArray = tabArray;
		this.tab = tab;
		this.tabWidget = tabArray.tabsWidget;
		this.display = false;
		this.on('render', this.render);
		},

	render: function ()
		{
		if (this.tabArray.tabsWidget.options.source == 'data')
			{
			this.domTabBody = $('<div/>').addClass('tusur-csp-tab-body');
			this.tabArray.domBodies.append(this.domTabBody);

			if (this.tab.body instanceof jQuery)
				{
				this.domTabBody.append(this.tab.body);
				}
			else if (typeof this.tab.body == 'string')
				{
				this.bindNode('tab.body', ':sandbox', MK.binders.html());
				}
			this.domTab = $('<li/>').addClass('tusur-csp-tab');
			this.bindNode('tab.title', this.domTab, MK.binders.html());
			this.tabArray.domTabs.append(this.domTab);
			}
		else if (this.tabArray.tabsWidget.options.source == 'dom')
			{
			this.domTab = this.tabArray.domTabs.find('li[data-href=' + this.tab.name + ']');
			this.domTabBody = this.tabArray.domBodies.find('.tab-body[data-tab-name=' + this.tab.name + ']');
			}

		//this.bindNode('display', this.domTabBody, MK.binders.display()); //  wtf?!!!
		this.bindNode('display', this.domTab, MK.binders.className('active'));

		this.domTab.on('click', $.proxy(this.tabClickSlot, this));
		//this.on("change:display", this.displayChangedSlot, this);
		},



	tabClickSlot: function ()
		{
		this.tabWidget.switchTab(this);
		}
});

MKWidgets.TabsNS.TabArray = Class({
	extends: MK.Array,
	Model: MKWidgets.TabsNS.TabObject,
	itemRenderer: '',
	constructor: function (tabsWidget, tabs, domTabs, domBodies)
		{
		this.tabsWidget = tabsWidget;
		this.tabs = tabs;
		this.domTabs = domTabs;
		this.domBodies = domBodies;
		//this.bindNode('sandbox', tabsWidget.domBodies);
		this.recreate(tabs);
		},

	recreate: function (tabs)
		{
		for (var i = 0; i < tabs.length; i++)
			{
			var tab = new MKWidgets.TabsNS.TabObject(tabs[i], this);
			this.push(tab);
			tab.render();
			}
		},

	restore: function (domTabs)
		{
		var tabs = this;
		domTabs.find('> li').each(
			function ()
			{
			var tabData = {name: $(this).data('href')};
			var tab = new MKWidgets.TabsNS.TabObject(tabData, tabs);
			tabs.push(tab);
			tab.render();
			});
		}
});

MKWidgets.TabsNS.NavigateInterface = Class({
	extends: NavigateInterface,

	constructor: function (widget, enable)
		{
		NavigateInterface.prototype.constructor.apply(this, [widget, enable]);
		},

	binder: function ()
		{
		this.widget.on('open-tab', this.setter, this);
		},

	setter: function ()
		{
		this.navData = {};
		this.navData['name'] = this.widget.activeTab.tab.name;
		this.setNavData();
		},

	navigate: function ()
		{
		this.widget.switchTab(this.widget.findTabByData(this.navData));
		},
});