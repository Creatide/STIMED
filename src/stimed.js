/*
 *  STIMED.js - v1.0.0
 *  jQuery plugin for controlling CSS styles over time.
 *  http://stimed.creatide.com
 *
 *  Made by Sakari Niittymaa (creatide.com)
 *  Under MIT License
 */

;(function ($) {

  $.stimed = function () {

    // Default options
    var defaults = {
        // Time control
        timeTarget: null,
        fps: 30,
        timeRunning: true,
        precise: false,
        speedUp: 0,
        // Debugging
        debugging: true
      },
      // Private variables
      pluginName = 'STIMED.JS',
      time, style, options,
      // Current instance of plugin
      plugin = this;

    // Create object for settings
    plugin.settings = {};

    // TODO: Fix to work if element contains multiple classes or id's
    // Check user-provided arguments and try to find time target
    // Usage: var stimed = new $.stimed($.(#time), {...});
    Array.prototype.slice.call(arguments).forEach(function (arg, i) {
      // If user provided time value target element on arguments
      if (typeof arg === 'object' && arg.length) {
        if (arg.attr('class').length) {
          defaults.timeTarget = '.' + arg.attr('class');
        } else if (arg.attr('id').length) {
          defaults.timeTarget = '#' + arg.attr('id');
        }
      }
      // Set options arguments if it's not a element
      else {
        options = arg;
      }
    });

    /* ---------------------------------------- *
     * INITIALIZE CONSTRUCTOR                   *
     * ---------------------------------------- */

    var init = function () {
      // Merge final properties from user-provided and default options
      plugin.settings = $.extend({}, defaults, options);
      // Create required objects
      time = new Time();
      style = new Style();
    };

    /* ---------------------------------------- *
     * PUBLIC: TIME                             *
     * ---------------------------------------- */

    plugin.time = {
      start: function () {
        plugin.settings.timeRunning = true;
        time.update();
      },
      stop: function () {
        plugin.settings.timeRunning = false;
      },
      get: function (args) {
        if ($.inArray(arguments[0], ['t', 'tt', 'tc', 'time', 'timecode']) > -1) return time.get.timecode();
        if ($.inArray(arguments[0], ['s', 'ss', 'sec', 'second', 'seconds']) > -1) return time.get.seconds();
        if ($.inArray(arguments[0], ['ms', 'millisecond', 'milliseconds']) > -1) return time.get.milliseconds();
        if ($.inArray(arguments[0], ['p', 'pos', 'position', 'percent']) > -1) return time.get.position(arguments[1]);
      },
    };

    /* ---------------------------------------- *
     * PUBLIC: STYLE                            *
     * ---------------------------------------- */

    plugin.style = {
      update: function () {
        style.update();
      },
      create: function () {
        style.create(arguments);
      },
      logStyles: function () {
        style.logStyles();
      },
      preset: function () {
        style.preset(arguments);
      }
    };

    /* ---------------------------------------- *
     * PRIVATE: TIME                            *
     * ---------------------------------------- */

    /* Time constructor *
     * ---------------- */
    function Time() {
      this.dt = new Date();
      this.speedUpCounter = 0;
      this.timeout;
      this.update();
    };

    /* Time update *
     * ----------- */
    Time.prototype.update = function () {
      this.dt = new Date();
      // Speedup time if value is set
      if (plugin.settings.speedUp > 0) {
        this.speedUpCounter += Math.round(plugin.settings.speedUp * 0.234);
        this.dt.setSeconds(this.dt.getSeconds() + this.speedUpCounter);
      }
      // Separate time values from current date object
      this.ms = this.dt.getMilliseconds();
      this.ss = utils.leadingZeros(this.dt.getSeconds());
      this.mm = utils.leadingZeros(this.dt.getMinutes());
      this.hh = utils.leadingZeros(this.dt.getHours());
      this.txt = this.hh + ':' + this.mm + ':' + this.ss;
      // Update html text value
      if (plugin.settings.timeTarget) this.renderTime(plugin.settings.timeTarget);
      // Update styles by calling update function
      if (style) Style.prototype.update();
      // If time is running setTimeout and call update again
      if (plugin.settings.timeRunning) {
        var ref = this;
        this.timeout = setTimeout(function () {
          return ref.update()
        }, 1000 / plugin.settings.fps);
      } else {
        clearTimeout(this.timeout);
      }
    };

    /* Get current time in different formats *
     * ------------------------------------- */
    Time.prototype.get = {
      timecode: function () {
        return utils.secondsToTime(this.seconds());
      },
      milliseconds: function () {
        var dateAbs = new Date(time.dt),
          millisecond = Math.floor(time.dt - dateAbs.setHours(0, 0, 0, 0));
        return millisecond;
      },
      seconds: function () {
        var dateAbs = new Date(time.dt),
          second = Math.floor((time.dt - dateAbs.setHours(0, 0, 0, 0)) / 1000);
        return second;
      },
      position: function (decimal) {
        var decimal = decimal === undefined ? 0 : decimal;
        if (decimal === 0) {
          return Math.round((this.seconds() / 86400) * 100);
        } else {
          // Get value for rounding process e.g. 100, 1000 -> 0.12, 0.123
          var val = parseInt(utils.trailingZeros(1, decimal, 0));
          return (Math.round((this.seconds() / 86400) * val) / val).toFixed(decimal);
        }
      }
    };

    /* Render time value to text element *
     * --------------------------------- */
    Time.prototype.renderTime = function (elem) {
      var ref = this;
      $(elem).each(function () {
        $(this).text(ref.txt);
      });
    };

    /* ---------------------------------------- *
     * PRIVATE: STYLE                           *
     * ---------------------------------------- */

    /* Style constructor *
     * ----------------- */
    function Style() {
      this.stylesAll = [];
      this.totalTargets = 0;
      this.totalStyles = 0;
      this.initStyles = 0;
    }

    /* Update all styles to DOM *
     * ------------------------ */
    Style.prototype.update = function () {
      // Check if there's no any styles
      if (!style.totalStyles) {
        debug('Styles not found!')
      } else {
        // Styles has found, now loop them and update DOM inline CSS
        style.loopStyles(function (target, styles) {
          // Get current time in seconds
          var currentSeconds = time.get.seconds();
          var currentMilliseconds = time.get.milliseconds();
          // Set time values to use milliseconds if needed
          var currentTime = plugin.settings.precise ? currentMilliseconds : currentSeconds;
          var timeMultiplier = plugin.settings.precise ? 1000 : 1;
          var dayLength = 86400 * timeMultiplier;
          // Loop all values of current style
          var valuesLength = styles.values.length;
          var newValue;
          for (var i = 0; i < valuesLength; i++) {            
            var timeAmount,
              currentStyle = styles.values[i],
              currentStyleTime = currentStyle.time * timeMultiplier,
              nextStyle = utils.arrayNext(styles.values, i, true),
              nextStyleTime = nextStyle[0].time * timeMultiplier,
              totalDistance = nextStyle[1] ? dayLength - currentStyleTime + nextStyleTime : nextStyleTime - currentStyleTime;
            // Check if we're on active style range and next style is not in reset range
            if (!nextStyle[1] && currentTime >= currentStyleTime && currentTime < nextStyleTime) {
              timeAmount = utils.normalize(currentStyleTime, nextStyleTime, currentTime);
              newValue = style.updateStyleValues(currentStyle, nextStyle[0], timeAmount, target);
              break;
            }
            // Time before reset and next style is reset range
            else if (nextStyle[1] && currentTime >= currentStyleTime) {
              timeAmount = utils.normalize(currentStyleTime, currentStyleTime + nextStyleTime, currentTime);
              newValue = style.updateStyleValues(currentStyle, nextStyle[0], timeAmount, target);
              break;
            }
            // Time after reseted 00:00 and next style is reset range
            else if (nextStyle[1] && currentTime < nextStyleTime && currentTime < currentStyleTime) {
              timeAmount = utils.normalize(currentStyleTime - dayLength, nextStyleTime, currentTime);
              newValue = style.updateStyleValues(currentStyle, nextStyle[0], timeAmount, target);
              break;
            }       
          }
          style.updateDOM(target, styles.property, newValue);
        });
      }
    };

    /* Create style *
     * ------------ */
    Style.prototype.create = function () {
      // Separate user-provided arguments
      var args = Array.prototype.slice.call(arguments[0]);
      var requiredProperties = ['target', 'time', 'property', 'value'];
      args.forEach(function (arg) {
        // If nested array then loop items inside of it
        if ($.isArray(arg)) {
          style.create(arg);
        } else {
          // Check if object data is valid to re-organize object data
          if (style.validateStyle(arg, requiredProperties)) style.createStyleObject(arg);
        }
        style.totalStyles++;
      });
      // Sort styles by time
      this.sortStyles('time');
    };

    /* Create style object *
     * ------------------- */
    Style.prototype.createStyleObject = function (obj) {
      // Find duplicates from style targets
      var duplicateStyle = utils.searchObjectIndex(this.stylesAll, 'target', obj['target']);
      // Create new base object
      var newStyle = {
        target: obj['target'],
        styles: [{
          property: obj['property'],
          values: [{
            time: utils.timeToSeconds(obj['time']),
            value: obj['value']
          }]
        }]
      };
      // Check if need to create new style or put values on exist style
      if (duplicateStyle === null) {
        this.stylesAll.push(newStyle);
        // Update styles length value by every new style
        this.totalTargets++;
      } else {
        // Try to find exist property from style
        var existProperty = $.grep(this.stylesAll[duplicateStyle].styles, function (e) {
          return e.property === obj['property'];
        });
        if (existProperty.length) {
          // Push new values to existing property
          existProperty[0].values.push(newStyle.styles[0].values[0]);
        } else {
          // Push new styles object to existing styles array
          this.stylesAll[duplicateStyle].styles.push(newStyle.styles[0]);
        }
      }
    };

    /* Update and parse style values *
     * ----------------------------- */
    Style.prototype.updateStyleValues = function (a, b, amount, target) {
      var aArray = a.value.toString().split(' ');
      var aArrayLength = aArray.length;
      var bArray = b.value.toString().split(' ');
      var bArrayLength = bArray.length;      
      // Check if there's same amount of value attributes
      if (aArrayLength !== bArrayLength) {
        attributionError();       
      } else {
        var unsplitArray = [];
        for (var i = 0; i < aArrayLength; i++) {
          var newValue = null;
          // Extract hex color value from string
          var aColor = utils.findHexColorString(aArray[i]);
          var bColor = utils.findHexColorString(bArray[i]);
          // Check break/illegal words to protect specific properties
          if (!utils.breakWords(aArray[i])) {
            // Create color lerp if colors found from both of values
            newValue = aColor && bColor ? utils.colorLerp(aColor[0], bColor[0], amount) : null;
            // If no colors found then try to find numbers to update
            if (!newValue) newValue = utils.lerpStringNumbers(aArray[i], bArray[i], amount);
          }
          // // Use string color or number not found and see if string has changed
          if (!newValue) newValue = aArray[i];
          // If theres problems in values show error and return
          if (!newValue) {
            attributionError();
            break;
          }
          unsplitArray.push(newValue)
        }
        return unsplitArray.join(' ');
      }    
      function attributionError() {
        target = target ? target : '';
        debug('Style attribute error on ' + target, [a, b]);
        return;
      }  
    };

    /* Validate style object *
     * --------------------- */
    Style.prototype.validateStyle = function (args, requiredProperties) {
      var failedData = [];
      // Validate user submitted style object that it contains required keys
      requiredProperties.forEach(function (prop) {
        if (!(prop in args)) failedData.push(prop);
      });
      if (!failedData.length) return true;
      debug(args.target + ' missing properties:', failedData);
    };

    /* Sort styles by property *
     * ----------------------- */
    Style.prototype.sortStyles = function (propertyName) {
      this.loopStyles(function (target, styles) {
        styles.values.sort(utils.sortBy(propertyName, false, parseInt));
      });
    };

    /* Log all current styles *
     * ---------------------- */
    Style.prototype.logStyles = function () {
      this.loopStyles(function (target, styles) {
        debug('Style found for ' + target, styles.property + ': ' + JSON.stringify(styles.values));
      });
    };

    /* Re-usable loop for all styles *
     * ----------------------------- */
    Style.prototype.loopStyles = function (callback) {
      this.stylesAll.forEach(function (obj) {
        obj.styles.forEach(function (styles) {
          callback(obj.target, styles);
        });
      });
    };

    /* Update DOM inline CSS values *
     * ---------------------------- */
    Style.prototype.updateDOM = function (target, property, value) {
      if (value) $(target).css(property, value);
    };

    /* Presets for styles *
     * ------------------ */
    Style.prototype.preset = function () {
      // Read user-provided arguments
      var args = Array.prototype.slice.call(arguments[0]);
      var presetStatus = { preset: null, found: false };
      args.forEach(function (arg) {
        if ($.isArray(arg)) {
          style.preset(arg);
        } else {
          presetStatus.preset = arg;
          // If user just submitted preset name in string
          if (typeof arg === 'string') arg = { preset: arg };
          // Try to find preset name from existing presets
          style.preset.presets.forEach(function(e, i) {
            if (utils.onlyChars(e.preset) === utils.onlyChars(arg.preset) && style.validateStyle(arg, style.preset.presets[i].required)) {
              style.preset.presets[i].create(arg);
              presetStatus.found = true;
            }
          });
        }
      });
      if (!presetStatus.found) debug('Preset not work properly:', presetStatus.preset);
    }

    /* ---------------------------------------- *
     * PRIVATE: UTILITIES                       *
     * ---------------------------------------- */

    var utils = {

      /* Array functions *
       * --------------- */

      // Array select next/prev items with cycling
      arrayNext: function (arr, i, cycle) {
        return cycle && i >= arr.length - 1 ? [arr[0], true] : [arr[++i], false];
      },
      arrayPrev: function (arr, i, cycle) {
        return cycle && i <= 0 ? [arr[arr.length - 1], true] : [arr[--i], false];
      },

      // Test if object is array type
      isArray: function (obj) {
        return !!obj && Array === obj.constructor;
      },

      // Search object index number from array with target property and key value
      searchObjectIndex: function (arr, key, value) {
        if ($.isArray(arr)) {
          for (var i = 0; i < arr.length; i++) {
            if (arr[i][key] == value) return i;
          }
        }
        return null;
      },

      // Sort array of objects by property value
      sortBy: function (field, reverse, primer) {
        var key = primer ?
          function (x) {
            return primer(x[field])
          } :
          function (x) {
            return x[field]
          };
        reverse = !reverse ? 1 : -1;
        return function (a, b) {
          return a = key(a), b = key(b), reverse * ((a > b) - (b > a));
        }
      },

      /* Math functions *
       * -------------- */

      // Check float and int types
      isInt: function (n) { return Number(n) === n && n % 1 === 0; },
      isFloat: function (n) { return Number(n) === n && n % 1 !== 0; },

      // Basic lerp function
      lerp: function (min, max, amount) {
        return min + amount * (max - min);
      },

      // Lerp all numbers in string
      lerpStringNumbers: function (a, b, amount, decimals) {
        decimals = decimals || 2;
        // Separate numbers to arrays
        aArr = a.match(/-?\d*[,.]?\d+/g);
        bArr = b.match(/-?\d*[,.]?\d+/g);
        // Test if there is the same number of values in string
        if ($.isArray(aArr) && $.isArray(bArr) && aArr.length === bArr.length) {
          return a.replace(/-?\d*[,.]?\d+/g, function (m) {
            var returnValue = utils.lerp(Number(m), bArr.shift(), amount);
            if (utils.isFloat(returnValue)) returnValue = returnValue.toFixed(decimals)
            return returnValue;
          });
        }
      },

      // Current value between two values and return float 0-1
      normalize: function (min, max, amount) {
        return Math.round(((amount - min) / (max - min)) * 10000) / 10000;
      },

      // Clamp / clip value to target range
      clamp: function (min, max, amount) {
        return Math.max(min, Math.min(amount, max));
      },

      // Generate random integer between two values (included min/max numbers)
      randomInt: function (min, max) {
          return Math.floor(Math.random() * (max - min + 1)) + min;
      },

      /* String editing functions *
       * ------------------------ */

      // Test if string contains illegal words to prevent value change for specific properties
      breakWords: function (str) {
        var ignoreWords = ['url'];
        if((new RegExp( '\\b' + ignoreWords.join('\\b|\\b') + '\\b') ).test(str)) return true;
      },

      // Format numbers to add leading zero if less than 10
      leadingZeros: function (val) {
        return ('0' + val).slice(-2);
      },

      // Add trailing zeros to any number (not add decimal)
      trailingZeros: function (val, size, character) {
        val = typeof val !== 'string' ? val.toString() : val;
        while (val.length <= size) val += character;
        return val;
      },

      // Lowercase and remove spaces from string
      onlyChars: function (str) {
        str = typeof str !== 'string' ? str.toString() : str;
        return str.replace(/\s+/g, '').toLowerCase();
      },

      // Validate that string is URL
      isURL: function (str) {
        var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|'+ // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
        '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
        return pattern.test(str);
      },

      /* Convert functions *
       * ----------------- */

      // Convert seconds to timecode (hh:mm:ss)
      secondsToTime: function (seconds) {
        var secondsInt = parseInt(seconds, 10);
        var hh = Math.floor(secondsInt / 3600);
        var mm = Math.floor((secondsInt - (hh * 3600)) / 60);
        var ss = secondsInt - (hh * 3600) - (mm * 60);
        return utils.leadingZeros(hh) + ':' + utils.leadingZeros(mm) + ':' + utils.leadingZeros(ss);
      },

      // Detect what type timecode value is
      timeToSeconds: function (val) {
        // Convert time value (hh:mm:ss) to seconds
        if (typeof val === 'string' && val.split(':').length > 1) {
          var timecode = val.split(':');
          while (timecode.length < 3) timecode.push(0);
          return (+timecode[0]) * 60 * 60 + (+timecode[1]) * 60 + (+timecode[2] || 0);
        }
        // Seconds format to return valid number from range 0-86400
        else {
          val = parseInt(val);
          if (val >= 0 && val <= 86400) return val;
          if (val > 86400) return 86400;
          if (val < 0) return 0;
        }
      },

      /* Color functions *
       * --------------- */

      // Color lerp from two hex value colors
      colorLerp: function(a, b, amount) {
        a = utils.expandHex(a), b = utils.expandHex(b);
        if (a !== b) {
          var ah = parseInt(a.replace(/#/g, ''), 16),
          ar = ah >> 16, ag = ah >> 8 & 0xff, ab = ah & 0xff,
          bh = parseInt(b.replace(/#/g, ''), 16),
          br = bh >> 16, bg = bh >> 8 & 0xff, bb = bh & 0xff,
          rr = ar + amount * (br - ar),
          rg = ag + amount * (bg - ag),
          rb = ab + amount * (bb - ab);
          return '#' + ((1 << 24) + (rr << 16) + (rg << 8) + rb | 0).toString(16).slice(1);
        } else {
          return a;
        }
      },

      // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
      expandHex: function (hex) {
        var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
        hex = hex.replace(shorthandRegex, function (m, r, g, b) {
          return r + r + g + g + b + b;
        });
        return hex;
      },

      // Find hex color value from string
      findHexColorString: function (str) {
        var shorthandRegex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;
        return str.match(shorthandRegex);
      },

      // Find hex color value from string
      replaceHexColorString: function (originalValue, newValue) {
        var shorthandRegex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;
        return originalValue.replace(shorthandRegex, newValue);
      },

      // Generata random hex color with adjusting brightness
      randomHexColor: function (brightness) {
        brightness = brightness > 255 ? 255 : brightness;
        function randomChannel(brightness) {
          var r = 255 - brightness;
          var n = 0 | ((Math.random() * r) + brightness);
          var s = n.toString(16);
          return (s.length == 1) ? '0' + s : s;
        }
        return '#' + randomChannel(brightness) + randomChannel(brightness) + randomChannel(brightness);
      }

    }

    /* ---------------------------------------- *
     * PRIVATE: DEBUGGING MESSAGES              *
     * ---------------------------------------- */

    function debug(message, data) {
      data = data ? data : '';
      if (plugin.settings.debugging) console.log('**', pluginName, '**', message, data);
    }

    // Call constructor to start
    init();

    /* ---------------------------------------- *
     * STYLE: PRESETS                           *
     * ---------------------------------------- */

    Style.prototype.preset.presets = [
      {
        preset: 'Rotate',
        required: ['target'],
        create: function (arg) {
          var
            from = arg.from || 0,
            to = arg.to == undefined ? 360 : arg.to;
          style.create([
            { target: arg.target, time: '0', property: '-ms-transform', value: 'rotate(' + from + 'deg)' },
            { target: arg.target, time: '86400', property: '-ms-transform', value: 'rotate(' + to + 'deg)' },
            { target: arg.target, time: '0', property: '-webkit-transform', value: 'rotate(' + from + 'deg)' },
            { target: arg.target, time: '86400', property: '-webkit-transform', value: 'rotate(' + to + 'deg)' },
            { target: arg.target, time: '0', property: 'transform', value: 'rotate(' + from + 'deg)' },
            { target: arg.target, time: '86400', property: 'transform', value: 'rotate(' + to + 'deg)' }
          ]);
        }
      },
      {
        preset: 'Random Values',
        required: ['target'],
        create: function (arg) {
          var
            property = arg.property || 'font-size',
            delay = arg.delay || 1000,
            min = arg.min || '40',
            max = arg.max || '100',
            unit = arg.unit || 'px',
            amount = Math.ceil(86400 / delay),            
            stylesArray = [],
            counter = 0;
          for (var i = 0; i < amount; i++) {
            var styleObj = {
              target: arg.target,
              time: counter,
              property: property,
              value: utils.randomInt(parseInt(min), parseInt(max)) + unit
            }
            stylesArray.push(styleObj);
            counter += delay;
          }
          style.create(stylesArray);
        }
      },
      {
        preset: 'Random Colors',
        required: ['target'],
        create: function (arg) {
          var
            property = arg.property || 'color',
            delay = arg.delay || 1000,
            amount = Math.ceil(86400 / delay),
            brightness = arg.brightness || 0,
            stylesArray = [],
            counter = 0;
          for (var i = 0; i < amount; i++) {
            var styleObj = {
              target: arg.target,
              time: counter,
              property: property,
              value: utils.randomHexColor(brightness)
            }
            stylesArray.push(styleObj);
            counter += delay;
          }
          style.create(stylesArray);
        }
      },
      {
        preset: 'Unsplash',
        required: ['target'],
        create: function (arg) {
          var
            property = arg.property || 'background-image',
            preload = arg.preload == undefined ? true : arg.preload,
            delay = arg.delay || 1000,
            amount = Math.ceil(86400 / delay),
            width = arg.width || 1920,
            height = arg.height || 1080,
            blur = arg.blur || false,
            grayscale = arg.grayscale || false,
            gravityOptions = ['north', 'east', 'south', 'west', 'center'],
            gravity = gravityOptions.indexOf(arg.gravity) != -1 ? arg.gravity : false,
            imageBaseUrl = "https://unsplash.it/",
            jsonUrl = "https://unsplash.it/list",
            imagesList = [],
            imageIDs = [],
            imgCounter = 0,
            totalImages = 0,
            stylesArray = [],
            counter = 0;
          // Get JSON list of images first to make sure that image exist
          $(function () {
            $.getJSON(jsonUrl)
              .done(function (result) {
                imagesList = result;
              })
              .always(function (result) {
                totalImages = imagesList.length;
                createStyles();
              })
          });
          function createStyles() {
            // Create random ID array
            for (var i = 0; i < amount; i++) imageIDs.push(imagesList[utils.randomInt(0, totalImages - 1)].id);
            // Create styles in loop
            while (counter <= 86400) {
              // Create image url with selected image effects
              var imgUrl = imageBaseUrl;
              if (grayscale) imgUrl += 'g/';
              imgUrl += width + '/' + height + '?image=' + imageIDs[imgCounter];
              if (blur) imgUrl += '&blur';
              if (gravity) imgUrl += '&gravity=' + gravity;
              // Try to preload images
              if (preload) (new Image()).src = imgUrl;
              // Create object
              var styleObj = {
                target: arg.target,
                time: counter,
                property: property,
                value: 'url("' + imgUrl + '")'
              }
              stylesArray.push(styleObj);
              imgCounter++;
              counter += delay;
              // Break the loop when all styles has countered
              if (imgCounter == amount) break;
            }
            style.create(stylesArray);
          }
        }
      }
    ];
  }

})(jQuery);