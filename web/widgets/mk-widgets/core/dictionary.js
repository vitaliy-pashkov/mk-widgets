var MKWidgets = MKWidgets || {};
MKWidgets.DictionaryNS = MKWidgets.DictionaryNS || {};

MKWidgets.Dictionary = Class(
	{
		extends: Entity,

		constructor: function (options)
			{
			Entity.prototype.constructor.apply(this, [options]);
			this.setOptions({
				dictIdIndex: 'id',
				dictDisplayIndex: 'text',
				depend: [], //{object, objectIndex, dictIdIndex}
				getUrl: '',
				getUrlParams: [],
				nullValue: false,
				formIdIndex: undefined,
				formDispalyIndex: undefined,
				data: undefined,
				dataSource: 'local', //local, remote, domSelect
				name: 'dictName'
			});
			this.setOptions(options);

			this.options.formIdIndex = this.options.formIdIndex || this.options.dictIdIndex;
			this.options.formDisplayIndex = this.options.formDisplayIndex || this.options.dictDisplayIndex;

			this.on('data-ready', this.initDict);
			this.loadData();
			},

		loadData: function ()
			{
			if (this.options.dataSource == 'local')
				{
				this.data = MKWidgets.DictionaryNS.DictItems(this, this.options.data);
				}
			else if(this.options.dataSource == 'remote')
				{
				this.getUrl = this.options.getUrl;
				this.getUrlParams = this.options.getUrlParams;

				$.ajax(
					{
						url: this.getUrl,
						data: this.getUrlParams,
						type: "GET",
						cache: false,
						dict: this,
						success: this.loadSuccess,
						error: this.loadError
					});
				}
			},

		loadSuccess: function(dictData)
			{
			//warning: another context! this = jqxhr, this.dict = Dictionary
			this.dict.data = dictData;
			this.dict.trigger('data-ready');
			},

		loadError: function(error)
			{
			alert(JSON.stringify(error));
			},


		initDict: function()
			{
			this.dictItems = MKWidgets.DictionaryNS.DictItems(this, this.data);
			this.trigger('dict-ready');
			}
	}
);

MKWidgets.DictionaryNS.DictItem = Class(
	{
		extends: MK.Object,

		constructor: function (item, dictItems)
			{
			this.jset(item);
			this.dictItems = dictItems;
			}
	}
);

MKWidgets.DictionaryNS.DictItems = Class(
	{
		extends: MK.Array,

		constructor: function (dict, data)
			{
			this.dict = dict;

			this.recreate(data);
			}
	}
);

