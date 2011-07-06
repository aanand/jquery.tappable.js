/*
 * jquery.tappable.js version 0.1
 *
 * Emulates native touch behaviour for buttons and other 'tappable' UI elements:
 *
 *  - A 'touched' class is added to the element as soon as it is touched (or
 *    after a specified delay), so that it can be immediately 'highlighted',
 *    providing a better experience than e.g. Mobile Safari's 300ms 'click'
 *    event delay and ugly grey overlay.
 *
 *  - The supplied callback is called as soon as the user lifts their finger
 *    (or, if a delay has been set, once the delay has expired).
 *
 *  - Highlighting and firing of the callback is cancelled if the user moves
 *    their finger (though this can be disabled).
 *
 *  - If the browser doesn't support touch events, it falls back to click events.
 *
 * See it in action here: http://nnnnext.com
 *
 * I recommend that you add a `-webkit-tap-highlight-color: rgba(0,0,0,0)`
 * style rule to any elements you wish to make tappable, to hide the ugly grey
 * click overlay.
 *
 * Tested on iOS 4.3 and some version of Android, I don't know. Leave me alone.
 *
 * Basic usage:
 *
 *   $(element).tappable(function() { console.log("Hello World!") })
 *
 * Advanced usage:
 *
 *   $(element).tappable({
 *     callback:     function() { console.log("Hello World!") },
 *     cancelOnMove: false,
 *     touchDelay:   150,
 *     onlyIf:       function() { return Math.random() > 0.5 }
 *   })
 *
 * Options:
 *
 *   cancelOnMove: If true, then as soon as the user moves their finger, the
 *                 'touched' class is removed from the element. When they lift
 *                 their finger, the callback will *not* be fired. Defaults to
 *                 true.
 *
 *   touchDelay:   Time to wait (ms) before adding the 'touched' class. If the
 *                 user lifts their finger before the delay has expired, then
 *                 the callback will be fired when it does expire, and the
 *                 'touched' class will not be added. Best employed on items in
 *                 a list, to avoid a flash of highlighting every time the user
 *                 scrolls the list - around 150 will work well. Defaults to 0.
 *   
 *   onlyIf:       Function to run as soon as the user touches the element, to
 *                 determine whether to do anything. If it returns a falsy value,
 *                 the callback will not be fired and the 'touched' class will
 *                 not be added. It's better to use this argument than to
 *                 perform the logic in the callback, which will run too late to
 *                 prevent the 'touched' class from being added.
 *
 */

;(function($) {
  var touchSupported = ('ontouchstart' in window)

  $.fn.tappable = function(options) {
    var cancelOnMove = true,
        onlyIf = function() { return true },
        touchDelay = 0,
        callback

    switch(typeof options) {
      case 'function':
        callback = options
        break;
      case 'object':
        callback = options.callback

        if (typeof options.cancelOnMove != 'undefined') {
          cancelOnMove = options.cancelOnMove
        }

        if (typeof options.onlyIf != 'undefined') {
          onlyIf = options.onlyIf
        }

        if (typeof options.touchDelay != 'undefined') {
          touchDelay = options.touchDelay
        }

        break;
    }

    var fireCallback = function(el, event) {
      if (typeof callback == 'function' && onlyIf(el)) {
        callback.call(el, event)
      }
    }

    if (touchSupported) {
      this.bind('touchstart', function(event) {
        var el = this

        if (onlyIf(this)) {
          $(el)
            .removeClass('touched')
            .removeClass('touch-ended')
            .addClass('touch-started')

          window.setTimeout(function() {
            if ($(el).hasClass('touch-ended')) {
              fireCallback(el, event)
            } else if ($(el).hasClass('touch-started')) {
              $(el).addClass('touched')
            }
          }, touchDelay)
        }

        return true
      })

      this.bind('touchend', function(event) {
        var el = this

        if ($(el).hasClass('touched')) {
          $(el).removeClass('touched')
          fireCallback(el, event)
        } else if ($(el).hasClass('touch-started')) {
          $(el)
            .removeClass('touch-started')
            .addClass('touch-ended')
        }

        return true
      })

      this.bind('click', function(event) {
        event.preventDefault()
      })

      if (cancelOnMove) {
        this.bind('touchmove', function() {
          $(this)
            .removeClass('touched')
            .removeClass('touch-started')
            .removeClass('touch-ended')
        })
      }
    } else if (typeof callback == 'function') {
      this.bind('click', function(event) {
        if (onlyIf(this)) {
          callback.call(this, event)
        }
      })
    }

    return this
  }
})(jQuery);

