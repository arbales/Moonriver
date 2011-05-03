/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/**
A text input control that supports auto-correction and hint text, and has default visual styling. To create an Input:

	{kind: "Input", hint: "type something here", onchange: "inputChange"}

The value property specifies the text displayed in the input.
The onchange event fires only when the input blurs (loses focus).
Listen for the oninput event to get notified as the input content changes.

It is common to use getValue and setValue to get and set the value of an input;
for example, to set the value of one input to that of another:

	buttonClick: function() {
		var x = this.$.input1.getValue();
		this.$.input2.setValue(x);
	}
*/
enyo.kind({
	name: "enyo.Input", 
	kind: enyo.Control,
	published: {
		hint: enyo._$L("Tap Here To Type"),
		value: "",
		// HTML5 'spellcheck' attribute
		spellcheck: true,
		// maps to Mobile Safari 'autocorrect' attribute
		autocorrect: true,
		//* Possible settings: "num-lock", "caps-lock", "shift-lock", "shift-single", "num-single",
		autoKeyModifier: "",
		//* Possible settings: "sentence", "title", "lowercase" (actual attribute is cap +)
		autoCapitalize: "sentence",
		//* Set to true to enable auto-emoticons support
		autoEmoticons: false,
		//* Set to true to enable auto-linking support
		autoLinking: false,
		//* Set to false to disable automatic word completion
		autoWordComplete: true,
		inputType: "",
		//* css class to apply to the inner input control
		inputClassName: "",
		//* css class to apply on focus
		focusClassName: "enyo-input-focus",
		//* css class to apply inner controls to control spacing
		spacingClassName: "enyo-input-spacing",
		/**
		The selection property is an object describing selected text. The start and end properties
		specify the zero-based starting and ending indexes of the selection.
		For example, if an input value is "Value"
		and getSelection returns {start: 1, end: 3} then "al" is selected. To select "alu," call:

			this.$.input.setSelection({start: 1, end: 4});
		*/
		selection: null,
		disabled: false,
		/**
		Set to true to fire the onchange event as well as the oninput event
		whenever the input content is changed.
		*/
		changeOnInput: false,
		/**
		Set to the number of milliseconds to delay the input event when a key is pressed.
		If another key is pressed within the delay interval, the input will be postponed
		and fired once only after the delay has elapsed without a key being pressed.
		*/
		keypressInputDelay: 0,
		//* Set to false to avoid any default styling from being applied
		styled: true,
		//* Set to true to select all text when the input gains focus
		selectAllOnFocus: false
	},
	events: {
		onfocus: "",
		onblur: "",
		onchange: "",
		oninput: "",
		onmousedown: "",
		/** The onkeypress event can be used to filter out disallowed characters.

		*/
		onkeypress: ""
	},
	className: "enyo-input",
	//* @protected
	chrome: [
		{name: "input", flex: 1, kind: enyo.BasicInput, className: "enyo-input-input"}
	],
	clientChrome: [
		{name: "spacer", kind: "HFlexBox", align: "center", components: [
			{name: "client", layoutKind: "HFlexLayout", align: "center"}
		]}
	],
	create: function() {
		this.inherited(arguments);
		this.updateSpacingControl();
		this.disabledChanged();
		this.inputTypeChanged();
		this.valueChanged();
		this.hintChanged();
		this.inputClassNameChanged();
		this.styledChanged();
		this.applySmartTextOptions();
	},
	destroy: function() {
		this.stopInputDelayJob();
		this.inherited(arguments);
	},
	addControl: function(inControl) {
		if (!inControl.isChrome && !this.$.client) {
			this.createChrome(this.clientChrome);
			this.$.input.prepend = true;
			this.$.input.setParent(this.$.spacer);
			this.updateSpacingControl();
		}
		this.inherited(arguments);
	},
	selectAllHandler: function() {
		document.execCommand("selectAll");
	},
	cutHandler: function() {
		document.execCommand("cut");
	},
	copyHandler: function() {
		document.execCommand("copy");
	},
	pasteHandler: function() {
		if (PalmSystem && PalmSystem.paste) {
			PalmSystem.paste();
		}
	},
	mousedownHandler: function(inSender, inEvent) {
		if (inEvent.dispatchTarget != this.$.input) {
			inEvent.preventDefault();
		}
		return this.doMousedown(inEvent);
	},
	focusHandler: function(inSender, inEvent) {
		if (this.styled) {
			this.addClass(this.focusClassName);
		}
		if (this.selectAllOnFocus) {
			this.forceSelect();
		}
		this.doFocus(inEvent);
	},
	blurHandler: function(inSender, inEvent) {
		this.removeClass(this.focusClassName);
		if (this.selectAllOnFocus) {
			document.execCommand("Unselect");
		}
		this.doBlur(inEvent);
	},
	clickHandler: function(inSender, inEvent) {
		this.forceFocus();
		this.doClick(inEvent);
	},
	rendered: function() {
		this.inherited(arguments);
		this.selectionChanged();
	},
	inputClassNameChanged: function() {
		this.$.input.addClass(this.inputClassName);
	},
	inputTypeChanged: function() {
		this.$.input.domAttributes.type = this.inputType;
		if (this.hasNode()) {
			this.$.input.render();
		}
	},
	valueChanged: function() {
		this.$.input.setValue(this.value);
	},
	getDomValue: function() {
		return this.$.input.getDomValue();
	},
	getValue: function() {
		return this.$.input.getValue();
	},
	// dom event handler
	changeHandler: function(inSender, e) {
		if (!this.changeOnInput) {
			this.value = inSender.getValue();
			this.doChange(e, this.value);
		}
		return true;
	},
	inputHandler: function(inSender, e) {
		this.value = inSender.getValue();
		if (this.keypressInputDelay) {
			enyo.job(this.id + "-inputDelay", enyo.bind(this, "doInput", e, this.value), Number(this.keypressInputDelay));
			if (this.changeOnInput) {
				enyo.job(this.id + "-inputDelay", enyo.bind(this, "doChange", e, this.value), Number(this.keypressInputDelay));
			}
		} else {
			this.doInput(e, this.value);
			if (this.changeOnInput) {
				this.doChange(e, this.value);
			}
		}
		return true;
	},
	keypressInputDelayChanged: function() {
		this.stopInputDelayJob();
	},
	stopInputDelayJob: function() {
		enyo.job.stop(this.id + "-inputDelay");
	},
	selectionChanged: function() {
		var n = this.$.input.hasNode();
		if (n && this.selection) {
			n.selectionStart = this.selection.start;
			n.selectionEnd = this.selection.end;
		}
	},
	getSelection: function() {
		var n = this.$.input.hasNode();
		return n ? {start: n.selectionStart, end: n.selectionEnd} : {start: 0, end: 0};
	},
	disabledChanged: function() {
		this.$.input.setDisabled(this.disabled);
	},
	hintChanged: function() {
		this.$.input.setPlaceholder(this.hint);
	},
	// FIXME: Smart text replace options (could be factored out)
	autoKeyModifierChanged: function() {
		this.$.input.setAttribute("x-palm-text-entry", this.autoKeyModifier ? this.autoKeyModifier : null);
	},
	autoCapitalizeChanged: function() {
		if (this.autoCapitalize === "lowercase") {
			this.$.input.setAttribute("x-palm-disable-auto-cap", "true");
			this.$.input.setAttribute("x-palm-title-cap", null);
		} else {
			this.$.input.setAttribute("x-palm-disable-auto-cap", null);
			this.$.input.setAttribute("x-palm-title-cap", (this.autoCapitalize === "title") ? true : null);
		}
	},
	autocorrectChanged: function() {
		// FIXME: our WebKit implementation of 'autocorrect' and 'spellcheck' doesn't work for all 4 possible values
		this.$.input.setAttribute("autocorrect", this.autocorrect ? "on" : "off");
	},
	spellcheckChanged: function() {
		// FIXME: our WebKit implementation of 'autocorrect' and 'spellcheck' doesn't work for all 4 possible values
		this.$.input.setAttribute("spellcheck", !!this.spellcheck);
	},

	autoLinkingChanged: function() {
		this.$.input.setAttribute("x-palm-enable-linker", this.autoLinking ? this.autoLinking : null);
	},
	autoEmoticonsChanged: function() {
		this.$.input.setAttribute("x-palm-enable-emoticons", this.autoEmoticons ? this.autoEmoticons : null);
	},
	autoWordCompleteChanged: function() {
		this.$.input.setAttribute("x-palm-word-completions", this.autoWordComplete ? null : "disabled");
	},
	applySmartTextOptions: function() {
		this.spellcheckChanged();
		this.autoWordCompleteChanged();
		this.autocorrectChanged();
		this.autoLinkingChanged();
		this.autoEmoticonsChanged();
		this.autoCapitalizeChanged();
		this.autoKeyModifierChanged();
	},
	// control used to reclaim space, can be either input or client
	updateSpacingControl: function() {
		var c = this.$.spacer || this.$.input;
		if (c != this.spacingControl) {
			if (this.spacingControl) {
				this.spacingControl.removeClass(this.spacingClassName);
			}
			this.spacingControl = c;
		}
		this.spacingClassNameChanged();
	},
	spacingClassNameChanged: function(inOldValue) {
		if (this.spacingControl) {
			if (inOldValue) {
				this.spacingControl.removeClass(inOldValue);
			}
			this.spacingControl.addClass(this.spacingClassName);
		}
	},
	styledChanged: function(inOldValue) {
		this.addRemoveClass(this.ctor.prototype.className, this.styled);
		if (this.spacingControl) {
			this.spacingControl.addRemoveClass(this.spacingClassName, this.styled);
		}
	},
	//* @public
	isEmpty: function() {
		return this.$.input.isEmpty();
	},
	/**
		Forces this input to be focused.
	*/
	forceFocus: function() {
		this.$.input.forceFocus();
	},
	/**
		Forces this input to be blurred (lose focus).
	*/
	forceBlur: function() {
		this.$.input.forceBlur();
	},
	/**
		Force select all text in this input.
	*/
	forceSelect: function() {
		this.$.input.forceSelect();
	},
	/**
		Returns true if the input has keyboard focus.
	*/
	hasFocus: function() {
		return this.$.input.hasFocus();
	}
});
