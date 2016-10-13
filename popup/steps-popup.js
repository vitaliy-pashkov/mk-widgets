var MKWidgets = MKWidgets || {};
MKWidgets.PopupNS = MKWidgets.PopupNS || {};

MKWidgets.PopupNS.StepsPopup = Class({
	extends: MKWidgets.Popup,
	constructor: function (elementSelector, options)
		{
		MKWidgets.Popup.prototype.constructor.apply(this, [elementSelector, options]);
		this.setOptions({
			align: "center",
			class: '',
			title: '',
			enable: true,
			steps: {}
		});
		this.setOptions(options);
		//this.createDom(this.element);
		//this.createDom();
		//this.render();
		},

	createDom: function ()
		{
		MKWidgets.Popup.prototype.createDom.apply(this);

		this.domTitle = $("<div/>").addClass('tusur-csp-popup-title').html(this.options.title);
		this.domSteps = $("<ul/>").addClass('tusur-csp-popup-steps');
		this.domStepTitle = $("<ul/>").addClass('tusur-csp-popup-step-title');
		this.domBodies = $("<div/>").addClass('tusur-csp-popup-steps-bodies');


		this.domFooter = $('<div/>').addClass('tusur-csp-popup-step-footer');
		this.element
			.append(this.domTitle)
			.append(this.domSteps)
			.append(this.domStepTitle)
			.append(this.domBodies)
			.append(this.domFooter)
			.attr('class', 'tusur-csp-popup-steps-container tusur-csp-popup-steps-popup')
		;
		this.createFooter();
		this.steps = new MKWidgets.PopupNS.StepPopupArray(this);
		this.switchStep(this.steps[0]);
		this.on('next-step', this.nextStepSlot, this)
			.on('previous-step', this.previousStepSlot, this)
			.on('enable-next-button', this.enableNextButton, this)
			.on('disable-next-button', this.disableNextButton, this)
			.trigger('popup-ready')
		;

		this.on('change:activeStep', this.buttonContoller, true, this);
		},

	createFooter: function ()
		{
		this.domInputNext = $("<input>").attr('type', 'button')
			.addClass('tusur-csp-popup-steps-footer-next-button')
			.val('Далее')
			//.prop('disabled', false)
			.on('click', $.proxy(this.nextButtonClickSlot, this))
		;
		this.domInputPrev = $("<input>").attr('type', 'button')
			.addClass('tusur-csp-popup-steps-footer-prev-button')
			.val('Назад')
			.on('click', $.proxy(this.previousStepSlot, this))
		;
		this.domInputCancel = $("<input>").attr('type', 'button')
			.addClass('tusur-csp-popup-steps-footer-cancel-button')
			.val('Отменить')
			.on('click', $.proxy(this.closePopup, this));
		;
		this.domFooter.append(this.domInputCancel)
			.append(this.domInputNext)
			.append(this.domInputPrev)
		;

		},

	enableNextButton: function ()
		{
		this.domInputNext.removeClass('disable');
		//.prop('disabled', false);
		},

	disableNextButton: function ()
		{
		this.domInputNext.addClass('disable');
		//.prop('disabled', true);
		},

	buttonContoller: function ()
		{
		if (this.activeStep.number == 1)
			{
			this.domInputPrev.hide();
			}
		else
			{
			this.domInputPrev.show();
			}
		if (this.options.steps.length == this.activeStep.number)
			{
			this.domInputNext.val('Завершить');
			}
		else
			{
			this.domInputNext.val('Далее');
			}
		},

	beforeSetPosition: function ()
		{
		this.activeStep.setMaxSizes();
		},

	nextButtonClickSlot: function ()
		{
		if (this.activeStep.number < this.options.steps.length)
			{
			this.trigger('try-next-step');
			}
		else if (this.activeStep.number == this.options.steps.length)
			{
			this.trigger('try-done');
			}

		},

	nextStepSlot: function ()
		{
		var nextStep = this.findStep(this.activeStep.number + 1);
		if (nextStep != null)
			{
			this.switchStep(nextStep);
			}
		else
			{
			//console.log('следующий шаг не найден!');
			}
		},

	previousStepSlot: function ()
		{
		if (this.activeStep.number == 1)
			{
			this.trigger('step-is-first');
			return;
			}
		var prevStep = this.findStep(this.activeStep.number - 1);
		if (prevStep != null)
			{
			this.switchStep(prevStep);
			}
		else
			{
			//console.log('предыдущий шаг не найден!');
			}
		},

	toStep: function (number)
		{
		var step = this.findStep(number);
		if (step != null)
			{
			this.switchStep(step);
			}
		},

	findStep: function (number)
		{
		var foundStep = null;
		this.steps.each(function (step)
		{
		if (step.number == number)
			{
			foundStep = step;
			}
		}, this);
		return foundStep;
		},

	switchStep: function (newStep)
		{
		if (this.activeStep != undefined)
			{
			this.activeStep.display = false;
			}
		newStep.display = true;
		this.activeStep = newStep;

		app.trigger('mkw_resize');

		this.activeStep.setMaxSizes();
		this.options.sizeRestrictionsScrollBar = this.activeStep.body;
		//this.
		this.domStepTitle.html(this.activeStep.title);

		}
});


MKWidgets.PopupNS.StepPopupObject = Class({
	'extends': MK.Object,
	display: false,
	constructor: function (step, parent)
		{
		this.parent = parent;
		this.jset(step);
		this.active = false;
		this.step = step;

		this.on('render', this.render);
		this.on('afterrender', this.afterRender);
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
		this.numberStep = 'Шаг ' + this.number;
		this.domStep = $('<li/>').addClass('tusur-csp-popup-step');
		this.parent.domSteps.append(this.domStep);
		this.bindNode('numberStep', this.domStep, MK.binders.html())
			.bindNode('display', this.domStep, MK.binders.display())
			.bindNode('display', ':sandbox', MK.binders.display())
			.bindNode('display', this.domStep, MK.binders.className('active'))
			.bindNode('display', this.domStep, MK.binders.className('tusur-csp-popup-step-active'))
		;

		this.domStep.on('click', $.proxy(this.stepClickSlot, this));
		this.on("change:display", function ()
		{
		this.parent.parent.trigger('set-position');
		if (this.display == true)
			{
			this.body.trigger('custom_resize');
			}
		}, this);

		this.on('step@change:body', this.redrawBody, this);
		},


	afterRender: function ()
		{
		this.setMaxSizes();
		},

	setMaxSizes: function ()
		{
		var popupSizes = this.parent.parent.getPopupMaxSizes();
		var deltaHeight = this.parent.parent.domInsideContainer.outerHeight(true) - this.body.outerHeight(),
			deltaWidth = this.parent.parent.domInsideContainer.outerWidth(true) - this.body.outerWidth(),
			height = popupSizes.height - deltaHeight,
			width = popupSizes.width - deltaWidth;

		this.body.css('max-height', height);
		this.body.css('max-width', width);
		},

	redrawBody: function ()
		{
		if (this.step.body instanceof jQuery)
			{
			$(this.sandbox).empty().append(this.step.body);
			}
		},


	stepClickSlot: function ()
		{
		this.parent.parent.switchStep(this);
		}
});

MKWidgets.PopupNS.StepPopupArray = Class({
	'extends': MK.Array,
	Model: MKWidgets.PopupNS.StepPopupObject,
	itemRenderer: '<div class="tusur-csp-step-popup-body"></div>',
	constructor: function (parent)
		{
		this.parent = parent;
		this.domSteps = parent.domSteps;
		this.bindNode('sandbox', parent.domBodies)
			.recreate(parent.options.steps);
		}
});