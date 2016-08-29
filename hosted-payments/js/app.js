(function() {
  'use strict';

  var zoozApi;

  var messageTypes = {
    CARD_NOT_ADDED:     'cardNotAdded',
    CARD_ADDED:         'cardAdded',
    VALIDATION_FAILED:  'validationFailed',
    SUBMIT:             'submit',
    TRANSLATE:          'translate',
    INIT:               'init'
  };

  var errorMessages = {
    INVALID_CARD_NUMBER:  'invalidCardNumber',
    INVALID_CVV:          'invalidCvv',
    INVALID_MONTH:        'invalidMonth',
    INVALID_YEAR:         'invalidYear'
  }

  var CARD_NUMBER = '#cardNumber';
  var CVV         = '#cvv';
  var MONTH       = '#month';
  var YEAR        = '#year';

  window.addEventListener("message", handleMessage);


  function init(data) {
    var initParams = {
      isSandbox:  data.isSandbox, // Must be false for production
      uniqueId:   data.appId, // App's unique ID as registered in the Zooz developer portal
    };

    zoozApi = new Zooz.Ext.External(initParams);
  }


  function isAllowedHost(host) {
    return host === 'https://gett-staging.herokuapp.com' ||
           host === 'http://gett.dev:3000';
  }


  function getCardHash() {
    var cardNumber  = document.querySelector(CARD_NUMBER).value;
    var sha1        = new jsSHA('SHA-1', 'TEXT');

    sha1.update(cardNumber);

    return sha1.getHash('HEX');
  }


  function buildCardAddedMessage(response) {
    return {
      action:         messageTypes.CARD_ADDED,
      status:         response.paymentMethodStatus.toString(),
      token:          response.paymentMethodToken,
      hash:           getCardHash(),
      month:          response.expirationMonth,
      year:           response.expirationYear,
      binNumber:      response.binNumber,
      lastFourDigits: response.lastFourDigits
    };
  }


  function buildCardNotAddedMessage(response) {
    var processorError = '';

    if (response.processorError) {
      processorError =
        'DeclineCode: ' +
        response.processorError.declineCode.toString() +
        '; DeclineReason: '
        + response.processorError.declineReason.toString();
    }

    var responseError =
      response.responseErrorCode.toString() + ': ' +
      response.errorDescription.toString();

    return {
      action:         messageTypes.CARD_NOT_ADDED,
      responseError:  responseError,
      processorError: processorError
    };
  }


  function addPaymentMethod(jsonData, eventOrigin) {
    function succFunc(response) {
      var message = buildCardAddedMessage(response);
      parent.postMessage(message, eventOrigin);
    }

    function failFunc(response) {
      var message = buildCardNotAddedMessage(response);
      parent.postMessage(message, eventOrigin);
    }

    var status = zoozApi.addPaymentMethod(jsonData, succFunc, failFunc);

    if (status.code) {
      var message = {
        action:         messageTypes.CARD_NOT_ADDED,
        responseError: 'addPaymentMethod() request has not been initiated. Please try again.',
        processorError: ''
      };

      parent.postMessage(message, eventOrigin);
    }
  }


  function handleMessage(event) {
    if (!isAllowedHost(event.origin)) return;

    if (event.data.action === messageTypes.SUBMIT) {
      submit(event.data, event.origin);
    }

    if (event.data.action === messageTypes.TRANSLATE) {
      translate(event.data);
    }

    if (event.data.action === messageTypes.INIT) {
      init(event.data);
    }
  }


  function translate(data) {
    var cardNumber = document.querySelector(CARD_NUMBER);
    var cvv        = document.querySelector(CVV);
    var month      = document.querySelector(MONTH);
    var year       = document.querySelector(YEAR);

    cardNumber.placeholder  = data.cardNumber;
    cvv.placeholder         = data.cvv;
    month.placeholder       = data.month;
    year.placeholder        = data.year;
  }


  function submit(data, origin) {
    var cardData = getCardData();
    if (!validateCardData(cardData, origin)) return;

    var jSONdata = {
      paymentToken: data.paymentToken,
      email:        data.email,
      paymentMethod: {
        paymentMethodType: 'CreditCard',
        paymentMethodDetails: {
          cardHolderName: data.name,
          cardNumber:     cardData.cardNumber,
          month:          cardData.month,
          year:           cardData.year,
          cvvNumber:      cardData.cvv
        },
        configuration: {
          rememberPaymentMethod: true
        }
      }
    };

    addPaymentMethod(jSONdata, origin);
  }


  function getCardData() {
    var year = document.querySelector(YEAR).value;

    return {
      cardNumber: document.querySelector(CARD_NUMBER).value,
      cvv:        document.querySelector(CVV).value,
      month:      document.querySelector(MONTH).value,
      year:       year.length === 2 ? '20' + year : year
    }
  }


  function postError(error, targetOrigin) {
    var message = { action: messageTypes.VALIDATION_FAILED, error: error };
    parent.postMessage(message, targetOrigin)
  }


  function validateCardData(data, targetOrigin) {
    if (!validateCardNumber(data.cardNumber)) {
      postError(errorMessages.INVALID_CARD_NUMBER, targetOrigin);
      return false;
    }

    if (!validateMonth(data.month)) {
      postError(errorMessages.INVALID_MONTH, targetOrigin);
      return false;
    }

    if (!validateYear(data.year)) {
      postError(errorMessages.INVALID_YEAR, targetOrigin);
      return false;
    }

    if (!validateCVV(data.cvv)) {
      postError(errorMessages.INVALID_CVV, targetOrigin);
      return false;
    }

    return true;
  }


  function validateMonth(month) {
    if (!/^[0-9]{2}$/.test(month)) return false;
    return Number(month) > 0 && Number(month) <= 12;
  }


  function validateYear(year) {
    var currentYear = new Date().getFullYear();
    return Number(year) >= currentYear;
  }


  function validateCardNumber(cardNumber) {
    var number = cardNumber.replace(/\D/g, '');
    if (!number) return false;

    // The Luhn Algorithm. It's so pretty.
    var nCheck  = 0;
    var nDigit  = 0;
    var bEven   = false;

    for (var n = number.length - 1; n >= 0; n--) {
      var cDigit = number.charAt(n);
      var nDigit = parseInt(cDigit, 10);

      if (bEven) {
        if ((nDigit *= 2) > 9) nDigit -= 9;
      }

      nCheck += nDigit;
      bEven = !bEven;
    }

    return (nCheck % 10) === 0;
  }


  function validateCVV(cvv) {
    return /^[0-9]{3,4}$/.test(cvv);
  }

}());


(function() {
  'use strict';

  var inputs = document.querySelectorAll('.Input');

  [].forEach.call(inputs, function(input) {
    var field = input.querySelector('.Input-field');
    var clear = input.querySelector('.Input-clear');

    function toggleClear() {
      clear.style.display = field.value ? 'block' : 'none';
    }

    function clearInput() {
      field.value = '';
      toggleClear();
    }

    clear.addEventListener('click', clearInput);
    field.addEventListener('keyup', toggleClear);
    field.addEventListener('change', toggleClear);
  });

})();
