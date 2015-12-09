# jcarouselSwipe plugin
Adds support user-friendly swipe gestures.

## Features
* user-friendly swipe gestures works
* work with any wrap option(both, first, last, circular)
* work with vertical carousels
* easy to use

## Requirments
* jQuery
* jquery.jcarousel-core.js(minimum) also you may use bundle version: jquery.jcarousel.js

## How to use
To use the plugin include jquery, jcarousel and jcarouselSwipe source files into your HTML document:
``` HTML
<script type="text/javascript" src="js/jquery.min.js"></script>
<script type="text/javascript" src="js/jquery.jcarousel.min.js"></script>
<script type="text/javascript" src="js/jcarousel.jcarousel-swipe.min.js"></script>
```
and init the plugin:
``` javascript
$('.jcarousel')
    .jcarousel()       // init jcarousel
    .jcarouselSwipe(); // init jcarouselSwipe
```

## Examples
You can find examples in the corresponding directory. I'm included my plugin in all jcarousel examples and added vertical carousel example.

## License
Copyright (c) 2015 Evgeniy Pelmenev. Released under the MIT license.
