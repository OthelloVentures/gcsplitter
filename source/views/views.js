/**
	For simple applications, you might define all of your views in this file.  
	For more complex applications, you might choose to separate these kind definitions 
	into multiple files under this folder.
*/

enyo.kind({
	name: "gcsplitter.MainView",
	kind: "FittableRows",
	fit: true,
	giftCardValueInputValid: false,
	numberOfPeopleInputValid: false,
	taxRateInputValid: false,
	tipPercentageInputValid: false,

	components:[
		{name: "headerToolbar", kind: "onyx.Toolbar", content: "Gift Card Splitter", style: "padding-left: 25px; border: none;"},
		{name: "mainScroller", kind: "enyo.Scroller", fit: true, style: "padding: 15px", components: [
			{kind: "FittableRows", fit: true, components: [
				{content:"Value of Gift Card"},
				{kind: "onyx.InputDecorator", style: "width: 100%; margin-bottom: 10px", components: [
					{content:"$&nbsp;", allowHtml: true},
					{name:"giftCardValueInput", kind: "onyx.Input", oninput: "validateInput", onfocus: "checkFocus", onblur: "checkBlur"}
				]},
				{content:"Number of People"},
				{kind: "onyx.InputDecorator", style: "width: 100%; margin-bottom: 10px", components: [
					{name:"numberOfPeopleInput", style: "width: 100%;", kind: "onyx.Input", oninput: "validateIntegerInput", onfocus: "checkFocus", onblur: "checkBlur"}
				]},
				{content:"Tax Rate"},
				{kind: "onyx.InputDecorator", style: "width: 100%; margin-bottom: 10px", components: [
					{name: "taxRateInput", kind: "onyx.Input", oninput: "validateInput", onfocus: "checkFocus", onblur: "checkBlur"},
					{content:"&nbsp;%", allowHtml: true}
				]},
				{content:"Tip Percentage"},
				{kind: "onyx.InputDecorator", style: "width: 100%; margin-bottom: 20px", components: [
					{name: "tipPercentageInput", kind: "onyx.Input", oninput: "validateInput", onfocus: "checkFocus", onblur: "checkBlur"},
					{content:"&nbsp;%", allowHtml: true}
				]},
				{name: "calculateButton", kind: "onyx.Button", content: "Calculate", disabled: true, style: "width: 100%; font-size: 22px; font-weight: 300; margin-bottom: 15px;", ontap: "calculateButtonTapped"},
				{name: "resultsDialog", kind: "gcsplit.resultsDialog"}
			]}
		]}
	],

	validateInput: function(inSender, inEvent) {
		this[inSender.name + "Valid"] = (inEvent.originator.value && isFinite(inEvent.originator.value) && inEvent.originator.value >= 0);
		inSender.parent.addRemoveClass("invalid-format", !(inEvent.originator.value && isFinite(inEvent.originator.value) && inEvent.originator.value >= 0));
		this.testButton();
	},

	validateIntegerInput: function(inSender, inEvent) {
		this[inSender.name + "Valid"] = (inEvent.originator.value && isFinite(inEvent.originator.value) && this.isInt(inEvent.originator.value) && inEvent.originator.value >= 0);
		inSender.parent.addRemoveClass("invalid-format", !(inEvent.originator.value && isFinite(inEvent.originator.value) && this.isInt(inEvent.originator.value) && inEvent.originator.value >= 0));
		this.testButton();
	},

	testButton: function() {
		if (this.giftCardValueInputValid && this.numberOfPeopleInputValid && this.taxRateInputValid && this.tipPercentageInputValid) {
			this.$.calculateButton.setDisabled(false);
		}
		else
		{
			this.$.calculateButton.setDisabled(true);
		}
	},

	roundToTwo: function(num) {    
		return +(Math.round(num + "e+2")  + "e-2");
	},

	isInt: function(n) {
		return n % 1 === 0;
	},

	calculateButtonTapped: function(inSender, inEvent) {
		if(this.giftCardValueInputValid && this.numberOfPeopleInputValid && this.taxRateInputValid && this.tipPercentageInputValid)
		{
			var cardValue = this.$.giftCardValueInput.getValue();
			var numPeople = this.$.numberOfPeopleInput.getValue();
			var taxRate = (this.$.taxRateInput.getValue()/100);
			var tipPercentage = (this.$.tipPercentageInput.getValue()/100);

			var result = cardValue/((1 + taxRate + tipPercentage) * numPeople);
			var taxResult = this.roundToTwo(result*taxRate*numPeople);
			var tipResult = (cardValue - this.roundToTwo(result * numPeople + taxResult));
			
			this.$.resultsDialog.show(result, taxResult, tipResult, numPeople);
		}
	},

	rendered: function(){
		this.inherited(arguments);
		//Apply per-platform styles
		if (enyo.platform.tizen)
		{
			this.addClass("tizen-fonts");
			this.$.headerToolbar.addClass("tizen-fonts tizen-header-colors");
			this.$.mainScroller.addClass("tizen-colors");
			this.$.calculateButton.addClass("tizen-buttons");
		}
		else if (enyo.platform.blackberry)
		{
			this.addClass("blackberry-fonts");
			this.$.headerToolbar.addClass("blackberry-fonts blackberry-header-colors");
			this.$.mainScroller.addClass("blackberry-colors");
			this.$.calculateButton.addClass("blackberry-buttons");
		}
		else
		{
			this.addClass("firefox-fonts");
			this.$.headerToolbar.addClass("firefox-fonts firefox-header-colors");
			this.$.mainScroller.addClass("firefox-colors");
			this.$.calculateButton.addClass("onyx-affirmative");
		}

		//Calculate Window Width
		var windowWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
		var decoratorWidth = windowWidth - 40;

		this.$.giftCardValueInput.applyStyle("width", (decoratorWidth - 30) + "px");
		this.$.taxRateInput.applyStyle("width", (decoratorWidth - 30) + "px");
		this.$.tipPercentageInput.applyStyle("width", (decoratorWidth - 30) + "px");
	},

	//utility
    checkFocus: function(source, event) {
		if(!enyo.platform.tizen && !enyo.platform.blackberry)
		{
			source.parent.applyStyle("color", "black");
			source.applyStyle("color", "black");
		}
	},

	checkBlur: function(source, event) {
		if(!enyo.platform.tizen && !enyo.platform.blackberry)
		{
			source.parent.applyStyle("color", "white");
			source.applyStyle("color", "white");
		}
	}
});

