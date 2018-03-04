/*!
 *
 *  Web Starter Kit
 *  Copyright 2015 Google Inc. All rights reserved.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *    https://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License
 *
 */
/* eslint-env browser */
(function() {
  'use strict';

  // Check to make sure service workers are supported in the current browser,
  // and that the current page is accessed from a secure origin. Using a
  // service worker from an insecure origin will trigger JS console errors. See
  // http://www.chromium.org/Home/chromium-security/prefer-secure-origins-for-powerful-new-features
  var isLocalhost = Boolean(window.location.hostname === 'localhost' ||
      // [::1] is the IPv6 localhost address.
      window.location.hostname === '[::1]' ||
      // 127.0.0.1/8 is considered localhost for IPv4.
      window.location.hostname.match(
        /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
      )
    );

  if ('serviceWorker' in navigator &&
      (window.location.protocol === 'https:' || isLocalhost)) {
    navigator.serviceWorker.register('service-worker.js')
    .then(function(registration) {
      // updatefound is fired if service-worker.js changes.
      registration.onupdatefound = function() {
        // updatefound is also fired the very first time the SW is installed,
        // and there's no need to prompt for a reload at that point.
        // So check here to see if the page is already controlled,
        // i.e. whether there's an existing service worker.
        if (navigator.serviceWorker.controller) {
          // The updatefound event implies that registration.installing is set:
          // https://slightlyoff.github.io/ServiceWorker/spec/service_worker/index.html#service-worker-container-updatefound-event
          var installingWorker = registration.installing;

          installingWorker.onstatechange = function() {
            switch (installingWorker.state) {
              case 'installed':
                // At this point, the old content will have been purged and the
                // fresh content will have been added to the cache.
                // It's the perfect time to display a "New content is
                // available; please refresh." message in the page's interface.
                break;

              case 'redundant':
                throw new Error('The installing ' +
                                'service worker became redundant.');

              default:
                // Ignore
            }
          };
        }
      };
    }).catch(function(e) {
      console.error('Error during service worker registration:', e);
    });
  }

  // Your custom JavaScript goes here
  var project = {
    CloneButton: function(buttonSelector, imageSelector) {
      this.button = document.querySelector(buttonSelector);
      this.image = document.querySelector(imageSelector);
      this.isBinded = false;

      if (this.button && this.image) {
        this.isBinded = true;
        this.button.addEventListener('click', function() {
          this.image.parentNode.insertAdjacentHTML(
              'beforeend',
              this.image.outerHTML
          );
        }.bind(this), false);
      }
    },
    initImageCloneButton: function() {
      var completePairs = [];

      for (var i = 0, argument; i < arguments.length; i++) {
        if (arguments[i].btn && arguments[i].img) {
          argument = new this.CloneButton(arguments[i].btn, arguments[i].img);
          if (argument.isBinded) {
            completePairs.push(argument);
          }
        }
      }

      return completePairs;
    },
    checkoutForm: function(formId) {
      const requiredAttribute = 'form-required';
      const localeAttribute = 'form-locale';
      const inputMaskAttribute = 'input-mask';
      const inputErrorMsgAttribute = 'form-error-msg';
      const markerSign = '#';
      const separatorSigns = '.,-()[]{}/\\';
      const validationClasses = {
        valid: 'valid',
        invalid: 'error',
        invalidMsg: 'error-msg'
      };
      const defaultErrorMsg = 'This field is required';
      const validationRules = {
        tel: {
          length: 10
        },
        email: new RegExp(/^[a-z][a-zA-Z0-9_]*(\.[a-zA-Z][a-zA-Z0-9_]*)?@[a-z][a-zA-Z-0-9]*\.[a-z]+(\.[a-z]+)?$/),
        postcode: {
          default: {
            length: 5
          },
          US: {
            length: 5
          }
        },
        cardcode: {
          length: 3
        },
        cardnumber: {
          length: 16
        },
        carddate: {
          length: 4
        }
      };
      var form = document.getElementById(formId);
      var requiredInputs = form ? form.querySelectorAll('input[' + requiredAttribute + ']') : [];
      var requiredCount = requiredInputs.length;
      var isDigit = function(char) {
        return /\d/.test(char);
      };
      var signIsReserved = function(char) {
        return separatorSigns.indexOf(char) > 0;
      };
      var checkForLocale = function() {
        var locale = form.querySelector('[' + localeAttribute + ']');
        return locale ? locale.options[locale.selectedIndex].value : '';
      };
      var maskInput = function(input, mask) {
        var inputMask = mask || input.getAttribute(inputMaskAttribute);

        if (inputMask) {
          inputMask = inputMask.trim();
          var currentValue = input.value.split('').filter(function(sign) {
            return !signIsReserved(sign) && sign.trim() !== '';
          });
          var maskedValue = '';

          for (var i = 0; i < inputMask.length; i++) {
            if (!currentValue.length) {
              break;
            }
            maskedValue += inputMask[i] === markerSign ? currentValue.shift() : inputMask[i];
          }

          input.value = maskedValue;

          return input;
        }
      };
      var validField = function(field) {
        var isValid = false;
        var errorMsg = document.createElement('small');
        errorMsg.classList.add(validationClasses.invalidMsg);

        switch (field.getAttribute(requiredAttribute)) {
          case 'text':
            isValid = field.value.length;
            break;

          case 'email':
            isValid = field.value.match(validationRules.email);
            break;

          case 'tel':
            isValid = field.value.split('').filter(isDigit).length === validationRules.tel.length;
            break;

          case 'postcode':
            var localeConfig = validationRules.postcode[checkForLocale()];
            isValid = field.value.split('').filter(isDigit).length === (localeConfig ? localeConfig.length : validationRules.postcode.default.length);
            break;

          case 'creditcard':
            isValid = field.value.split('').filter(isDigit).length === validationRules.cardnumber.length;
            break;

          case 'cardcode':
            isValid = field.value.length === validationRules.cardcode.length;
            break;

          case 'carddate':
            var date = field.value.split('').filter(isDigit);

            if (date.length === validationRules.carddate.length) {
              date = date.join('').match(/.{1,2}/g);
              isValid = date && date[0] && date[1] && parseInt(date[0]) <= 12;
            }
            break;

          default:
            isValid = false;
        }

        if (isValid) {
          field.classList.add(validationClasses.valid);
          field.classList.remove(validationClasses.invalid);
          field.parentNode.classList.remove(validationClasses.invalid);
          if (field.parentNode.querySelector('.' + validationClasses.invalidMsg)) {
            field.parentNode.querySelector('.' + validationClasses.invalidMsg).remove();
          }
        } else {
          field.classList.add(validationClasses.invalid);
          field.classList.remove(validationClasses.valid);
          field.parentNode.classList.add(validationClasses.invalid);
          if (!field.parentNode.querySelector('.' + validationClasses.invalidMsg)) {
            errorMsg.innerHTML = field.getAttribute(inputErrorMsgAttribute) || defaultErrorMsg;
            field.parentNode.insertBefore(errorMsg, field.nextSibling);
          }
        }

        return isValid;
      };
      var validForm = function() {
        var validFieldsCount = 0;

        for (var i = 0; i < requiredInputs.length; i++) {
          if (validField(requiredInputs[i])) {
            validFieldsCount++;
          }
        }

        return validFieldsCount;
      };

      if (requiredCount) {
        for (var i = 0; i < requiredInputs.length; i++) {
          requiredInputs[i].addEventListener('blur', function(e) {
            validField(e.target);
          }, true);
          requiredInputs[i].addEventListener('keyup', function(e) {
            maskInput(e.target);
          }, true);
        }

        form.addEventListener('submit', function(e) {
          e.preventDefault();
          if (validForm() === requiredCount) {
            e.target.submit();
          }
        }, false);
      }
    }
  };
  project.initImageCloneButton({
    btn: '#overview [action="button"]',
    img: '#overview img'
  });
  project.checkoutForm('checkout-form');
})();
