tui.util.defineNamespace("fedoc.content", {});
fedoc.content["datepicker.js.html"] = "      <div id=\"main\" class=\"main\">\n\n\n\n    \n    <section>\n        <article>\n            <pre class=\"prettyprint source linenums\"><code>/**\n * Created by nhnent on 15. 5. 14..\n * @fileoverview This component provides a calendar for picking a date &amp; time.\n * @author NHN ent FE dev &lt;dl_javascript@nhnent.com> &lt;minkyu.yi@nhnent.com>\n * @dependency jquery-1.8.3, code-snippet-1.0.2, component-calendar-1.0.1, timePicker.js\n */\n\n'use strict';\n\nvar utils = require('./utils');\n\nvar util = tui.util,\n    inArray = util.inArray,\n    formatRegExp = /yyyy|yy|mm|m|dd|d/gi,\n    mapForConverting = {\n        yyyy: {expression: '(\\\\d{4}|\\\\d{2})', type: 'year'},\n        yy: {expression: '(\\\\d{4}|\\\\d{2})', type: 'year'},\n        y: {expression: '(\\\\d{4}|\\\\d{2})', type: 'year'},\n        mm: {expression: '(1[012]|0[1-9]|[1-9]\\\\b)', type: 'month'},\n        m: {expression: '(1[012]|0[1-9]|[1-9]\\\\b)', type: 'month'},\n        dd: {expression: '([12]\\\\d{1}|3[01]|0[1-9]|[1-9]\\\\b)', type: 'date'},\n        d: {expression: '([12]\\\\d{1}|3[01]|0[1-9]|[1-9]\\\\b)', type: 'date'}\n    },\n    CONSTANTS = {\n        minYear: 1970,\n        maxYear: 2999,\n        monthDays: [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],\n        wrapperTag: '&lt;div style=\"position:absolute;\">&lt;/div>',\n        defaultCentury: '20',\n        selectableClassName: 'selectable',\n        selectedClassName: 'selected'\n    };\n\n/**\n * Create DatePicker&lt;br>\n * You can get a date from 'getYear', 'getMonth', 'getDayInMonth', 'getDateObject'\n * @constructor\n * @param {Object} option - options for DatePicker\n *      @param {HTMLElement|string} option.element - input element(or selector) of DatePicker\n *      @param {Object} [option.date = today] - initial date object\n *          @param {number} [option.date.year] - year\n *          @param {number} [option.date.month] - month\n *          @param {number} [option.date.date] - day in month\n *      @param {string} [option.dateForm = 'yyyy-mm-dd'] - format of date string\n *      @param {string} [option.defaultCentury = 20] - if year-format is yy, this value is prepended automatically.\n *      @param {string} [option.selectableClassName = 'selectable'] - for selectable date elements\n *      @param {string} [option.selectedClassName = 'selected'] - for selected date element\n *      @param {Object} [option.startDate] - start date in calendar\n *          @param {number} [option.startDate.year] - year\n *          @param {number} [option.startDate.month] - month\n *          @param {number} [option.startDate.date] - day in month\n *      @param {Object} [option.endDate] - last date in calendar\n *          @param {number} [option.endDate.year] - year\n *          @param {number} [option.endDate.month] - month\n *          @param {number} [option.endDate.date] - day in month\n *      @param {Object} [option.pos] - calendar position style vlaue\n *          @param {number} [option.pos.left] - position left of calendar\n *          @param {number} [option.pos.top] - position top of calendar\n *          @param {number} [option.pos.zIndex] - z-index of calendar\n *      @param {Object} [option.openers = [element]] - opener button list (example - icon, button, etc.)\n *      @param {tui.component.TimePicker} [option.timePicker] - TimePicker instance\n * @param {tui.component.Calendar} calendar - Calendar instance\n * @example\n *   var calendar = new tui.component.Calendar({\n *       element: '#layer',\n *       titleFormat: 'yyyy년 m월',\n *       todayFormat: 'yyyy년 mm월 dd일 (D)'\n *   });\n *\n *   var timePicker = new tui.component.TimePicker({\n *       showMeridian: true,\n *       defaultHour: 13,\n *       defaultMinute: 24\n *   });\n *\n *   var picker1 = new tui.component.DatePicker({\n *       element: '#picker',\n *       dateForm: 'yyyy년 mm월 dd일 - ',\n *       date: {year: 2015, month: 1, date: 1 },\n *       startDate: {year:2012, month:1, date:17},\n *       endDate: {year: 2070, month:12, date:31},\n *       openers: ['#opener'],\n *       timePicker: timePicker\n *   }, calendar);\n *\n *   // Close calendar when select a date\n *   $('#layer').on('click', function(event) {\n *       var $el = $(event.target);\n *\n *       if ($el.hasClass('selectable')) {\n *           picker1.close();\n *       }\n *   });\n */\nvar DatePicker = tui.util.defineClass(/** @lends DatePicker.prototype */{\n    init: function(option, calendar) {\n        /**\n         * Calendar instance\n         * @type {Calendar}\n         * @private\n         */\n        this._calendar = calendar;\n\n        /**\n         * Element for displaying a date value\n         * @type {HTMLElement}\n         * @private\n         */\n        this._$element = $(option.element);\n\n        /**\n         * Element wrapping calendar\n         * @type {HTMLElement}\n         * @private\n         */\n        this._$wrapperElement = null;\n\n        /**\n         * Format of date string\n         * @type {string}\n         * @private\n         */\n        this._dateForm = option.dateForm || 'yyyy-mm-dd ';\n\n        /**\n         * RegExp instance for format of date string\n         * @type {RegExp}\n         * @private\n         */\n        this._regExp = null;\n\n        /**\n         * Array saving a order of format\n         * @type {Array}\n         * @private\n         * @see {tui.component.DatePicker.prototype.setDateForm}\n         * @example\n         *  // If the format is a 'mm-dd, yyyy'\n         *  // `this._formOrder` is ['month', 'date', 'year']\n         */\n        this._formOrder = [];\n\n        /**\n         * Object having date values\n         * @type {{year: number, month: number, date: number}}\n         * @private\n         */\n        this._date = null;\n\n        /**\n         * This value is prepended automatically when year-format is 'yy'\n         * @type {string}\n         * @private\n         * @example\n         *  //\n         *  // If this vlaue is '20', the format is 'yy-mm-dd' and the date string is '15-04-12',\n         *  // the date value object is\n         *  //  {\n         *  //      year: 2015,\n         *  //      month: 4,\n         *  //      date: 12\n         *  //  }\n         */\n        this._defaultCentury = option.defaultCentury || CONSTANTS.defaultCentury;\n\n        /**\n         * Class name for selectable date elements\n         * @type {string}\n         * @private\n         */\n        this._selectableClassName = option.selectableClassName || CONSTANTS.selectableClassName;\n\n        /**\n         * Class name for selected date element\n         * @type {string}\n         * @private\n         */\n        this._selectedClassName = option.selectedClassName || CONSTANTS.selectedClassName;\n\n        /**\n         * Start date that can be selected\n         * It is number of date (=timestamp)\n         * @type {number}\n         * @private\n         */\n        this._startEdge = option.startDate;\n\n        /**\n         * End date that can be selected\n         * It is number of date (=timestamp)\n         * @type {number}\n         * @private\n         */\n        this._endEdge = option.endDate;\n\n        /**\n         * TimePicker instance\n         * @type {TimePicker}\n         * @private\n         * @since 1.1.0\n         */\n        this._timePicker = null;\n\n        /**\n         * position - left &amp; top &amp; zIndex\n         * @type {Object}\n         * @private\n         * @since 1.1.1\n         */\n        this._pos = null;\n\n        /**\n         * openers - opener list\n         * @type {Array}\n         * @private\n         * @since 1.1.1\n         */\n        this._openers = [];\n\n        /**\n         * Handlers binding context\n         * @type {Object}\n         * @private\n         */\n        this._proxyHandlers = {};\n\n        this._initializeDatePicker(option);\n    },\n\n    /**\n     * Initialize method\n     * @param {Object} option - user option\n     * @private\n     */\n    _initializeDatePicker: function(option) {\n        this._setWrapperElement();\n        this._setDefaultDate(option.date);\n        this._setDefaultPosition(option.pos);\n        this._restrictDate(option.startDate, option.endDate);\n        this._setProxyHandlers();\n        this._bindOpenerEvent(option.openers);\n        this._setTimePicker(option.timePicker);\n        this.setDateForm();\n        this._$wrapperElement.hide();\n    },\n\n    /**\n     * Set wrapper element(= container)\n     * @private\n     */\n    _setWrapperElement: function() {\n        this._$wrapperElement = $(CONSTANTS.wrapperTag)\n            .insertAfter(this._$element)\n            .append(this._calendar.$element);\n    },\n\n    /**\n     * Set default date\n     * @param {{year: number, month: number, date: number}|Date} opDate [option.date] - user setting: date\n     * @private\n     */\n    _setDefaultDate: function(opDate) {\n        if (!opDate) {\n            this._date = utils.getDateHashTable();\n        } else {\n            this._date = {\n                year: util.isNumber(opDate.year) ? opDate.year : CONSTANTS.minYear,\n                month: util.isNumber(opDate.month) ? opDate.month : 1,\n                date: util.isNumber(opDate.date) ? opDate.date : 1\n            };\n        }\n    },\n\n    /**\n     * Save default style-position of calendar\n     * @param {Object} opPos [option.pos] - user setting: position(left, top, zIndex)\n     * @private\n     */\n    _setDefaultPosition: function(opPos) {\n        var pos = this._pos = opPos || {},\n            bound = this._getBoundingClientRect();\n\n        pos.left = pos.left || bound.left;\n        pos.top = pos.top || bound.bottom;\n        pos.zIndex = pos.zIndex || 9999;\n    },\n\n    /**\n     * Restrict date\n     * @param {{year: number, month: number, date: number}} opStartDate [option.startDate] - start date in calendar\n     * @param {{year: number, month: number, date: number}} opEndDate [option.endDate] - end date in calendar\n     * @private\n     */\n    _restrictDate: function(opStartDate, opEndDate) {\n        var startDate = opStartDate || {year: CONSTANTS.minYear, month: 1, date: 1},\n            endDate = opEndDate || {year: CONSTANTS.maxYear, month: 12, date: 31};\n\n        this._startEdge = utils.getTime(startDate) - 1;\n        this._endEdge = utils.getTime(endDate) + 1;\n    },\n\n    /**\n     * Store opener element list\n     * @param {Array} opOpeners [option.openers] - opener element list\n     * @private\n     */\n    _setOpeners: function(opOpeners) {\n        this.addOpener(this._$element);\n        util.forEach(opOpeners, function(opener) {\n            this.addOpener(opener);\n        }, this);\n    },\n\n    /**\n     * Set TimePicker instance\n     * @param {tui.component.TimePicker} [opTimePicker] - TimePicker instance\n     * @private\n     */\n    _setTimePicker: function(opTimePicker) {\n        if (!opTimePicker) {\n            return;\n        }\n\n        this._timePicker = opTimePicker;\n        this._bindCustomEventWithTimePicker();\n    },\n\n    /**\n     * Bind custom event with TimePicker\n     * @private\n     */\n    _bindCustomEventWithTimePicker: function() {\n        var onChangeTimePicker = util.bind(this.setDate, this);\n\n        this.on('open', function() {\n            this._timePicker.setTimeFromInputElement(this._$element);\n            this._timePicker.on('change', onChangeTimePicker);\n        });\n        this.on('close', function() {\n            this._timePicker.off('change', onChangeTimePicker);\n        });\n    },\n\n    /**\n     * Check validation of a year\n     * @param {number} year - year\n     * @returns {boolean} - whether the year is valid or not\n     * @private\n     */\n    _isValidYear: function(year) {\n        return util.isNumber(year) &amp;&amp; year > CONSTANTS.minYear &amp;&amp; year &lt; CONSTANTS.maxYear;\n    },\n\n    /**\n     * Check validation of a month\n     * @param {number} month - month\n     * @returns {boolean} - whether the month is valid or not\n     * @private\n     */\n    _isValidMonth: function(month) {\n        return util.isNumber(month) &amp;&amp; month > 0 &amp;&amp; month &lt; 13;\n    },\n\n    /**\n     * Check validation of values in a date object having year, month, day-in-month\n     * @param {{year: number, month: number, date: number}} datehash - date object\n     * @returns {boolean} - whether the date object is valid or not\n     * @private\n     */\n    _isValidDate: function(datehash) {\n        var year = datehash.year,\n            month = datehash.month,\n            date = datehash.date,\n            isLeapYear = (year % 4 === 0) &amp;&amp; (year % 100 !== 0) || (year % 400 === 0),\n            lastDayInMonth,\n            isBetween;\n\n        if (!this._isValidYear(year) || !this._isValidMonth(month)) {\n            return false;\n        }\n\n        lastDayInMonth = CONSTANTS.monthDays[month];\n        if (isLeapYear &amp;&amp; month === 2) {\n                lastDayInMonth = 29;\n        }\n        isBetween = !!(util.isNumber(date) &amp;&amp; (date > 0) &amp;&amp; (date &lt;= lastDayInMonth));\n\n        return isBetween;\n    },\n\n    /**\n     * Check an element is an opener.\n     * @param {HTMLElement} target element\n     * @returns {boolean} - opener true/false\n     * @private\n     */\n    _isOpener: function(target) {\n        var result = false;\n\n        util.forEach(this._openers, function(opener) {\n            if (target === opener || $.contains(opener, target)) {\n                result = true;\n                return false;\n            }\n        });\n        return result;\n    },\n\n    /**\n     * Set style-position of calendar\n     * @private\n     */\n    _arrangeLayer: function() {\n        var style = this._$wrapperElement[0].style,\n            pos = this._pos;\n\n        style.left = pos.left + 'px';\n        style.top = pos.top + 'px';\n        style.zIndex = pos.zIndex;\n        this._$wrapperElement.append(this._calendar.$element);\n        if (this._timePicker) {\n            this._$wrapperElement.append(this._timePicker.$timePickerElement);\n            this._timePicker.show();\n        }\n    },\n\n    /**\n     * Get boundingClientRect of an element\n     * @param {HTMLElement|jQuery} [element] - element\n     * @returns {Object} - an object having left, top, bottom, right of element\n     * @private\n     */\n    _getBoundingClientRect: function(element) {\n        var el = $(element)[0] || this._$element[0],\n            bound,\n            ceil;\n\n        bound = el.getBoundingClientRect();\n        ceil = Math.ceil;\n        return {\n            left: ceil(bound.left),\n            top: ceil(bound.top),\n            bottom: ceil(bound.bottom),\n            right: ceil(bound.right)\n        };\n    },\n\n    /**\n     * Set date from string\n     * @param {string} str - date string\n     * @private\n     */\n    _setDateFromString: function(str) {\n        var date = this._extractDate(str);\n\n        if (date &amp;&amp; !this._isRestricted(date)) {\n            if (this._timePicker) {\n                this._timePicker.setTimeFromInputElement(this._$element);\n            }\n            this.setDate(date.year, date.month, date.date);\n        } else {\n            this.setDate();\n        }\n    },\n\n    /**\n     * Return formed date-string from date object\n     * @return {string} - formed date-string\n     * @private\n     */\n    _formed: function() {\n        var year = this._date.year,\n            month = this._date.month,\n            date = this._date.date,\n            form = this._dateForm,\n            replaceMap,\n            dateString;\n\n        month = month &lt; 10 ? ('0' + month) : month;\n        date = date &lt; 10 ? ('0' + date) : date;\n\n        replaceMap = {\n            yyyy: year,\n            yy: String(year).substr(2, 2),\n            mm: month,\n            m: Number(month),\n            dd: date,\n            d: Number(date)\n        };\n\n        dateString = form.replace(formatRegExp, function(key) {\n            return replaceMap[key.toLowerCase()] || '';\n        });\n\n        return dateString;\n    },\n\n    /**\n     * Extract date-object from input string with comparing date-format&lt;br>\n     * If can not extract, return false\n     * @param {String} str - input string(text)\n     * @returns {{year: number, month: number, date: number}|false} - extracted date object or false\n     * @private\n     */\n    _extractDate: function(str) {\n        var formOrder = this._formOrder,\n            resultDate = {},\n            regExp = this._regExp;\n\n        regExp.lastIndex = 0;\n        if (regExp.test(str)) {\n            resultDate[formOrder[0]] = Number(RegExp.$1);\n            resultDate[formOrder[1]] = Number(RegExp.$2);\n            resultDate[formOrder[2]] = Number(RegExp.$3);\n        } else {\n            return false;\n        }\n\n        if (String(resultDate.year).length === 2) {\n            resultDate.year = Number(this._defaultCentury + resultDate.year);\n        }\n\n        return resultDate;\n    },\n\n    /**\n     * Check a date-object is restricted or not\n     * @param {{year: number, month: number, date: number}} datehash - date object\n     * @returns {boolean} - whether the date-object is restricted or not\n     * @private\n     */\n    _isRestricted: function(datehash) {\n        var start = this._startEdge,\n            end = this._endEdge,\n            date = utils.getTime(datehash);\n\n        return !this._isValidDate(datehash) || (date &lt; start || date > end);\n    },\n\n    /**\n     * Set selectable-class-name to selectable date element.\n     * @param {HTMLElement|jQuery} element - date element\n     * @param {{year: number, month: number, date: number}} dateHash - date object\n     * @private\n     */\n    _setSelectableClassName: function(element, dateHash) {\n        if (!this._isRestricted(dateHash)) {\n            $(element).addClass(this._selectableClassName);\n        }\n    },\n\n    /**\n     * Set selected-class-name to selected date element\n     * @param {HTMLElement|jQuery} element - date element\n     * @param {{year: number, month: number, date: number}} dateHash - date object\n     * @private\n     */\n    _setSelectedClassName: function(element, dateHash) {\n        var year = this._date.year,\n            month = this._date.month,\n            date = this._date.date,\n            isSelected = (year === dateHash.year) &amp;&amp; (month === dateHash.month) &amp;&amp; (date === dateHash.date);\n\n        if (isSelected) {\n            $(element).addClass(this._selectedClassName);\n        }\n    },\n\n    /**\n     * Set value a date-string of current this instance to input element\n     * @private\n     */\n    _setValueToInputElement: function() {\n        var dateString = this._formed(),\n            timeString = '';\n\n        if (this._timePicker) {\n            timeString = this._timePicker.getTime();\n        }\n        this._$element.val(dateString + timeString);\n    },\n\n    /**\n     * Set(or make) RegExp instance from the date-format of this instance.\n     * @private\n     */\n    _setRegExp: function() {\n        var regExpStr = '^',\n            index = 0,\n            formOrder = this._formOrder;\n\n        this._dateForm.replace(formatRegExp, function(str) {\n            var key = str.toLowerCase();\n\n            regExpStr += (mapForConverting[key].expression + '[\\\\D\\\\s]*');\n            formOrder[index] = mapForConverting[key].type;\n            index += 1;\n        });\n        this._regExp = new RegExp(regExpStr, 'gi');\n    },\n\n    /**\n     * Set event handlers to bind context and then store.\n     * @private\n     */\n    _setProxyHandlers: function() {\n        var proxies = this._proxyHandlers;\n\n        // Event handlers for element\n        proxies.onMousedownDocument = util.bind(this._onMousedownDocument, this);\n        proxies.onKeydownElement = util.bind(this._onKeydownElement, this);\n        proxies.onClickCalendar = util.bind(this._onClickCalendar, this);\n        proxies.onClickOpener = util.bind(this._onClickOpener, this);\n\n        // Event handlers for custom event of calendar\n        proxies.onBeforeDrawCalendar = util.bind(this._onBeforeDrawCalendar, this);\n        proxies.onDrawCalendar = util.bind(this._onDrawCalendar, this);\n        proxies.onAfterDrawCalendar = util.bind(this._onAfterDrawCalendar, this);\n    },\n\n    /**\n     * Event handler for mousedown of document&lt;br>\n     * - When click the out of layer, close the layer\n     * @param {Event} event - event object\n     * @private\n     */\n    _onMousedownDocument: function(event) {\n        var isContains = $.contains(this._$wrapperElement[0], event.target);\n\n        if ((!isContains &amp;&amp; !this._isOpener(event.target))) {\n            this.close();\n        }\n    },\n\n    /**\n     * Event handler for enter-key down of input element\n     * @param {Event} [event] - event object\n     * @private\n     */\n    _onKeydownElement: function(event) {\n        if (!event || event.keyCode !== 13) {\n            return;\n        }\n        this._setDateFromString(this._$element.val());\n    },\n\n    /**\n     * Event handler for click of calendar&lt;br>\n     * - Update date form event-target\n     * @param {Event} event - event object\n     * @private\n     */\n    _onClickCalendar: function(event) {\n        var target = event.target,\n            className = target.className,\n            value = Number((target.innerText || target.textContent || target.nodeValue)),\n            shownDate,\n            relativeMonth,\n            date;\n\n        if (value &amp;&amp; !isNaN(value)) {\n            if (className.indexOf('prev-month') > -1) {\n                relativeMonth = -1;\n            } else if (className.indexOf('next-month') > -1) {\n                relativeMonth = 1;\n            } else {\n                relativeMonth = 0;\n            }\n\n            shownDate = this._calendar.getDate();\n            shownDate.date = value;\n            date = utils.getRelativeDate(0, relativeMonth, 0, shownDate);\n            this.setDate(date.year, date.month, date.date);\n        }\n    },\n\n    /**\n     * Event handler for click of opener-element\n     * @private\n     */\n    _onClickOpener: function() {\n        this.open();\n    },\n\n    /**\n     * Event handler for 'beforeDraw'-custom event of calendar\n     * @private\n     * @see {tui.component.Calendar.draw}\n     */\n    _onBeforeDrawCalendar: function() {\n        this._unbindOnClickCalendar();\n    },\n\n    /**\n     * Event handler for 'draw'-custom event of calendar\n     * @param {Object} eventData - custom event data\n     * @private\n     * @see {tui.component.Calendar.draw}\n     */\n    _onDrawCalendar: function(eventData) {\n        var dateHash = {\n            year: eventData.year,\n            month: eventData.month,\n            date: eventData.date\n        };\n        this._setSelectableClassName(eventData.$dateContainer, dateHash);\n        this._setSelectedClassName(eventData.$dateContainer, dateHash);\n    },\n\n    /**\n     * Event handler for 'afterDraw'-custom event of calendar\n     * @private\n     * @see {tui.component.Calendar.draw}\n     */\n    _onAfterDrawCalendar: function() {\n        this._bindOnClickCalendar();\n    },\n\n    /**\n     * Bind opener-elements event\n     * @param {Array} opOpeners [option.openers] - list of opener elements\n     * @private\n     */\n    _bindOpenerEvent: function(opOpeners) {\n        this._setOpeners(opOpeners);\n        this._$element.on('keydown', this._proxyHandlers.onKeydownElement);\n    },\n\n    /**\n     * Bind mousedown event of documnet\n     * @private\n     */\n    _bindOnMousedownDocumnet: function() {\n        $(document).on('mousedown', this._proxyHandlers.onMousedownDocument);\n    },\n\n    /**\n     * Unbind mousedown event of documnet\n     * @private\n     */\n    _unbindOnMousedownDocument: function() {\n        $(document).off('mousedown', this._proxyHandlers.onMousedownDocument);\n    },\n\n    /**\n     * Bind click event of calendar\n     * @private\n     */\n    _bindOnClickCalendar: function() {\n        var handler = this._proxyHandlers.onClickCalendar;\n        this._$wrapperElement.find('.' + this._selectableClassName).on('click', handler);\n    },\n\n    /**\n     * Unbind click event of calendar\n     * @private\n     */\n    _unbindOnClickCalendar: function() {\n        var handler = this._proxyHandlers.onClickCalendar;\n        this._$wrapperElement.find('.' + this._selectableClassName).off('click', handler);\n    },\n\n    /**\n     * Bind custom event of calendar\n     * @private\n     */\n    _bindCalendarCustomEvent: function() {\n        var proxyHandlers = this._proxyHandlers,\n            onBeforeDraw = proxyHandlers.onBeforeDrawCalendar,\n            onDraw = proxyHandlers.onDrawCalendar,\n            onAfterDraw = proxyHandlers.onAfterDrawCalendar;\n\n        this._calendar.on({\n            'beforeDraw': onBeforeDraw,\n            'draw': onDraw,\n            'afterDraw': onAfterDraw\n        });\n    },\n\n   /**\n    * Unbind custom event of calendar\n    * @private\n    */\n    _unbindCalendarCustomEvent: function() {\n       var proxyHandlers = this._proxyHandlers,\n           onBeforeDraw = proxyHandlers.onBeforeDrawCalendar,\n           onDraw = proxyHandlers.onDrawCalendar,\n           onAfterDraw = proxyHandlers.onAfterDrawCalendar;\n\n       this._calendar.off({\n           'beforeDraw': onBeforeDraw,\n           'draw': onDraw,\n           'afterDraw': onAfterDraw\n       });\n    },\n\n\n    /**\n     * Set position-left, top of calendar\n     * @api\n     * @param {number} x - position-left\n     * @param {number} y - position-top\n     * @since 1.1.1\n     */\n    setXY: function(x, y) {\n        var pos = this._pos;\n\n        pos.left = util.isNumber(x) ? x : pos.left;\n        pos.top = util.isNumber(y) ? y : pos.top;\n        this._arrangeLayer();\n    },\n\n    /**\n     * Set z-index of calendar\n     * @api\n     * @param {number} zIndex - z-index value\n     * @since 1.1.1\n     */\n    setZIndex: function(zIndex) {\n        if (!util.isNumber(zIndex)) {\n            return;\n        }\n\n        this._pos.zIndex = zIndex;\n        this._arrangeLayer();\n    },\n\n    /**\n     * add opener\n     * @api\n     * @param {HTMLElement|jQuery} opener - element\n     */\n    addOpener: function(opener) {\n        if (inArray(opener, this._openers) &lt; 0) {\n            this._openers.push($(opener)[0]);\n            $(opener).on('click', this._proxyHandlers.onClickOpener);\n        }\n    },\n\n    /**\n     * remove opener\n     * @api\n     * @param {HTMLElement} opener - element\n     */\n    removeOpener: function(opener) {\n        var index = inArray(opener, this._openers);\n\n        if (index > -1) {\n            $(this._openers[index]).off('click', this._proxyHandlers.onClickOpener);\n            this._openers.splice(index, 1);\n        }\n    },\n\n    /**\n     * Open calendar with arranging position\n     * @api\n     */\n    open: function() {\n        if (this.isOpened()) {\n            return;\n        }\n        this._arrangeLayer();\n        this._bindCalendarCustomEvent();\n        this._bindOnMousedownDocumnet();\n        this._calendar.draw(this._date.year, this._date.month, false);\n        this._$wrapperElement.show();\n\n        /**\n         * @api\n         * @event DatePicker#open\n         * @example\n         * datePicker.on('open', function() {\n         *     alert('open');\n         * });\n         */\n        this.fire('open');\n    },\n\n    /**\n     * Close calendar with unbinding some events\n     * @api\n     */\n    close: function() {\n        if (!this.isOpened()) {\n            return;\n        }\n        this._unbindCalendarCustomEvent();\n        this._unbindOnMousedownDocument();\n        this._$wrapperElement.hide();\n\n        /**\n         * @api\n         * @event DatePicker#close\n         * @example\n         * datePicker.on('close', function() {\n         *     alert('close');\n         * });\n         */\n        this.fire('close');\n    },\n\n    /**\n     * Get date-object of current DatePicker instance.\n     * @api\n     * @returns {Object} - date-object having year, month and day-in-month\n     */\n    getDateObject: function() {\n        return util.extend({}, this._date);\n    },\n\n    /**\n     * Return year\n     * @api\n     * @returns {number} - year\n     */\n    getYear: function() {\n        return this._date.year;\n    },\n\n    /**\n     * Return month\n     * @api\n     * @returns {number} - month\n     */\n    getMonth: function() {\n        return this._date.month;\n    },\n\n    /**\n     * Return day-in-month\n     * @api\n     * @returns {number} - day-in-month\n     */\n    getDayInMonth: function() {\n        return this._date.date;\n    },\n\n    /**\n     * Set date from values(year, month, date) and then fire 'update' custom event\n     * @api\n     * @param {string|number} [year] - year\n     * @param {string|number} [month] - month\n     * @param {string|number} [date] - day in month\n     */\n    setDate: function(year, month, date) {\n        var dateObj = this._date,\n            newDateObj = {};\n\n        newDateObj.year = year || dateObj.year;\n        newDateObj.month = month || dateObj.month;\n        newDateObj.date = date || dateObj.date;\n\n        if (!this._isRestricted(newDateObj)) {\n            util.extend(dateObj, newDateObj);\n        }\n        this._setValueToInputElement();\n        this._calendar.draw(dateObj.year, dateObj.month, false);\n\n        this.fire('update');\n    },\n\n    /**\n     * Set or update date-form\n     * @api\n     * @param {String} [form] - date-format\n     * @example\n     *  datepicker.setDateForm('yyyy-mm-dd');\n     *  datepicker.setDateForm('mm-dd, yyyy');\n     *  datepicker.setDateForm('y/m/d');\n     *  datepicker.setDateForm('yy/mm/dd');\n     */\n    setDateForm: function(form) {\n        this._dateForm = form || this._dateForm;\n        this._setRegExp();\n        this.setDate();\n    },\n\n    /**\n     * Return whether the calendar is opened or not\n     * @api\n     * @returns {boolean} - true if opened, false otherwise\n     */\n    isOpened: function() {\n        return this._$wrapperElement.css('display') === 'block';\n    },\n\n    /**\n     * Return TimePicker instance\n     * @api\n     * @returns {TimePicker} - TimePicker instance\n     */\n    getTimePicker: function() {\n        return this._timePicker;\n    }\n});\n\nutil.CustomEvents.mixin(DatePicker);\n\nmodule.exports = DatePicker;\n\n</code></pre>\n        </article>\n    </section>\n\n\n\n</div>\n\n"