enyo.kind({
    name: "gcsplit.resultsDialog",
    style: "padding: 15px; width: 80%; max-height: 80%;",
    kind: "onyx.Popup",
    centered: true,
    modal: true,
    floating: true,
    autoDismiss: false,
    scrim: true,
    scrimWhenModal: false,

    components: [
		{name: "dialogScroller", kind: "enyo.Scroller", components: [
			{content: "Results", style: "font-size: 28px; text-align: center"},
			{content: "You may spend a total of:"},
			{name: "totalField", style: "font-size: 24px; font-weight: 200; margin-bottom: 10px;"},
			{content: "Each person may spend:"},
			{name: "resultField", style: "font-size: 24px; font-weight: 200; margin-bottom: 10px;"},
			{content: "The total tip is:"},
			{name: "tipResultField", style: "font-size: 24px; font-weight: 200; margin-bottom: 10px;"},
			{content: "The total tax is:"},
			{name: "taxResultField", style: "font-size: 24px; font-weight: 200; margin-bottom: 10px;"}
		]},
		{name: "doneButton", kind: "onyx.Button", content: "Done", ontap: "doneButtonTapped", style: "width: 100%; font-size: 18px; font-weight: 300"}
	],

	show: function(result, taxResult, tipResult, numPeople){
		if (enyo.platform.tizen)
		{
			this.addClass("tizen-fonts tizen-dialog");
			this.$.doneButton.addClass("tizen-buttons");
		}
		else if (enyo.platform.blackberry)
		{
			this.addClass("blackberry-fonts blackberry-dialog");
			this.$.doneButton.addClass("blackberry-buttons");
		}
		else
		{
			this.addClass("firefox-fonts");
			this.$.doneButton.addClass("onyx-affirmative");
		}
		this.$.totalField.setContent("$" + result.toFixed(2) * numPeople);
		this.$.resultField.setContent("$" + result.toFixed(2));
		this.$.taxResultField.setContent("$" + taxResult.toFixed(2));
		this.$.tipResultField.setContent("$" + tipResult.toFixed(2));
		this.inherited(arguments);
		this.resizeHandler();
	},

	doneButtonTapped: function()
	{
		this.hide();
	},

	resizeHandler: function(){
		//Calculate scroller height - if we don't explicitly set the scroller height, it will overflow the dialog
		var dialogHeight = document.getElementById(this.id).clientHeight;
		var scrollerHeight = document.getElementById(this.$.dialogScroller.id).clientHeight;

		if (scrollerHeight > (dialogHeight - 70))
		{
			this.$.dialogScroller.applyStyle("height", dialogHeight - 70 + "px");
		}
	}
});