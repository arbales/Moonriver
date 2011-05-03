/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
// FIXME: currently a bad name: this is not an Input kind, should it be?
enyo.kind({
	name: "enyo.AtomizingInput",
	kind: enyo.Control,
	className: "enyo-atomizing-input-container",
	events: {
		onFilterStringChanged: "",
		onAtomize: "",
		onAtomGetContact: "",
		onEditContact: "",
		onShowAllButtonClick: "",
		onExpandButtonClick: ""
	},
	published: {
		contacts: null,
		expandButtonCaption: enyo.addressing._$L("TO"),
		hint: enyo.addressing._$L("Name or email address"),
		inputType: "",
		filterDelay: 200,
		inputValue: "",
		inputClassName: "enyo-middle"
	},
	//* @protected
	components: [
		{kind: "InputBox", className: "enyo-atomizing-input-box", layoutKind: null, components: [
			{name: "client", className: "enyo-atomizing-input-wrapper", components: [
				{name: "expandButton", kind: "Button", className: "enyo-contact-atom enyo-addressing-expand-button", onclick: "doExpandButtonClick"},
				{name: "showallButton", showing: false, kind: "IconButton", className: "enyo-addressing-showall-button",  icon: "enyo-addressing-showall-icon", iconIsClassName: true, onclick: "doShowAllButtonClick"},
				// FIXME: RichText is a BasicInput, so it does not have changeOnKeypress
				{
					name: "input",
					kind: "RichText",
					className: "enyo-atomizing-input",
					autocorrect: false,
					autoWordComplete: false,
					spellcheck: false,
					autoCapitalize: "lowercase",
					styled: false,
					richContent: false,
					onkeydown: "inputKeydown",
					onkeypress: "inputKeypress",
					oninput: "inputInputEvent"
				}
			]}
		]}
	],
	constructor: function() {
		// Semicolon **webOS NON-STANDARD**
		var semicolon = window.PalmSystem ? 0 : 186;
		this.atomizingKeyCodes = [
			semicolon,
			13,		// Enter
			188		// Comma
		];
		this.contacts = [];
		this.atoms = [];
		this.inherited(arguments);
	},
	create: function() {
		this.inherited(arguments);
		this.contactsChanged();
		this.expandButtonCaptionChanged();
		this.inputTypeChanged();
		this.inputClassNameChanged();
		this.inputValueChanged();
		this.hintChanged();
	},
	inputClassNameChanged: function(inOldValue) {
		if (inOldValue) {
			this.$.inputBox.removeClass(inOldValue);
		}
		this.$.inputBox.addClass(this.inputClassName);
	},
	setOrderStyle: function(inClass) {
		this.setInputClassName(inClass);
	},
	expandButtonCaptionChanged: function() {
		this.$.expandButton.setContent(this.expandButtonCaption);
	},
	hintChanged: function() {
		var h = this.atoms.length ? "" : this.hint;
		this.$.input.setHint(h);
	},
	inputValueChanged: function(inOldValue) {
		this.inputValue = this.inputValue || "";
		this.$.input.setValue(this.inputValue);
		if (this.generated && inOldValue !== undefined) {
			this.startFilterJob();
		}
	},
	getInputValue: function() {
		return this.inputValue = this.$.input.getValue();
	},
	inputTypeChanged: function() {
		this.$.input.domAttributes.type = this.inputType;
		if (this.hasNode()) {
			this.$.input.render();
		}
	},
	contactsChanged: function() {
		this.destroyAtoms();
		var f = this.$.input.hasFocus();
		//this.setInputValue("");
		this.contacts = this.contacts || [];
		for (var i=0, c; c=this.contacts[i]; i++) {
			this.addAtom(c, f);
		}
		if (!f) {
			this.unbuttonize();
		}
		this.hintChanged();
	},
	getContacts: function() {
		var contacts = [];
		for (var i=0, a; a=this.atoms[i]; i++) {
			contacts.push(a.getContact());
		}
		return this.contacts = contacts;
	},
	// FIXME: this causes keyboard to lower and raise quickly. It's imperceptible except
	// that the window resizes =(
	ensureFocus: function() {
		return;
		var n = this.$.input.hasNode();
		if (n) {
			n.blur();
		}
		this.forceFocus();
	},
	//* @public
	forceFocus: function() {
		this.$.input.forceFocus();
	},
	addAtom: function(inContact, inIsButtony) {
		var atom = this.createComponent({
			kind: "ContactAtom",
			contact: inContact,
			isButtony: !!inIsButtony,
			onclick: "editAtom",
			onGetContact: "doGetContact"
		});
		//
		this.atoms.push(atom);
		//
		// New atom should be inserted before the input element
		// avoid rendering client to prevent blur of input.
		var c = this.$.client;
		c.children.pop();
		c.children.splice(c.children.length - 1, 0, atom);
		atom.render();
		if (atom.hasNode()) {
			atom.node.parentNode.insertBefore(atom.node, atom.node.previousSibling);
		}
		return atom;
	},
	atomizeInput: function(inContact) {
		var contact = inContact || {};
		var dn = contact.displayName = contact.displayName || this.$.input.getValue();
		var address = contact.value = contact.value || dn;
		if (this.editingAtom) {
			if (address) {
				this.editingAtom.setContact(contact);
				this.editingAtom.show();
				this.doAtomize(this.editingAtom);
			} else {
				this.editingAtom.destroy();
			}
			this.editingAtom = null;
		} else if (address) {
			var atom = this.addAtom(contact, true);
			this.doAtomize(atom);
		} else {
			return false;
		}
		this.$.input.setValue("");
		this.$.showallButton.show();
		return true;
	},
	//* @protected
	destroyAtoms: function() {
		for (var i=0, a; a=this.atoms[i]; i++) {
			a.destroy();
		}
		this.atoms = [];
	},
	removeLastAtom: function() {
		var atom = this.atoms.pop();
		atom.destroy();
		this.$.client.removeChild(atom);
		// FIXME: why necessary?
		if (this.$.input.hasNode()) {
			this.$.input.node.focus();
		}
	},
	buttonize: function(inSender, inEvent) {
		for (var i = 0, a; a=this.atoms[i]; i++) {
			a.setIsButtony(true);
		}
		this.$.showallButton.addClass("enyo-button");
		this.$.expandButton.addClass("enyo-button");
	},
	unbuttonize: function(inSender, inEvent) {
		for (var i = 0, a; a=this.atoms[i]; i++) {
			a.setIsButtony(false);
			a.setSeparator(i < this.atoms.length-1 ? ", " : "");
		}
		this.$.showallButton.removeClass("enyo-button");
		this.$.expandButton.removeClass("enyo-button");
	},
	editAtom: function(inSender, inEvent) {
		if (!this.$.input.hasFocus()) {
			return;
		}
		this.atomizeInput();
		inSender.hide();
		this.editingAtom = inSender;
		this.$.input.setValue(inSender.getContact().value);
		this.$.input.forceSelect();
		// FIXME: why an event?
		this.doEditContact(inSender);
	},
	// prevent internal mousedowns not on input from blurring it
	mousedownHandler: function(inSender, inEvent) {
		if (inSender != this.$.input) {
			inEvent.preventDefault();
			if (!this.$.input.hasFocus()) {
				this.forceFocus();
			}
		}
	},
	focusHandler: function(inSender, inEvent) {
		this.buttonize();
		this.$.showallButton.show();
		this.addClass(this.focusedClassName);
		this.fire("onfocus", inEvent);
	},
	blurHandler: function(inSender, inEvent) {
		this.atomizeInput();
		this.$.showallButton.hide();
		this.unbuttonize();
		this.removeClass(this.focusedClassName);
		this.hintChanged();
		this.fire("onblur", inEvent);
	},
	keyShouldAtomize: function(inKeyCode) {
		for (var i=0, kc=this.atomizingKeyCodes; i < kc.length; i++) {
			if (kc[i] == inKeyCode) {
				return true;
			}
		}
	},
	isExcludedFilterKey: function(inKeyCode) {
		if (inKeyCode == 9) {
			return true;
		}
	},
	inputKeydown: function(inSender, inEvent) {
		var keyCode = inEvent.keyCode;
		if (this.keyShouldAtomize(keyCode)) {
			// Atomizing keys shouldn't print their characters
			inEvent.preventDefault();
			var atomized = this.atomizeInput();
			event.atomizedInput = atomized;
		// special handling for when we have no value
		} else if (!this.$.input.getValue()) {
			// 8 == delete
			// Deleting when input is empty should destroy the last atom.
			if (keyCode == 8) {
				if (this.atoms.length) {
					this.removeLastAtom();
				}
				// Deleting characters changes the filter string and should kick off a new filter
				this.startFilterJob();
			// 32 == space
			// disallow leading space
			} else if (keyCode == 32) {
				inEvent.preventDefault();
			}
		} else if (!this.isExcludedFilterKey(keyCode)) {
			this.startFilterJob();
		}
	},
	inputKeypress: function(inSender, inEvent) {
		var kc = inEvent.keyCode;
		if (!this.keyShouldAtomize(kc) && !this.isExcludedFilterKey(kc)) {
			this.startFilterJob();
		}
	},
	inputInputEvent: function(inSender, inEvent) {
		this.$.showallButton.setShowing(inSender.isEmpty());
	},
	startFilterJob: function() {
		enyo.job(this.id + "filter", enyo.bind(this, "fireFilterStringChanged"), this.filterDelay);
	},
	fireFilterStringChanged: function() {
		var v = this.$.input.getValue();
		this.doFilterStringChanged(v);
	}
});
