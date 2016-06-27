var MKWidgets = MKWidgets || {};
MKWidgets.PopupNS = MKWidgets.PopupNS || {};

MKWidgets.Popup = Class({
	extends: MKWidget,

	value: null,
	oldValue: null,
	windowBordersIndent: 50,
	reverceFlag: true,
	transitionTime: 0.27,

	constructor: function (elementSelector, options)
		{
		MKWidget.prototype.constructor.apply(this, [elementSelector, options]);
		this.setOptions({
			enable: true,
			positioning: true,

			positionElement: $('body'),
			linkVertical: 'top', //top, center, bottom
			linkHorizontal: 'left', //left, center, right
			positionCorrections: {top: 0, left: 0},
			paddingCorrect: false,    //true, false
			linkingPoint: 'topLeft', //center, topLeft, topRight, bottomLeft, bottomRight, topCenter
			popupContainer: $('body'),

			reverceVertical: false,
			reverceVerticalPositions: {}, //vertical linkingPoint
			reverceHorizontal: false,
			reverceHorizontalPositions: {}, //horizontal linkingPoint

			width: '',
			parentWidth: false,
			sizeRestrictions: true,
			sizeRestrictionsScrollBar: false,
			background: true,

			customClasses: '',    //any additional classes

			returnElementToDom: false,

			cascade: false,
			closeButton: false,
		});
		this.setOptions(options);
		this.init();
		this.cascadeController();
		//this.testCounter = 0;//test string
		//this.addElementsTest = true; //test string
		//this.testAddDiv();
		//this.testChanges();//test string
		},

	init: function ()
		{
		this.createDom();
		this.setPosition();
		this.binds();
		this.events();
		},

	createDom: function ()
		{
		this.domBackground = $("<div/>").addClass("tusur-csp-hide-popup-background");

		this.domPopup = $("<div/>").addClass("tusur-csp-show-table-popup-container");
		if (this.options.closeButton == true)
			{
			this.domCloseButton = $("<div/>").addClass("tusur-csp-popup-close-button")
				.on('click', this.closePopup, this);
			this.domPopup.append(this.domCloseButton);
			}
		this.domInsideContainer = $("<div/>").addClass('tusur-csp-show-table-popup-inside-container');

		this.domPopup.append(this.domInsideContainer);
		this.domBackground.append(this.domPopup);
		this.options.popupContainer.append(this.domBackground);

		if (this.options.background == true)
			{
			this.domBackground.addClass('tusur-csp-hide-popup-background-color');
			}

		if (this.options.returnElementToDom == false)
			{
			this.domInsideContainer.append(this.element);
			}

		this.positionElement = this.options.positionElement;
		},

	disable: function ()
		{
		this.openPopup = false;
		this.options.enable = false;
		},

	enable: function ()
		{
		this.options.enable = true;
		},

	openPopup: function ()
		{
		this.domPopup.css('opacity', '0');
		if (this.options.parentWidth == true)
			{
			this.parentSizes();
			}
		if (this.options.enable)
			{
			this.popupDisplay = true;
			this.showSettings = window.app.getCascadeLevel(this.domPopup, this.options.cascade);
			if (this.options.background == true)
				{
				this.domBackground.css('background', 'rgba(0, 0, 0, ' + this.showSettings.opacity + ')');
				}
			$(this.domBackground).css('z-index', this.showSettings['Zindex']);
			}
		},

	showPopup: function ()
		{
		this.delay(function ()
		{
		this.domPopup.css('opacity', '1')
		}, 10, this);
		},

	cascadeController: function ()
		{
		window.app.on('cascade-changed', this.updateView, this);
		this.basicLinkVertical = this.options.linkVertical;
		this.basicLinkHorizontal = this.options.linkHorizontal;
		this.basicLinkingPoint = this.options.linkingPoint;
		this.basicPositionCorrections = this.options.positionCorrections;
		},

	updateView: function ()
		{
		if (this.popupDisplay == true && this.showSettings != undefined)
			{
			var newShowSettings = window.app.updateCascadeInfo(this.showSettings['level']);
			this.showSettings = $.extend(this.showSettings, newShowSettings);
			this.setViewSettings();
			}
		},

	setViewSettings: function ()
		{
		if (this.options.cascade == true)
			{
			if (this.showSettings.first == true)
				{
				this.options.linkVertical = this.basicLinkVertical;
				this.options.linkHorizontal = this.basicLinkHorizontal;
				this.options.linkingPoint = this.basicLinkingPoint;
				}
			else
				{
				this.linkVertical = 'top';
				this.linkHorizontal = 'left';
				this.linkingPoint = 'topLeft';
				}
			var topIndent = this.basicPositionCorrections['top'] - this.showSettings.indent[1],
				leftIndent = this.basicPositionCorrections['left'] - this.showSettings.indent[0];
			this.options.positionCorrections = {top: topIndent, left: leftIndent};
			this.options.positionElement = this.showSettings.element;
			}
		if (this.options.cascade == true)
			{
			this.domPopup.css('transition', this.transitionTime + 's ease-in-out');
			}
		if (this.options.background == true)
			{
			this.domBackground.css('background', 'rgba(0, 0, 0, ' + this.showSettings.opacity + ')');
			}
		this.trigger('set-position');
		},

	parentSizes: function ()
		{
		this.domPopup.css('width', this.element.parent().outerWidth());
		this.domPopup.css('height', this.element.parent().outerHeight());    //for select only!!! warning! Delete this string!
		},

	closePopup: function ()
		{
		if (this.popupDisplay == true)
			{
			window.app.closeLevel(this.options.cascade);
			}
		this.popupDisplay = false;
		this.trigger('close-popup');
		},

	togglePopup: function ()
		{
		if (this.popupDisplay == true)
			{
			this.closePopup();
			}
		else
			{
			this.openPopup();
			}
		},


	returnElementToDom: function ()
		{
		if (this.popupDisplay == true)
			{
			if (this.clone == undefined)
				{
				this.clone = $('<div/>');//this.element.clone().empty();
				this.element.before(this.clone);
				}
			else
				{
				this.clone.show();
				}

			this.clone.width(this.element.width());
			this.clone.height(this.element.height());

			this.domInsideContainer.append(this.element);

			this.positionElement = this.clone;
			//this.setPosition(this.clone);
			}
		else
			{
			this.clone.hide();
			this.clone.after(this.element);
			//this.positionElement = this.element;
			//this.setPosition(this.element);
			}
		},

	beforeSetPosition: function ()
		{

		},

	setPosition: function (reverce)
		{
		if (this.options.positioning)
			{
			this.beforeSetPosition();
			this.setPopupSizeRestrictions();
			this.setWidth();

			this.position = this.getPosition();
			this.positionCorrection = {
				top: this.options.positionCorrections.top,
				left: this.options.positionCorrections.left,
			};
			this.positionCorrection = this.paddingCorrect(this.positionCorrection);
			this.linkingPointPosition = {
				left: this.position.x + this.positionCorrection.left,
				top: this.position.y + this.positionCorrection.top
			};
			this.positionCorrection = this.linkingPointCorrect(this.positionCorrection);

			this.applyPosition(this.position, this.positionCorrection);


			if (reverce !== false)
				{
				this.reverce();
				}
			}
		this.mutation = 'finish';
		this.delay(
			function ()
			{
			this.mutation = 'reason';
			}, 100);
		this.showPopup();
		this.trigger('popup-positioning-finish');
		},

	applyPosition: function (position, positionCorrection)
		{
		position.x += positionCorrection.left;
		position.y += positionCorrection.top;

		this.domPopup.css({left: position.x});
		this.domPopup.css({top: position.y});
		},

	getPosition: function ()
		{

		var position = {
			x: this.positionElement.offset().left,
			y: this.positionElement.offset().top
		};

		if (this.options.linkHorizontal == 'center')
			{
			position.x += this.positionElement.outerWidth() / 2;
			}
		if (this.options.linkHorizontal == 'right')
			{
			position.x += this.positionElement.outerWidth();
			}

		if (this.options.linkVertical == 'center')
			{
			position.y += this.positionElement.outerHeight() / 2;
			}
		if (this.options.linkVertical == 'bottom')
			{
			position.y += this.positionElement.outerHeight();
			}

		return position;
		},

	paddingCorrect: function (positionCorrection)
		{
		if (this.options.paddingCorrect)
			{
			var padding = {
				top: parseInt(this.positionElement.css('padding-top')),
				right: parseInt(this.positionElement.css('padding-right')),
				bottom: parseInt(this.positionElement.css('padding-bottom')),
				left: parseInt(this.positionElement.css('padding-left')),
			}

			if (this.options.linkHorizontal == 'center')
				{
				positionCorrection.left += (padding.left - padding.right) / 2;
				}
			if (this.options.linkVertical == 'center')
				{
				positionCorrection.top += ( padding.top - padding.bottom) / 2;
				}
			if (this.options.linkHorizontal == 'left')
				{
				positionCorrection.left += padding.left;
				}
			if (this.options.linkHorizontal == 'right')
				{
				positionCorrection.left -= padding.right;
				}
			if (this.options.linkVertical == 'top')
				{
				positionCorrection.top += padding.top;
				}
			if (this.options.linkVertical == 'bottom')
				{
				positionCorrection.top -= padding.bottom;
				}
			}
		return positionCorrection;
		},


	linkingPointCorrect: function (positionCorrection)
		{
		if (this.options.linkingPoint == 'center')
			{
			positionCorrection.left -= this.domPopup.outerWidth() / 2;
			positionCorrection.top -= this.domPopup.outerHeight() / 2;
			}
		else if (this.options.linkingPoint == 'topRight')
			{
			positionCorrection.left -= this.domPopup.outerWidth();
			}
		else if (this.options.linkingPoint == 'bottomLeft')
			{
			positionCorrection.top -= this.domPopup.outerHeight();
			}
		else if (this.options.linkingPoint == 'bottomRight')
			{
			positionCorrection.left -= this.domPopup.outerWidth();
			positionCorrection.top -= this.domPopup.outerHeight();
			}
		else if (this.options.linkingPoint == 'topCenter')
			{
			positionCorrection.left -= this.domPopup.outerWidth() / 2;
			}
		return positionCorrection;
		},

	setWidth: function ()
		{
		if (this.options.width != '')
			{
			$(this.domPopup).css('width', this.options.width);
			//if (this.options.positionElement.outerWidth() < $(this.domPopup).outerWidth())
			//	{
			//	$(this.domPopup)
			//		.css('width', (this.options.positionElement.outerWidth() + this.leftHorizontalCorrect + this.rightHorizontalCorrect) + 'px');
			//	}
			}
		},

	setPopupSizeRestrictions: function ()
		{
		if (this.options.sizeRestrictions === true)
			{
			var maxSizes = this.getPopupMaxSizes(true);
			this.domInsideContainer.css('max-width', maxSizes.width);
			this.domInsideContainer.css('max-height', maxSizes.height);

			if (this.options.sizeRestrictionsScrollBar === true)
				{
				this.initScroll(this.domInsideContainer);

				}
			else if (this.options.sizeRestrictionsScrollBar instanceof jQuery)
				{
				this.initScroll(this.options.sizeRestrictionsScrollBar);
				}
			}
		},

	initScroll: function (element)
		{
		if (this.listScroll != undefined)
			{
			var scrollElementPosition = element.find('.overview').position();
			if (scrollElementPosition != undefined)
				{
				this.scrollTop = -1 * scrollElementPosition.top;
				}
			this.listScroll.customScrollbar("remove");
			this.listScroll.removeClass("thin-skin");
			element.removeClass("thin-skin")
			this.listScroll = null;
			}

		element.css('height', 'auto');
		var maxHeight = parseInt(element.css('max-height'));
		element.css('max-height', 'none');

		var currentHeight = element.height();


		if (currentHeight > maxHeight)
			{
			element.css('height', maxHeight);
			this.listScroll = element
				.addClass("thin-skin")
				.customScrollbar(CustomScrollbarSettings);
			}
		else
			{
			element.css('height', currentHeight);
			}

		element.css('max-height', maxHeight + 'px');

		if (scrollElementPosition != undefined)
			{
			element.customScrollbar("scrollToY", this.scrollTop);
			}
		},


	reverce: function ()
		{

		this.reverceFlag = false;

		this.reverceVertical();
		this.reverceHorizontal();

		if (this.reverceFlag == true)
			{
			this.setPosition(false);
			}

		},

	getElementSize: function (size)
		{
		if (this.element.css('min-' + size) != '0px')
			{
			return parseInt(this.element.css('min-' + size));
			}
		else if (this.element.css(size) != '0px')
			{
			return parseInt(this.element.css(size));
			}
		return 0;
		},

	reverceVertical: function ()
		{
		if (this.options.reverceVertical == true)
			{
			var elementHeight = this.getElementSize('height');
			if (this.position.y + elementHeight + this.windowBordersIndent > $(window).height())
				{
				if (this.options.reverceVerticalPositions.vertical == undefined)
					{
					this.getTopPosition();
					}
				else
					{
					this.options.linkVertical = this.options.reverceVerticalPositions['vertical'];
					this.options.linkingPoint = this.options.reverceVerticalPositions['linkingPoint'];
					}
				//console.log('вылезли по вертикали');
				this.reverceFlag = true;
				}
			}
		},

	reverceHorizontal: function ()
		{
		if (this.options.reverceHorizontal == true)
			{
			var elementWidth = this.getElementSize('width');

			if (this.position.x + elementWidth + this.windowBordersIndent > $(window).width() && elementWidth > 0)
				{
				if (this.options.reverceHorizontalPositions.horizontal == undefined)
					{
					this.getLeftPosition();
					}
				else
					{
					this.options.linkHorizontal = this.options.reverceHorizontalPositions['horizontal'];
					this.options.linkingPoint = this.options.reverceHorizontalPositions['linkingPoint'];
					}
				//console.log('вылезли по горизонтали справа');
				this.reverceFlag = true;
				}

			if (elementWidth + this.windowBordersIndent > this.position.x && elementWidth > 0 && this.position.x != 0)
				{
				if (this.options.reverceHorizontalPositions.horizontal == undefined)
					{
					this.getRightPosition();
					}
				else
					{
					this.options.linkHorizontal = this.options.reverceHorizontalPositions['horizontal'];
					this.options.linkingPoint = this.options.reverceHorizontalPositions['linkingPoint'];
					}
				this.reverceFlag = true;
				}
			}
		},

	getTopPosition: function ()
		{   //center, topLeft, topRight, bottomLeft, bottomRight
		this.options.linkVertical = 'top';
		if (this.options.linkingPoint == 'topLeft')
			{
			this.options.linkingPoint = 'bottomLeft';
			}
		else if (this.options.linkingPoint == 'topRight')
			{
			this.options.linkingPoint = 'bottomRight';
			}
		},

	getLeftPosition: function ()
		{
		this.options.linkHorizontal = 'left';
		if (this.options.linkingPoint == 'bottomRight')
			{
			this.options.linkingPoint = 'bottomLeft';
			}
		else if (this.options.linkingPoint == 'topRight')
			{
			this.options.linkingPoint = 'topLeft';
			}
		},

	getRightPosition: function ()
		{
		this.options.linkHorizontal = 'right';
		if (this.options.linkingPoint == 'bottomLeft')
			{
			this.options.linkingPoint = 'bottomRight';
			}
		else if (this.options.linkingPoint == 'topLeft')
			{
			this.options.linkingPoint = 'topRight';
			}
		},

	getPopupMaxSizes: function (pxFlag)
		{
		var popupMaxWidth,
			popupMaxHeight
			;

		if (this.linkingPointPosition == undefined)
			{
			this.position = this.getPosition();
			this.positionCorrection = {
				top: this.options.positionCorrections.top,
				left: this.options.positionCorrections.left,
			};
			this.positionCorrection = this.paddingCorrect(this.positionCorrection);
			this.linkingPointPosition = {
				left: this.position.x + this.positionCorrection.left,
				top: this.position.y + this.positionCorrection.top
			};
			}

		if (this.options.linkingPoint == 'center')
			{
			var linkingPointBottom = $(window).width() - this.linkingPointPosition.left;
			if (this.linkingPointPosition.left < linkingPointBottom)
				{
				popupMaxWidth = 2 * (this.linkingPointPosition.left - this.windowBordersIndent);
				}
			else
				{
				popupMaxWidth = 2 * (linkingPointBottom - this.windowBordersIndent);
				}

			var linkingPointRight = $(window).height() - this.linkingPointPosition.top;
			if (this.linkingPointPosition.top < linkingPointRight)
				{
				popupMaxHeight = 2 * (this.linkingPointPosition.top - this.windowBordersIndent);
				}
			else
				{
				popupMaxHeight = 2 * (linkingPointRight - this.windowBordersIndent);
				}

			}
		else if (this.options.linkingPoint == 'bottomLeft' || this.options.linkingPoint == 'bottomRight')
			{
			popupMaxWidth = this.linkingPointPosition.left - this.windowBordersIndent;
			popupMaxHeight = this.linkingPointPosition.top - this.windowBordersIndent;
			}
		else if (this.options.linkingPoint == 'topLeft' || this.options.linkingPoint == 'topRight')
			{
			popupMaxWidth = $(window).width() - this.linkingPointPosition.left - this.windowBordersIndent;
			popupMaxHeight = $(window).height() - this.linkingPointPosition.top - this.windowBordersIndent;
			}
		else if (this.options.linkingPoint == 'topCenter' || this.options.linkingPoint == 'bottomCenter' )
			{
			popupMaxWidth = $(window).width() - this.windowBordersIndent * 2;
			popupMaxHeight = $(window).height() - this.windowBordersIndent * 2;
			}

		if (pxFlag == true)
			{
			return {width: popupMaxWidth + 'px', height: popupMaxHeight + 'px'};
			}
		return {width: popupMaxWidth, height: popupMaxHeight};
		},

	unsetStrictHeight: function ()
		{
		this.domPopup.css('height', 'auto');
		},

	events: function ()
		{
		this.on('openPopup', this.openPopup, this);
		$(document).on('mousedown', $.proxy(this.hideFiltersContainer, this));
		//$(document).keydown($.proxy(this.bodyKeydownSlot, this));
		this.element.on('rendering-over', $.proxy(this.unsetStrictHeight, this));
		},

	bodyKeydownSlot: function (event)
		{
		if (event.keyCode == 27 && this.popupDisplay)
			{
			this.closePopup();
			}
		},

	hideFiltersContainer: function (event)
		{
		if (event.target === this.domBackground[0] && this.popupDisplay)
			{
			this.closePopup();
			event.stopPropagation();
			}
		},

	binds: function ()
		{
		this.popupDisplay = false;
		//this.popupDisplay = true; //test string
		this.bindNode('sandbox', this.domPopup)
			.bindNode('popupDisplay', ':sandbox', MK.binders.display())
			.bindNode('popupDisplay', this.domBackground, MK.binders.display())
		;

		this.on('change:popupDisplay',
			function ()
			{
			if (this.options.returnElementToDom == true)
				{
				this.returnElementToDom();
				}

			if (this.popupDisplay == true)
				{
				this.trigger('set-position');
				this.trigger('popup-open');
				}
			else
				{
				this.trigger('popup-close');
				}


			}, this);


		MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

		var that = this;
		that.mutation = 'reason';
		this.observer = new MutationObserver(
			function (mutations, observer)
			{
			if (that.popupDisplay && that.mutation == 'reason')
				{
				that.trigger('set-position');
				that.mutation = 'in_process';
				}

			if (that.mutation == 'finish')
				{
				that.mutation = 'reason';
				}

			});

		this.observer.observe(this.domPopup[0], {
			subtree: true,
			attributes: true,
			childList: true,
			characterData: true,
			attributeOldValue: true,
			characterDataOldValue: true
		});


		this.onDebounce('set-position', this.setPosition, 10, this);
		$(window).resize($.proxy(this.trigger, this, 'set-position'));
		},

	deletePopUp: function ()
		{
		this.domBackground.remove();
		this.observer.disconnect()
		},

	destroy: function()
		{
		this.deletePopUp();
		},

	testAddDiv: function ()
		{
		this.delay(function ()
		{
		if (this.addElementsTest == true)
			{
			this.element.append($('<div/>').html(this.testCounter).attr('display', 'block'));
			this.testAddDiv();
			this.testCounter++;
			}
		}, 100, this);
		},

	testChanges: function ()
		{
		this.options.linkHorizontal = 'left';
		this.testVertical();
		this.delay(function ()
		{
		this.options.linkHorizontal = 'center';
		this.testVertical();
		}, 3000, this);
		this.delay(function ()
		{
		this.options.linkHorizontal = 'right';
		this.testVertical();
		}, 6000, this);
		this.delay(function ()
		{
		this.testChanges();
		}, 9000, this);
		},

	testVertical: function ()
		{
		this.options.linkVertical = 'top';
		this.setPosition();
		this.delay(function ()
		{
		this.options.linkVertical = 'center';
		this.setPosition();
		}, 1000, this);
		this.delay(function ()
		{
		this.options.linkVertical = 'bottom';
		this.setPosition();
		}, 2000, this);
		},
});

