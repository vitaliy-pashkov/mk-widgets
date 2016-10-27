var MKWidgets = MKWidgets || {};

MKWidgets.FileLoader = Class({
		extends: MKWidget,
	},
	{
		load: function (fileName, data)
			{
			var domLink = $('<a/>');
			$('body').append(domLink);
			domLink.attr('download', fileName);
			domLink.attr('href', data);
			domLink[0].click();
			domLink.remove();
			}
	}
);