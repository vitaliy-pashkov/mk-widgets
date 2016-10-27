var MKWidgets = MKWidgets || {};
MKWidgets.HcPlotNS = MKWidgets.HcPlotNS || {};

MKWidgets.HcPlot = Class({
	extends: MKWidget,

	constructor: function (elementSelector, options)
		{
		MKWidget.prototype.constructor.apply(this, [elementSelector, options]);

		this.setOptions({
			dataSource: "remote", //local, remote
			dtFormat: 'DD.MM.YYYY HH:mm:ss',
			dataParams: null,
			plotConfig: {
				title: {
					text: 'title 1'
				},
				series: [
					//{
					//type: 'area',
					//name: '',
					//data: [] url or $data
					//},
				]
			},
			title: 'title',

		});
		this.setOptions(options);

		this.setHighchartsOptions();
		this.initPlotDefaultConfig();

		this.plotConfig = jQuery.extend(true, {}, this.options.plotConfig);
		this.plotConfig = Entity.assignObject(this.plotDefaultConfig, this.plotConfig);

		this.on("one-data-ready", this.oneDataReadySlot);
		this.on("data-ready", this.createDom);
		this.getData();
		},

	oneDataReadySlot: function()
		{
		var f = 1;
		for(var i in this.plotConfig.series)
			{
			if(this.plotConfig.series[i].dataReady != true)
				{
				f=0;
				}
			}
		if(f==1)
			{
			this.trigger('data-ready');
			}
		},

	createInterfaces: function ()
		{

		},

	getData: function getData()
		{
		if (this.options.dataSource == "remote")
			{
			for(var i in this.plotConfig.series)
				{
				if(this.plotConfig.series[i].data != undefined && this.plotConfig.series[i].type!='errorbar')
					{
					$.ajax(
						{
							url: this.plotConfig.series[i].data,
							data: this.options.dataParams,
							type: "GET",
							cache: false,
							contentType: "application/json",
							widget : this,
							seriesIndex: i,
							success: this.setData,
							error: this.serverError,
						});
					}
				else
					{
					this.plotConfig.series[i].dataReady = true;
					this.trigger("data-ready");
					}
				}
			}
		if (this.options.dataSource == "local")
			{
			this.trigger("data-ready");
			}
		},

	setData: function setData(data)
		{
		//warning: another context! this = jqxhr, this.series = series

		if(data.points.length == 0 && this.widget.plotConfig.series.length == 1)
			{
			this.widget.element.addClass("plot-dummy").text("Нет данных за указанный период.");
			return;
			}

		this.widget.element.removeClass("plot-dummy");

		this.widget.plotConfig.series[this.seriesIndex].data = data.points;
		this.widget.plotConfig.series[this.seriesIndex].name = data.name;

		if(data.errors != undefined)
			{
			this.widget.plotConfig.series[parseInt(this.seriesIndex)+1].data = data.errors;
			}

		if(Array.isArray(this.widget.plotConfig.yAxis) )
			{
			var yAxisIndex = 0;
			if(this.widget.plotConfig.series[this.seriesIndex].yAxis != undefined)
				{
				yAxisIndex = this.widget.plotConfig.series[this.seriesIndex].yAxis;
				}
			if(this.widget.plotConfig.yAxis[yAxisIndex].labels == undefined)
				{
				this.widget.plotConfig.yAxis[yAxisIndex].labels = {format: '{value} ' + data.unit};
				}
			else
				{
				this.widget.plotConfig.yAxis[yAxisIndex].labels.format = '{value} ' + data.unit;
				}
			this.widget.plotConfig.yAxis[yAxisIndex].title = {text: data.name} ;
			}
		else
			{
			this.widget.plotConfig.yAxis.labels.format = '{value} ' + data.unit;
			}


		if(Array.isArray(this.widget.plotConfig.xAxis) )
			{
			var xAxisIndex = 0;
			if(this.widget.plotConfig.series[this.seriesIndex].xAxis != undefined)
				{
				xAxisIndex = this.widget.plotConfig.series[this.seriesIndex].xAxis;
				}

			if(this.widget.plotConfig.xAxis[xAxisIndex]['min-max'] != undefined)
				{
				var minMax = this.widget.plotConfig.xAxis[xAxisIndex]['min-max'].split(' - ',2);
				var min = moment(minMax[0], this.widget.options.dtFormat).valueOf() + 25200000; //+7 h
				var max = moment(minMax[1], this.widget.options.dtFormat).valueOf() + 25200000; //+7 h
				if(minMax[1] == undefined)
					{
					var max = min + 25200000 * 3; //+7 h
					}

				this.widget.plotConfig.xAxis[xAxisIndex].min = min;
				this.widget.plotConfig.xAxis[xAxisIndex].max = max;
				}
			}
		else
			{
			if(this.widget.plotConfig.xAxis['min-max'] != undefined)
				{
				var minMax = this.widget.plotConfig.xAxis['min-max'].split(' - ',2);
				var min = moment(minMax[0], this.widget.options.dtFormat).valueOf() + 25200000; //+7 h
				var max = moment(minMax[1], this.widget.options.dtFormat).valueOf() + 25200000; //+7 h
				if(minMax[1] == undefined)
					{
					var max = min + 25200000 * 3; //+7 h
					}

				this.widget.plotConfig.xAxis.min = min;
				this.widget.plotConfig.xAxis.max = max;
				}
			}


		this.widget.plotConfig.series[this.seriesIndex].dataReady = true;
		this.widget.trigger('one-data-ready');
		},

	serverError: function serverError(error)
		{
		alert("error: " + JSON.stringify(error));
		},

	createDom: function()
		{


		//this.plotConfig.yAxis.labels.format = '{value} ' + 'unit'; //

		this.element.addClass('tusur-csp-hc-plot-element');
		this.element.highcharts(this.plotConfig);
		this.chart = this.element.highcharts();
		this.redrawPlot();

		app.on('mkw_resize', $.proxy(this.redrawPlot, this));

		this.trigger('plot-ready');
		},

	redrawPlot: function redrawPlot(event)
		{
		if(event!= undefined && event.type=='custom_resize')
			{
			event.stopPropagation();
			}

		this.chart = this.element.highcharts();
		if (this.chart != undefined)
			{
			var width = this.element.width();
			if(width > 0)
				{
				this.chart.setSize(width, 400, false);
				}
			}
		},

	destroy: function()
		{
		if(this.chart != undefined)
			{
			this.chart.destroy();
			}

		this.element.empty();
		delete this;
		},

	setHighchartsOptions: function ()
		{
		Highcharts.setOptions({
			lang: {
				weekdays: ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'],
				shortMonths: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'],
			},
			chart: {
				style: {
					fontFamily: 'GothamPro',
				},
				backgroundColor: "#FDFDFD",
				plotBackgroundColor: '#FDFDFD'
			}
		});
		},

	initPlotDefaultConfig:function()
		{
		this.plotDefaultConfig = {
			title: {
				text: "",
				style: {"font-weight": "bold"}
			},
			chart: {
				zoomType: 'x',
				backgroundColor: "#FDFDFD",
				plotBackgroundColor: '#FDFDFD',
				animation: false,
			},
			xAxis: {
				type: 'datetime'
			},
			yAxis: {
				title: {
					text: ''
				},
				labels: {
					format: '{value}'
				}
			},
			legend: {
				enabled: false
			},
			plotOptions: {
				area: {
					fillColor: {
						linearGradient: {
							x1: 0,
							y1: 0,
							x2: 0,
							y2: 1
						},
						stops: [
							[0, Highcharts.getOptions().colors[0]],
							[1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
						]
					},
					marker: {
						radius: 4
					},
					lineWidth: 1,
					states: {
						hover: {
							lineWidth: 1
						}
					},
					threshold: null,

				},
				series: {
					animation: false
				}
			},
			series: [
				//{
				//	type: 'area',
				//	name: '',
				//	data: null
				//}
			]
		}
		},
});