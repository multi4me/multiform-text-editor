# ***MultiformTextEditor*** - **jQuery text editing plugin** · [![GitHub release](https://img.shields.io/github/release/multi4me/multiform-text-editor/all.svg?style=plastic)](https://github.com/multi4me/multiform-text-editor/releases)
[![license](https://img.shields.io/badge/license-MIT-blue.svg?style=flat)](https://choosealicense.com/licenses/mit/) [![contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat)](https://github.com/multi4me/multiform-text-editor/issues)  ╵  [![Build Status](https://scrutinizer-ci.com/g/multi4me/multiform-text-editor/badges/build.png?b=master)](https://scrutinizer-ci.com/g/multi4me/multiform-text-editor/build-status/master) [![Scrutinizer Code Quality](https://scrutinizer-ci.com/g/multi4me/multiform-text-editor/badges/quality-score.png?b=master)](https://scrutinizer-ci.com/g/multi4me/multiform-text-editor/?branch=master) [![Maintainability](https://api.codeclimate.com/v1/badges/df3a6a4e6869b0b643af/maintainability)](https://codeclimate.com/github/multi4me/multiform-text-editor/maintainability)  ╵  [![GitHub watchers](https://img.shields.io/github/watchers/multi4me/multiform-text-editor.svg?style=flat)](https://github.com/multi4me/multiform-text-editor/subscription)

[ **Warning**: Project stuck in the time of old jQuery versions... ]

<br><br>
> It's a JavaScript/jQuery plugin, highly flexible, designed for rich WYSIWYG text editing for web. Made to be used by and receive contributions from, the *JavaScript development community*. If you are one of them and feel like to contribute with this conception, and/or if you are a Portuguese speaker and want to help us translate all into English, thank you a lot! :octocat:

<br><br>
![prtflo_modulo_PluginFormatTxt1](https://multi4dotme.files.wordpress.com/2017/11/prtflo_modulo_pluginformattxt1.jpg) :eyes: See "demo" folder
<br><br>

## Initial assembly

Focused on programmers with experience in ***JavaScript & jQuery***, the purpose of the plugin as well as being clean and slim, it is offer a way to prepare a text editor on a level of customization to add any kind of formatting and insertion without the need to change the plugin code and its patterns (but ready for this too and can serve as a basis for other plugins) and allowing us to use any HTML structure in the controls, buttons and styling when setting the edit menu. For this, we need some standard labels setting to be followed when naming classes and using data attributes in the main elements; they are:

- Class **frmttxt-mn-it** for each format item with the attribute **data-frmt="\*"** for the format type and optionally **data-val="*"**
- Class **frmttxt-mn-gp** for groups of formatting items using a child element with the class **frmttxt-mn-drpdn** to serve as wrapper of the items;
- **frmttxt-mn-mp** for handlers of other elements and data before and during the formatting, with the attribute **data-mnpl="*"** for the name of the method

Each format item will have the class **frmttxt-mn-it** and the attribute **data-frmt="\*"** will have the same chosen format label, referenced in the objec **datafrmt_obj** (explained later) optionally being able to use **data-val="\*"** for when we want to pass value formatting, although it is possible to pass value in different ways. Elements that list a group of formatting items (like a color palette, where each color is an element *"frmttxt-mn-it"*) will have the class **frmttxt-mn-gp**, which when clicked will display its child with the class **frmttxt-mn-drpdn** that is who owns the set of formatting items. If an element somewhere in the menu is needed to manipulate other elements and data before and during the formatting (such as two elements for the user to select whether to apply color to text or background), we should set the class **frmttxt-mn-mp** and the attribute **data-mnpl="\*"** with the name of the method created in the object **datamnpl_obj** (must be different from the names of *"datafrmt_obj"*). See the explanation of the objects *"datafrmt_obj"* and *"datamnpl_obj"* at the end. Both can be edited by the programmer to change the formatting standards already available. 
\* As text box for editing we should use a **non-input** element with the attribute `contenteditable="true"`

Here is a simple example of a HTML structure for a menu of controls and editable text box:

```html
<div id="menu-edit unselectable">
	<b class="frmttxt-mn-it" data-frmt="ngrto">B</b>
	<i class="frmttxt-mn-it" data-frmt="itlco">i</i>
	<u class="frmttxt-mn-it" data-frmt="sblnhdo" data-val="underline">U</u>
	&nbsp;&nbsp;❘&nbsp;&nbsp;
	<div class="frmttxt-mn-gp texto-cor">
		<span>✽</span>
		<div class="frmttxt-mn-drpdn d-nn">
			<span class="frmttxt-mn-it" data-frmt="txtcor" data-val="rgb(255, 255, 255)" style="background: #FFFFFF;"></span><span class="frmttxt-mn-it" data-frmt="txtcor" data-val="rgb(247, 218, 100)" style="background: #F7DA64;"></span>
			<span class="frmttxt-mn-it" data-frmt="txtcor" data-val="rgb(0, 168, 133)" style="background: #00A885;"></span><span class="frmttxt-mn-it" data-frmt="txtcor" data-val="rgb(128, 110, 128)" style="background: #806E80;"></span>
			<span class="frmttxt-mn-it rmv" data-frmt="txtcor" data-val="#888888" style="background: #F1F1F1;">×</span><!-- Used to remove color from text or background -->
			<div class="frmttxt-mn-mp" data-mnpl="txtcortp">
				<input id="tipo-cor1" type="radio" name="tipo-cor" value="1" checked><label for="tipo-cor1">Text</label>
				<input id="tipo-cor2" type="radio" name="tipo-cor" value="2"><label for="tipo-cor2">Background</label>
			</div>
		</div>
	</div>
	&nbsp;&nbsp;&nbsp;❘&nbsp;&nbsp;
	<span class="frmttxt-mn-it limpa-frmt" data-frmt="lmpfrmt">&nbsp;</span>
</div>
<div id="box-txt" contenteditable="true" placeholder="Write your text here"></div>
```

<br><br>
We must include the **jQuery** (minimum version 2.0) in the index of our site and the plugin ***MultiformTextEditor***:

```html
<script src="/path/to/jquery.multiform-text-editor.js"></script>
```

<br><br>
The pages will then be ready to receive mounting applications of menus for the specified edit boxes, via **jQuery**; like this:


#### `$(menu-element).formatTxt($(box-element)|function()[, datafrmt_obj, datamnpl_obj, callback($bxelmnt, slc_obj, exec)]});`
<br><br>


## Description

- **menu-element**: id/class of the wrapper element of the editing menu controls. If it's a class representing multiple elements, the first parameter needs to be a function to return the specific edition of each menu box.
- **box-element|function()**: *jQuery* element specifying the content editing box or a custom function to return the edit box - inside its scope **"this"** refers to the current menu *jQuery* element.
- **datafrmt_obj** (optional): object to inclusion of extra formats according to standards and possibilities detailed in the plugin body:
  - `{bold: {tp:"bold", tg:["B", "STRONG"]}, itlco: {tp:"italic", tg:["I", "EM"]}, color: {...}, ...}`
- **datamnpl_obj** (opcional): object for extra menu events with methods to attach manipulations to mainstream formats according to standards and possibilities detailed in the plugin body:
  - `{colortype: function(mnmp, slc){ ... }}`
- **callback($bxelmnt, slc_obj, exec)**: if set, the function is called after any content formatting. The **this** in the function scope is the *item/$(element)* clicked on the menu. Parameters:
  - **$bxelmnt**: jQuery element of the edit box;
  - **slc_obj**: data object of the current selection in the content `{rng: range-obj, elmt: slctd-elmnt, tag: slctd_tag, txt: slctd_txt}`;
  - **exec**: true/false indicating whether the formatting applied was supported in the current browser


### Example 1

```javascript
$("#menu-edit").formatTxt($("#box-txt"));
```


### Example 2

```javascript
$("#menu-edit").formatTxt($("#box-txt"), {blckqte: {tg:["BLOCKQUOTE"], vltgc: function(mnit, slc){
	return " "+(slc.txt || "...")+" ";
}}});
```

- Adding an object with a new format for creating block quote.


### Example 3

```javascript
$(".menu-edit").formatTxt(function(){
	return $(this).parent().find(".box-txt")}
);
```


### Example 4

```javascript
$("#menu-edit").formatTxt($("#box-txt"), null, null, function(cx, slc, exc){
	cx.keyup();
	exc == false ? alert("Formatting not supported by this browser") : null;
});
```

- A function is passed as the last parameter to run something after any change in the text box.


<br><br>
## Execution and predefined formatting

The plugin constructor method ***formatTxt()***, search the elements with the standard classes and prepares the events of the menu items and edit box to highlight, detection and application of formattings and assemblies. Uses the default object **datafrmt_obj** (plus custom formatting object, if specified) for application of several formatting options, including the use of the method `execCommand (command, ShowDefaultUI(false), value(optional))`, which allows us to run standard formatting commands to edit content.

![prtflo_modulo_PluginFormatTxt2](https://multi4dotme.files.wordpress.com/2017/11/prtflo_modulo_pluginformattxt2.jpg)

The example above has been assembled using the labels (classes and attributes) of pre-created formatting for **bold** , **italics**, **underline**, **scratched**, **overline**, **superscript**, **subscript**, **insertion** of characters, **lists**, **size** of font, **color** of text and background, addition/removal of link and formatting cleanup.

![prtflo_modulo_PluginFormatTxt7](https://multi4dotme.files.wordpress.com/2017/11/prtflo_modulo_pluginformattxt7.jpg)
![prtflo_modulo_PluginFormatTxt10](https://multi4dotme.files.wordpress.com/2017/11/prtflo_modulo_pluginformattxt10.jpg)


<br><br>
## Custom formats with *"datafrmt_obj"*

With the options of adding a custom formatting object and extra manipulations, that's possible, for example, add a list of shapes in SVG (rectangle, diamond, ellipse, etc.) to be inserted in the text, something that is not usually offered by plugins, or even an item to apply a set of *css* pre-created styles to the text selected. Programmers must follow the standards of **datafrmt_obj** to add properties and methods to format, manipulate and insert into the editable box. We can even rewrite data standards, their labels and values.

Still in the example above, the programmer may, before applying the ***formatTxt()***, change data from formatting standards such as underscore ( "sblnhdo"), for instance, changing the way text will have a lower trace (applying a style attribute *"text-decoration"*, for example) and placing `data-val = "underline"` in the html of menu item:

```javascript
$.fn.formatTxt.datafrmt_obj.sblnhdo = {tg:[{nm:null, atr:"style", ext:"text-decoration"}], vlatr: function(mnit, slc){
	return ["style", "text-decoration"];
}};
```

It would also be possible to pass the same formatting object for *underline* as a parameter of ***formatTxt()*** and using the same default formatting name (*"sblnhdo"*) to be overwritten.

```javascript
$("#menu-edit").formatTxt($("#box-txt"), {sblnhdo: {tg:[{nm:null, atr:"style", ext:"text-decoration"}], vlatr: function(mnit, slc){
	return ["style", "text-decoration"];
}}});
```


<br><br>
## Extra manipulations with *"datamnpl_obj"*

For extra events in the menu we can use the object **datamnpl_obj** with methods to attach manipulations to the mainstream formats and independent of them. Ex.: color formatting needs a handler to change the highlighted value like `hghlghtd: {atr: "style", ext: "color"}` between text color (*"color"*) and background color (*"background-color"*) by checking which has been selected by the user. While applying ***formatTxt()*** to the edit menu, we must pass the object with one or more handlers as the third parameter. The methods names/labels should be different from the property names in *"datafrmt_obj"* because in the application they are united in one object, allowing manipulation of all data. The use of **this** in the methods refers to the parent object ***dados_obj***  created in the application.

```javascript
$("#menu-edit").formatTxt($("#box-txt"), null, {txtcortp: function(mnmp, slc){//For colors
	var chk = $(mnmp).children("input:checked").val();//option selected by user
	this.txtcor.tg[0].ext = (chk == "1" ? "color" : "background-color");//changes the comparison value for highlight
	$(mnmp).parents(".frmttxt-mn-drpdn").find(".frmttxt-mn-it.rmv").attr("data-val", (chk == "1" ? "#888888" : "inherit"));//changes the value used in the item that simulates color removal, using the default color for text color and "inherit" for background color
}});
```


<br><br>
## Events in the edit box

Other events after the application are readily prepared in content editing box as:

- When selecting text or positioning the cursor (by mouse or keyboard) detects formatting (tags) already applied and highlights the items on the menu:

![prtflo_modulo_PluginFormatTxt3](https://multi4dotme.files.wordpress.com/2017/11/prtflo_modulo_pluginformattxt3.jpg)
![prtflo_modulo_PluginFormatTxt9](https://multi4dotme.files.wordpress.com/2017/11/prtflo_modulo_pluginformattxt9.jpg)
![prtflo_modulo_PluginFormatTxt12](https://multi4dotme.files.wordpress.com/2017/11/prtflo_modulo_pluginformattxt12.jpg)

- Clears formatting when user is pasting text by mouse or keyboard. Checks for print data in memory and reinserts it plain;
- When the *tab* key is pressed, inserts the equivalent space code in html, without losing focus.


<br><br>
## Destroy

The method `destroy($(element-menu))` kills the plugin methods in the menu element (or collection of elements), in its child elements and in the editable box linked to the menu. Remove events labeled with "mnedt" and other data:

```javascript
$.fn.formatTxt.destroy($("#menu-edit"));
```


<br><br>
## License

This project is under the terms of the **[MIT License](https://choosealicense.com/licenses/mit/)**

Copyright © 2018 Multi4me