MKWidgets.PopupNS.TabPopup = Class({
	extends: MKWidgets.Popup,
	constructor: function (elementSelector, options)
		{
		MKWidgets.Popup.prototype.constructor.apply(this, [elementSelector, options]);
		this.setOptions({
			align: "center",
			class: '',
			enable: true,
			tabs: []
		});
		this.setOptions(options);
		//this.createDom(this.element);
		//this.createDom();
		//this.render();
		},

	createDom: function ()
		{
		MKWidgets.Popup.prototype.createDom.apply(this);

		this.domTabs = $("<ul/>").addClass('tusur-csp-popup-tabs');
		this.domBodies = $("<div/>").addClass('tusur-csp-popup-tabs-bodies');


		this.element.append(this.domTabs)
			.append(this.domBodies)
			.attr('class', 'tusur-csp-popup-tabs-container')
		;

		this.tabs = new MKWidgets.PopupNS.TabPopupArray(this);
		this.switchTab(this.tabs[0]);

		this.trigger('popup-ready');
		},

	switchTab: function (newTab)
		{
		if (this.activeStep != newTab)
			{
			if (this.activeStep != undefined)
				{
				this.activeStep.display = false;
				}
			newTab.display = true;
			this.activeStep = newTab;
			}
		}
});


MKWidgets.PopupNS.TabPopupObject = Class({
	'extends': MK.Object,
	display: false,
	constructor: function (tab, parent)
		{
		this.parent = parent;
		this.jset(tab);
		this.on('render', this.render);
		},

	render: function ()
		{
		if (this.body instanceof jQuery)
			{
			$(this.sandbox).append(this.body);
			}
		else if (typeof this.body == 'string')
			{
			this.bindNode('body', ':sandbox', MK.binders.html());
			}

		this.domTab = $('<li/>').addClass('tusur-csp-popup-tab');
		this.parent.domTabs.append(this.domTab);
		this.bindNode('title', this.domTab, MK.binders.html())
			.bindNode('display', ':sandbox', MK.binders.display())
			.bindNode('display', this.domTab, MK.binders.className('tusur-csp-popup-tab-active'))
			.on('click::title', this.tabClickSlot, this)
		;

		//todo: redefine setPopupSizeRestrictions
		var sizes = this.parent.parent.getPopupMaxSizes(true);
		this.body.css('max-height', sizes.height);
		this.body.css('max-width', sizes.width);


		this.on("change:display", function ()
		{
		this.parent.parent.setPosition();
		if (this.display == true)
			{
			this.body.trigger('custom_resize');
			}

		}, this);
		},

	tabClickSlot: function ()
		{
		this.parent.parent.switchTab(this);
		}
});

MKWidgets.PopupNS.TabPopupArray = Class({
	'extends': MK.Array,
	Model: MKWidgets.PopupNS.TabPopupObject,
	itemRenderer: '<div class="tusur-csp-tab-popup-body"></div>',
	constructor: function (parent)
		{
		this.parent = parent;
		this.domTabs = parent.domTabs;
		this.bindNode('sandbox', parent.domBodies)
			.recreate(parent.options.tabs);
		}
});

