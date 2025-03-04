import sprintf from "wc/string/sprintf.mjs";
import wcconfig from "wc/config.mjs";
import mixin from "wc/mixin.mjs";
import ajax from "wc/ajax/ajax.mjs";
import resource from "wc/loader/resource.mjs";
import i18next from 'i18next';

/**
 *
 * @param key
 * @param args
 * @return {string|string[]}
 */
const noop = function(key, ...args) {
		console.warn("Calling i18n before inited ", key, args);
		return "";
	},
	GOOG_RE = /^(.+)-x-mtfrom-(.+)$/;

let initingPromise;

/**
 * Manages the loading of i18n "messages" from the relevant i18n "resource bundle".
 *
 * WARNING i18n depends on at least one asynchronously loaded resource (the message bundle).
 * If you try to use it before async resources have loaded "stuff" will break.
 *
 * The easiest way to solve this is to call the async "translate" method, unfortunately
 * this means the calling method is async too and this can quickly branch out into EVERYTHING
 * being async.
 *
 * Alternatively ensure you do not use i18n "too early".
 * If you register with "wc/dom/initialise" you should be fine, though if you use i18n in the "preInit" phase,
 * it may cause a race because that's where i18n does its own initialization.
 */
const instance = {
	/**
	 * This will be set to something useful when is inited.
	 * @deprecated Use translate method instead.
	 */
	get: noop,

	/**
	 * Gets an internationalized string/message from the resource bundle.
	 *
	 * @function module:wc/i18n/i18n.get
	 * @public
	 * @param {String|String[]} key A message key, i.e. the key of an i18n key/value pair.
	 *    If an array is provided then each item is taken to be a key. The promise will be resolved with
	 *    an array of translations in the order they appeared in the key array.
	 *    Each key will be passed the same arguments, it probably mainly makes sense when there are no args.
	 * @param {...any} [args] additional arguments will be used to printf format the string before it is
	 *    returned. Note: It's up to the caller to ensure the correct args (type, number etc...) are passed to
	 *    printf formatted messages.
	 * @returns {Promise<string|string[]>} resolved with {String} The message value, i.e. the value of an i18n key/value pair.
	 *     If not found will return an empty string.
	 */
	translate: function(key, ...args) {
		if (this.get !== noop) {
			return Promise.resolve(this.get(key, ...args));
		}
		return this.initialize().then(() => {
			return this.get(key, ...args);
		});
	},

	/**
	 * The language to use when no preference has been explicitly specified.
	 * In the unlikely event this ever needs to be changed bear in mind the server
	 * side i18n also has a similar hardcoded setting.
	 */
	_DEFAULT_LANG: "en",

	/**
	 * Determine the language of the document.
	 * @param {HTMLElement} [element] Optionally provide a context element which will take precedence over the documentElement.
	 * @returns {String} the current document language.
	 */
	_getLang: function(element) {
		/*
		 * Handles a special case for Google Translate, full details here: https://github.com/BorderTech/wcomponents/issues/994
		 * Format is: toLang-x-mtfrom-fromLang
		 */
		let result;
		if (element) {
			result = element.lang;
		}
		if (!result && globalThis.document) {
			const docElement = globalThis.document.documentElement;
			if (docElement) {
				result = docElement.lang;  // should we consider xml:lang (which takes precedence over lang)?
			}
		}
		if (!result) {
			result = this._DEFAULT_LANG;
		} else {
			const googParsed = GOOG_RE.exec(result);
			result = googParsed ? googParsed[1] : result;
		}
		return result;
	},
	/**
	 * Initialize this module.
	 * @param {Object} [config] Configuration options, if provided FORCES initialize even if it has already run.
	 * @returns {Promise} resolved when COMPLETELY initialized.
	 */
	initialize: function(config) {
		const conf = config || wcconfig.get("wc/i18n/i18n") || {};
		if (initingPromise) {
			return initingPromise;
		}
		const done = () => initingPromise = null;
		initingPromise = initI18next(i18next, conf).then(translate => {
			if (translate) {
				this.get = translatorFactory(translate);
				return translate;
			}
		});
		initingPromise.catch(done);
		return initingPromise.then(done);
	}
};

function translatorFactory(funcTranslate) {
	/**
	 * Gets an internationalized string/message from the resource bundle.
	 *
	 * @function module:wc/i18n/i18n.get
	 * @public
	 * @param {String} key A message key, i.e. the key of an i18n key/value pair.
	 * @param {...any} [args] additional arguments will be used to printf format the string before it is
	 *    returned. Note: It's up to the caller to ensure the correct args (type, number etc...) are passed to
	 *    printf formatted messages.
	 * @returns {String} The message value, i.e. the value of an i18n key/value pair. If not found will return an empty string.
	 */
	function translator(key, ...args) {
		let result;
		if (Array.isArray(key)) {
			result = key.map(nextKey => translator(nextKey, ...args));
		} else {
			result = (key && funcTranslate) ? funcTranslate(key) : "";
			if (result && args.length) {
				const printfArgs = [result].concat(args);
				result = sprintf(...printfArgs);
			}
		}
		return result;
	}
	return translator;
}

/**
 * Provides an XHR backend for i18next (one that works on PhantomJS).
 * All public methods implement the i18next backend interface, see i18next documentation (if you can find any).
 */
const backend = {
	type: "backend",

	init: function(services, backendOptions /* , i18nextOptions */) {
		this.services = services;
		this.options = backendOptions;
	},

	read: function(language, namespace, callback) {
		let cacheBuster = this.options.cachebuster || "";
		let url = this.services.interpolator.interpolate(this.options.loadPath, { lng: language, ns: namespace });
		if (cacheBuster) {
			cacheBuster = "?" + cacheBuster;
			if (url.indexOf(cacheBuster) < 0) {  // requirejs will probably have added the cachebuster
				url += cacheBuster;
			}
		}
		ajax.simpleRequest({
			url,
			cache: true,
			callback: function(response) {
				try {
					const data = JSON.parse(response);
					callback(null, data);
				} catch (ex) {
					console.error(ex);  // It is important not to silently swallow these errors.
					callback(ex, response);
				}
			},
			onError: callback
		});
	}
};

/**
 * Gets i18next options taking into account defaults and overrides provided by the caller.
 * @function
 * @private
 * @param {Object} i18nConfig Override default options by setting corresponding properties on this object.
 */
function getOptions(i18nConfig={}) {
	const basePath = i18nConfig.basePath || resource.getResourceUrl(),
		currentLanguage = instance._getLang(),
		cachebuster = resource.getCacheBuster(),
		nsResource = "{{ns}}/{{lng}}.json" + (cachebuster ? "?" + cachebuster : ""),
		defaultOptions = {
			load: "currentOnly",
			initImmediate: true,
			lng: currentLanguage,
			fallbackLng: instance._DEFAULT_LANG,
			backend: {
				loadPath: basePath + nsResource
			}
		};
	let result = mixin(defaultOptions, {});
	result = mixin(i18nConfig.options, result);
	return result;
}

/**
 * Initialize the underlying i18next instance.
 * @function
 *
 * @param {typeof i18next} engine The instance of i18next to initialize.
 * @param config Configuration options.
 * @return {Promise} when initialized
 */
function initI18next(engine, config) {
	return new Promise((win, lose) => {
		const options = getOptions(config);
		try {
			// `backend` is for unit testing / mocking
			engine.use(config["backend"] || backend).init(options, (err, translate) => {
				if (err) {
					lose(err);
				}
				win(translate);
			});
		} catch (ex) {
			lose(ex);
		}
	});
}

export default instance;
