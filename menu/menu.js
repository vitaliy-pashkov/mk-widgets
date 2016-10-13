(function ($)
	{
	$.widget("custom.menu",
		{
			options: {
				title: "defaultMenuName",

				debugLevel: "profile"
			},

			_create: function _create()
				{

				//var route = GET("r");
				//var link = this.element.find("[href $= '"+route+"']");
				//var li = link.parent("li");
				//li.addClass("active");
				//if(li.hasClass("submenu-li"))
				//	{
				//	li.parents("li").addClass("active");
				//	}

				//this.element.find("a").on('click', $.proxy(this.itemClickSlot, this));

				},

			itemClickSlot: function itemClickSlot(e)
				{
				e.preventDefault();

				var newItem = $(e.target).parent("li");
				var newName = $(e.target).attr("href");

				if (this.currentName != newName)
					{
					if (this.currentItem !== undefined)
						{
						this.currentItem.removeClass("active");
						if (this.currentItem.hasClass("tusur-csp-submenu-li"))
							{
							this.currentItem.parents("li").removeClass("active");
							}
						}
					this.currentItem = newItem;
					this.currentName = newName;

					this.currentItem.addClass("active");
					if (this.currentItem.hasClass("tusur-csp-submenu-li"))
						{
						this.currentItem.parents("li").addClass("active");
						}
					this.element.trigger("select-item", [newName]);
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

(function ($)
	{
	$.widget("custom.header_menu",
		{
			options: {
				title: "defaultMenuName",
			},

			_create: function _create()
				{
				this.element.find('a').each(
					function()
					{
					if ($(this).css('background-image') == 'none')
						{
						$(this).addClass('without-ico');
						}
					})

				$('.tusur-csp-menu-li-first').on('mouseenter',
					function ()
					{
					$('.tusur-csp-menu-li-second').hide();
					$('.tusur-csp-menu-li-third').hide();
					});
				$('.tusur-csp-menu-li-first').on('mouseleave',
					function ()
					{
					$('.tusur-csp-menu-li-second').show();
					$('.tusur-csp-menu-li-third').show();
					});

				$('.tusur-csp-menu-li-second').on('mouseenter',
					function ()
					{
					$('.tusur-csp-menu-li-third').hide();
					});
				$('.tusur-csp-menu-li-second').on('mouseleave',
					function ()
					{
					$('.tusur-csp-menu-li-third').show();
					});

				},

			destroy: function ()
				{
				$.Widget.prototype.destroy.call(this);
				}

		});
	$('#header_menu').header_menu();
	}(jQuery) );