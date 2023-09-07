
const CLASS = {
	DIAGNOSTIC: "wc-fieldindicator",
	TYPE_SUFFIX: "-type-",
	MESSAGE: "wc-message"
};

const diagnosticSelector = `span.${CLASS.DIAGNOSTIC}`;
const messageSelector = `${diagnosticSelector} > span.${CLASS.MESSAGE}`;

const diagnostic = {
	/**
	 * Describes the types of diagnostic widget available.
	 * @constant
	 * @type {Object}
	 * @public
	 */
	LEVEL: {
		"ERROR": 1,
		"WARN": 2,
		"INFO": 4,
		"SUCCESS": 8
	},

	/**
	 * Gets the string extension applied to the id of an element when creating its diagnostic box. This should not be widely used but must be
	 * public for use in {@link module:wc/ui/feedback}.
	 * @function
	 * @public
	 * @param {number} [level=1] the diagnostic box level
	 * @returns {String} an extension appropriate to the level
	 */
	getIdExtension: function (level) {
		const baseExtension = "_err";
		if (!level || level === this.LEVEL.ERROR) {
			return baseExtension;
		}
		switch (level) {
			case this.LEVEL.WARN:
				return "_wrn";
			case this.LEVEL.INFO:
				return "_nfo";
			case this.LEVEL.SUCCESS:
				return "_scc";
			default:
				return baseExtension;
		}
	},

	/**
	 * Get the HTML class attribute which defines a diagnostic box.
	 * @function
	 * @public
	 * @param {number} [level] the severity level, one of {@link module:wc/dom/diagnostic.LEVEL} if not set then get the basic diagnostic box class
	 * @returns {String} the value of the HTML class attribute for the required diagnostic box.
	 */
	getBoxClass: function (level) {
		const baseClass = CLASS.DIAGNOSTIC;
		if (!level) {
			return baseClass;
		}
		const levelClass = baseClass + CLASS.TYPE_SUFFIX;
		switch (level) {
			case this.LEVEL.ERROR:
				return levelClass + "error";
			case this.LEVEL.WARN:
				return levelClass + "warn";
			case this.LEVEL.INFO:
				return levelClass + "info";
			case this.LEVEL.SUCCESS:
				return levelClass + "success";
			default:
				return null;
		}
	},

	getMessageHtml: message => `<span class="${CLASS.MESSAGE}">${message}</span>`,
	/**
	 *
	 * @param {string[]} messages The messages, marked up as you wish (probably with getMessageHtml).
	 * @param targetId What is the diagnostic for
	 * @param level The diagnostic level
	 * @param levelIcon
	 * @return {{html: string, id: string}}
	 */
	getBoxHtml: function (messages, targetId, level, levelIcon) {
		const id = targetId + this.getIdExtension(level);
		const classNames = level ? [this.getBoxClass(), this.getBoxClass(level)] : [this.getBoxClass()];
		const html = `<span id="${id}" class="${classNames.join(" ")}" role="alert" data-wc-dfor="${targetId}">${levelIcon ? 
			`<i aria-hidden="true" class="fa ${levelIcon}"></i>` : ''
		}${messages.join("")}</span>`;
		return { id, html };
	},


	/**
	 * Gets the widget for a generic inline diagnostic box.
	 * @function
	 * @public
	 * @returns {string}
	 */
	getWidget: () => diagnosticSelector,

	/**
	 * Find all the contained diagnostics.
	 * @param {Element} element Will search within the subtree of this element.
	 * @return {HTMLElement[]}
	 */
	getWithin: function (element) {
		if (!element) {
			return [];
		}
		const result = /** @type {NodeListOf<HTMLSpanElement>} */(
			element.querySelectorAll(this.getWidget()));
		return Array.from(result);
	},

	/**
	 * Gets the widget for an inline diagnostic's message(s).
	 * @function
	 * @public
	 * @returns {string}
	 */
	getMessage: () => messageSelector,

	/**
	 * Gets the widget for an inline diagnostic box of a particular severity level.
	 * @function
	 * @public
	 * @param {number} [level] the severity level, one of {@link module:wc/dom/diagnostic.LEVEL} if not set then test for any diagnostic level
	 * @returns {string}
	 */
	getByType: function (level) {
		if (!level) {
			return diagnosticSelector;
		}
		switch (level) {
			case this.LEVEL.ERROR:
				return `${diagnosticSelector}.${this.getBoxClass(this.LEVEL.ERROR)}`;
			case this.LEVEL.WARN:
				return `${diagnosticSelector}.${this.getBoxClass(this.LEVEL.WARN)}`;
			case this.LEVEL.INFO:
				return `${diagnosticSelector}.${this.getBoxClass(this.LEVEL.INFO)}`;
			case this.LEVEL.SUCCESS:
				return `${diagnosticSelector}.${this.getBoxClass(this.LEVEL.SUCCESS)}`;
			default:
				return null;
		}
	},

	/**
	 * Indicates if an element is an inline diagnostic message box.
	 * @function
	 * @public
	 * @param {Element} element the element to test
	 * @param {instance.LEVEL} [level] the severity level, one of {@link module:wc/dom/diagnostic.LEVEL} if not set then test for any diagnostic level
	 * @returns {Boolean}
	 */
	isOneOfMe: function (element, level) {
		if (!element) {
			return false;
		}
		if (!level) {
			return element.matches(diagnosticSelector);
		}
		const widget = this.getByType(level);
		if (widget) {
			return element.matches(widget);
		}
		return false;
	},

	/**
	 * Indicates if an element is a message within an inline diagnostic message box.
	 * @function
	 * @public
	 * @param {Element} element the element to test
	 * @param {module:wc/dom/diagnostic.LEVEL} [level] the severity level, one of {@link module:wc/dom/diagnostic.LEVEL} if not set then test for any diagnostic level
	 * @returns {Boolean}
	 */
	isMessage: function (element, level) {
		if (!(element && element.nodeType === Node.ELEMENT_NODE)) {
			return false;
		}
		// firstly, do we even have a message?
		const message = element.matches(this.getMessage());
		// if we don't have a message _or_ we don't care what type just return what we have
		if (!(message && level)) {
			return message;
		}
		const widget = this.getByType(level);
		if (!widget) {
			return false;
		}
		if (widget === diagnosticSelector) {
			// we have already checked for an un-typed diagnostic message, so just return it.
			return message;
		}
		// if we get here we have a diagnostic message _and_ we want a message of a particular type
		// so we need to check the message's diagnostic ancestor.
		return !!element.closest(widget);
	},

	/**
	 * Get the diagnostic level (e.g. LEVEL.ERROR) for a given diagnostic box.
	 * @function
	 * @public
	 * @param {Element} diag the box to test
	 * @throws {TypeError} if `diag` is not a diagnostic box
	 * @returns {module:wc/dom/diagnostic.LEVEL|Number} the diagnostic level from module:wc/dom/diagnostic.LEVEL or -1 if not found
	 */
	getLevel: function (diag) {
		if (!diag?.matches(diagnosticSelector)) {
			throw new TypeError("Argument must be a diagnostic box");
		}
		for (let lvl in this.LEVEL) {
			if (this.LEVEL.hasOwnProperty(lvl) && this.isOneOfMe(diag, this.LEVEL[lvl])) {
				return this.LEVEL[lvl];
			}
		}
		return -1;
	},

	/**
	 * Get the target element of a diagnostic message box.
	 * @function
	 * @public
	 * @param {Element} diag the diagnostic box
	 * @returns {HTMLElement} the target element of the diagnostic box
	 */
	getTarget: function (diag) {
		if (!(diag && diag.nodeType === Node.ELEMENT_NODE && diag.matches(diagnosticSelector))) {
			return null;
		}

		const targetId = diag.getAttribute("data-wc-dfor");
		if (targetId) {
			return document.getElementById(targetId);
		}
		return null;
	}
};

export default diagnostic;
