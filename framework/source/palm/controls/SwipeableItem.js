/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/**
An item that can be swiped to show an inline confirmation prompt with confirm and cancel buttons.
It is typically used to support swipe-to-delete in lists.

The onConfirm event is fired when the user taps the confirm button, or when the user swipes the item while confirmRequired is false. The event provides the index of the item. For example:

	components: [
		{flex: 1, name: "list", kind: "VirtualList", onSetupRow: "listSetupRow", components: [
			{kind: "SwipeableItem", onConfirm: "deleteItem"}
		]}
	],
	deleteItem: function(inSender, inIndex) {
		// remove data
		this.someData.splice(inIndex, 1);
	}

*/
enyo.kind({
	name: "enyo.SwipeableItem",
	kind: enyo.Item,
	published: {
		/**
		Set to false to prevent swiping.
		*/
		swipeable: true,
		/**
		If false, no confirm prompt is displayed, and swipes immediately trigger an onConfirm event.
		*/
		confirmRequired: true,
		/**
		Caption shown for the confirm button in the confirm prompt.
		*/
		confirmCaption: enyo._$L("Delete"),
		/**
		Caption shown for the cancel button in the confirm prompt.
		*/
		cancelCaption: enyo._$L("Cancel"),
		confirmShowing: false,
		/**
		If the confirm prompt is automatically hidden, for example, in a list context when a confirm prompt
		is shown for another row, automatically send an onConfirm event.
		*/
		confirmWhenAutoHidden: false,
		/**
		Allows the item to be swiped to the left.
		*/
		allowLeft: true
	},
	className: "enyo-item enyo-swipeableitem",
	triggerDistance: 50,
	lastConfirmIndex: null,
	events: {
		/**
		Event fired when the user clicks the confirm button or, if confirmRequired is false, when the item is swiped.
		The event includes the index of the swiped item.
		*/
		onConfirm: "",
		/**
		Event fired when the user clicks the cancel button in the confirm prompt.
		The event includes the index of the swiped item.
		*/
		onCancel: "",
		/**
		Event fired when the user swipes the item.
		The event includes the index of the swiped item.
		*/
		onSwipe: "",
		/**
		Event fired when the confirm prompt is shown or hidden.
		*/
		onConfirmShowingChanged: "",
		/**
		Event fired repeatedly as the item is dragged.
		Includes the total x pixel delta from at-rest position.
		*/
		onDrag: ""
	},
	chrome: [
		{name: "confirm", canGenerate: false, showing: false, kind: "ScrimmedConfirmPrompt", className: "enyo-fit", onConfirm: "confirmSwipe", onCancel: "cancelSwipe"}
	],
	statified: {
		confirmGenerated: false
	},
	//* @protected
	create: function() {
		this.inherited(arguments);
		this.confirmCaptionChanged();
		this.cancelCaptionChanged();
	},
	confirmCaptionChanged: function() {
		this.$.confirm.setConfirmCaption(this.confirmCaption);
	},
	cancelCaptionChanged: function() {
		this.$.confirm.setCancelCaption(this.cancelCaption);
	},
	getContent: function() {
		return this.inherited(arguments);
	},
	// when item clicks, it briefly shows its held state, we want to 
	// avoid this when we're confirming.
	clickHandler: function(inSender, inEvent) {
		if (!this.confirmShowing) {
			this.inherited(arguments);
		}
	},
	flickHandler: function(inSender, inEvent) {
		if (this.swipeable && !this.confirmShowing && Math.abs(inEvent.xVel) > Math.abs(inEvent.yVel)) {
			this.handlingDrag = false;
			if (this.hasNode()) {
				this.node.style.webkitTransform = "";
			}
			this.handleSwipe();
			return true;
		}
	},
	dragstartHandler: function(inSender, inEvent) {
		this.resetPosition();
		if (this.swipeable && inEvent.horizontal && !this.confirmShowing && this.hasNode()) {
			this.index = inEvent.rowIndex;
			//this.log(inEvent.rowIndex);
			this.handlingDrag = true;
			return true;
		} else {
			return this.fire("ondragstart", inEvent);
		}
	},
	dragHandler: function(inSender, inEvent) {
		var dx = this.getDx(inEvent);
		if (this.handlingDrag) {
			if (this.hasNode()) {
				this.node.style.webkitTransform = "translate3d(" + dx + "px, 0, 0)";
				this.doDrag(dx);
			} else {
				// FIXME: This can occur if a RowServer generates a row node (therefore disabling node access)
				console.log("drag with no node!");
			}
		}
	},
	dragfinishHandler: function(inSender, inEvent) {
		if (this.handlingDrag) {
			var dx = this.getDx(inEvent);
			inEvent.preventClick();
			this.handlingDrag = false;
			this.resetPosition();
			if (Math.abs(dx) > this.triggerDistance) {
				this.handleSwipe();
			}
		} else {
			this.fire("ondragfinish", inEvent);
		}
	},
	handleSwipe: function() {
		this.doSwipe(this.index);
		if (this.confirmRequired) {
			this.setConfirmShowing(true);
		} else {
			this.doConfirm(this.index);
		}
	},
	resetPosition: function() {
		if (this.hasNode()) {
			this.node.style.webkitTransform = "";
			this.doDrag(0);
		}
	},
	confirmShowingChanged: function() {
		// FIXME: jumping through hoops to satisfy flyweight usage
		// confirmGenerated is a "statified" property
		if (!this.confirmGenerated) {
			var c = this.$.confirm;
			this.confirmGenerated = true;
			c.canGenerate = true;
			// specifically call renderNode instead of render so that we abort 
			// updating confirm's node if a reference exists. It's likely to be wrong
			// if we're flyweighting
			c.renderNode();
			// generate the node reference; if we're flyweighting, then hasNode
			// will find the incorrect node.
			if (this.node) {
				c.node = this.node.querySelector("[id="+c.id+"]");
			}
			// NOTE: do not turn off ability to generate so that we can set showing
			// when a list is generating content
			//c.canGenerate = false;
		}
		// if we've generated the confirm prompt, then always generate it
		// so we can show it in a list onSetupRow.
		this.$.confirm.canGenerate = this.confirmGenerated;
		// save show state since flyweight machinations can change it.
		var show = this.confirmShowing;
		var didAutoConfirm;
		if (show) {
			didAutoConfirm = this.confirmFlyweightSiblings();
			this.lastConfirmIndex = this.index;
		} else {
			this.lastConfirmIndex = null;
		}
		this.applyStyle("position", show ? "relative" : null);
		//this.log(show, this.index);
		this.$.confirm.setShowing(show);
		this.doConfirmShowingChanged(show, this.index, didAutoConfirm);
	},
	// Find our manager that has row api, if exists.
	findRowManager: function() {
		var m = this.parent;
		while (m) {
			if (m.prepareRow) {
				return this.rowManager = m;
			}
			m = m.parent;
		}
	},
	// FIXME: special handling for use in flyweight context.
	confirmFlyweightSiblings: function() {
		// note: if our manager has "prepareRow" it supports flyweighting.
		var didAutoConfirm;
		var m = this.rowManager || this.findRowManager();
		if (m && m.prepareRow && this.lastConfirmIndex != null) {
			//this.log(this.lastConfirmIndex);
			// shift flyweight to previous row with a showing confirm
			m.prepareRow(this.lastConfirmIndex);
			if (this.confirmShowing) {
				var i = this.index;
				// temporarily reset our index so events have correct data
				this.index = this.lastConfirmIndex;
				// hide confirm prompt and send an "auto" confirm.
				this.setConfirmShowing(false);
				if (this.confirmWhenAutoHidden) {
					didAutoConfirm = true;
					this.doConfirm(this.index);
				}
				this.index = i;
			}
			// reset our row to the proper one.
			m.prepareRow(this.index);
		}
		return didAutoConfirm;
	},
	confirmSwipe: function(inSender) {
		this.setConfirmShowing(false);
		this.doConfirm(this.index);
		return true;
	},
	cancelSwipe: function(inSender) {
		this.setConfirmShowing(false);
		this.doCancel(this.index);
		return true;
	},
	getDx: function(inEvent) {
		// Obey allowLeft in calculation of dx values.
		return inEvent.dx > 0 || this.allowLeft ? inEvent.dx : 0;
	}
});


