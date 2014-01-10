#HelpHud

A simple help overlay for web pages.

##Why Another One?

Most plugins like this "highlight" elements by adding a mask to the body and then moving the elements out of their dom positions and into the body with absolute positioning so they can properly appear over the mask. Complex CSS layouts may pose problems for such repositioning of elements. Further, background javascript code can also suffer if it happens to run while the help overlay is shown.

HelpHud solves the two problems above by not using a solid mask, instead it masks only the areas of the screen not covered by the elements that need to be "highlighted". It does not modify the dom structure of those elements at all.

##Setup

Add `jquery.js`, `helphud.js`, and `helphud.css` to your html.

###Defininig Help Text

Short snippets of help text can be defined by adding `data-intro` attribute to an html tag:

    <input type='submit' value='Remove'
           data-intro='Click here to remove the item from your cart.'/>

If you wish to define a longer help text or use html inside it you may put it into a `div` with a defined `id` attribute and:


    <div id='help1'>
	    <img src='...'/>
    	Click here to <strong>remove</strong> the item from your cart.
    </div>


and provide the value of the id attribute in `data-intro` prefixed with a `#`:

    <input type='submit' value='Remove' data-intro='#help1'/>

###Defining Help Panels
Help panels are chunks of markup that are not attached to any particular element. They usually have a fixed or an absolute position and are shown when helphud is shown.

To define a help panel simply assign `helphud-panel` class to a tag. When helphud is shown the tag will be moved into the helphud overlay dom. This action will be undone when helphud is closed.

For Example:

    <div class="helphud-panel" style="position:fixed; left:20px; top: 20px;">
        I am a free-floating remark that is visible when helphud is visible
    </div>

###Defining Help Text Popups

In situation where a single help popup is not enough HelpHud can also show additional help via a modal popup, for example:


    <div id='help1'>
    	Click here to <strong>remove</strong> the item from your cart.
    	To learn more about removing items from the cart
    	please click <a href='#' data-more='help1-1'>here</a>.
		
		<div class='helphud-more' id='help1-1'>
    	    Removing items from the cart is permanent and cannot be undone.
	        The cart's total and subtotals will be recalculated once the
	        removal is performed
	    </div>
    </div>

when the user brings up the HelpHud and click on the 'here' link they will get the contents of the `help1-1` div displayed in a modal window. This feature can be used to embed additional text content or other resources such as help videos.

To use this feature define a `div` with an `id` and the `helphud-more` class inside another help `div`. To trigger this content to show up you must add a `data-more` attribute with the `id` of the div to a tag inside the help tooltip.

###Positioning

By default all tooltips will show below the element. This behavior can be changed by adding a `data-position` attribute which can be one of the following: `top`, `bottom`, `left`, `right`. For example:

    <input type='submit' value='Remove'
           data-intro='Click here to remove the item from your cart'
           data-position='left'/>

##Triggering

Call `$("body").helphud("show")` to trigger the help. Click anywhere on the screen to dismiss, or call `$("body").helphud("hide")`.

##Events

* `helphud-shown` fired when helphud is shown

* `helphud-hidden` fired when helphud is hidden

##Other

When helphud is opened `helphud-shown` css class will be added to the element on which helphud was called. This class will be removed when helphud is closed.


##License
The MIT License (MIT)

Copyright (c) 2013 Igor Vaynberg

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.


