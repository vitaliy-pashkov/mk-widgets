(function ($)
    {
        $.widget("tusur-csp.checkboxSlider",
            {
            _create: function()
                {
                this.domInput = this.element.find("input");
                this.domLabel = this.element.find("label");
                this.domLabel.on('mousedown', $.proxy(this._generateClick, this));
                this.domLabel.on('click', $.proxy(this.inputClickSlot, this));
                },

            inputClickSlot: function(event)
                {
                event.preventDefault();
                },

            _generateClick: function()
                {
                this.domInput.trigger("click");
                }
            });
        $(".csp-tusur-on-off-switcher-container").checkboxSlider();
    }(jQuery)
);


//html example code
//<div class="csp-tusur-on-off-switcher-container"><input id="test" type="checkbox" class="csp-tusur-on-off-switcher"><label id="test"></label></div>