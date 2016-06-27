var Application = Class(
	{
		extends: Matreshka,

		page: null,
		pages: {},
		widgetsConfig: {},
		widgets: {},
		pageIsInit: false,

		popupZindex: 100,
		basicOpasity: 0.6,
		opacityStep: 0.6,
		cascadeLevel: 1,
		indent: [20, 20],

		nullSymbol: '-',

		logLevels: {
			error: 1,
			waring: 2,
			info: 3,
			debug: 4,
			profile: 5
		},

		logLevel: 'profile',

		constructor: function ()
			{
			$(document).ready($.proxy(this.openPageByUrl, this));

			$(document).ready($.proxy(this.documentReadySlot, this));
			$(window).resize($.proxy(this.windowResizeSlot, this));
			},

		openPageByUrl: function ()
			{
			var url = window.location.pathname;
			if (url.indexOf('/', url.length - 1) !== -1)
				{
				url = url.substr(0, url.length - 1);
				}
			for (var pageClassName in this.pages)
				{
				var pageUrls = this.pages[pageClassName].url;
				if (!Array.isArray(pageUrls))
					{
					pageUrls = [pageUrls];
					}
				for (var i in pageUrls)
					{
					var urlReExp = new RegExp(pageUrls[i]);
					if (urlReExp.test(url))  //(pageUrls[i] == url)
						{
						this.page = new this.pages[pageClassName]();
						this.page.initPage();
						this.initWidgets();
						this.page.pageIsInit = true;
						break;
						}
					}
				if (this.page != undefined)
					{
					break;
					}
				}

			},

		documentReadySlot: function ()
			{
			},
		windowResizeSlot: function ()
			{
			},

		//widgets functionality

		initWidgets: function ()
			{
			for (var name in this.widgetsConfig)
				{
				this.initWidget(name, this.widgetsConfig[name]);
				}
			},

		initWidget: function (name, widget, options)
			{
			if (options != undefined)
				{
				widget.config = Entity.assignObject(widget.config, options);
				}

			if (widget.type == "mk" || widget.type == null)
				{
				var widgetName = widget.widget;

				var ns = window;
				while (widgetName.indexOf('.') > 0)
					{
					var nsName = widgetName.substr(0, widgetName.indexOf('.'));
					ns = ns[nsName];
					widgetName = widgetName.substr(widgetName.indexOf('.') + 1);
					}

				if (widget.element == undefined)
					{
					this.widgets[name] = new ns[widgetName]($('<div/>'), widget.config);
					}

				if (typeof widget.element == 'string')
					{
					this.widgets[name] = new ns[widgetName]('#' + widget.element, widget.config);
					}
				if (widget.element instanceof jQuery)
					{
					this.widgets[name] = new ns[widgetName](widget.element, widget.config);
					}
				}

			if (widget.type == "jui")
				{
				var widgetName = widget.widget;
				$("#" + widget.element)[widgetName](widget.config);
				}
			return this.widgets[name];
			},

		registrateWidget: function (name, widget, options, afterInit)
			{
			//if (this.widgets[name] != null)
			//	{
			//	//this.log("warning", "widget with name " + name + " already registered");
			//	name += this.widgetsConfig.length;
			//	}
			this.widgetsConfig[name] = widget;

			if (this.page instanceof Page)
				{
				if (this.page.pageIsInit)
					{
					var widget = this.initWidget(name, widget, options);
					if (typeof afterInit == 'function')
						{
						afterInit(widget);
						}
					}
				}
			},

		registrateWidgetByRepresent: function (represent, name, getData, options, afterInit)
			{
			$.ajax(
				{
					url: "/represent/get-widget-config?represent=" + represent,
					type: "GET",
					data: getData,
					cache: false,
					widgetName: name,
					widgetOptions: options,
					afterInit: afterInit,
					app: this,
					success: this.loadWidgetConfigSuccess,
					error: this.getDictError
				});
			},

		loadWidgetConfigSuccess: function (data)
			{
			//warning: another context! this = jqxhr, this.app = app, this.widgetName = widgetName
			this.app.registrateWidget(this.widgetName, data, this.widgetOptions, this.afterInit);
			},

		log: function (level, message)
			{
			if (this.logLevels[level] >= this.logLevels[this.logLevel])
				{
				console.log("app " + this.logLevels[level] + " : " + message);
				}
			},


		// dictionary functionality

		getDict: function (nameOrConfig)
			{
			if (typeof nameOrConfig === 'string')
				{
				return this.getDictByName(nameOrConfig);
				}
			if (typeof nameOrConfig === 'object')
				{
				return this.getDictByConfig(nameOrConfig);
				}
			return null;
			},

		getDictByName: function (name)
			{
			if (this.dicts != undefined)
				{
				return this.dicts[name];
				}
			return null;
			},

		getDictByConfig: function (dictConfig)
			{
			var dict = null;
			if (this.dicts != undefined)
				{
				dict = this.getDictByName(dictConfig.dictName);
				}
			if (dict == null || dictConfig.cache == false)
				{
				dict = this.getDictByUrl(dictConfig);
				}
			dict = this.addDictNullElement(dict, dictConfig);
			return dict;
			},

		getDictError: function ()
			{
			//this.app.log("error", "dictionary didn't find!");
			$(document).ajaxError(function (event, jqxhr, settings, thrownError)
			{
			console.log(thrownError);
			});
			},

		getDictByUrl: function (dictConfig)
			{
			if (dictConfig.dictUrl == undefined)
				{
				return null;
				}
			if (dictConfig.dictName == undefined)
				{
				dictConfig.dictName = dictConfig.dictUrl;
				}

			var url = dictConfig.dictUrl;
			if (dictConfig.dictUrlData != null)
				{
				var offset = 0;
				while (url.indexOf('`', offset) > -1)
					{
					var begin = url.indexOf('`', offset) + 1;
					var end = url.indexOf('`', begin);

					if (url.length - 1 > begin && begin < end)
						{
						var index = url.substring(begin, end);
						if (dictConfig.dictUrlData[index] != undefined)
							{
							var regexp = new RegExp("`" + index + "`", 'g');
							url = url.replace(regexp, dictConfig.dictUrlData[index]);
							}
						}
					offset = begin + 1;
					}
				}
			$.ajax(
				{
					url: url,
					type: "GET",
					cache: false,
					async: false,
					dictConfig: dictConfig,
					//app: this,
					success: $.proxy(this.getDictByUrlSuccess, this, dictConfig.dictName),
					error: this.getDictError
				});
			return this.getDictByName(dictConfig.dictName);
			},

		getDictByUrlSuccess: function (name, data)
			{
			this.saveDict(data, name);
			},

		addDictNullElement: function (data, dictConfig)
			{
			if (dictConfig.allowNull == true)
				{
				var nullValue = {};
				nullValue[dictConfig.dictIdIndex] = this.nullSymbol;
				nullValue[dictConfig.dictDisplayIndex] = this.nullSymbol;

				if (dictConfig.dictDependIdIndex != undefined)
					{
					nullValue[dictConfig.dictDependIdIndex] = this.nullSymbol;
					}

				var f = 0;
				for (var i in data)
					{
					if (data[i][dictConfig.dictIdIndex] == nullValue[dictConfig.dictIdIndex])
						{
						f = 1;
						}
					}
				if (f == 0)
					{
					data.push(nullValue);
					}
				}
			return data;
			},

		saveDict: function (dict, name) //as name can be send dictConfig or name in string format
			{
			if (this.dicts == undefined)
				{
				this.dicts = {};
				}
			if (name == undefined || name == '' || name == null)
				{
				name = this.generateDictName();
				this.dicts[name] = dict;
				return name;
				}
			if (typeof name === 'string')
				{
				this.dicts[name] = dict;
				}
			else if (typeof name === 'object')
				{
				dict = this.addDictNullElement(dict, name);
				var index = '';
				if (dictConfig.dictName != undefined)
					{
					index = dictConfig.dictName;
					}
				else if (dictConfig.dictIndex != undefined)
					{
					index = dictConfig.dictIndex;
					}
				if (index != '')
					{
					this[index] = dict;
					}

				}
			else
				{
				//error event
				}
			},

		generateDictName: function ()
			{
			var text = '';
			var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
			for (var i = 0; i < 10; i++)
				{
				text += possible.charAt(Math.floor(Math.random() * possible.length));
				}
			return text;
			},

		saveDicts: function (dicts)//, names)
			{
			MK.each(dicts,
				function (index, value)
				{
				this.saveDict(index, value);
				}, this);
			//for(var i in dicts)
			//    {
			//    this.saveDict(dicts[i], names[i]);
			//    }
			},


		//popup global functionality


		getCascadeLevel: function (element, isCascade)
			{
			if (isCascade == true)
				{
				this.cascadeLevel++;
				}
			this.popupZindex++;
			this.positionElement = element;
			this.trigger('cascade-changed');
			return {
				level: this.cascadeLevel,
				Zindex: this.popupZindex,
				opacity: this.basicOpasity,
				indent: [0, 0],
				element: $('body')
			};
			},

		closeLevel: function (isCascade)
			{
			if (isCascade == true)
				{
				this.cascadeLevel--;
				}
			this.popupZindex--;
			this.trigger('cascade-changed');
			},

		updateCascadeInfo: function (level)
			{
			var opacity = this.getNewOpacity(level),
				indent = this.getNewIndent(level),
				element = this.cascadeLevel - level > 0 ? this.positionElement : $('body'),
				first = this.cascadeLevel - level == 0 ? true : false;
			;

			return {'indent': indent, 'element': element, 'opacity': opacity, 'first': first};
			},

		getNewOpacity: function (level)
			{
			return this.basicOpasity * Math.pow(this.opacityStep, (this.cascadeLevel - level));
			},

		getNewIndent: function (level)
			{
			var deltaLevel = this.cascadeLevel - level;
			return [this.indent[0] * deltaLevel, this.indent[0] * deltaLevel];
			},

		getMaxPopupZindex: function ()
			{
			this.popupZindex++;
			return this.popupZindex;
			},

		decrementPopupZindex: function ()
			{
			this.popupZindex--;
			}
	});

