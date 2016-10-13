var MKWidgets = MKWidgets || {};
MKWidgets.PopupNS = MKWidgets.PopupNS || {};

MKWidgets.PopupNS.Tooltip = Class({
	extends: MKWidgets.Popup,
	inverceVertical: false,
	bottomIndent: 30,
	dynamicHorizontalAlign: 'left',

	constructor: function (elementSelector, options)
		{
		MKWidgets.Popup.prototype.constructor.apply(this, [elementSelector, options]);

		this.setOptions({
			dynamicElement: $('<div/>'),
			indent: 0,
			sizeRestrictions: false,
			closeOnHeaderClick: false,
		});
		this.setOptions(options);

		this.positionCorrectionsBackup = {
			top: this.options.positionCorrections.top,
			left: this.options.positionCorrections.left
		};
		},

	createDom: function ()
		{
		this.domBackground = $("<div/>").addClass("tusur-csp-hide-popup-background");
		this.domBackgroundSkin = $("<div/>").addClass("background-skin").on('click', $.proxy(this.closePopup, this));
		this.domBackground.append(this.domBackgroundSkin);
		this.domPopup = $("<div/>").addClass("tusur-csp-show-table-popup-container");


		this.domInsideStaticContainer = $("<div/>").addClass('tusur-csp-show-table-popup-inside-static-container');
		this.domInsideDynamicContainer = $("<div/>").addClass('tusur-csp-show-table-popup-inside-dynamic-container')
			.css('margin', this.options.indent + 'px 0')
			.append(this.options.dynamicElement);

		this.domInsideContainer = $("<div/>").addClass('tusur-csp-show-table-popup-inside-container')
			.append(this.domInsideStaticContainer)
			.append(this.domInsideDynamicContainer);
		this.domInsideContainer.addClass('tooltip')

		this.domPopup.append(this.domInsideContainer);
		this.domBackground.append(this.domPopup);
		this.options.popupContainer.append(this.domBackground);

		if (this.options.background == true)
			{
			this.domBackground.addClass('tusur-csp-hide-popup-background-color');
			}

		if (this.options.returnElementToDom == false)
			{
			this.domInsideStaticContainer.append(this.element);
			}
		//else
		//    {
		//    this.domInsideStaticContainer.css('height', this.element.innerHeight());
		//    this.domInsideStaticContainer.css('width', this.element.innerWidth());
		//    }

		this.positionElement = this.options.positionElement;

		this.tooltipEvents();
		},

	tooltipEvents: function ()
		{
		this.bindNode('inverceVertical', this.domPopup, MK.binders.className('reverce-vertical'));
		$(window).resize($.proxy(this.reverceSlot, this));
		this.on('content-ready popup-positioning-finish',
			function ()
			{
			if (this.popupDisplay == true)
				{
				this.reverceSlot();
				}
			}, this);
		if(this.options.closeOnHeaderClick)
			{
			this.domInsideStaticContainer.on('click', $.proxy(this.closePopup, this));
			}

		},

	parentSizes: function ()
		{
		if (this.element.parent().parent().length == 0 || this.element.parent()
				.parent()
				.hasClass('tusur-csp-show-table-popup-inside-container'))
			{
			this.domInsideStaticContainer.css('width', this.options.positionElement.outerWidth());
			this.domInsideStaticContainer.css('height', this.options.positionElement.outerHeight());
			}
		else
			{
			this.domInsideStaticContainer.css('width', this.element.parent().parent().outerWidth());
			//this.domInsideStaticContainer.css('height', this.element.parent().parent().outerHeight());    //for select only!!! warning! Delete this string!

			this.domInsideDynamicContainer.css('min-width', this.element.parent().parent().outerWidth());
			}
		},

	returnElementToDom: function ()
		{
		if (this.popupDisplay == true)
			{
			if (this.clone == undefined)
				{
				this.clone = this.element.clone().empty().html('&nbsp;');
				this.clone.width(0);
				this.clone.height(0);
				this.element.before(this.clone);
				}
			else
				{
				this.clone.show();
				}
			var elementWidth = this.element.width() - 1,
				elementHeight = this.element.height() - 1
				;


			this.clone.height(elementHeight);
			this.clone.width(elementWidth);
			if (this.options.parentWidth == false)
				{
				this.domInsideStaticContainer.height(this.element.outerHeight());
				this.domInsideStaticContainer.width(this.element.outerWidth());
				}

			//this.clone.css('max-width', elementWidth );
			//this.clone.css('max-height', elementHeight );

			this.domInsideStaticContainer.append(this.element);
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

	reverceSlot: function ()
		{
		this.reverceFlag = false;

		this.reverceVerticalTooltip();
		this.reverceHorizontalTooltip();

		if (this.reverceFlag === true)
			{
			this.setPosition(false);
			}
		},

	reverceVerticalTooltip: function ()
		{
		if (this.popupDisplay == true)
			{

			var insideContainerthisMaxHeight = this.domInsideContainer.css('max-height');
			this.domInsideContainer.css('max-height', 'none');

			var bottomPoint = this.domPopup.outerHeight(true) + this.domPopup.offset().top,
				dynamicContainerHeight = this.domInsideDynamicContainer.outerHeight(true);// + 2 * this.options.indent;
			this.domInsideDynamicContainer.css('height', 'auto');
			if (bottomPoint + this.bottomIndent > $(window).height() && this.inverceVertical == false )
				{
				this.domInsideDynamicContainer.insertBefore(this.domInsideStaticContainer);

				this.options.positionCorrections = {
					top: this.positionCorrectionsBackup.top,
					left: this.positionCorrectionsBackup.left
				};
				this.options.positionCorrections.top -= dynamicContainerHeight;

				this.inverceVertical = true;
				this.reverceFlag = true;
				}
			if (this.inverceVertical == true && bottomPoint + dynamicContainerHeight + this.bottomIndent < $(window).height() )
				{
				this.options.positionCorrections = {
					top: this.positionCorrectionsBackup.top,
					left: this.positionCorrectionsBackup.left
				};



				this.domInsideDynamicContainer.insertAfter(this.domInsideStaticContainer);

				this.inverceVertical = false;
				this.reverceFlag = true;
				}
			this.domInsideContainer.css('max-width', insideContainerthisMaxHeight);
			}
		},

	reverceHorizontalTooltip: function ()
		{
		if (this.popupDisplay == true)
			{
			var insideContainerthisMaxWidth = this.domInsideContainer.css('max-width');
			this.domInsideContainer.css('max-width', 'none');

			var rightPointCoordinate = this.domInsideDynamicContainer.offset().left + this.domInsideDynamicContainer.outerWidth(),
				deltaCoordinates = this.domInsideDynamicContainer.outerWidth() - this.domInsideStaticContainer.outerWidth();

			if (rightPointCoordinate > $(window).outerWidth() && this.dynamicHorizontalAlign == 'left')
				{
				this.domInsideDynamicContainer.css('margin-left', -deltaCoordinates);
				this.dynamicHorizontalAlign = 'right';
				//console.log('111');
				}
			else if (rightPointCoordinate + deltaCoordinates < $(window)
					.outerWidth() && this.dynamicHorizontalAlign == 'right')
				{
				this.domInsideDynamicContainer.css('margin-left', 0);
				this.dynamicHorizontalAlign = 'left';
				}
			this.domInsideContainer.css('max-width', insideContainerthisMaxWidth);
			}
		},

});