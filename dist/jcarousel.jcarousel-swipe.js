/**
 * jCarousel Control Plugin
 *
 * Depends:
 *     core.js
 *     core_plugin.js
 */
(function($) {
    'use strict';

    $.jCarousel.plugin('jcarouselSwipe', {
        _options: {
            target: '+=1'
        },
        _init: function() {

        },
        _create: function() {
            this._instance = this.carousel().data('jcarousel');
            this._instance._element.css('touch-action', 'pan-y');

            this._initGestures();
        },
        _initGestures: function() {
            var self = this;
            var startTouch = {};
            var currentTouch = {};
            var started = false;
            var animated = false;
            var minLeft, lastItem;

            this._element.on('touchstart.jcarouselSwipe', dragStart);

            function dragStart(event) {
                event = event.originalEvent || event || window.event;
                startTouch = getTouches(event);

                self._element.on('touchmove.jcarouselSwipe', dragMove);
                self._element.on('touchend.jcarouselSwipe touchcancel.jcarouselSwipe', dragEnd);
            }

            function dragMove(event) {
                var delta, newLeft;
                event = event.originalEvent || event || window.event;
                currentTouch = getTouches(event);

                if (started) {
                    event.preventDefault();
                }

                if (Math.abs(startTouch.y - currentTouch.y) > 10 && !started) {
                    self._element.off('touchmove.jcarouselSwipe');
                    return;
                }

                if (!animated && Math.abs(startTouch.x - currentTouch.x) > 10) {
                    delta = startTouch.x - currentTouch.x;


                    if (!started) {
                        started = true;
                        self._addClones();
                        self._currentLeft = self._getListPosition();
                        lastItem = self._instance.items().last();
                        minLeft = (lastItem.position().left + lastItem.outerWidth() - self._instance.carousel().outerWidth()) * -1;
                    }

                    newLeft = self._instance._options.wrap === 'circular' ? self._currentLeft - delta : Math.min(0, Math.max(self._currentLeft - delta, minLeft));

                    self._setListPosition({'left': newLeft + 'px'});
                }
            }

            function dragEnd() {
                if (started) {
                    var newTarget = self._getNewTarget(startTouch.x - currentTouch.x > 0);
                    newTarget = self._instance._options.wrap === 'circular' ? newTarget.relative : newTarget.static;

                    self._removeClones();
                    self._instance._items = null;
                    animated = true;
                    self._instance.scroll(newTarget, function() {
                        started = false;
                        animated = false;
                    });

                    self._element.off('touchmove.jcarouselSwipe');
                    self._element.off('touchend.jcarouselSwipe touchcancel.jcarouselSwipe');
                }
            }

            function getTouches(event) {
                if (event.touches !== undefined) {
                    return {
                        x: event.touches[0].pageX,
                        y: event.touches[0].pageY
                    }
                } else {
                    if (event.pageX !== undefined) {
                        return {
                            x: event.pageX,
                            y: event.pageY
                        }
                    } else {
                        return {
                            x: event.clientX,
                            y: event.clientY
                        }
                    }
                }
            }
        },
        _getNewTarget: function(isLeftSwipe) {
            var target = this._instance.target();
            var staticTarget = this._instance.index(target);
            var relativeTarget = 0;
            var carouselOffset = this._instance.carousel().offset().left;
            var slidesCount = this._instance.items().length;

            while(true) {
                if (isLeftSwipe && target.offset().left - carouselOffset >= 0 ||
                    !isLeftSwipe && target.offset().left - carouselOffset <= 0) {
                    break;
                }

                if (isLeftSwipe) {
                    target = target.next();
                    staticTarget = staticTarget + 1 >= slidesCount ? 0 : staticTarget + 1;
                } else {
                    target = target.prev();
                    staticTarget = staticTarget - 1 < 0 ? slidesCount - 1 : staticTarget - 1;
                }

                relativeTarget++;
            }

            return {
                static: staticTarget,
                relative: (isLeftSwipe ? '+' : '-') + '=' + relativeTarget
            };
        },
        _getListPosition: function() {
            return this._instance.list().position()[this._instance.lt];
        },
        _setListPosition: function(position) {
            var option       = this._instance.options('transitions');
            var transforms   = !!option.transforms;
            var transforms3d = !!option.transforms3d;
            var css = {};

            if (transforms3d) {
                css.transform = 'translate3d(' + (position.left || 0) + ',' + (position.top || 0) + ',0)';
            } else if (transforms) {
                css.transform = 'translate(' + (position.left || 0) + ',' + (position.top || 0) + ')';
            } else {
                css = position;
            }

            this._instance.list().css(css);
        },
        _addClones: function() {
            var self = this;
            var items = self._instance.items();
            var first = self._instance.first();
            var last = self._instance.last();
            var clip = self._instance.clipping();
            var curr;
            var wh;
            var index;
            var clonesBefore = [];
            var clonesAfter = [];
            var left = self._getListPosition();

            if (this._instance._options.wrap !== 'circular') {
                return false;
            }

            for (wh = 0, index = 0, curr = first; wh < clip;) {
                curr = curr.prev();

                if (curr.length === 0) {
                    --index;
                    wh += self._instance.dimension(items.eq(index));
                    clonesBefore.push(items.eq(index).clone().attr('data-jcarousel-clone', true));
                } else {
                    wh += self._instance.dimension(curr);
                }
            }

            left = Math.min(left, - wh) + 'px';

            for (wh = 0, index = -1, curr = last; wh < clip;) {
                curr = curr.next();

                if (curr.length === 0) {
                    ++index;
                    wh += self._instance.dimension(items.eq(index));
                    clonesAfter.push(items.eq(index).clone().attr('data-jcarousel-clone', true));
                } else {
                    wh += self._instance.dimension(curr);
                }
            }

            self._instance._items.first().before(clonesBefore.reverse());
            self._instance._items.last().after(clonesAfter);
            self._instance.move({left: left});
        },
        _removeClones: function() {
            var startPosition = this._instance.first().position()[this._instance.lt];
            var removeCLonesWidth;
            this._instance.list().find('[data-jcarousel-clone]').remove();
            removeCLonesWidth = Math.abs(this._instance.first().position()[this._instance.lt] - startPosition);
            if (removeCLonesWidth) {
                this._instance.move({left: this._getListPosition() + removeCLonesWidth + 'px'});
            }
        },
        _destroy: function() {

        },
        _reload: function() {

        }
    });
}(jQuery));
