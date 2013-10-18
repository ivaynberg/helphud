#HelpHud

A simple help overlay for web pages.

##Why Another One?

Most plugins like this "highlight" elements by adding a mask to the body and then moving the elements out of their dom positions and into the body with absolute positioning so they can properly appear over the mask. Complex CSS layouts may pose problems for such repositioning of elements. Further, background javascript code can also suffer if it happens to run while the help overlay is shown.

HelpHud solves the two problems above by not using a solid mask, instead it masks only the areas of the screen not covered by the elements that need to be "highlighted". It does not modify the dom structure of those elements at all.

##Setup

Add `jquery.js`, `helphud.js`, and `helphud.css` to your html.

Define help by putting `data-intro` attribute on elements.

Define position of the tooltip using `data-position` attribute which can be one of the following: `top`, `bottom`, `left`, `right`.

##Use
Call `$("body").helphud("show")` to trigger the help. Click anywhere on the screen to dismiss, or call `$("body").helphud("hide")`.

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


