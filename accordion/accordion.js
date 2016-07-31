
(function ($)
	{
	$.widget("custom.accordion",
		{
			options: {
				title: "defaultAccordionName",

				debugLevel: "profile",
				sectionShortHeight: 170,
				scrolable: true,
			},

			_create: function _create()
				{
				this.countSections = this.element.find(".section:visible").length;
				this.sections = [];
//				this.elementHeight = this.element.innerHeight() - 40;
				this.elementHeight = this.element.parent().height() - 40;
				this.element.find(".section").each($.proxy(this._createSection, this));

				this.element.on("redraw", $.proxy(this.redraw, this));
				this.redraw();

				},

			_createSection: function _createSection(index, domSection)
				{
				this.sections.push(new Section(this, $(domSection)));
				},

			hideAll: function _hideAll()
				{
				for (var i in this.sections)
					{
					this.sections[i].toHideState();
					}
				},

			shortAll: function _shortAll()
				{
				for (var i in this.sections)
					{
					this.sections[i].toShortState();
					}
				},

			redraw: function redraw()
				{
				if (!this.element.is(":visible"))
					{
					return;
					}

				var freeHeight = this._calcFreeHeight();
				var notCalcedSectionsCount = this.element.find(".section:visible").length;;
				var normalHeight = freeHeight / notCalcedSectionsCount;
				var staticNormalHeight = freeHeight / notCalcedSectionsCount;

				for (var i in this.sections)
					{
					this.sections[i].draw.calced = false;
					this.sections[i].draw.bodyExpandHeight = freeHeight;
					}

				var f = 1;
				while (f == 1)
					{
					f = 0;
					for (var i in this.sections)
						{
						if (this.sections[i].domSection.is(":visible"))
							{
							var section = this.sections[i];
							var draw = section.draw;

							section.domBody.css({"height": "auto"});

							draw.realBodyHeight = section.domBody.outerHeight(true);

							if (draw.realBodyHeight < normalHeight && draw.calced == false)
								{
								draw.bodyShortHeight = draw.realBodyHeight;
								draw.calced = true;

								freeHeight -= draw.bodyShortHeight;
								notCalcedSectionsCount--;
								normalHeight = freeHeight / notCalcedSectionsCount;
								f = 1;
								}
							}
						}
					}

				for (var i in this.sections)
					{
					if (this.sections[i].draw.calced == false)
						{
						this.sections[i].draw.bodyShortHeight = normalHeight;
						this.sections[i].draw.calced = true;
						this.sections[i].draw.needScroll = true;
						}
					this.sections[i].refreshDom();
					}
				},

			_calcFreeHeight: function()
				{

				var freeHeight = this.element.parent().height();

				for (var i in this.sections)
					{
					if (this.sections[i].domHeader.is(":visible"))
						{
						this.sections[i].draw.headerHeight = this.sections[i].domHeader.outerHeight(true);
						freeHeight -= this.sections[i].draw.headerHeight;
						}
					freeHeight -= this.sections[i].domSection.outerHeight(true) - this.sections[i].domSection.height();
					}
				return freeHeight;
				},
			// signals ////////////////////////////////////////////////////////////////////////////////////////////////

			_setOption: function (key, value)
				{
				},

			destroy: function ()
				{
				}

		});
	}(jQuery) );

