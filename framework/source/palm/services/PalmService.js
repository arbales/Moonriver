/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/**
An asynchronous controller handling Palm Service (LS2) requests.

An Enyo service call is typically created in two parts: a component declaration and a method invocation on that component. 
The component describes the service endpoint and, optionally, how the results will be handled. 
The method invocation kicks it all off. The purpose of the component declaration is the same as for all 
components: to bring important flow information to the top level and refactor boilerplate code.

Add a `Service` component to describe as much as you know ahead of time about the request and its handling:

	{
		name: "listAccounts",
		kind: "PalmService",
		service: "palm://com.palm.service.accounts/",
		method: "listAccounts",
		onSuccess: "gotAccounts",
		onFailure: "genericFailure",
		subscribe: false
	}

Declaring the component does not actually start a service request; it just sets everything up beforehand, 
so you can make the request later with a minimum of configuration. Be sure to hang the component off the most 
appropriate owner--the owner's lifecycle should fit the desired lifetime of the service call.

When specifying the service property, be sure to include the trailing slash or you'll get a failure 
when the service is combined with the method.

Call the service with some parameters:

	this.$.listAccounts.call({
		capability: "MAIL"
	});
	
Handle the response in your onSuccess/onFailure/onResponse handler:

	gotAccounts: function(inSender, inResponse) {
		console.log("got these accounts: " + enyo.json.stringify(inResponse));
	}

Response handlers are just specialized event handlers, so inSender here is the service. 
For PalmService objects, inResponse is a pre-parsed JavaScript object.

The different response events are fired under the following conditions:

<li>onSuccess is called on a "successful" response. For PalmService objects, this is called if returnValue === true.</li>
<li>onFailure is called on a failure response.</li>
<li>onResponse is called on any kind of response.</li>

You can also defer assignment of all the other properties of the request until the call is actually made. This is handy when you want to re-use a single service for different kinds of requests:

	{name: "accounts", kind: "PalmService", onFailure: "genericFailure"}
	...
	this.$.accounts.call(
		{
			capability: "MAIL"
		},
		{
			method: "listAccounts",
			onSuccess: "gotAccounts"
		}
	);
	this.$.accounts.call(
		{
			...
		},
		{
			method: "createAccount",
			onSuccess: "createdAccount"
		}
	);
	
If you are calling a subscription service, you must set the "subscribe" property to true.	This will add a 
"subscribe":true value to the params of the service call and also tell the PalmService object to defer the automatic
destruction behavior that it normally happens after your response callback.  You can call the destroy method of 
the PalmService component when you want to unsubscribe from the service.
*/
enyo.kind({
	name: "enyo.PalmService",
	kind: enyo.Service,
	published: {
		method: "",
		subscribe: null,
		resubscribe: false,
		params: null
	},
	resubscribeDelay: 10000,
	requestKind: "PalmService.Request",
	//* @protected
	create: function() {
		this.params = {};
		this.inherited(arguments);
	},
	destroy: function() {
		this.inherited(arguments);
		enyo.job.stop(this.id + "-" + "resubscribe");
	},
	importProps: function(inProps) {
		this.inherited(arguments);
		this.method = this.method || this.name;
	},
	makeRequestProps: function(inProps) {
		// get a mix of inProps and delegates
		var props = this.inherited(arguments);
		// we will include this setup
		var setup = {
			service: this.service,
			method: this.method
		};
		// use the default setup, unless overriden by props
		props = enyo.mixin(setup, props);
		// propagate this.subscribe to params.subscribe as necessary
		if (this.subscribe) {
			// include 'subscribe' in params, it's not supported to include subscribe in params directly
			props.params.subscribe = true; 
			// request itself must be marked to subscribe so it will persist
			props.subscribe = true; 
		}
		return props;
	},
	responseFailure: function(inRequest) {
		this.inherited(arguments);
		// automatic re-subscription on failure; intended to ease recovery when services crash
		if (this.resubscribe && this.subscribe) {
			enyo.job(this.id + "-" + "resubscribe", enyo.hitch(this, "reCall", inRequest), this.resubscribeDelay);
		}
	},
	//* @public
	// note: works only if subscribe is true
	reCall: function(inRequest) {
		if (!inRequest.destroyed) {
			inRequest.call();
			return inRequest;
		}
	}
});

//* @protected
enyo.kind({
	name: "enyo.PalmService.Request",
	kind: enyo.Request,
	create: function() {
		this.inherited(arguments);
	},
	initComponents: function() {
		this.createBridge();
		this.inherited(arguments);
	},
	createBridge: function() {
		this.bridge = new PalmServiceBridge();
		// note: bridge does not properly reference the bound method, so we store a local reference to prevent GC
		this.bridge.onservicecallback = this.clientCallback = enyo.bind(this, "receive");
	},
	call: function() {
		var p = this.params || {};
		this.json = enyo.isString(p) ? p : enyo.json.stringify(p);
		//this.log("bridge.call: " + this.service + this.method + "(" + this.json + ")");
		this.bridge.call(this.service + this.method, this.json);
	},
	destroy: function() {
		this.bridge.cancel();
		this.inherited(arguments);
	},
	setResponse: function(inResponse) {
		try {
			this.response = enyo.isString(inResponse) ? enyo.json.parse(inResponse) : inResponse;
		} catch(x) {
			this.warn("Failed to convert response from JSON:", x, " for response: [" + inResponse + "]" );
			this.response = null;
		}
	},
	isFailure: function(inResponse) {
		// FIXME: is falsey inResponse really a fail condition?
		return !this.response || (this.response.errorCode || this.response.returnValue === false);
	},
	finish: function() {
		if (!this.subscribe) {
			this.destroy();
		}
	}
});
