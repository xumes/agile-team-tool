/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

	var overlay = __webpack_require__(1)
	var tray = __webpack_require__(3)
	var tabGroup = __webpack_require__(4)
	var tooltip = __webpack_require__(5)
	var dismissible = __webpack_require__(6)
	var dropdown = __webpack_require__(7)
	var progressBar = __webpack_require__(8)
	var accordion = __webpack_require__(9)
	var setHeightFns = __webpack_require__(10)
	var carousel = __webpack_require__(11)
	var sideNav = __webpack_require__(16)
	var scrollspy = __webpack_require__(17)
	var jumpLink = __webpack_require__(18)
	var expandCollapse = __webpack_require__(19)
	var utils = __webpack_require__(2)

	var setHeight = setHeightFns.setHeight
	var setHeightMultipleGroups = setHeightFns.setHeightMultipleGroups

	function catchErrors (arg, fn) {
	  try {
	    return fn(arg)
	  } catch (e) {
	    console.error('Error: ', e)
	  }
	}

	function initOverlays () {
	  var overlayClasses = '.ds-overlay, .ds-overlay-focus, .ds-overlay-fullscreen'
	  var overlays = Array.prototype.slice.apply(document.querySelectorAll(overlayClasses))
	  overlays.forEach(function (overlayEl) {
	    catchErrors(overlayEl, overlay)
	  })
	}

	function initTrays () {
	  var trayClasses = '.ds-tray'
	  var trays = Array.prototype.slice.apply(document.querySelectorAll(trayClasses))
	  trays.forEach(function (trayEl) {
	    catchErrors(trayEl, tray)
	  })
	}

	function initTabs () {
	  var tabClasses = '.ds-tabs'
	  var tabs = Array.prototype.slice.apply(document.querySelectorAll(tabClasses))
	  tabs.forEach(function (tabEl) {
	    catchErrors(tabEl, tabGroup)
	  })
	}

	function initTooltips () {
	  var tooltipClasses = '.ds-tooltip'
	  var tooltips = Array.prototype.slice.apply(document.querySelectorAll(tooltipClasses))
	  catchErrors(tooltips, initCaretPositionStyleTag)
	  tooltips.forEach(function (tooltipEl) {
	    catchErrors(tooltipEl, tooltip)
	  })
	}

	function initCaretPositionStyleTag (tooltips) {
	  var style = document.createElement('style')
	  style.id = tooltip.styleTagId
	  style.innerHTML = ''
	  document.head.appendChild(style)
	}

	function initDismissibles () {
	  var dismissibleClasses = '.ds-dismissible'
	  var dismissibles = Array.prototype.slice.apply(document.querySelectorAll(dismissibleClasses))
	  dismissibles.forEach(function (dismissibleEl) {
	    catchErrors(dismissibleEl, dismissible)
	  })
	}

	function initDropdowns () {
	  var dropdownClasses = '.ds-dropdown'
	  var dropdowns = Array.prototype.slice.apply(document.querySelectorAll(dropdownClasses))
	  dropdowns.forEach(function (dropdownEl) {
	    catchErrors(dropdownEl, dropdown)
	  })
	}

	function initProgressBars () {
	  var progressBarClasses = '.ds-progress-bar'
	  var progressBars = Array.prototype.slice.apply(document.querySelectorAll(progressBarClasses))
	  progressBars.forEach(function (progressBarEl) {
	    catchErrors(progressBarEl, progressBar.progressBar)
	  })
	}

	function initFileUpload () {
	  var fileUploadClasses = '.ds-file-upload'
	  var fileUploads = Array.prototype.slice.apply(document.querySelectorAll(fileUploadClasses))
	  fileUploads.forEach(function (fileUploadEl) {
	    catchErrors(fileUploadEl, progressBar.fileUpload)
	  })
	}

	function initAccordions () {
	  var accordionClasses = '.ds-accordion, .ds-accordion-small, .ds-accordion-large'
	  var accordions = Array.prototype.slice.apply(document.querySelectorAll(accordionClasses))
	  accordions.forEach(function (accordionEl) {
	    catchErrors(accordionEl, accordion)
	  })
	}

	function initSetSameHeight () {
	  // get groups
	  var setHeightArray = Array.prototype.slice.call(document.querySelectorAll('[class*="ds-set-height-"]'))

	  catchErrors(setHeightArray, setHeightMultipleGroups)
	}

	function initCarousels () {
	  var carouselClasses = '.ds-carousel'
	  var carousels = Array.prototype.slice.apply(document.querySelectorAll(carouselClasses))
	  carousels.forEach(function (carouselEl) {
	    catchErrors(carouselEl, carousel)
	  })
	}

	function initDelay () {
	  var delayClasses = '.ds-carousel, .ds-accordion, .ds-accordion-small, .ds-accordion-large, .ds-tabs, .ds-overlay, .ds-overlay-focus, .ds-overlay-fullscreen, .ds-trays'
	  var delayers = Array.prototype.slice.apply(document.querySelectorAll(delayClasses))
	  delayers.forEach(function (delayer) {
	    catchErrors(delayer, utils.delay)
	  })
	}

	// jumplinks should be implemented manually, prevent error from hash routing
	// function initJumpLinks () {
	//   var jumpLinkTags = 'a[href^="#"]'
	//   var jumpLinks = Array.prototype.slice.apply(document.querySelectorAll(jumpLinkTags))
	//   jumpLinks.forEach(function (jumpLinkEl) {
	//     if (jumpLinkEl.hash.length > 0) {
	//       catchErrors(jumpLinkEl, jumpLink)
	//     }
	//   })
	// }

	function initSideNav () {
	  catchErrors('', sideNav)
	}

	function initScrollspy () {
	  catchErrors('', scrollspy)
	}

	function initExpandCollapse () {
	  var expandClasses = '.ds-expand-collapse'
	  var expandss = Array.prototype.slice.apply(document.querySelectorAll(expandClasses))
	  expandss.forEach(function (expandEl) {
	    catchErrors(expandEl, expandCollapse)
	  })
	}

	// function initInputFile () {
	//   var inputFileClasses = '.ds-input-file-container'
	//   var inputFiles = Array.prototype.slice.apply(document.querySelectorAll(inputFileClasses))
	//   inputFiles.forEach(function (inputFileEl) {
	//     catchErrors(inputFileEl, inputFile)
	//   })
	// }

	function init () {
	  initOverlays()
	  initTrays()
	  initTabs()
	  initTooltips()
	  initDismissibles()
	  initDropdowns()
	  initProgressBars()
	  initFileUpload()
	  initAccordions()
	  initSetSameHeight()
	  initCarousels()
	  // initJumpLinks()
	  initExpandCollapse()
	  initDelay()

	  if (document.querySelector('.ds-scrollspy')) initScrollspy()
	  else initSideNav()

	  window.addEventListener('resize', utils.last(40, initSetSameHeight))
	}

	window.w3ds = {
	  init: init,
	  overlay: overlay,
	  tray: tray,
	  tabGroup: tabGroup,
	  tooltip: tooltip,
	  dismissible: dismissible,
	  dropdown: dropdown,
	  progressBar: progressBar,
	  accordion: accordion,
	  setHeight: setHeight,
	  setAllHeightGroups: setHeightMultipleGroups,
	  carousel: carousel,
	  jumpLink: jumpLink,
	  sideNav: sideNav,
	  scrollspy: scrollspy,
	  expandCollapse: expandCollapse,
	  delay: utils.delay,
	  dispatchFocusEvent: utils.dispatchFocusEvent
	}

	document.addEventListener('DOMContentLoaded', function (event) {
	  // .ds-js-manual-init is added to the body
	  if (!document.querySelector('.ds-js-manual-init')) {
	    init()
	  }
	})


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

	var utils = __webpack_require__(2)
	var objectFrom = utils.objectFrom
	var keycodes = utils.keycodes
	var addCheckFocusListener = utils.checkFocus

	var bodyEl = document.querySelector('body')

	function overlay (el, options) {
	  // var dataAttrs = objectFrom(el.dataset)
	  var opts = objectFrom(el.dataset, options)
	  var openControl = document.querySelector('#' + el.id + '-open')
	  var closeControl
	  var ariaHide = Array.prototype.slice.call(document.querySelectorAll('body > :not(.ds-overlay-container)'))

	  if (options !== undefined && options.obj) {
	    addCheckFocusListener('ds-open', el, options)
	  }

	  el.setAttribute('aria-hidden', 'true')
	  el.setAttribute('role', 'dialog')
	  el.querySelector('.ds-overlay-box').setAttribute('role', 'document')

	  // add close button unless data-close-button="false" or included in options
	  if (opts.closeButton !== 'false') {
	    el.querySelector('.ds-overlay-box').insertAdjacentHTML('afterbegin', '<button class="ds-close ds-button ds-flat"><span class="ds-icon-x"></span></button>')
	  }

	  // closeControl = el.querySelector('.ds-close')
	  closeControl = Array.prototype.slice.call(el.querySelectorAll('[class*="ds-close"]'))

	  if (!openControl) {
	    return console.warn('w3DS: an open control does not exist for the overlay:', el)
	  }

	  openControl.addEventListener('click', openBtnListener)

	  closeControl.forEach(function (element) {
	    element.addEventListener('click', function () {
	      ariaHide.forEach(function (ariaEl) {
	        ariaEl.setAttribute('aria-hidden', false)
	      })
	      closeThisOverlay()
	    })
	  })

	  // closeControl.addEventListener('click', function () {
	  //   ariaHide.forEach(function (element) {
	  //     element.setAttribute('aria-hidden', false)
	  //   })

	  //   closeThisOverlay()
	  // })

	  function openBtnListener (e) {
	    // get all direct body children except overlay
	    ariaHide.filter(function (element) {
	      return element !== el
	    })

	    // listen for esc key and exit overlay
	    window.addEventListener('keydown', escListener)

	    window.addEventListener('focusin', outsideFocusListener)

	    // listen for all clicks, close overlay if outside 'overlay-content'
	    if (el.className.split(' ').indexOf('ds-overlay-focus') === -1) {
	      el.addEventListener('click', outsideClickListener)
	    }

	    openOverlay(el, closeControl)

	    ariaHide.forEach(function (element) {
	      element.setAttribute('aria-hidden', true)
	    })
	    openControl.removeEventListener('click', openBtnListener)
	  }

	  function closeThisOverlay () {
	    openControl.addEventListener('click', openBtnListener)
	    el.removeEventListener('click', outsideClickListener)
	    window.removeEventListener('focusin', outsideFocusListener)
	    window.removeEventListener('keydown', escListener)
	    closeOverlay(el, openControl)
	  }

	  function outsideClickListener (e) {
	    if (!isClickInsideOverlayContent(e.target)) {
	      closeThisOverlay()
	    }
	  }

	  function outsideFocusListener (e) {
	    if (!isFocusInsideOverlayContent(e.target)) {
	      closeControl.forEach(function (element) {
	        element.focus()
	      })
	    }
	  }

	  function escListener (ev) {
	    if (ev.keyCode === keycodes.esc) {
	      closeThisOverlay()
	    }
	  }

	  function isClickInsideOverlayContent (target) {
	    if (target.className.split(' ').indexOf('ds-overlay-box') !== -1) {
	      return true
	    } else if (target.id === el.id) {
	      return false
	    } else {
	      return isClickInsideOverlayContent(target.parentNode)
	    }
	  }

	  function isFocusInsideOverlayContent (target) {
	    if (target.className.split(' ').indexOf('ds-overlay-box') !== -1) {
	      return true
	    } else if (target === bodyEl) {
	      return false
	    } else {
	      return isFocusInsideOverlayContent(target.parentNode)
	    }
	  }

	  /* -- PUBLIC METHODS -- */
	  function openOverlay (el, closeControl) {
	    el.classList.add('ds-open')
	    bodyEl.style.overflow = 'hidden'
	    el.setAttribute('aria-hidden', false)

	    if (closeControl !== undefined) {
	      if (Array.isArray(closeControl)) { // if more than one close buttons
	        console.log('array')
	        closeControl.forEach(function (element) {
	          element.focus()
	        })
	      } else {
	        console.log('single item')
	        closeControl.focus()
	      }
	    }

	    window.w3ds.dispatchFocusEvent(el)
	  }

	  function closeOverlay (el, openControl) {
	    el.classList.remove('ds-open')
	    bodyEl.style.overflow = 'auto'
	    el.setAttribute('aria-hidden', true)

	    if (openControl !== undefined) {
	      openControl.focus()
	    }

	    window.w3ds.dispatchFocusEvent(el)
	  }
	  /* -- END PUBLIC METHODS -- */

	  /* -- EXPOSE METHODS -- */
	  return {
	    open: openOverlay,
	    close: closeOverlay
	  }
	  /* -- END EXPOSE METHODS -- */
	}

	module.exports = overlay