var Section = function (accordion, domSection)
	{

	this.accordion = accordion;
	this.domSection = domSection;
	this.domHeader = domSection.find("header");
	this.domBody = domSection.find(".section-body");
	this.scrollbar = null;
	this.domController = $();
	this.state = "short"	//short, hide, expand
	this.draw = {
		calced: false,
		sectionHeight: 0,
		headerHeight: 0,
		bodyShortHeight: 0,
		bodyExpandHeight: 0,
		needScroll: false,

		realSectionHeight: 0,
		realBodyHeight: 0,
	};


	this.init = function ()
		{
		this.domController = $("<div>").addClass("accordion-controller").addClass("accordion-controller-expand");

		this.domHeader.append(this.domController);
		this.domController.on("click", $.proxy(this.controllerSlot, this));

		this.refreshDom();
		};

	this.controllerSlot = function controllerSlot(e)
		{
		//this.debugStartCall(arguments, this);

		switch (this.state)
		{
			case "short":
				this.accordion.hideAll();
				this.state = "expand";
				break;
			case "hide":
				this.accordion.hideAll();
				this.state = "expand";
				break;
			case "expand":
				this.accordion.shortAll();
				this.state = "short";
				break;
		}
		this.accordion.element.trigger("accordion-state-change");
		this.refreshDom();
		};

	this.refreshDom = function refreshDom()
		{

		if (this.scrollbar != undefined)
			{
			this.domBody.customScrollbar("remove");
			}

		if (this.state == "short")
			{
			this.toShortState();
			}
		if (this.state == "hide")
			{
			this.toHideState();
			}
		if (this.state == "expand")
			{
			this.toExpandState();
			}

		if (this.draw.needScroll == true && this.domSection.data('accordion-scrolable') != false)
			{
			this.scrollbar = this.domBody.addClass("thin-skin").customScrollbar(
				{
					updateOnWindowResize: true,
					hScroll: false,
					fixedThumbHeight: 7,
					fixedThumbWidth: 7,
					wheelSpeed: 10,
				});
			}

		}
	this.toShortState = function toShortState()
		{
		this.state = "short";
		this.domBody.show();

		//this.setShortDomBodyHeight();
		this.domBody.height(this.draw.bodyShortHeight);

		this.domController.removeClass("accordion-controller-rollup");
		this.domController.addClass("accordion-controller-expand");
		}

	this.toHideState = function toHideState()
		{
		this.state = "hide";
		this.domBody.hide();
		this.needScroll = false;

		this.domController.removeClass("accordion-controller-rollup");
		this.domController.addClass("accordion-controller-expand");
		}

	this.toExpandState = function toExpandState()
		{
		this.state = "expand";
		this.domBody.show();

		//var bodyHeight = this.accordion.elementHeight - this.domHeader.outerHeight(true) * this.accordion.countSections;
		//this.domBody.height(bodyHeight);
		//this.scrollbar.resize();

		//this.setExpandDomBodyHeight();

		this.domBody.height(this.draw.bodyExpandHeight);

		this.domController.removeClass("accordion-controller-expand");
		this.domController.addClass("accordion-controller-rollup");
		}

	this.init();
	};


var MKWidgets = MKWidgets || {};
MKWidgets.AccordionNS = MKWidgets.AccordionNS || {};

MKWidgets.Accordion = Class({
	extends: MKWidget,

	showList: false,
	selectedOption: null,
	nullSymbol: "-",

	constructor: function (elementSelector, options)
		{
		MKWidget.prototype.constructor.apply(this, [elementSelector, options]);
		this.setOptions({
			sectionShortHeight: 170,
			scrolable: true,
		});
		this.setOptions(options);
		this.createDom();
		},

	createDom: function ()
		{
		this.countSections = this.element.find(".section:visible").length;
		this.sections = [];
		//	this.elementHeight = this.element.innerHeight() - 40;
		this.elementHeight = this.element.parent().height() - 40;
		this.element.find(".section").each($.proxy(this.createSection, this));
		this.element.on("redraw", $.proxy(this.redraw, this));
		this.redraw();
		},

	createSection: function (index, domSection)
		{
		this.sections.push(new MKWidgets.AccordionNS.Section(this, $(domSection)));
		},

	hideAll: function ()
		{
		for (var i in this.sections)
			{
			this.sections[i].toHideState();
			}
		},

	shortAll: function ()
		{
		for (var i in this.sections)
			{
			this.sections[i].toShortState();
			}
		},

	redraw: function redraw()
		{
		if (!this.element.is(":visible"))
			{
			return;
			}

		var freeHeight = this.calcFreeHeight();
		var notCalcedSectionsCount = this.element.find(".section:visible").length;
		;
		var normalHeight = freeHeight / notCalcedSectionsCount;
		var staticNormalHeight = freeHeight / notCalcedSectionsCount;

		for (var i in this.sections)
			{
			this.sections[i].draw.calced = false;
			this.sections[i].draw.bodyExpandHeight = freeHeight;
			}

		var f = 1;
		while (f == 1)
			{
			f = 0;
			for (var i in this.sections)
				{
				if (this.sections[i].domSection.is(":visible"))
					{
					var section = this.sections[i];
					var draw = section.draw;

					section.domBody.css({"height": "auto"});

					draw.realBodyHeight = section.domBody.outerHeight(true);

					if (draw.realBodyHeight < normalHeight && draw.calced == false)
						{
						draw.bodyShortHeight = draw.realBodyHeight;
						draw.calced = true;

						freeHeight -= draw.bodyShortHeight;
						notCalcedSectionsCount--;
						normalHeight = freeHeight / notCalcedSectionsCount;
						f = 1;
						}
					}
				}
			}

		for (var i in this.sections)
			{
			if (this.sections[i].draw.calced == false)
				{
				this.sections[i].draw.bodyShortHeight = normalHeight;
				this.sections[i].draw.calced = true;
				this.sections[i].draw.needScroll = true;
				}
			this.sections[i].refreshDom();
			}
		},

	calcFreeHeight: function ()
		{
		var freeHeight = this.element.parent().height();

		for (var i in this.sections)
			{
			if (this.sections[i].domHeader.is(":visible"))
				{
				this.sections[i].draw.headerHeight = this.sections[i].domHeader.outerHeight(true);
				freeHeight -= this.sections[i].draw.headerHeight;
				}
			freeHeight -= this.sections[i].domSection.outerHeight(true) - this.sections[i].domSection.height();
			}
		return freeHeight;
		},

	destroy: function ()
		{

		},

});

