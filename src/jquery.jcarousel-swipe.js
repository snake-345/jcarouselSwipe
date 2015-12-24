/*! jсarouselSwipe - v0.1.1 - 2015-12-10
* Copyright (c) 2015 Evgeniy Pelmenev; Licensed MIT */
(function($) {
    'use strict';

    $.jCarousel.plugin('jcarouselSwipe', {
        _init: function() {
            var self = this;
            this.carousel().on('jcarousel:reloadend', function() {
                self._reload();
            });
        },
        _create: function() {
            this._instance = this.carousel().data('jcarousel');
            this._instance._element.css('touch-action', (!this._instance.vertical ? 'pan-y' : 'pan-x'));
            this._carouselOffset = this.carousel().offset()[this._instance.lt] + parseInt(this.carousel().css((!this._instance.vertical ? 'border-left-width' : 'border-top-width'))) + parseInt(this.carousel().css((!this._instance.vertical ? 'padding-left' : 'padding-top')));
            this._slidesCount = this._instance.items().length;
            this.carousel().find('img').attr('draggable', false);

            this._destroy();

            if (this._instance.items().length > this._instance.fullyvisible().length) {
                this._initGestures();
            }
        },
        _initGestures: function() {
            var self = this;
            var startTouch = {};
            var currentTouch = {};
            var started = false;
            var animated = false;
            var xKey = !this._instance.vertical ? 'x' : 'y';
            var yKey = !this._instance.vertical ? 'y' : 'x';
            var minLT, lastItem;

            this._element.on('touchstart.jcarouselSwipe mousedown.jcarouselSwipe', dragStart);

            function dragStart(event) {
                event = event.originalEvent || event || window.event;
                startTouch = getTouches(event);

                $(document).on('touchmove.jcarouselSwipe mousemove.jcarouselSwipe', dragMove);
                $(document).on('touchend.jcarouselSwipe touchcancel.jcarouselSwipe mouseup.jcarouselSwipe', dragEnd);
            }

            function dragMove(event) {
                var delta, newLT;
                event = event.originalEvent || event || window.event;
                currentTouch = getTouches(event);

                if (started) {
                    event.preventDefault();
                }

                if (Math.abs(startTouch[yKey] - currentTouch[yKey]) > 10 && !started) {
                    $(document).off('touchmove.jcarouselSwipe mousemove.jcarouselSwipe');
                    return;
                }

                if (!animated && Math.abs(startTouch[xKey] - currentTouch[xKey]) > 10) {
                    delta = startTouch[xKey] - currentTouch[xKey];


                    if (!started) {
                        started = true;
                        self._addClones();
                        self._currentLT = self._getListPosition();
                        lastItem = self._instance.items().last();
                        minLT = (lastItem.position()[self._instance.lt] + self._instance.dimension(lastItem) - self._instance.clipping()) * -1;
                    }

                    newLT = self._instance._options.wrap === 'circular' ? self._currentLT - delta : Math.min(0, Math.max(self._currentLT - delta, minLT));

                    self._setListPosition(newLT + 'px');
                }
            }

            function dragEnd(event) {
                event = event.originalEvent || event || window.event;
                if (started) {
                    var newTarget = self._getNewTarget(startTouch[xKey] - currentTouch[xKey] > 0);
                    newTarget = self._instance._options.wrap === 'circular' ? newTarget.relative : newTarget.static;

                    $(event.target).on("click.disable", function (event) {
                        event.stopImmediatePropagation();
                        event.stopPropagation();
                        event.preventDefault();
                        $(event.target).off("click.disable");
                    });

                    self._removeClones();
                    self._instance._items = null;
                    animated = true;
                    self._instance.scroll(newTarget, function() {
                        started = false;
                        animated = false;
                    });
                }

                $(document).off('touchmove.jcarouselSwipe mousemove.jcarouselSwipe');
                $(document).off('touchend.jcarouselSwipe touchcancel.jcarouselSwipe mouseup.jcarouselSwipe');
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
        _getNewTarget: function(isSwipeToNext) {
            var target = this._instance.target();
            var staticTarget = this._instance.index(target);
            var relativeTarget = 0;

            while(true) {
                if (!target.length ||
                    isSwipeToNext && target.offset()[this._instance.lt] - this._carouselOffset >= 0 ||
                    !isSwipeToNext && target.offset()[this._instance.lt] - this._carouselOffset <= 0) {
                    break;
                }

                if (isSwipeToNext) {
                    target = target.next();
                    if (!target.length) break;
                    staticTarget = staticTarget + 1 >= this._slidesCount ? 0 : staticTarget + 1;
                } else {
                    target = target.prev();
                    if (!target.length) break;
                    staticTarget = staticTarget - 1 < 0 ? this._slidesCount - 1 : staticTarget - 1;
                }

                relativeTarget++;
            }

            return {
                static: staticTarget,
                relative: (isSwipeToNext ? '+' : '-') + '=' + relativeTarget
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
            var isLeft = this._instance.lt === 'left';
            position = position || 0;

            if (transforms3d) {
                css.transform = 'translate3d(' + (isLeft ? position : 0) + ',' + (isLeft ? 0 : position) + ',0)';
            } else if (transforms) {
                css.transform = 'translate(' + (isLeft ? position : 0) + ',' + (isLeft ? 0 : position) + ')';
            } else {
                css[this._instance.lt] = position;
            }

            this._instance.list().css(css);
        },
        _addClones: function() {
            var self = this;
            var inst = this._instance;
            var items = inst.items();
            var first = inst.first();
            var last = inst.last();
            var clip = inst.dimension($(window));
            var curr;
            var wh;
            var index;
            var clonesBefore = [];
            var clonesAfter = [];
            var lt = self._getListPosition();
            var moveObj = {};

            if (inst._options.wrap !== 'circular') {
                return false;
            }

            for (wh = 0, index = 0, curr = first; wh < clip;) {
                curr = curr.prev();

                if (curr.length === 0) {
                    index = --index < -items.length ? -1 : index;
                    wh += inst.dimension(items.eq(index));
                    clonesBefore.push(items.eq(index).clone().attr('data-jcarousel-clone', true));
                } else {
                    wh += inst.dimension(curr);
                }
            }

            lt = Math.min(lt, - wh) + 'px';

            for (wh = 0, index = -1, curr = last; wh < clip;) {
                curr = curr.next();

                if (curr.length === 0) {
                    index = ++index > items.length - 1 ? 0 : index;
                    wh += inst.dimension(items.eq(index));
                    clonesAfter.push(items.eq(index).clone().attr('data-jcarousel-clone', true));
                } else {
                    wh += inst.dimension(curr);
                }
            }

            inst._items.first().before(clonesBefore.reverse());
            inst._items.last().after(clonesAfter);
            moveObj[inst.lt] = lt;
            inst.move(moveObj);
        },
        _removeClones: function() {
            var startPosition = this._instance.first().position()[this._instance.lt];
            var removeCLonesWidth;
            var moveObj = {};
            this._instance.list().find('[data-jcarousel-clone]').remove();
            removeCLonesWidth = Math.abs(this._instance.first().position()[this._instance.lt] - startPosition);
            if (removeCLonesWidth) {
                moveObj[this._instance.lt] = this._getListPosition() + removeCLonesWidth + 'px';
                this._instance.move(moveObj);
            }
        },
        _destroy: function() {
            this._element.off('touchstart.jcarouselSwipe mousedown.jcarouselSwipe');
            $(document).off('touchmove.jcarouselSwipe mousemove.jcarouselSwipe touchend.jcarouselSwipe touchcancel.jcarouselSwipe mouseup.jcarouselSwipe');
        },
        _reload: function() {
            this._create();
        }
    });
}(jQuery));