var Page = Class(
	{
		extends: Matreshka,
		pageIsInit: false,

		constructor: function ()
			{
			},

		initPage: function ()
			{

			}
	});


var Entity = Class({
		extends: MK,
		options: new Object(),
		docsLevel: 'none', //none, trace, debug, profile

		constructor: function (options)
			{
			this.setOptions(options);

			this.initDocsFunctions();
			},

		setOptions: function (options)
			{
			this.options = Entity.assignObject(this.options, options);
			this.optionsPattern = jQuery.extend(true, {}, options);

			if (this.options.context != undefined)
				{
				this.options = this.applyContext(this.options, this.options.context);

				this.on('options@change:context', this.reApplyContext);
				}
			},

		applyContext: function (options, context)
			{
			var configStr = JSON.stringify(options);
			var offset = 0;
			while (configStr.indexOf('`', offset) > -1)
				{
				var begin = configStr.indexOf('`', offset) + 1;
				var end = configStr.indexOf('`', begin);

				if (configStr.length - 1 > begin && begin < end)
					{
					var index = configStr.substring(begin, end);
					if (context[index] != undefined)
						{
						var regexp = new RegExp("`" + index + "`", 'g');
						configStr = configStr.replace(regexp, context[index]);
						}
					}
				offset = begin + 1;
				}
			var newOptions = JSON.parse(configStr);

			return newOptions;
			},

		reApplyContext: function ()
			{
			this.options = jQuery.extend(true, {}, this.optionsPattern);

			this.options = this.applyContext(this.options, this.options.context);
			},

		initDocsFunctions: function ()
			{
			if (this.docsLevel != 'none')
				{
				for (var i in this)
					{
					if (typeof this[i] === 'function')
						{
						this[i] = this.callEvent(this[i], this.callStartSlot, this.callFinishSlot);
						}
					}
				}
			},

		callEvent: function (func, startCallback, finishCallback)
			{
			return function ()
				{
				var args = [].slice.call(arguments);
				var result;
				try
					{
					startCallback(args, this);
					result = func.apply(this, arguments);
					finishCallback(result, args, this);
					}
				catch (e)
					{
					throw e;
					}
				return result;
				}
			},

		callStartSlot: function(args, context)
			{
			console.log('startCall');
			},
		callFinishSlot: function(result, args, context)
			{
			console.log('finishCall');
			},

	},
	{
		assignObject: function (targetObject, object)
			{
			var result = {};
			result = Object.assign(result, targetObject);
			for (var key in object)
				{
				if (object[key] instanceof HTMLElement || object[key] instanceof EventTarget || object[key] instanceof jQuery || object[key] instanceof Matreshka || typeof object[key] == 'function' || moment.isMoment(object[key]))
					{
					result[key] = object[key];
					}
				else
					{
					if (!(object[key] instanceof Object) || (object[key] instanceof Array))
						{
						result[key] = object[key];
						}
					else
						{

						var target = {};
						if (result[key] != undefined)
							{
							target = targetObject[key]
							}
						result[key] = Entity.assignObject(target, object[key]);
						}
					}

				}
			return result;
			}
	});


