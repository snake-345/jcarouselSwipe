(function($) {
    $(function() {
        /*
        Carousel initialization
        */
        $('.jcarousel li').width($(window).width());

        $('.jcarousel')
            .jcarousel()
            .jcarouselSwipe(); // swipe support
    });
})(jQuery);