MKWidgets.AccordionNS.Section = Class({
	'extends': MK.Object,


	scrollbar: null,
	domController: $(),
	state: "short",	//short, hide, expand
	draw: {
		calced: false,
		sectionHeight: 0,
		headerHeight: 0,
		bodyShortHeight: 0,
		bodyExpandHeight: 0,
		needScroll: false,

		realSectionHeight: 0,
		realBodyHeight: 0,
	},


	constructor: function (accordion, domSection)
		{
		this.accordion = accordion;
		this.domSection = domSection;
		this.domHeader = domSection.find("header");
		this.domBody = domSection.find(".section-body");
		this.init();
		},

	init: function ()
		{
		this.domController = $("<div>").addClass("accordion-controller").addClass("accordion-controller-expand");

		this.domHeader.append(this.domController);
		this.domController.on("click", $.proxy(this.controllerSlot, this));

		this.refreshDom();
		this.debugFinishCall(arguments, this);
		},

	controllerSlot: function (e)
		{
		switch (this.state)
		{
			case "short":
				this.accordion.hideAll();
				this.state = "expand";
				break;
			case "hide":
				this.accordion.hideAll();
				this.state = "expand";
				break;
			case "expand":
				this.accordion.shortAll();
				this.state = "short";
				break;
		}
		this.accordion.element.trigger("accordion-state-change");
		this.refreshDom();
		},

	refreshDom: function ()
		{
		if (this.scrollbar != undefined)
			{
			this.domBody.customScrollbar("remove");
			}

		if (this.state == "short")
			{
			this.toShortState();
			}
		if (this.state == "hide")
			{
			this.toHideState();
			}
		if (this.state == "expand")
			{
			this.toExpandState();
			}

		if (this.draw.needScroll == true && this.domSection.data('accordion-scrolable') != false)
			{
			this.scrollbar = this.domBody.addClass("thin-skin").customScrollbar(
				{
					updateOnWindowResize: true,
					hScroll: false,
					fixedThumbHeight: 7,
					fixedThumbWidth: 7,
					wheelSpeed: 10,
				});
			}
		},

	toShortState: function ()
		{
		this.state = "short";
		this.domBody.show();

		//this.setShortDomBodyHeight();
		this.domBody.height(this.draw.bodyShortHeight);

		this.domController.removeClass("accordion-controller-rollup");
		this.domController.addClass("accordion-controller-expand");
		},

	toHideState: function ()
		{
		this.state = "hide";
		this.domBody.hide();
		this.needScroll = false;

		this.domController.removeClass("accordion-controller-rollup");
		this.domController.addClass("accordion-controller-expand");
		},

	toExpandState: function ()
		{
		this.state = "expand";
		this.domBody.show();

		//var bodyHeight = this.accordion.elementHeight - this.domHeader.outerHeight(true) * this.accordion.countSections;
		//this.domBody.height(bodyHeight);
		//this.scrollbar.resize();

		//this.setExpandDomBodyHeight();

		this.domBody.height(this.draw.bodyExpandHeight);

		this.domController.removeClass("accordion-controller-expand");
		this.domController.addClass("accordion-controller-rollup");
		},
});