var MKWidget = Class({
		extends: Entity,
		options: new Object(),

		constructor: function (elementSelector, options)
			{
			Entity.prototype.constructor.apply(this, [options]);

			if (elementSelector instanceof jQuery)
				{
				this.element = elementSelector;
				}
			else
				{
				this.elementSelector = elementSelector;
				this.element = $(elementSelector);
				}
			},

		destructor: function ()
			{
			this.off();
			}
	}
);

var WidgetInterface = Class({
	extends: MK,
	widget: null,
	enabled: false,
	eventsEnabled: false,

	constructor: function (widget, enable)
		{
		this.widget = widget;
		this.enable = enable;

		if (this.enable)
			{
			this.create();
			}
		},

	create: function ()
		{
		this.turnOn();
		this.widget.on('reset-interfaces', this.reset, this);
		},

	turnOn: function ()
		{
		this.enabled = true;
		},
	turnOff: function ()
		{
		this.enabled = false;
		},
	reset: function ()
		{
		this.turnOff();
		this.turnOn();
		},
	turnOnEvents: function ()
		{
		this.eventsEnabled = true;
		},
	turnOffEvents: function ()
		{
		this.eventsEnabled = false;
		},
	resetEvents: function ()
		{
		this.turnOffEvents();
		this.turnOnEvents();
		}
});
