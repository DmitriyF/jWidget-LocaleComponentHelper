/*!
	LocaleComponentHelper for jWidget

	Copyright (C) 2016 DmitriyF

	This program is free software: you can redistribute it and/or modify
	it under the terms of the GNU Lesser General Public License as published by
	the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.

	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU Lesser General Public License for more details.

	You should have received a copy of the GNU Lesser General Public License
	along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/


/**
 * [Bind Localization For JW.UI.Component
 * 	Use in afterAppend Only
 * ]
 * @param {[type]} config [
 *    localePlugin: JW.Plugins.Locale
 *    sublocale? : string, Optional
 *    scope: JW.UI.Component
 *    el: rootElement from JW.UI.Component (gets from scope.el by default). Optional
 *    localizedElements : Array with objects {
 *        jwid: jwid of element
 *        aliasName?: name from localization, Optional
 *        isAutoUpdate? : update Field if language changed (false by default), Optional,
 *        isIgnoreSublocale?: use Global Locale, Optional
 *    }
 * ]
 */

JW.Plugins.DF = JW.Plugins.DF || {};
JW.Plugins.DF.LocaleComponentHelper = function(config) {
	JW.Plugins.DF.LocaleComponentHelper._super.call(this);
	this.config                = {};
	this.externalLocalePlugin  = null; // JW.Plugins.Locale
	this._localePlugin         = null; // JW.Plugins.Locale
	this.scope                 = null; // JW.UI.Component
	this.sublocale             = null; // String, might be empty
	this.el                    = null; // this.scope.el by defaut
	this._localizedElements    = [];

	if (this._validateConfig(config)) {
		this._ininialize();
	}
};

JW.extend(JW.Plugins.DF.LocaleComponentHelper, JW.Class, {
	asyncHtmlTag : "data-localized",
	syncHtmlTag : "data-localized-sync",

	_validateConfig: function(config) {
		this.config = config || {};
		if (config.localePlugin) {
			this.externalLocalePlugin = this.config.localePlugin;
		} else {
			Console.error("Language [config.localePlugin] Plugin is not defined");
			return false;
		}

		this.sublocale = this.config.sublocale || "";

		if (this.config.scope) {
			this.scope = this.config.scope;
			this.el = this.config.el || this.scope.el;
		} else {
			Console.error("JW.UI.Component [config.localePlugin] is not defined");
			return false;
		}

		this._localePlugin = (this.sublocale) ? this.externalLocalePlugin.getSubLocale(this.sublocale) : this.externalLocalePlugin;
		this._localizedElements = this.config.localizedElements || [];

		return true;
	},

	_ininialize: function() {
		var asynkLocalizationEl = this.el.find("[" + this.asyncHtmlTag + "]");
		var synkLocalizationEl = this.el.find("[" + this.syncHtmlTag + "]");

		this._bindAction(asynkLocalizationEl, this._bindAsyncElement);
		this._bindAction(synkLocalizationEl, this._bindSyncElement);
		this._bindCustomAction();
	},

	_bindAction: function(array, bindFunc) {
		for (var i = 0; i < array.length; i++) {
			var item = $(array[i]);
			var aliasName = this._getAliasName(item);
			if (aliasName) {
				bindFunc.call(this, item, this._localePlugin, aliasName);
			} else {
				this._showWarning("Localization alias not found for the element", item);
			}
		}
	},

	_bindCustomAction: function() {
		JW.Array.each(this._localizedElements, this._bindCustomElement, this);
	},

	_bindCustomElement: function(item) {
		if (!item.jwid) {
			this._showWarning("Element name [jwid] not found", item);
			return;
		}

		var aliasName = (item.aliasName) ? item.aliasName : JW.String.camel(item.jwid);
		var localePlugin = (item.isIgnoreSublocale) ? this.externalLocalePlugin : this._localePlugin;
		var element = this.scope.getElement(item.jwid);

		if (item.isAutoUpdate) {
			this._bindSyncElement(element, localePlugin, aliasName);
		} else {
			this._bindAsyncElement(element, localePlugin, aliasName);
		}
	},

	_bindAsyncElement: function(el, localePlugin, aliasName) {
		el.text(localePlugin.getString(aliasName));
	},

	_bindSyncElement: function(el, localePlugin, aliasName) {
		var text = this.scope.own(localePlugin.getProperty(aliasName));
		this.scope.own(el.jwtext(text));
	},

	_getAliasName: function(el) {
		return el.attr(this.asyncHtmlTag) || el.attr(this.syncHtmlTag);
	},

	_showWarning: function(message, item) {
		console.warn(message);
		console.warn(item);
		console.warn("______________________");
	}
});
