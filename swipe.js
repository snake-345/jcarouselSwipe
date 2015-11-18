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
        _started: false,
        _animated: false,
        _x: 0,
        _y: 0,
        _options: {
            target: '+=1',
            event:  'click',
            method: 'scroll'
        },
        _init: function() {

        },
        _create: function() {
            var self = this;
            this._instance = this.carousel().data('jcarousel');
            this._element.on('touchstart', function(event) {
                self._x = event.originalEvent.changedTouches[0].pageX;
                self._y = event.originalEvent.changedTouches[0].pageY;
            });

            this._element.on('touchmove', function(event) {
                var x = event.originalEvent.changedTouches[0].pageX;
                var y = event.originalEvent.changedTouches[0].pageY;

                if (!self._started) {
                    self._started = true;
                    self._addClones();
                    self._currentLeft = self._getListPosition();
                }

                if (!self._animated && Math.abs(self._x - x) > Math.abs(self._y - y)) {
                    var delta = self._x - x;

                    self._setListPosition({'left': self._currentLeft - delta + 'px'});
                }
            });

            this._element.on('touchend', function(event) {
                if (self._started) {
                    var x = event.originalEvent.changedTouches[0].pageX;
                    var newTarget = self._getNewTarget(self._x - x > 0);

                    self._removeClones();
                    self._instance._items = null;
                    self._animated = true;
                    self._instance.scroll(newTarget.relative, function() {
                        self._started = false;
                        self._animated = false;
                    });
                }
            });
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