/***/ }),
/* 2 */
/***/ (function(module, exports) {

	// returns a new object made up of objects passed in
	// each object in arguments takes precedence over the previous object
	function objectFrom () {
	  var args = Array.prototype.slice.call(arguments)

	  var obj = args.reduce(function (result, arg) {
	    // get enumerable properties and copy to new obj
	    if (arg instanceof window.DOMStringMap) { // if it's a DOMStringMap, handle it custom
	      for (var key1 in arg) {
	        result[key1] = arg[key1]
	      }
	    } else {
	      for (var key2 in arg) {
	        if (arg.propertyIsEnumerable(key2)) {
	          result[key2] = arg[key2]
	        }
	      }
	    }

	    return result
	  }, {})

	  return obj
	}

	function throttle (time, fn) {
	  var lastExecution

	  return function () {
	    var now = Date.now()
	    if (!lastExecution || now - lastExecution > time) {
	      fn.apply(this, arguments)
	      lastExecution = now
	    }
	  }
	}

	function throttleLast (time, fn) {
	  var lastExecution
	  var timeout

	  return function () {
	    var now = Date.now()
	    var self = this
	    var args = arguments

	    var cb = function () {
	      fn.apply(self, args)
	      lastExecution = now
	    }

	    timeout = setTimeout(function () {
	      if (Date.now() - lastExecution > time) cb()
	    }, time)

	    if (!lastExecution || now - lastExecution > time) {
	      cb()
	      clearTimeout(timeout)
	    }
	  }
	}

	function last (time, fn) {
	  var lastCheck
	  var timeout

	  return throttle(time, function () {
	    var now = Date.now()
	    var self = this
	    var args = arguments

	    if (lastCheck && now - lastCheck > time) {
	      clearTimeout(timeout)
	    }

	    timeout = setTimeout(function () {
	      if (Date.now() - lastCheck > time) {
	        fn.apply(self, args)
	        lastCheck = now
	      }
	    }, time)

	    lastCheck = now
	  })
	}

	// extremely basic event handling
	function events () {
	  var listeners = {}

	  return {
	    addListener: addListener,
	    removeListener: removeListener,
	    trigger: trigger
	  }

	  function trigger (evt) {
	    var additionalArgs = Array.prototype.slice.call(arguments, 1)
	    listeners[evt].forEach(function (fn) {
	      fn.apply(null, additionalArgs)
	    })
	  }

	  function addListener (evt, fn) {
	    if (!listeners[evt]) {
	      listeners[evt] = [ fn ]
	    } else {
	      listeners[evt].push(fn)
	    }

	    return fn
	  }

	  function removeListener (evt, fn) {
	    if (evt instanceof Function) {
	      // if evt is a function, remove that function from all events
	      for (var key in listeners) {
	        listeners[key].filter(filterListeners)
	      }
	    } else if (!fn) {
	      // if there's not a function, remove the event
	      listeners[evt] = undefined
	    } else {
	      // if there's an event and a function, remove the function from the event
	      listeners[evt].filter(filterListeners)
	    }

	    function filterListeners (listenerFn) {
	      return listenerFn !== fn
	    }
	  }
	}

	function uniqueId (prefix, idSet) {
	  var id
	  var lastId

	  prefix = prefix || ''
	  idSet = idSet || _uniqueIds
	  lastId = idSet[idSet.length - 1]

	  if (idSet.length) {
	    id = atLeast4Chars(+lastId + 1 + '')
	  } else {
	    id = '0001'
	  }

	  idSet.push(id)
	  id = prefix + id
	  return id

	  function atLeast4Chars (str) {
	    if (str.length < 4) {
	      return atLeast4Chars('0' + str)
	    } else {
	      return str
	    }
	  }
	}

	function scrollTo (to, duration) {
	  var start = window.pageYOffset
	  var change = (to - start)
	  var increment = 20

	  var animateScroll = function (elapsedTime) {
	    elapsedTime += increment
	    var position = easeInOut(elapsedTime, start, change, duration)
	    window.scroll(0, position)

	    if (elapsedTime < duration) {
	      setTimeout(function () {
	        animateScroll(elapsedTime)
	      }, increment)
	    }
	  }

	  animateScroll(0)
	}

	function animateProperty (property) {
	  return function (element, end, duration, cb) {
	    if (duration instanceof Function) {
	      cb = duration
	      duration = null
	    }
	    var computed = window.getComputedStyle(element)
	    var specifiedTransition = computed['transition-property']
	    var start = computed[property]
	    var computedEnd = end === 'auto'
	      ? getAutoValue(element, property, start)
	      : end
	    var increment = 20
	    var totalChange = computedEnd - removeDimensions(start)

	    element.style[property] = start
	    element.offsetWidth // eslint-disable-line

	    if (specifiedTransition && specifiedTransition.indexOf(property) !== -1) {
	      element.addEventListener('transitionend', function transitionListener (e) {
	        if (e.propertyName === property) {
	          element.style[property] = end
	          element.removeEventListener('transitionend', transitionListener)
	          if (cb) cb()
	        }
	      })
	      element.style[property] = computedEnd + 'px'
	    } else {
	      animate(0)
	    }

	    function animate (elapsedTime) {
	      elapsedTime += increment
	      var current = easeInOut(elapsedTime, start, totalChange, duration)
	      window.requestAnimationFrame(function () {
	        element.style[property] = current + 'px'
	      })

	      if (elapsedTime < duration) {
	        setTimeout(function () {
	          animate(elapsedTime)
	        }, increment)
	      } else {
	        if (cb) cb()
	      }
	    }
	  }
	}

	function getAutoValue (element, property, start) {
	  element.style[property] = 'auto'
	  var autoValue = removeDimensions(window.getComputedStyle(element)[property])
	  element.style[property] = start
	  return autoValue
	}

	function removeDimensions (str) {
	  return +str.replace(/px|em|rem/g, function (match) { return '' })
	}

	// gets scrollTop pos for each .ds-scrollspy-section relative to body
	function getScrollTopFromBody (element) {
	  var pos = 0

	  while (element) {
	    pos += (element.offsetTop + element.clientTop)
	    element = element.offsetParent
	  }

	  return pos
	}

	// Will come back and adjust this later
	function easeInOut (currentTime, start, change, duration) {
	  currentTime /= duration / 2
	  if (currentTime < 1) {
	    return change / 2 * currentTime * currentTime + start
	  }
	  currentTime -= 1
	  return -change / 2 * (currentTime * (currentTime - 2) - 1) + start
	}

	function createUniqueIdSet (prefix, idSet) {
	  if (prefix instanceof Array) {
	    prefix = null
	    idSet = prefix
	  }

	  prefix = prefix || ''
	  idSet = idSet || []

	  return {
	    id: function () {
	      return uniqueId(prefix, idSet)
	    }
	  }
	}

	function isTargetInsideElement (target, element) {
	  if (target === element) {
	    return true
	  } else if (target === document.body) {
	    return false
	  } else {
	    return isTargetInsideElement(target.parentNode, element)
	  }
	}

	function delay (wait, fn, params) {
	  // var options = Object.assign({}, comp.options, params)
	  setTimeout(
	    function () {
	      if (fn) {
	        // if (fn === 'autoplay') {
	          // autoplay with latest options
	          // comp.goToSlide(options.index)
	          // comp.play(options.index, options.interval)
	        // } else {
	        fn.call(params)
	        // }
	      }
	    }, wait
	  )
	}

	// custom event for element focus
	var focusEv = document.createEvent('Event')
	focusEv.initEvent('itemFocus', true, true)

	function checkFocus (elClass, el, func) {
	  if (func !== undefined) {
	    el.addEventListener('itemFocus', function focusItem (e) {
	      if (e.target.className.split(' ').indexOf(elClass) !== -1) {
	        // console.log('itemOpen')
	        if (func.focus) {
	          func.focus.call(func.obj)
	        }
	      } else {
	        // console.log('itemClose')
	        if (func.blur) {
	          func.blur.call(func.obj)
	        }
	      }
	    }, false)
	  }
	}

	function dispatchFocusEvent (el) {
	  el.dispatchEvent(focusEv)
	}

	var _uniqueIds = []

	// function listenOnce (el) {
	//   var additionalArgs = Array.prototype.slice.call(arguments, 1)

	//   el.addEventListener.apply(el, additionalArgs)

	//   function callback (e) {
	//     el.removeEventListener.apply(el, additionalArgs)
	//     cb(e)
	//   }
	// }

	var keycodes = {
	  esc: 27,
	  enter: 13,
	  space: 32,
	  tab: 9,
	  left: 37,
	  up: 38,
	  right: 39,
	  down: 40,
	  shift: 16
	}

	var focusableQuerySelector = [
	  'a[href]',
	  'area[href]',
	  'input:not([disabled])',
	  'select:not([disabled])',
	  'textarea:not([disabled])',
	  'button:not([disabled])',
	  'iframe',
	  'object',
	  'embed',
	  '*[tabindex]',
	  '*[contenteditable]'
	]

	module.exports = {
	  objectFrom: objectFrom,
	  keycodes: keycodes,
	  events: events,
	  uniqueId: uniqueId,
	  createUniqueIdSet: createUniqueIdSet,
	  // listenOnce: listenOnce,
	  focusable: focusableQuerySelector.join(', '),
	  scrollTo: scrollTo,
	  getScrollTopFromBody: getScrollTopFromBody,
	  easeInOut: easeInOut,
	  isTargetInsideElement: isTargetInsideElement,
	  getAutoValue: getAutoValue,
	  animateProperty: animateProperty,
	  throttle: throttle,
	  throttleLast: throttleLast,
	  last: last,
	  delay: delay,
	  checkFocus: checkFocus,
	  dispatchFocusEvent: dispatchFocusEvent
	}


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

	var utils = __webpack_require__(2)

	var isTargetInsideElement = utils.isTargetInsideElement
	var focusable = utils.focusable
	var animateHeight = utils.animateProperty('height')
	var animateWidth = utils.animateProperty('width')
	var animateMarginLeft = utils.animateProperty('margin-left')
	var keycodes = utils.keycodes
	var addCheckFocusListener = utils.checkFocus

	function openTray (el) {
	  el.style.zIndex = 101
	  el.classList.add('ds-open')
	  if (el.classList.contains('ds-tray-left')) {
	    animateWidth(el, el.getAttribute('data-width') || 'auto')
	  } else if (el.classList.contains('ds-tray-right')) {
	    animateMarginLeft(el, el.getAttribute('data-margin-left') || 0)
	  } else {
	    animateHeight(el, el.getAttribute('data-height') || 'auto')
	  }
	  // enables amination to button when tray is open (example page)
	  el.parentElement.classList.add('ds-tray-open')

	  // add for screen readers
	  el.setAttribute('aria-hidden', false)
	  window.w3ds.dispatchFocusEvent(el)
	}

	function closeTray (el) {
	  el.style.zIndex = ''
	  var trayName = el.id
	  var trayButton = document.querySelector('.ds-tray-open .' + trayName + '-open')

	  if (trayButton) {
	    trayButton.classList.remove('active')
	  }

	  if (el.classList.contains('ds-megamenu')) {
	    var focusableEls = Array.prototype.slice.call(el.querySelectorAll(focusable))
	    focusableEls.forEach(function (focusEl) {
	      focusEl.tabIndex = -1
	    })
	  } else {
	    el.tabIndex = -1
	  }

	  if (el.classList.contains('ds-tray-left')) {
	    animateWidth(el, 0, function () {
	      el.classList.remove('ds-open')
	      window.w3ds.dispatchFocusEvent(el)
	    })
	  } else if (el.classList.contains('ds-tray-right')) {
	    animateMarginLeft(el, '100%', function () {
	      el.classList.remove('ds-open')
	      window.w3ds.dispatchFocusEvent(el)
	    })
	  } else {
	    animateHeight(el, 0, function () {
	      el.classList.remove('ds-open')
	      window.w3ds.dispatchFocusEvent(el)
	    })
	  }
	  // enables amination to button when tray is open (example page)
	  el.parentElement.classList.remove('ds-tray-open')

	  // add for screen readers
	  el.setAttribute('aria-hidden', true)
	}

	function tray (el, options) {
	  if (el.classList.contains('ds-tray-left')) {
	    el.style.width = 0
	  } else if (el.classList.contains('ds-tray-right')) {
	    el.style.marginLeft = '100%'
	  } else {
	    el.style.height = 0
	  }
	  var control = document.querySelector('.' + el.id + '-open')
	  var focusableEls = Array.prototype.slice.call(el.querySelectorAll(focusable))

	  var isOpen = false

	  var openActions = [ 'click' ]

	  if (el.classList.contains('ds-tray-hover-open')) {
	    openActions.push('mouseenter')
	  }

	  el.setAttribute('aria-hidden', true)

	  addOpenListener()

	  if (options !== undefined && options.obj) {
	    addCheckFocusListener('ds-open', el, options)
	  }

	  function openListener (e) {
	    removeOpenListener()
	    addCloseListener()
	    openTray(el)

	    if (el.classList.contains('ds-megamenu')) setMegamenu()
	    else el.tabIndex = 0

	    isOpen = true
	  }

	  function removeOpenListener () {
	    openActions.forEach(function (action) {
	      control.removeEventListener(action, openListener)
	    })
	  }

	  function addOpenListener () {
	    openActions.forEach(function (action) {
	      control.addEventListener(action, openListener)
	    })
	  }

	  function setMegamenu () {
	    var trayName = el.id
	    var trayButton = document.querySelector('.ds-tray-open .' + trayName + '-open')

	    trayButton.classList.add('active')

	    focusableEls.forEach(function (focusEl) {
	      focusEl.tabIndex = 0
	    })

	    trayButton.addEventListener('blur', focusToTray)
	  }

	  function unsetMegamenu () {
	    var trayName = el.id
	    var trayButton = document.querySelector('.ds-tray-open .' + trayName + '-open')

	    focusableEls.forEach(function (focusEl) {
	      focusEl.tabIndex = -1
	    })

	    trayButton.classList.remove('active')
	    trayButton.removeEventListener('blur', focusToTray)
	  }

	  function focusToTray (e) {
	    focusableEls[0].focus()
	  }

	  function addCloseListener () {
	    if (el.classList.contains('ds-tray-hover-open')) {
	      control.addEventListener('mouseleave', closeListener)

	      el.addEventListener('mouseenter', trayHovered)
	    }

	    document.addEventListener('click', outsideClickListener, true)
	    control.addEventListener('click', closeListener)
	    window.addEventListener('keydown', closeListener)

	    // jumping back to parent button (focusout doesn't work in FF)
	    el.addEventListener('blur', trayToButton, true)
	  }

	  function trayToButton (e) {
	    if (isTargetInsideElement(e.relatedTarget, el)) return

	    if (el.classList.contains('ds-open')) {
	      control.focus()
	    }
	  }

	  function removeCloseListener () {
	    document.removeEventListener('click', outsideClickListener, true)
	    control.removeEventListener('click', closeListener)
	    window.removeEventListener('keydown', closeListener)
	    el.removeEventListener('blur', trayToButton)
	    el.removeEventListener('mouseleave', closeListener)

	    if (el.classList.contains('ds-tray-hover-open')) {
	      control.removeEventListener('mouseleave', closeListener)

	      el.removeEventListener('mouseenter', trayHovered)
	    }
	  }

	  function outsideClickListener (ev) {
	    ev.stopPropagation()

	    if (!isClickInsideTray(ev.target)) {
	      closeListener(ev)
	    }
	  }

	  function closeListener (e) {
	    if (!isOpen) return
	    if (e.keyCode) {
	      if (e.keyCode !== keycodes.esc) return
	      else control.focus()
	    }

	    if (e.type === 'mouseleave' && isTargetInsideElement(e.relatedTarget, el)) return

	    if (el.classList.contains('ds-megamenu')) unsetMegamenu()
	    else el.tabIndex = -1

	    closeTray(el)
	    removeCloseListener()
	    addOpenListener()
	    isOpen = false
	  }

	  function trayHovered () {
	    el.addEventListener('mouseleave', closeListener)
	  }

	  function isClickInsideTray (target) {
	    if (target.tagName === 'BODY') {
	      return false
	    } else if (target.classList.contains('ds-tray')) {
	      return true
	    } else if (target.id === el.id) {
	      return false
	    } else {
	      return isClickInsideTray(target.parentNode)
	    }
	  }
	}

	module.exports = tray


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

	var utils = __webpack_require__(2)

	var keycodes = utils.keycodes

	function tabGroup (el, options) {
	  var controlsContainer = el.querySelector('.ds-tab-controls')
	  var controls = Array.prototype.slice.apply(controlsContainer.querySelectorAll('.ds-tab-controls .ds-button'))
	  var removeSelectedPending

	  var controlEvents = [ 'click' ]

	  if (controlsContainer.className.split(' ').indexOf('ds-tab-controls-hover') !== -1) {
	    controlEvents.push('mouseenter')
	  }

	  var tabs = controls.map(function (control) {
	    var contentContainerId = '#' + control.id.split('-').map(function (str) {
	      return str === 'control' ? 'content' : str
	    }, '').join('-')

	    return {
	      control: control,
	      content: control.id ? el.querySelector(contentContainerId) : null
	    }
	  })

	  // listen for arrow keys for looking at tab options
	  controlsContainer.addEventListener('keydown', tabChangeKeypress)

	  controls.forEach(function (control) {
	    if (!control.classList.contains('ds-selected')) {
	      control.setAttribute('tabindex', -1)
	      control.setAttribute('aria-selected', false)
	    } else {
	      control.setAttribute('aria-selected', true)
	    }
	  })

	  tabs.forEach(function (tab) {
	    if (tab.control.className.split(' ').indexOf('ds-selected') === -1) {
	      if (tab.content) {
	        tab.content.style.display = 'none'
	      }
	    }

	    controlEvents.forEach(function (ev) {
	      tab.control.addEventListener(ev, function () {
	        // don't select disabled tabs
	        if (tab.control.className.split(' ').indexOf('ds-disabled') === -1) {
	          switchSelected(tab)
	          centerActiveTab()
	        }
	      })
	    })

	    if (controlEvents.indexOf('mouseenter') !== -1) {
	      tab.control.addEventListener('mouseleave', removeSelectedListener)

	      if (tab.content) {
	        tab.content.addEventListener('mouseenter', function () {
	          removeSelectedPending = false
	        })

	        tab.content.addEventListener('mouseleave', function () {
	          removeSelected(tab)
	        })
	      }
	    }
	  })

	  centerActiveTab()

	  function switchSelected (newTab) {
	    removeSelectedPending = false

	    tabs.forEach(function (tab) {
	      if (tab === newTab) {
	        tab.control.className += ' ds-selected'
	        tab.control.setAttribute('tabindex', 0)
	        tab.control.setAttribute('aria-selected', true)
	        if (tab.content) tab.content.style.display = ''
	      } else {
	        tab.control.setAttribute('aria-selected', false)
	        removeSelected(tab)
	        if (tab.content) tab.content.style.display = 'none'
	      }
	    })
	  }

	  function removeSelectedListener () {
	    removeSelectedPending = true

	    setTimeout(function () {
	      if (!removeSelectedPending) {
	        return
	      }

	      tabs.forEach(removeSelected)
	    }, 10)
	  }

	  function removeSelected (tab) {
	    var removedSelected = tab.control.className.split(' ').filter(function (cl) {
	      return cl !== 'ds-selected'
	    }).join(' ')

	    tab.control.className = removedSelected
	    tab.control.setAttribute('tabindex', -1)
	  }

	  function centerActiveTab () {
	    var tabContols = el.getElementsByClassName('ds-tab-controls')[0]
	    var selectedTab = el.querySelectorAll('.ds-tab-controls .ds-selected')[0]

	    if (!selectedTab) {
	      return
	    }

	    var offset = ((selectedTab.offsetLeft) % tabContols.scrollWidth) - (tabContols.clientWidth / 2.25)

	    tabContols.scrollLeft = offset
	  }

	  // moves focus between tab options via left & right arrows
	  function tabChangeKeypress (e) {
	    var index
	    var target = e.target

	    if (e.keyCode === keycodes.left) {
	      controls.forEach(function (control, i) {
	        if (control === target && i > 0) {
	          index = i - 1
	        }
	      })
	    } else if (e.keyCode === keycodes.right) {
	      controls.forEach(function (control, i, arr) {
	        if (control === target && i < arr.length - 1) {
	          index = i + 1
	        }
	      })
	    }

	    if (index >= 0) {
	      controls[index].focus()
	    }
	  }
	}

	module.exports = tabGroup


/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

	var utils = __webpack_require__(2)

	var focusable = utils.focusable
	var styleTagId = 'tooltip-caret-positions'

	function openTooltip (el) {
	  el.querySelector('.ds-tooltip-content').setAttribute('aria-hidden', false)
	  el.querySelector('.ds-tooltip-content').style.overflow = 'visible'
	  el.classList.add('ds-open')
	}

	function closeTooltip (el) {
	  var content = el.querySelector('.ds-tooltip-content')
	  content.addEventListener('transitionend', transitionEnded)

	  el.classList.remove('ds-open')

	  function transitionEnded (ev) {
	    content.removeEventListener('transitionend', transitionEnded)
	    content.style.overflow = ''
	    content.setAttribute('aria-hidden', true)
	  }
	}

	function tooltip (el) {
	  var isClickActivated = 'ontouchstart' in window || el.className.split(' ').indexOf('ds-click') !== -1
	  var style = document.querySelector('#' + styleTagId)
	  var openControl = el.querySelector('.ds-tooltip-trigger')
	      ? el.querySelector('.ds-tooltip-trigger')
	      : document.querySelector('#' + el.id)

	  var openAction = isClickActivated ? 'click' : 'mouseover'
	  var closeAction = isClickActivated ? 'click' : 'mouseout'

	  var tooltipTriggers = Array.prototype.slice.call(el.querySelectorAll('.ds-tooltip-trigger'))
	  var focusableEls = Array.prototype.slice.call(el.querySelectorAll(focusable))
	      .filter(function (focusEl) {
	        // Pick up tabindexes in tooltip trigger
	        return !focusEl.classList.contains('ds-tooltip-trigger')
	      })
	      .map(function (focusEl) {
	        return {
	          el: focusEl,
	          tabindex: focusEl.getAttribute('tabindex')
	        }
	      })

	  // add attribute on initilization
	  el.querySelector('.ds-tooltip-content').setAttribute('aria-hidden', true)

	  // look for items to add tabindex to
	  focusableEls.forEach(function (focusEl) {
	    focusEl.el.setAttribute('tabindex', -1)
	  })

	  tooltipTriggers.forEach(function (trigger) {
	    // if tabindexes already set in html, don't change anything
	    if (trigger.getAttribute('tabindex') == null) {
	      trigger.setAttribute('tabindex', 0)
	    }
	  })

	  createCaretPositionStyle(style, el)

	  addOpenListener(el)

	  function addOpenListener (el) {
	    openControl.addEventListener(openAction, openListener)
	    el.addEventListener('keydown', openListener)
	  }

	  function removeOpenListener () {
	    openControl.removeEventListener(openAction, openListener)
	    el.removeEventListener('keydown', openListener)
	  }

	  function openListener (e) {
	    if (!e.keyCode || e.keyCode === 13) {
	      removeOpenListener()
	      openTooltip(el)
	      addCloseListener(el)
	    }
	  }

	  function checkOpenTooltip (tooltip) {
	    var openTooltips = document.querySelectorAll('.ds-tooltip.ds-open')
	    var itemToOpen = tooltip.target.parentElement
	    var itemId = itemToOpen.id

	    // close itself if clicked anywhere on the page
	    if (itemToOpen.className.split(' ').indexOf('ds-tooltip') === -1) {
	      removeCloseListener()
	      closeTooltip(el)
	      addOpenListener(el)
	      return
	    }

	    // close previous one before opening a new one
	    for (var i = 0; i < openTooltips.length; i++) {
	      if (openTooltips[i].id !== itemId) {
	        // close the one that's open atm
	        removeCloseListener()
	        closeTooltip(openTooltips[i])

	        // open the one that's clicked on
	        openTooltip(itemToOpen)
	        addCloseListener(itemToOpen)

	        // clear array
	        openTooltips = []

	        return
	      } else if (openTooltips[i].id === itemId) {
	        // close itself when clicked on its own icon
	        // eventCache = tooltip
	        removeCloseListener()
	        closeTooltip(el)
	        tooltip.stopPropagation()
	        addOpenListener(el)

	        return
	      }
	    }
	  }

	  function outsideClickListener (ev) {
	    ev.stopPropagation()

	    // check if the next focused element is a 'focusableEl'
	    // if so, say it's a match
	    var match = focusableEls.reduce(function (acc, curr) {
	      if (curr.el === ev.relatedTarget) {
	        return true
	      } else {
	        return acc
	      }
	    }, false)

	    // skip this so tooltip doesn't close if there's a match
	    if (!match) {
	      checkOpenTooltip(ev)
	    }
	  }

	  function addCloseListener (el) {
	    // add exception for focusable elements, so it doesn't close itself when tabbed into
	    focusableEls.forEach(function (focusEl) {
	      if (focusEl.tabindex) {
	        focusEl.el.setAttribute('tabindex', focusEl.tabindex)
	      } else {
	        focusEl.el.setAttribute('tabindex', 0)
	      }
	    })

	    if (!isClickActivated) {
	      // listening for mouseover & mouseout
	      el.addEventListener(closeAction, closeListener)
	    }

	    // needed for when clicking on its own icon
	    document.addEventListener('click', outsideClickListener, true)
	    el.addEventListener('keydown', closeListener)

	    // when tabbing away from icon with open tooltip to another icon
	    el.addEventListener('blur', outsideClickListener, true)
	  }

	  function removeCloseListener () {
	    focusableEls.forEach(function (focusEl) {
	      focusEl.el.setAttribute('tabindex', -1)
	    })

	    if (!isClickActivated) {
	      el.removeEventListener(closeAction, closeListener)
	    }

	    document.removeEventListener('click', outsideClickListener, true)
	    el.removeEventListener('keydown', closeListener)
	    el.removeEventListener('blur', outsideClickListener, true)
	  }

	  function closeListener (e) {
	    if (!e.keyCode || e.keyCode === 13) {
	      closeTooltip(el)
	      removeCloseListener()
	      addOpenListener(el)
	    }
	  }

	  function createCaretPositionStyle () {
	    var percent = el.querySelector('.ds-tooltip-content').dataset.caret
	    var contentSelector

	    if (percent == null) {
	      return
	    }

	    if (style.innerHTML.indexOf(percent) === -1) {
	      contentSelector = '.ds-tooltip-content[data-caret="' + percent + '"]'
	      style.innerHTML += contentSelector + '::before, ' + contentSelector + '::after { left: ' + percent + '%; }\n'
	    }
	  }
	}

	module.exports = tooltip
	module.exports.styleTagId = 'tooltip-caret-positions'


/***/ }),
/* 6 */
/***/ (function(module, exports) {

	var bodyEl = document.querySelector('body')

	function dismiss (el) {
	  el.remove()
	  bodyEl.style.overflow = 'auto'
	}

	function dismissible (el) {
	  var closeControl = el.querySelector('.ds-close')

	  function click (event) {
	    el.classList.add('ds-fade')
	    el.addEventListener('transitionend', transitionEnded)
	  }

	  function transitionEnded (event) {
	    if (event.target.classList.contains('ds-dismissible')) {
	      el.removeEventListener('transitionend', transitionEnded)
	      el.classList.remove('ds-fade')
	      dismiss(el)
	    }
	    closeControl.removeEventListener('click', click)
	  }

	  closeControl.addEventListener('click', click)
	}

	module.exports = dismissible


/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

	var utils = __webpack_require__(2)

	var keycodes = utils.keycodes
	var focusable = utils.focusable

	// var bodyEl = document.querySelector('body')

	function openMenu (el) {
	  el.classList.add('ds-open')
	}

	function closeMenu (el) {
	  el.classList.remove('ds-open')
	}

	function dropdown (el) {
	  var openAction = 'click'
	  var closeAction = 'click'
	  var itemContainer = el.querySelector('.ds-options')
	  var items = Array.prototype.slice.call(el.querySelectorAll('.ds-option'))
	  var focusableEls = Array.prototype.slice.call(el.querySelectorAll(focusable))
	    .map(function (focusEl) {
	      return {
	        el: focusEl,
	        tabindex: focusEl.getAttribute('tabindex')
	      }
	    })
	  var focusedout

	  itemContainer.setAttribute('aria-hidden', 'true')

	  focusableEls.forEach(function (focusEl) {
	    focusEl.el.setAttribute('tabindex', -1)
	  })

	  items.forEach(function (item) {
	    item.setAttribute('tabindex', -1)
	  })

	  if (el.classList.contains('ds-hover')) {
	    openAction = 'mouseenter'
	    closeAction = 'mouseleave'
	  }

	  function addOpenListener () {
	    el.addEventListener(openAction, openListener)
	    el.addEventListener('keydown', keydownOpenListener)
	  }

	  function removeOpenListener () {
	    el.removeEventListener(openAction, openListener)
	    el.removeEventListener('keydown', keydownOpenListener)
	  }

	  function addCloseListener () {
	    el.addEventListener(closeAction, clickCloseListener)
	    el.addEventListener('keydown', keydownCloseListener)
	    el.addEventListener('blur', blurListener, true)
	    el.addEventListener('focus', focusListener, true)
	  }

	  function removeCloseListener () {
	    el.removeEventListener(closeAction, clickCloseListener)
	    el.removeEventListener('keydown', keydownCloseListener)
	    el.removeEventListener('blur', blurListener, true)
	    el.removeEventListener('focus', focusListener, true)
	  }

	  function openListener () {
	    removeOpenListener()

	    focusableEls.forEach(function (focusEl) {
	      if (focusEl.tabindex) {
	        focusEl.el.setAttribute('tabindex', focusEl.tabindex)
	      } else {
	        focusEl.el.removeAttribute('tabindex')
	      }
	    })

	    itemContainer.setAttribute('aria-hidden', 'false')

	    items.forEach(function (item, i) {
	      if (item.getAttribute('tabindex') === '-1') {
	        item.setAttribute('tabindex', 0)
	      }
	    })

	    openMenu(el)
	    addCloseListener()
	  }

	  function keydownOpenListener (e) {
	    if (e.target.tagName.toUpperCase() !== 'INPUT') {
	      if (e.keyCode === keycodes.enter || e.keyCode === keycodes.space) {
	        e.preventDefault()
	        openListener()
	      }
	    }
	  }

	  function keydownCloseListener (e) {
	    if (e.target.tagName.toUpperCase() !== 'INPUT') {
	      if (e.keyCode === keycodes.enter || e.keyCode === keycodes.space) {
	        e.preventDefault()
	        clickCloseListener(e)
	      }
	    }
	  }

	  function clickCloseListener (e) {
	    var closeClasses = [
	      'ds-dropdown',
	      'ds-dropup',
	      'ds-title',
	      'ds-option'
	    ]

	    var shouldClose = closeClasses.reduce(function (acc, currClass) {
	      return acc || e.target.classList.contains(currClass)
	    }, false)

	    if (shouldClose) {
	      closeListener()
	    } else {
	      e.stopPropagation()
	    }
	  }

	  function blurListener (e) {
	    focusedout = true

	    window.requestAnimationFrame(function () {
	      if (focusedout) {
	        closeListener()
	      }
	    })
	  }

	  function focusListener () {
	    focusedout = false
	  }

	  function closeListener () {
	    removeCloseListener()

	    focusableEls.forEach(function (focusEl) {
	      focusEl.el.setAttribute('tabindex', -1)
	    })

	    itemContainer.setAttribute('aria-hidden', 'true')

	    items.forEach(function (item) {
	      item.setAttribute('tabindex', -1)
	    })

	    closeMenu(el)
	    el.focus()
	    addOpenListener()
	  }

	  addOpenListener()
	}

	module.exports = dropdown


/***/ }),
/* 8 */
/***/ (function(module, exports) {

	// var bodyEl = document.querySelector('body')
	// var MutationObserver

	function progressBar (el) {
	  var progress = el.querySelector('.ds-progress')
	  var progressCounter = el.querySelector('.ds-progress-counter')

	  var val = progress.dataset.value || 0
	  var max = progress.dataset.maxValue || 100
	  var min = progress.dataset.minValue || 0

	  // set initial progress value based on data-value
	  setProgress(val)

	  // create an observer instance
	  var observer = new window.MutationObserver(function (mutations) {
	    mutations.forEach(function (mutation) {
	      // get new progress value from mutation observer
	      var newVal = mutation.target.dataset.value
	      // set new progress value
	      setProgress(newVal)
	    })
	  })

	  // set observer, pass in the target node and observer options
	  observer.observe(progress, { attributes: true })

	  function setProgress (val) {
	    if (val > min && val <= max) {
	      progress.style.width = val + '%'
	      if (progressCounter) {
	        setProgressCounter(val)
	      }
	    } else if (val > max) {
	      progress.style.width = max + '%'
	      if (progressCounter) {
	        setProgressCounter(max)
	      }
	    } else {
	      progress.style.width = min + '%'
	      if (progressCounter) {
	        setProgressCounter(min)
	      }
	    }
	  }

	  function setProgressCounter (val) {
	    progressCounter.innerHTML = val
	    progressCounter.style.left = 'calc(' + val + '% - ' + (progressCounter.offsetWidth / 2) + 'px)'
	  }
	}

	function fileUpload (el) {
	  var progress = el.querySelector('.ds-progress')
	  var val = progress.dataset.value || 0

	  setProgress(val)

	  var observer = new window.MutationObserver(function (mutations) {
	    mutations.forEach(function (mutation) {
	      // get new progress value from mutation observer
	      var newVal = mutation.target.dataset.value
	      // set new progress value
	      setProgress(newVal)
	    })
	  })

	  // set observer, pass in the target node and observer options
	  observer.observe(progress, { attributes: true })

	  function setProgress (val) {
	    progress.style.width = val + '%'
	  }
	}

	module.exports = {
	  progressBar: progressBar,
	  fileUpload: fileUpload
	}


/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

	// var bodyEl = document.querySelector('body')

	var utils = __webpack_require__(2)
	var keycodes = utils.keycodes
	var focusable = utils.focusable
	var addCheckFocusListener = utils.checkFocus

	function openAccordion (target) {
	  target.classList.add('ds-open')
	  target.setAttribute('aria-expanded', 'true')
	  var slidedown = target.querySelector('.ds-accordion-slidedown')
	  slidedown.setAttribute('aria-hidden', 'false')
	  window.w3ds.dispatchFocusEvent(target)
	}

	function closeAccordion (target) {
	  target.classList.remove('ds-open')
	  target.setAttribute('aria-expanded', 'false')
	  var slidedown = target.querySelector('.ds-accordion-slidedown')
	  slidedown.setAttribute('aria-hidden', 'true')
	  window.w3ds.dispatchFocusEvent(target)
	}

	function accordion (el, newOptions) {
	  var options
	  var defaults = {
	    singleToggle: el.classList.contains('ds-single-toggle'),
	    expandAll: el.classList.contains('ds-expand-all')
	  }

	  if (newOptions) {
	    options = Object.assign({}, defaults, newOptions)
	  } else {
	    options = defaults
	  }

	  var accordionItems = Array.prototype.slice.call(el.querySelectorAll('.ds-accordion-control'))

	  var focusableEls = Array.prototype.slice.call(el.querySelectorAll(focusable))
	    .map(function (focusableEl) {
	      return {
	        el: focusableEl,
	        tabindex: focusableEl.getAttribute('tabindex')
	      }
	    })

	  accordionItems.forEach(function (item) {
	    if (options !== undefined && options.obj) {
	      addCheckFocusListener('ds-open', item, options)
	    }

	    // make these keyboard accessible
	    item.setAttribute('tabindex', 0)

	    // add listeners on accordion title
	    // for click and `enter` key to toggle
	    if (options.singleToggle) {
	      item.addEventListener('click', singleToggle)
	      item.addEventListener('keydown', function (e) {
	        if (e.keyCode === keycodes.enter) {
	          singleToggle.call(this, e)
	        }
	      })
	    } else {
	      item.addEventListener('click', accordionToggle)
	      item.addEventListener('keydown', function (e) {
	        if (e.keyCode === keycodes.enter) {
	          accordionToggle.call(this, e)
	        }
	      })
	    }
	  })

	  // trigger (expand/collapse btn) controller
	  var expandBtns = Array.prototype.slice.call(document.querySelectorAll('.ds-expand-all-trigger'))
	  var triggers = expandBtns.map(
	    function (btn) {
	      var d = extractData(btn)
	      return {
	        type: d.type,
	        target: determineTarget(btn),
	        btn: btn,
	        id: btn.getAttribute('id'),
	        tag: d.tag,
	        text: d.text,
	        swap: d.swap || null
	      }
	    }
	  )

	  if (options.expandAll) {
	    triggers.forEach(function (trigger) {
	      trigger.btn.innerHTML = trigger.text
	      if (trigger.type === 'toggle') {
	        trigger.btn.addEventListener('click', function () {
	          if (trigger.target === el) {
	            if (this.innerHTML === trigger.text) {
	              expandAll()
	              this.innerHTML = trigger.swap
	            } else if (this.innerHTML === trigger.swap) {
	              collapseAll()
	              this.innerHTML = trigger.text
	            }
	          }
	        })

	        var openingCount
	        // if at least one .ds-accordion-control is open, toggle expand/collapse btn
	        accordionItems.forEach(function (accordion) {
	          accordion.addEventListener('click', function (e) {
	            openingCount = 0
	            var control = e.target.parentElement
	            if (control.classList.contains('ds-open')) {
	              ++openingCount
	            }

	            if (openingCount >= 1) {
	              trigger.btn.innerHTML = trigger.swap
	            } else {
	              trigger.btn.innerHTML = trigger.text
	            }
	          })
	        })
	      } else if (trigger.type === 'expand') {
	        trigger.btn.addEventListener('click', function () {
	          if (trigger.target === el) {
	            expandAll()
	          }
	        })
	      } else if (trigger.type === 'collapse') {
	        trigger.btn.addEventListener('click', function () {
	          if (trigger.target === el) {
	            collapseAll()
	          }
	        })
	      }
	    })
	  }

	  hideFocusableEls()
	  // watch each .ds-accodion-control for toggling
	  function accordionToggle (e) {
	    var accordionItem = this
	    // only toggle if either the title or control was directly clicked
	    // expandable part of accordion is nested within `control`
	    if (!e.target.classList.contains('ds-accordion-title') && !e.target.classList.contains('ds-accordion-control')) {
	      return
	    }

	    if (accordionItem.classList.contains('ds-open')) {
	      hideFocusableEls()
	      closeAccordion(accordionItem)
	    } else {
	      showFocusableEls()
	      openAccordion(accordionItem)
	    }
	  }
	  // watch the entire .ds-accordion and only allow one .ds-accordion-control to be open at a time
	  function singleToggle (e) {
	    var opened = this
	    var i = accordionItems.indexOf(opened)
	    var remainingItems = accordionItems.slice(0)
	    remainingItems.splice(i, 1)

	    if (!e.target.classList.contains('ds-accordion-title') && !e.target.classList.contains('ds-accordion-control')) {
	      return
	    }

	    if (opened.classList.contains('ds-open')) {
	      hideFocusableEls()
	      closeAccordion(opened)
	    } else {
	      showFocusableEls()
	      openAccordion(opened)
	    }

	    remainingItems.forEach(function (item) {
	      closeAccordion(item)
	      hideFocusableEls()
	    })
	  }

	  function hideFocusableEls () {
	    focusableEls.forEach(function (focusableEl) {
	      focusableEl.el.setAttribute('tabindex', -1)
	    })
	  }

	  function showFocusableEls () {
	    focusableEls.forEach(function (focusableEl) {
	      if (focusableEl.tabindex) {
	        focusableEl.el.setAttribute('tabindex', focusableEl.tabindex)
	      } else {
	        focusableEl.el.removeAttribute('tabindex')
	      }
	    })
	  }

	  function extractData (el) {
	    var data
	    var id = el.getAttribute('id')
	    var text = el.getAttribute('data-text')
	    var swap = el.getAttribute('data-swap')
	    var base = ['toggle', 'expand', 'collapse']
	    base.forEach(function (b) {
	      var match = id.slice(0, b.length)
	      if (b === match) {
	        data = {
	          type: b,
	          text: text,
	          tag: id.slice(b.length + 1)
	        }
	        if (swap) {
	          data.swap = swap
	        }
	      }
	    })
	    return data
	  }

	  function determineTarget (button) {
	    var tag = extractData(button).tag
	    var target = document.getElementById('accordion-' + tag)
	    return target
	  }

	  // PUBLIC METHODS //

	  function expandAll () {
	    // expand all `.ds-accordion-control .ds-accordion-slidedown` elements
	    accordionItems.forEach(function (item) {
	      openAccordion(item)
	      showFocusableEls()
	    })
	  }

	  function collapseAll () {
	    // close all `.ds-accordion-control .ds-accordion-slidedown` elements
	    accordionItems.forEach(function (item) {
	      closeAccordion(item)
	      hideFocusableEls()
	    })
	  }

	  // EXPOSE PUBLIC METHODS //

	  return {
	    expandAll: expandAll,
	    collapseAll: collapseAll
	  }
	}

	module.exports = accordion


/***/ }),
/* 10 */
/***/ (function(module, exports) {

	function setHeightMultiple (els) {
	  if (!(els instanceof Array)) els = Array.prototype.slice.call(els)
	  var groups = els.map(function (el) {
	    return Array.prototype.filter.call(el.classList, function (item) {
	      return item.indexOf('ds-set-height') !== -1
	    }).map(function (heightClass) {
	      return {
	        class: heightClass,
	        el: el
	      }
	    })[0]
	  }).reduce(function (acc, item, index, arr) {
	    if (!acc[item.class]) acc[item.class] = []
	    acc[item.class].push(item.el)
	    return acc
	  }, {})

	  Object.keys(groups).forEach(function (groupName) { setHeightGroup(groups[groupName]) })
	}

	function setHeightGroup (group) {
	  var tallest = 0

	  group.forEach(function (item) {
	    item.style.minHeight = ''
	  })

	  group.forEach(function (item) {
	    var itemHeight = item.offsetHeight
	    tallest = (itemHeight > tallest ? itemHeight : tallest)
	  })

	  group.forEach(function (item) {
	    item.style.minHeight = tallest + 'px'
	  })
	}

	module.exports = {
	  setHeight: setHeightGroup,
	  setHeightMultipleGroups: setHeightMultiple
	}


/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

	var eventHandler = __webpack_require__(2).events
	// var delay = require('../../utils').delay
	var createIndicators = __webpack_require__(12)
	var createArrows = __webpack_require__(14)

	function carousel (el, newOptions) {
	  /* -- BEGIN VARS -- */
	  var events = eventHandler()
	  var itemsContainer = el.querySelector('.ds-carousel-items')
	  var items = Array.prototype.slice.call(el.querySelectorAll('.ds-carousel-items > *'))
	  // var isLooping = el.classList.contains('ds-infinite')
	  // var autoPlay = el.classList.contains('ds-autoplay')
	  var disabledArrowDirection = null
	  var disabledArrow = null
	  var indicators
	  var arrows
	  var autoID
	  var options

	  var defaults = {
	    index: 0,
	    isLooping: el.classList.contains('ds-infinite'),
	    autoPlay: el.classList.contains('ds-autoplay'),
	    interval: 5000,
	    direction: 'right',
	    disabledArrows: false
	  }

	  if (newOptions) {
	    options = Object.assign({}, defaults, newOptions)
	  } else {
	    options = defaults
	  }

	  // var methods = {
	  //   nextIndex: next,
	  //   prevIndex: prev,
	  //   firstIndex: first,
	  //   lastIndex: last,
	  //   changePosition: changePosition
	  // }
	  var initialSelectedSlide = options.index || 0
	  /* -- END VARS -- */

	  /* -- BEGIN INIT SEQUENCE -- */

	  indicators = createIndicators(el, items, events, initialSelectedSlide)

	  arrows = createArrows(indicators.el, events)

	  if (options.disabledArrows) {
	    for (var arrow in arrows.elements) {
	      arrows.elements[arrow].style.opacity = 0
	      arrows.elements[arrow].classList.add('ds-disabled')
	    }
	  }

	  setWorkingCarouselStyles()

	  events.addListener('changePosition', function (num) {
	    changePosition(num)
	  })

	  events.addListener('arrowClick', function (direction) {
	    var pendingPosition

	    if (direction === 'left') pendingPosition = prevIndex(indicators.position())
	    else if (direction === 'right') pendingPosition = nextIndex(indicators.position())

	    indicators.position(pendingPosition)
	    changePosition(pendingPosition)
	  })

	  if (options.autoPlay) {
	    if (!options.isLooping) {
	      el.classList.add('ds-infinite')
	      options.isLooping = el.classList.contains('ds-infinite')
	    }
	    play()
	  }
	  /* -- END INIT SEQUENCE -- */

	  /* -- BEGIN METHODS -- */

	  // PRIVATE METHODS //

	  function nextIndex (currentPosition) {
	    var pendingPosition = currentPosition >= lastIndex()
	      ? options.isLooping ? firstIndex() : null
	      : currentPosition + 1

	    return pendingPosition
	  }

	  function prevIndex (currentPosition) {
	    var pendingPosition = currentPosition <= firstIndex()
	      ? options.isLooping ? lastIndex() : null
	      : currentPosition - 1

	    return pendingPosition
	  }

	  function firstIndex () {
	    return 0
	  }

	  function lastIndex () {
	    return items.length - 1
	  }

	  function changePosition (num) {
	    if (num == null) return
	    itemsContainer.style.left = (num * -100) + '%'

	    if (options.isLooping) {
	      return
	    }

	    if ((disabledArrowDirection === 'left' && num !== 0) || (disabledArrowDirection === 'right' && num !== items.length - 1)) {
	      enableArrow()
	    }

	    if (num === 0) {
	      disableArrow(num)
	    } else if (num === items.length - 1) {
	      disableArrow(num)
	    }
	  }

	  function disableArrow (index) {
	    disabledArrowDirection = index === 0 ? 'left' : 'right'
	    disabledArrow = disabledArrowDirection === 'left' ? arrows.elements.left : arrows.elements.right

	    disabledArrow.style.opacity = 0
	    disabledArrow.classList.add('ds-disabled')
	  }

	  function enableArrow () {
	    disabledArrow.style.display = ''
	    disabledArrow.classList.remove('ds-disabled')
	    disabledArrow.style.opacity = 1
	    disabledArrowDirection = null
	    disabledArrow = null
	  }

	  // PUBLIC METHODS //

	  function play (index, interval) {
	    // only allows for 'right' or forward direction
	    function advancePosition () {
	      var pendingPosition = nextIndex(currentPosition)
	      changePosition(pendingPosition)
	      indicators.position(pendingPosition)
	      currentPosition = pendingPosition
	    }
	    var currentPosition = (index === undefined) ? options.index : index
	    if (interval !== undefined) {
	      options.interval = interval
	    }
	    indicators.position(currentPosition)
	    autoID = setInterval(advancePosition, options.interval)
	  }

	  function stop () {
	    clearInterval(autoID)
	  }

	  function next () {
	    var newPos = nextIndex(indicators.position())
	    changePosition(newPos)
	    indicators.position(newPos)
	  }

	  function prev () {
	    var newPos = prevIndex(indicators.position())
	    changePosition(newPos)
	    indicators.position(newPos)
	  }

	  function goToSlide (index) {
	    changePosition(index)
	    indicators.position(index)
	  }

	  /* -- END METHODS -- */

	  /* -- BEGIN INIT FUNCTIONS -- */
	  function setWorkingCarouselStyles () {
	    // each item should be size of the carousel
	    // item container should be 100% * num of items
	    var itemContainerWidth = (items.length * 100) + '%'

	    // each item set to 1 / numOfItems, matches width of carousel
	    var itemWidth = (100 / items.length) + '%'

	    itemsContainer.style.width = itemContainerWidth
	    items.forEach(function (item) {
	      item.style.width = itemWidth
	    })

	    // set position for initial slide
	    changePosition(initialSelectedSlide || 0)
	  }
	  /* -- END INIT FUNCTIONS -- */

	  /* -- EXPOSE METHODS -- */
	  return {
	    play: play,
	    stop: stop,
	    next: next,
	    prev: prev,
	    goToSlide: goToSlide
	    // delay: delay
	  }
	  /* -- END EXPOSE METHODS -- */
	}

	module.exports = carousel


/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

	var template = __webpack_require__(13)

	function indicators (carouselEl, items, events, selected) {
	  /* -- BEGIN VARS -- */
	  var currentPosition = selected || 0
	  var indicatorAttrs = {
	    classes: carouselEl.classList,
	    numOfItems: items.length,
	    position: currentPosition
	  }
	  var indicators
	  /* -- END VARS -- */

	  /* -- BEGIN INIT SEQUENCE -- */
	  indicators = createIndicators()
	  addListeners()
	  /* -- END INIT SEQUENCE -- */

	  /* -- BEGIN RETURNED API -- */
	  return {
	    position: position,
	    addListeners: addListeners,
	    removeListeners: removeListeners,
	    el: carouselEl.querySelector('.ds-carousel-position-indicator')
	  }
	  /* -- END RETURNED API -- */

	  /* -- BEGIN METHODS & PRIVATE FUNCS -- */
	  function position (num) {
	    if (typeof num === 'undefined') {
	    // if nothing was passed in, treat as a getter
	      return currentPosition
	    } else if (num === null) {
	    // if it is null, don't do anything
	      return null
	    } else if (typeof num !== 'number') {
	    // if it's anything else that's not a number, warn
	      return console.warn('cannot change position to a non-number')
	    } else {
	    // save the new position and change the selected indicator
	      currentPosition = num
	      changeIndicator(num)
	    }
	  }

	  function addListeners () {
	    indicators.forEach(function (ind) {
	      ind.addEventListener('click', clickListener)
	    })
	  }

	  function removeListeners () {
	    indicators.forEach(function (ind) {
	      ind.removeEventListener('click', clickListener)
	    })
	  }

	  function clickListener (evt) {
	    var indicator = evt.target
	    var index = +indicator.dataset.index

	    // don't do anything if they clicked the already selected one
	    if (index === currentPosition) {
	      return
	    }

	    currentPosition = index

	    changeIndicator(index)

	    events.trigger('changePosition', index)
	  }

	  function changeIndicator (index) {
	    indicators.forEach(function (indicator, i) {
	      if (i === index) {
	        indicator.classList.add('ds-selected')
	      } else {
	        indicator.classList.remove('ds-selected')
	      }
	    })
	  }
	  /* -- END METHODS & PRIVATE FUNCS -- */

	  /* -- BEGIN INIT FUNCTIONS -- */
	  function createIndicators () {
	    var html = template(getIndicatorOptions(indicatorAttrs))
	    carouselEl.insertAdjacentHTML('beforeend', html)

	    var indicators = carouselEl.querySelectorAll('.ds-carousel-position-indicator > div')

	    return Array.prototype.slice.call(indicators)
	  }

	  function getIndicatorOptions (indicatorAttrs) {
	    var opts = {}

	    var specifiedType = indicatorAttrs.classes.contains('ds-carousel-controls-circle')
	      ? 'circle'
	      : indicatorAttrs.classes.contains('ds-carousel-controls-number')
	        ? 'number'
	        : null

	    // set positionIndicator template options
	    opts.items = indicatorAttrs.numOfItems

	    opts.type = opts.items < 6 ? specifiedType || 'circle' : 'condensed'

	    opts.color = indicatorAttrs.classes.contains('ds-carousel-controls-color')

	    opts.position = indicatorAttrs.position

	    return opts
	  }
	  /* -- END INIT FUNCTIONS -- */
	}

	module.exports = indicators


/***/ }),
/* 13 */
/***/ (function(module, exports) {

	module.exports = function (data) {
	var __t, __p = '', __j = Array.prototype.join;
	function print() { __p += __j.call(arguments, '') }

	 var type = data.type ;
	__p += '\n';
	 var color = data.color && type === 'circle' ;
	__p += '\n';
	 var items = [] ;
	__p += '\n';
	 var position = data.position ;
	__p += '\n';
	 for (var i = 0; i < data.items; i++) { items.push(i) } ;
	__p += '\n\n\n<div class="ds-carousel-position-indicator ds-' +
	((__t = ( type )) == null ? '' : __t) +
	' ' +
	((__t = ( color ? 'ds-color' : '' )) == null ? '' : __t) +
	'">\n\n	';
	 if (type !== 'condensed') { ;
	__p += '\n\n		';
	 items.forEach(function(item, i) { ;
	__p += '\n			<div class="ds-indicator ' +
	((__t = ( i === position ? 'ds-selected' : '' )) == null ? '' : __t) +
	'" data-index="' +
	((__t = ( i )) == null ? '' : __t) +
	'">' +
	((__t = ( type === 'number' ? i + 1 : '')) == null ? '' : __t) +
	'</div>\n		';
	 }) ;
	__p += '\n\n	';
	 } else { ;
	__p += '\n\n		<div class="ds-indicator">1 / ' +
	((__t = ( data.items )) == null ? '' : __t) +
	'</div>\n\n	';
	 } ;
	__p += '\n\n</div>\n\n';
	return __p
	}

/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

	var template = __webpack_require__(15)

	function arrows (indicatorEl, events) {
	  /* -- BEGIN VARS -- */
	  var arrows
	  /* -- END VARS -- */

	  /* -- BEGIN INIT SEQUENCE -- */
	  arrows = createArrows()
	  addListeners()
	  /* -- END INIT SEQUENCE -- */

	  /* -- BEGIN RETURNED API -- */
	  return {
	    elements: {
	      left: arrows.filter(function (arrow) { return arrow.classList.contains('ds-left') })[0],
	      right: arrows.filter(function (arrow) { return arrow.classList.contains('ds-right') })[0]
	    },
	    addListeners: addListeners,
	    removeListeners: removeListeners
	  }
	  /* -- END RETURNED API -- */

	  /* -- BEGIN METHODS -- */
	  function addListeners () {
	    arrows.forEach(function (arrow) {
	      arrow.addEventListener('click', clickListener)
	    })
	  }

	  function removeListeners () {
	    arrows.forEach(function (arrow) {
	      arrow.removeEventListener('click', clickListener)
	    })
	  }

	  function clickListener (evt) {
	    evt.stopPropagation()
	    var arrow = evt.target
	    var direction = arrow.classList.contains('ds-left') || arrow.parentElement.classList.contains('ds-left')
	      ? 'left'
	      : 'right'
	    events.trigger('arrowClick', direction)
	  }
	  /* -- END METHODS -- */

	  /* -- BEGIN INIT FUNCTIONS -- */
	  function createArrows () {
	    var leftArrow = template({ direction: 'left' })
	    var rightArrow = template({ direction: 'right' })

	    indicatorEl.insertAdjacentHTML('afterbegin', leftArrow)
	    indicatorEl.insertAdjacentHTML('beforeend', rightArrow)

	    var arrows = indicatorEl.querySelectorAll('.ds-carousel-arrow')

	    return Array.prototype.slice.call(arrows)
	  }

	  // function getArrowOptions (arrowAttrs) {
	  //   var opts = {}

	  //   return opts
	  // }
	  /* -- END INIT FUNCTIONS -- */
	}

	module.exports = arrows


/***/ }),
/* 15 */
/***/ (function(module, exports) {

	module.exports = function (data) {
	var __t, __p = '';
	__p += '<div class="ds-carousel-arrow ds-' +
	((__t = ( data.direction )) == null ? '' : __t) +
	'">\n	<span class="ds-icon-caret-' +
	((__t = ( data.direction )) == null ? '' : __t) +
	'-m-l ds-icon-size-medium"></span>\n</div>';
	return __p
	}

/***/ }),
/* 16 */
/***/ (function(module, exports) {

	function sideNavMobile () {
	  var body = document.querySelector('body')
	  var nav = document.querySelector('.ds-side-nav')
	  var spacer = document.querySelector('.ds-side-nav-mobile-spacer')
	  var openControl = document.querySelector('.ds-side-nav-mobile-open')

	  if (!nav) return
	  if (!openControl) return

	  var mobileNav = nav.parentElement.querySelector('.ds-side-nav-mobile')
	  if (mobileNav && mobileNav.dataset && mobileNav.dataset.noinit) return

	  // init
	  nav.classList.add('ds-side-nav-mobile-drawer')
	  openControl.addEventListener('click', toggleDrawer)

	  if (spacer) {
	    spacer.addEventListener('click', toggleDrawer)
	  }

	  window.addEventListener('resize', resizeClosesDrawer)
	  window.addEventListener('orientationchange', resizeClosesDrawer)
	  window.addEventListener('click', routerLinkSelect, false)

	  function routerLinkSelect (ev) {
	    if (ev.target.classList.contains('router-link-active')) {
	      closeDrawer()
	    }
	  }

	  function openDrawer () {
	    window.requestAnimationFrame(function () {
	      body.classList.add('ds-side-nav-mobile-drawer-expanded')
	      spacer.classList.add('ds-active')
	      openControl.classList.add('ds-close-icon')
	    })
	  }

	  function closeDrawer () {
	    window.requestAnimationFrame(function () {
	      body.classList.remove('ds-side-nav-mobile-drawer-expanded')
	      spacer.classList.remove('ds-active')
	      openControl.classList.remove('ds-close-icon')
	    })
	  }

	  function toggleDrawer () {
	    if (!body.classList.contains('ds-side-nav-mobile-drawer-expanded')) {
	      openDrawer()
	    } else {
	      closeDrawer()
	    }
	  }

	  function resizeClosesDrawer () {
	    var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0)
	    var medBreakpointMin = 780
	    if (spacer) {
	      if (w > medBreakpointMin) {
	        closeDrawer()
	      }
	    }
	  }
	}

	module.exports = sideNavMobile


/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

	var utils = __webpack_require__(2)
	var getScrollTopFromBody = utils.getScrollTopFromBody
	var throttle = utils.throttle
	var mobileNav = __webpack_require__(16)

	function scrollspy () {
	  var nav = document.querySelector('.ds-scrollspy')
	  var sections = Array.prototype.slice.call(document.querySelectorAll('.ds-scrollspy-section'))
	  var spied = document.querySelector('.ds-scrollspy-el')

	  // get out if certain things aren't defined:
	  if (!sections || !spied || !nav) return null

	  var navLinks = Array.prototype.slice.call(nav.querySelectorAll('a')).map(function (link) {
	    return {
	      el: link,
	      href: link.href.substring(link.href.indexOf('#') + 1)
	    }
	  })

	  var mobileNavControls = Array.prototype.slice.call(nav.parentElement.querySelectorAll('.ds-side-nav-mobile-control'))
	    .map(function (ctrl) {
	      return {
	        el: ctrl,
	        link: ctrl.querySelector('a'),
	        label: ctrl.querySelector('.ds-side-nav-mobile-label'),
	        type: ctrl.dataset.control
	      }
	    })

	  var triggerOffset = parseInt(spied.dataset.offset) || 0
	  var sortedSections
	  var mobileSections

	  var spiedHeight = window.getComputedStyle(spied).height

	  window.w3ds.activeScrollspy = {
	    reset: function () {
	      getSections()
	      calculateSectionPositions()
	      findPos()
	    }
	  }

	  // initial load
	  window.w3ds.activeScrollspy.reset()

	  mobileNav()

	  // runs findPos() func on page scroll:
	  window.addEventListener('scroll', throttle(40, function () {
	    window.requestAnimationFrame(findPos)
	  }))

	  checkSpiedHeight()

	/** ******************************
	           Methods
	****************************** **/

	  var timeout
	  var listenerAttached
	  var lastResize
	  function checkSpiedHeight () {
	    var newHeight = window.getComputedStyle(spied).height
	    if (newHeight !== spiedHeight) {
	      spiedHeight = newHeight
	      window.requestAnimationFrame(window.w3ds.activeScrollspy.reset)
	    }

	    timeout = setTimeout(function () {
	      checkSpiedHeight()
	    }, 100)

	    if (!listenerAttached) {
	      listenerAttached = true
	      window.addEventListener('resize', function resizeListener () {
	        if (!lastResize) clearTimeout(timeout)
	        lastResize = Date.now()

	        if (Date.now - lastResize > 250) {
	          listenerAttached = false
	          window.removeEventListener('resize', resizeListener)
	          checkSpiedHeight()
	        }
	      })
	    }
	  }

	  // variable 'section' is the actual dom element that scrollspy link targets
	  function getSections () {
	    sortedSections = sections.map(function (section) {
	      return {
	        id: section.id,
	        el: section,
	        title: section.dataset && section.dataset.scrollspyTitle,
	        scrollTop: Math.floor(getScrollTopFromBody(section) + triggerOffset)
	      }
	    }).sort(function (a, b) {
	      return a.scrollTop - b.scrollTop
	    })

	    filterMobileSections()
	  }

	  function calculateSectionPositions () {
	    sortedSections = sortedSections.map(function (section) {
	      return {
	        id: section.id,
	        el: section.el,
	        title: section.title,
	        scrollTop: Math.floor(getScrollTopFromBody(section.el) + triggerOffset)
	      }
	    })

	    filterMobileSections()
	  }

	  // takes the result of 'getSections', and filters the objects
	  function filterMobileSections () {
	    mobileSections = sortedSections.filter(function (section) {
	      return section.title
	    })
	  }

	  // gets active section in array of sorted objects for mobile nav:
	  function getActiveSection (scrollPosition, array) {
	    var target = Math.ceil(scrollPosition)
	    return array.reduce(function (acc, curr) {
	      if (curr.scrollTop > target) {
	        return acc
	      } else if (!acc) {
	        return curr
	      } else if (curr.scrollTop - target > acc.scrollTop - target) {
	        return curr
	      } else {
	        return acc
	      }
	    }, null)
	  }

	  // gets ancestor nav sections (for "ds-expanded" class) in desktop nav:
	  function findAncestorNavSections (el) {
	    var looper = true
	    var navSections = []

	    while (looper) {
	      if (el.classList.contains('ds-nav-section')) navSections.push(el)
	      el = el.parentElement
	      if (el.classList.contains('ds-scrollspy')) looper = false
	    }

	    return navSections
	  }

	  // TODO: Fix mobile scrollspy
	  // sets prev or next button label and link dest in mobile nav,
	  // assumes if isPrev === false, then it is next control
	  var lastPrevRequest
	  var lastNextRequest
	  function setPrevNextControl (activeIndex, isPrev) {
	    var controlType = isPrev ? 'prev' : 'next'
	    var control = mobileNavControls.filter(function (ctrl) {
	      return ctrl.type === controlType
	    })[0]

	    var titleSpanElement = control.label
	    var linkElement = control.link
	    if (isPrev) {
	      window.cancelAnimationFrame(lastPrevRequest)
	      // do stuff for Previous control:
	      if (activeIndex <= 0) {
	        if (linkElement.classList.contains('ds-disabled')) return

	        lastPrevRequest = window.requestAnimationFrame(function () {
	          linkElement.classList.add('ds-disabled')
	          linkElement.removeAttribute('href')
	          titleSpanElement.innerHTML = ''
	        })
	      } else {
	        lastPrevRequest = window.requestAnimationFrame(function () {
	          if (linkElement.classList.contains('ds-disabled')) linkElement.classList.remove('ds-disabled')
	          titleSpanElement.innerHTML = mobileSections[activeIndex - 1].title
	          linkElement.href = '#' + mobileSections[activeIndex - 1].id
	        })
	      }
	    } else {
	      window.cancelAnimationFrame(lastNextRequest)
	      // do stuff for Next control:
	      if (activeIndex >= mobileSections.length - 1) {
	        if (linkElement.classList.contains('ds-disabled')) return

	        lastNextRequest = window.requestAnimationFrame(function () {
	          linkElement.classList.add('ds-disabled')
	          linkElement.removeAttribute('href')
	          titleSpanElement.innerHTML = ''
	        })
	      } else {
	        lastNextRequest = window.requestAnimationFrame(function () {
	          if (linkElement.classList.contains('ds-disabled')) linkElement.classList.remove('ds-disabled')
	          titleSpanElement.innerHTML = mobileSections[activeIndex + 1].title
	          linkElement.href = '#' + mobileSections[activeIndex + 1].id
	        })
	      }
	    }
	  }

	  function setMobileScrollspy (activeSection) {
	    var activeIndex = mobileSections.indexOf(activeSection)

	    setPrevNextControl(activeIndex, true) // prev
	    setPrevNextControl(activeIndex, false) // next
	  }

	  // takes the object describing the active section (in body)
	  // removes highlight from prev active section link (in scrollspy)
	  // adds highlight to the current active section link (in scrollspy)
	  function setDesktopScrollspy (activeSection) {
	    var prevLink = document.querySelector('.ds-scrollspy .ds-active')
	    if (!prevLink) prevLink = document.querySelector('.ds-scrollspy .ds-nav-item')

	    // find all anscestor nav section elements:
	    var sectionEls = findAncestorNavSections(prevLink)

	    var currentLink = navLinks.reduce(function (acc, link) {
	      return link.href === activeSection.id ? link.el : acc
	    }, null)

	    var parentItems = findAncestorNavSections(currentLink)

	    window.requestAnimationFrame(function () {
	      // remove active & expanded classes:
	      prevLink.classList.remove('ds-active')
	      sectionEls.forEach(function (el) {
	        el.classList.remove('ds-expanded')
	      })

	      // add active class to active element:
	      currentLink.parentElement.classList.add('ds-active')

	      // add expanded class to all anscestor nav section elements:
	      parentItems.forEach(function (el) {
	        el.classList.add('ds-expanded')
	      })
	    })
	  }

	  // sets default states when scollPos is < first anchor tag
	  function setDefaultClosedStates (scrollPosition) {
	    // desktop - close the whole menu and unhighlight if scroll position is above scroll top:
	    var expanded = document.querySelector('.ds-scrollspy .ds-expanded')
	    var active = document.querySelector('.ds-scrollspy .ds-active')

	    if (scrollPosition < sortedSections[0].scrollTop) {
	      if (expanded && active) {
	        window.requestAnimationFrame(function () {
	          expanded.classList.remove('ds-expanded')
	          active.classList.remove('ds-active')
	        })
	      }
	    }

	    // mobile - set initial prev and next buttons
	    if (scrollPosition < sortedSections[0].scrollTop) {
	      var prevCtrl = mobileNavControls.filter(function (ctrl) { return ctrl.type === 'prev' })[0]
	      var nextCtrl = mobileNavControls.filter(function (ctrl) { return ctrl.type === 'next' })[0]
	      window.requestAnimationFrame(function () {
	        prevCtrl.link.classList.add('ds-disabled')
	        prevCtrl.link.removeAttribute('href')
	        nextCtrl.label.innerHTML = sortedSections[0].title
	        nextCtrl.link.href = '#' + sortedSections[0].id
	      })
	    }
	  }

	  // finds active postion:
	  // Runs code for both mobile and desktop regardless of screensize
	  function findPos () {
	    var scrollPosition = Math.ceil(window.pageYOffset) + 5
	    var activeSection = getActiveSection(scrollPosition, sortedSections)
	    var activeSectionMobile = getActiveSection(scrollPosition, mobileSections)

	    if (activeSection) {
	      // MOBILE STUFF:
	      setMobileScrollspy(activeSectionMobile)

	      // DESKTOP STUFF:
	      setDesktopScrollspy(activeSection)
	    } else {
	      setDefaultClosedStates(scrollPosition)
	    }
	  }
	}

	module.exports = scrollspy


/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

	var utils = __webpack_require__(2)
	var scrollTo = utils.scrollTo
	var getScrollTopFromBody = utils.getScrollTopFromBody

	function jumpLink (el, scroll) {
	  if (!el.hash) return
	  var anchorName = document.querySelector(el.hash)

	  el.addEventListener('click', function (evt) {
	    evt.preventDefault()

	    var scrollPos

	    // calculate scrollTop when jump happens
	    // offsetTop will not work, btw
	    if (anchorName) {
	      scrollPos = getScrollTopFromBody(anchorName)

	      if (!scroll) window.scroll(0, scrollPos)
	      else scrollTo(scrollPos, 600)
	    }
	  })
	}

	module.exports = jumpLink


/***/ }),
/* 19 */
/***/ (function(module, exports) {

	function expand (expanderEl) {
	  var pointerSelector = expanderEl.getAttribute('data-element')
	  var elements = Array.prototype.slice.apply(document.querySelectorAll(pointerSelector))

	  expanderEl.addEventListener('click', function () {
	    elements.forEach(function (el) {
	      el.classList.toggle('ds-hide')
	      var parent = el.parentElement
	      var hideMe = parent.querySelector('[class*=hide-me]')
	      var ariaValue = hideMe.getAttribute('aria-hidden')
	      ariaValue = ariaValue === 'true' ? 'false' : 'true'
	      hideMe.setAttribute('aria-hidden', ariaValue)
	    })
	  })
	}

	module.exports = expand


/***/ })
/******/ ]);