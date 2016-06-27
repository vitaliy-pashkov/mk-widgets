var MKWidgets = MKWidgets || {};
MKWidgets.XmlExporterNS = MKWidgets.XmlExporterNS || {};

MKWidgets.XmlExporter = Class({
	extends: MKWidget,

	gridData: [],
	excelData: [],

	constructor: function (elementSelector, options)
		{
		MKWidget.prototype.constructor.apply(this, [elementSelector, options]);
		this.setOptions({
			sheets: null,
			returnUri: false,
			title: 'Таблица'
		});
		this.setOptions(options);
		this.init();
		},

	init: function ()
		{
		this.sheets = this.options.sheets;
		this.excelData = this.export(this.convertDataStructureToTable());
		if (this.options.returnUri)
			{
			this.element.attr('download', this.options.title);
			this.element.attr('href', this.excelData);
			return this.excelData;
			}
		else
			{
			window.open(this.excelData);
			}
		},

	getXML: function(options)
		{
		this.setOptions(options);
		this.init();
		},

	convertDataStructureToTable: function ()
		{
		var result = '';
		for (var name in this.sheets)
			{
			var sheet = this.sheets[name];
			result += '<Worksheet ss:Name="' + name + '"><Table>';

			result += '<Row>';
			for (var j in sheet.columns)
				{
				var col = sheet.columns[j];
				result += '<Cell ss:StyleID="header"><Data  ss:Type="String">';
				result += col.headertext;
				result += '</Data></Cell>';
				}
			result += '</Row>';

			for (var j in sheet.data)
				{
				var row = sheet.data[j];
				result += '<Row>';
				for (var k in sheet.columns)
					{
					var col = sheet.columns[k];
					var type = 'String';
					if (this.checknumbr(row[col.datafield]))
						{
						type = 'Number';
						}
					result += '<Cell><Data ss:Type="' + type + '">';
					result += this.stripTags(row[col.datafield].value) || '';
					result += '</Data></Cell>'
					}
				result += '</Row>'
				}
			result += '</Table></Worksheet>';
			}
		return result;
		},

	export: function (data)
		{
		var excelFile = '<?xml version="1.0"?> <Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"  xmlns:o="urn:schemas-microsoft-com:office:office"  xmlns:x="urn:schemas-microsoft-com:office:excel"  xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"  xmlns:html="http://www.w3.org/TR/REC-html40">  <Styles>   <Style ss:ID="Default" ss:Name="Normal">    <Alignment ss:Vertical="Bottom"/>    <Borders/>    <Font ss:FontName="Arial" x:CharSet="204"/>    <Interior/>    <NumberFormat/>    <Protection/>   </Style>   <Style ss:ID="header">    <Font ss:FontName="Arial Cyr" x:CharSet="204" ss:Bold="1"/>   </Style>  </Styles>';
		excelFile += data;
		excelFile += '</Workbook>';

		var uri = 'data:application/vnd.ms-excel;base64,';
		return uri + this.base64(excelFile);
		//return excelFile;
		},

	base64: function (s)
		{
		var test = encodeURIComponent(s);
		var test1 = unescape(test);
		var test2 = decodeURIComponent(test);
		console.log(test1, test2);
		return window.btoa(unescape(encodeURIComponent(s)))
		},

	stripTags: function (input, allowed)
		{
		input += '';
		allowed = (((allowed || '') + '')
			.toLowerCase()
			.match(/<[a-z][a-z0-9]*>/g) || [])
			.join(''); // making sure the allowed arg is a string containing only tags in lowercase (<a><b><c>)
		var tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi,
			commentsAndPhpTags = /<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi;
		return input.replace(commentsAndPhpTags, '')
			.replace(tags, function ($0, $1)
			{
			return allowed.indexOf('<' + $1.toLowerCase() + '>') > -1 ? $0 : '';
			});
		},


	checknumbr: function (x)
		{
		var anum = /(^\d+$)|(^\d+\.\d+$)/;
		if (anum.test(x))
			{
			return true;
			}
		return false;
		},

});


//var xmlExporter = new MKWidgets.XmlExporter($('#exportLink'), {
//	"sheets": {'sheet 1':{
//		"columns": [
//			{
//				"headertext": 'Main 1',
//				"datafield": 'data1',
//			},
//			{
//				"headertext": 'Main 2',
//				"datafield": 'data2',
//
//			},
//			{
//				"headertext": 'Main 3',
//				"datafield": 'data3',
//
//			},
//			{
//				"headertext": 'Main 4',
//				"datafield": 'data4',
//			},
//		],
//		"data": [
//			{
//				"data1": {'value': 'field 1'},
//				"data2": {'value': 'field 2', "style":{
//
//					}},
//				"data3": {'value': 'field 3'},
//				"data4": {'value': 'field 4'},
//			},
//			{
//				"data1": {'value': 'field 5'},
//				"data2": {'value': 'field 6'},
//				"data3": {'value': 'field 7'},
//				"data4": {'value': 'field 8'},
//			},
//
//		]
//	},
//	},
//	returnUri: true
//})
//;
//console.log(xmlExporter);