// A swipeable item that animates the item out (or back into place).
// Separate for now, so we can limit changes to dashboards only, until they're proven robust.
// May not play nicely with delete confirmation mode.
enyo.kind({
	name: "enyo.SwipeableItem2",
	kind: enyo.SwipeableItem,
	dragstartHandler: function() {
		if(this.exitIntervalId) {
			return true;
		}
		return this.inherited(arguments);
	},
	dragHandler: function() {
		if(this.exitIntervalId) {
			return true;
		}
		return this.inherited(arguments);
	},
	dragfinishHandler: function(inSender, inEvent) {
		if(this.exitIntervalId) {
			return true;
		}
		if(this.handlingDrag) {
			var dx = this.getDx(inEvent);
			this.setSwipeable(false);
			this.exitPos = dx;
			this.exitDirection = dx > 0 ? 1 : -1;
			// Were we dragged far enough to trigger a delete?
			if (Math.abs(dx) > this.triggerDistance) {
				this.exitTarget = this.node.offsetWidth; //  - (dx * this.exitDirection)
				this.exitIntervalId = window.setInterval(enyo.bind(this, "animateExit"), 33);
				this.exitSpeed = 40;
			} else {
				this.exitDirection *= -1; // invert direction, so we animate back into place.
				this.exitTarget = 0;
				this.exitSpeed = 10;
				this.exitIntervalId = window.setInterval(enyo.bind(this, "animateReset"), 33);
			}
			this.handlingDrag = false;
			inEvent.preventClick();
			return true;
		}
	},
	animateReset: function() {
		this.animateFrame();
		if(this.exitDirection < 0 === this.exitPos < 0) {
			this.animationComplete();
		}
	},
	animateExit: function() {
		this.animateFrame();
		if(Math.abs(this.exitPos) > this.exitTarget) {
			this.animationComplete();
			this.handleSwipe();
		}
	},
	animateFrame: function() {
		this.exitPos += this.exitSpeed * this.exitDirection;
		this.node.style.webkitTransform = "translate3d(" + this.exitPos + "px, 0, 0)";
		this.doDrag(this.exitPos);
	},
	animationComplete: function() {
		this.resetPosition();
		this.setSwipeable(true);
	},
	resetPosition: function() {
		if(this.exitIntervalId) {
			window.clearInterval(this.exitIntervalId);
			this.exitIntervalId = undefined;
		}
		this.inherited(arguments);
	}	
});
