/*
 * @summary        menu
 * @description    menu
 * @version        0.0.1
 * @author         vitaliy_pashkov
 * @contact        vitaliy_pashkov@inbox.ru
 */

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
				$.custom.debug.prototype._create.call(this);
				this.debugStartCall(arguments);

				//var route = GET("r");
				//var link = this.element.find("[href $= '"+route+"']");
				//var li = link.parent("li");
				//li.addClass("active");
				//if(li.hasClass("submenu-li"))
				//	{
				//	li.parents("li").addClass("active");
				//	}

				//this.element.find("a").on('click', $.proxy(this.itemClickSlot, this));

				this.debugFinishCall(arguments);
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

			$('.tusur-csp-menu-li-first').on('mouseenter',
				function()
				{
				$('.tusur-csp-menu-li-second').hide();
				$('.tusur-csp-menu-li-third').hide();
				});
			$('.tusur-csp-menu-li-first').on('mouseleave',
				function()
				{
				$('.tusur-csp-menu-li-second').show();
				$('.tusur-csp-menu-li-third').show();
				});

			$('.tusur-csp-menu-li-second').on('mouseenter',
				function()
				{
				$('.tusur-csp-menu-li-third').hide();
				});
			$('.tusur-csp-menu-li-second').on('mouseleave',
				function()
				{
				$('.tusur-csp-menu-li-third').show();
				});


			/*
                var route = window.location.pathname,
                    link = this.element.find('.tusur-csp-menu-li-second').find("[href $= '"+route+"']");
                var that = this;
                if(link.length > 0)
                {
                    li = link.parent("li")
                    li.addClass("active");
                    if(li.parent().hasClass("tusur-csp-submenu2-ul")) //показатель того, что выбрано подменю
                    {
                        li.parents("li.tusur-csp-submenu-li").addClass("active");
                    }
                    if(this.element.find('.active').length > 0) {
                        this.recreateActiveMenu();
                        this.element.find('.tusur-csp-menu-li-third').find('.tusur-csp-submenu-li').on('mouseenter',
                            function(){
                                that.element.find('.tusur-csp-menu-li-third').find('.tusur-csp-submenu-li').show();
                            })
                            .on('mouseleave', function(){
                                that.element.find('.tusur-csp-menu-li-third').find('.tusur-csp-submenu-li').hide().first().show();
                            });
                    }}
                    else {
                        this.element.find('.tusur-csp-menu-li-third').hide();
                        this.element.find('.tusur-csp-menu-li-second').hide();
                        this.element.find('.tusur-csp-menu-li').on('mouseenter',
                            function(){
                                that.element.find('.tusur-csp-menu-li-second').show();
                            })
                            .on('mouseleave', function(){
                                that.element.find('.tusur-csp-menu-li-second').hide();
                            });
                    }
*/
            },

            //recreateActiveMenu: function(e)
            //{
            //    this.element.find('.tusur-csp-menu-li-second').show();
            //    var top_a = this.element.find('.tusur-csp-menu-li-second').children('a'),
            //        active_a = this.element.find('.active').children('a').first();
            //    var Htmlcode = [top_a.attr('class'), top_a.html(), top_a.prop('href')];
            //    top_a.attr('class', active_a.attr('class')).html(active_a.html()).prop('href', active_a.prop('href'))
            //    active_a.attr('class', Htmlcode[0]).html(Htmlcode[1]).prop('href', Htmlcode[2]);
            //    var third_submenu = this.element.find('.tusur-csp-menu-li-third').find('.tusur-csp-submenu');
            //    var active_ul = this.element.find('.active').find('.tusur-csp-submenu2-ul');
            //    if(third_submenu.length > 0){
            //        $('<div>').addClass("tusur-csp-submenu-triangle").appendTo(active_a.parent());
            //        third_submenu
            //            .attr('class', 'tusur-csp-submenu2-ul')
            //            .appendTo(active_a.parent());
            //    }
            //    if(this.element.find('.active').length == 1)
            //    {
            //        this.element.find('.tusur-csp-menu-li-third').hide();
			//
            //    }
            //    else if(this.element.find('.active').length > 1)
            //    {
            //        this.element.find('.tusur-csp-menu-li-third').show();
			//
			//
            //        if(active_ul.length > 0){
            //            active_ul.find("tusur-csp-submenu-triangle").remove();
            //            active_ul
            //                .attr('class', 'tusur-csp-submenu')
            //                .appendTo(this.element.find('.tusur-csp-menu-li-third'));
            //        }
            //        active_ul.find('.active').prependTo(active_ul.find('.active').parent());
            //    }
            //},
			//
            //changeElements: function(topElement, secondElement)
            //{
			//
            //},
			//
            //_setOption: function (key, value)
            //{
            //},

            destroy: function ()
            {
                $.Widget.prototype.destroy.call(this);
            }

        });
    $('#header_menu').header_menu();
}(jQuery) );