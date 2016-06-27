/*
 * @summary        tabs
 * @description    tabs
 * @version        0.0.1
 * @author         vitaliy_pashkov
 * @contact        vitaliy_pashkov@inbox.ru
 */

(function ($)
	{
	$.widget("custom.tabs",
		{
			options: {
				title: "defaultTabsName",

				debugLevel: "profile"
			},

			_create: function _create()
				{
				this.activeStep = this.element.find(".tabs>li.active").first();
				if(this.activeStep == undefined)
					{
					this.activeStep = this.element.find("li").first();
					this.activeStep.addClass("active");
					}
				this.tabsContent = this.element.find(".tabs-content");
				this.tabsContent.find(".tab-content").hide();
				this.activeTabContent = this.tabsContent.find(".tab-content[data-tab-name="+this.activeStep.data("href")+"]").show();

				this.element.find(".tabs>li").on("click", $.proxy(this._tabClickSlot, this));


				},

			_tabClickSlot: function _tabClickSlot(e)
				{


				if($(e.target).data("href") != this.activeStep.data("href"))
					{
					this.activeStep.removeClass("active");
					this.activeTabContent.hide();

					this.activeStep = $(e.target);
					this.activeStep.addClass("active");
					this.activeTabContent = this.tabsContent.find(".tab-content[data-tab-name="+this.activeStep.data("href")+"]").show();
					this.element.trigger("open");
					this.element.trigger("open-"+this.activeStep.data("href"));
					}



				},

			// signals ////////////////////////////////////////////////////////////////////////////////////////////////


			_setOption: function (key, value)
				{
				},

			destroy: function ()
				{
				$.Widget.prototype.destroy.call(this);
				}

		});
	}(jQuery) );


var MKWidgets = MKWidgets || {};
MKWidgets.TabsNS = MKWidgets.TabsNS || {};

MKWidgets.Tabs = Class({
	extends: MKWidget,

	constructor: function (elementSelector, options)
		{
		MKWidget.prototype.constructor.apply(this, [elementSelector, options]);

		this.setOptions({
			source: 'data', // data, dom
			tabs: [], // [ { title: '', body: $ | '' },... ]
		});
		this.setOptions(options);

		if (this.options.source == 'data')
			{
			this.createDom();
			}
		},

	createDom: function ()
		{
		this.domTabs = $("<ul/>").addClass('tusur-csp-tabs');
		this.domBodies = $("<div/>").addClass('tusur-csp-tabs-bodies');

		this.element.append(this.domTabs);
		this.element.append(this.domBodies);
		this.element.attr('class', 'tusur-csp-tabs-container');


		if(this.options.tabs instanceof Object)
			{
			this.tabsObject = this.options.tabs;
			this.tabsArray = [];
			for(var key in this.tabsObject)
				{
				this.tabsObject[key].key = key;
				this.tabsArray.push(this.tabsObject[key]);
				}
			}
		else if(this.options.tabs instanceof Array)
			{
			this.tabsArray = this.options.tabs;
			}
		this.tabs = new MKWidgets.TabsNS.TabArray(this, this.tabsArray, this.domTabs);
		this.switchTab(this.tabs[0]);

		this.trigger('tabs-ready');
		},

	switchTab: function (newTab)
		{
		if (this.activeTab != newTab)
			{
			if (this.activeTab != undefined)
				{
				this.activeTab.display = false;
				}
			newTab.display = true;
			this.activeTab = newTab;
			}
		}

});


MKWidgets.TabsNS.TabObject = Class({
	extends: MK.Object,
	display: false,
	constructor: function (tab, tabArray)
		{
		this.tabArray = tabArray;
		this.tab = tab;
		this.tabWidget = tabArray.tabsWidget;
		this.on('render', this.render);
		},

	render: function ()
		{
		if (this.tab.body instanceof jQuery)
			{
			$(this.sandbox).append(this.tab.body);
			}
		else if (typeof this.tab.body == 'string')
			{
			this.bindNode('tab.body', ':sandbox', MK.binders.html());
			}

		this.domTab = $('<li/>').addClass('tusur-csp-tab');
		this.bindNode('tab.title', this.domTab, MK.binders.html());
		this.tabArray.domTabs.append(this.domTab);

		this.bindNode('display', ':sandbox', MK.binders.display());
		this.bindNode('display', this.domTab, MK.binders.className('tusur-csp-tab-active'));
		this.on('tab@click::title', this.tabClickSlot, this);
		this.on("change:display", this.displayChangedSlot, this);
		},

	displayChangedSlot: function ()
		{
		if (this.display == true)
			{
			$(this.sandbox).trigger('custom_resize');
			}
		},

	tabClickSlot: function ()
		{
		this.tabWidget.switchTab(this);
		}
});

MKWidgets.TabsNS.TabArray = Class({
	extends: MK.Array,
	Model: MKWidgets.TabsNS.TabObject,
	itemRenderer: '<div class="tusur-csp-tab-body"></div>',
	constructor: function (tabsWidget, tabs, domTabs)
		{
		this.tabsWidget = tabsWidget;
		this.tabs = tabs;
		this.domTabs = domTabs;
		this.bindNode('sandbox', tabsWidget.domBodies);
		this.recreate(tabs);
		}
});

