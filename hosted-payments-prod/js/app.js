(function() {
  'use strict';
  var zoozApi;
  // error messages 
  var errorMessages = {
    INVALID_CARD_NUMBER:  'Invalid card number',
    INVALID_CVV:          'Invalid cvv',
    INVALID_MONTH:        'Invalid exp month',
    INVALID_YEAR:         'Invalid exp year',
    INVALID_GENERAL:      'Unable to process credit card:'
  }

//credit card data mapping
var CARD_NUMBER = '#c_no';
var CVV         = '#c_sec';
var MONTH       = '#month';
var YEAR        = '#year';
var targetHost = '*';
var currCardData = 
  // select-picker option generation 
  (function initSelectOptions(){
    var str = '';
    for(var i = 1; i < 13; i++){
      var stub = i < 10?'0' : '';
      str += '<option>'+ stub + i + '</option>';
    }
    $("#month")
    .html(str)
    .selectpicker('refresh');
    str = '';
    var currentYear = new Date().getFullYear();
    for(var i = 0; i < 6; i++){
      str += '<option>'+ (currentYear + i) + '</option>';
    }
    $("#year")
    .html(str)
    .selectpicker('refresh');
  })();

  $(document).ready(function() {
    //lisnter
    window.addEventListener("message", handleMessage, false);
    // select-picker init 
    $('.selectpicker').selectpicker({
      style: 'btn-default',
      size: 6
    });

    $('#sign-up').click(function(event) {
      currCardData = getCardData();
    if (!validateCardData(currCardData)){/*handle here*/}
      var eventObj = {
        eventType: 'fieldValidation'
      };
      parent.postMessage(eventObj, targetHost);
    });

    $('#sign-up').prop('disabled', getParameterByName('isValidSession') === 'false');

    $('.validate').click(function (event) {
      $(this).parents('.form-group').removeClass('has-error').removeClass('has-danger');
      $('#general-error-block').parents(".form-group").removeClass('has-error').removeClass('has-danger');
    });
  });

  function handleMessage(event){
    var data = event.data;
    if(event.data.eventType === 'dataInit'){
      var languageFilter = function(){
        return (data.lang ==='iw') };
      // label initialization 
      $('#terms-label').text(data.buttonLabel)
      .filter(languageFilter).attr('dir','rtl');
      $('#sign-up').text(data.buttonValue)
      .filter(languageFilter).attr('dir','rtl');
      // labels processing 
      if(data.labels)
        var isCompleteLabelSet = data.labels.every(function(el, ind){return el?true:false;});
      if(isCompleteLabelSet && data.labels.length !== 0){
        $('label').each(function(index, el){
          $(el).text(data.labels[index]).filter(languageFilter);
          if(languageFilter()){
            $(el).before($(el).next());
          }
        });
        if(languageFilter()){
          $('.input-block').attr('dir', 'rtl');
        }
      }

      return;
    }
    if(event.data.eventType === 'validationResult'){
      console.log('In handleMessage > validationResult');
      if(data.result){
        addPaymentMethod(currCardData, data.customerToken);
      }
    }
  }
  // Main Method
  function  addPaymentMethod(cardData, paymentToken){
    var initParams = {
      isSandbox: false,
      uniqueId: 'PAPI_ZooZNP_TXRYLFPIXLGKZCX37TXONGT6NY_1'
    };  
    zoozApi = new Zooz.Ext.External(initParams);
    var paymentRequest = {
      paymentToken: paymentToken,
      email: getParameterByName('email'),
      paymentMethod: {
        paymentMethodType: 'CreditCard',
        paymentMethodDetails: {
          cardNumber: cardData.cardNumber,
          cardHolderName: getParameterByName('cardHolderName'),
          month: cardData.month,
          year: cardData.year,
          cvvNumber: cardData.cvv
        }
      }
    };
    console.log('paymentRequest', paymentRequest);
    var succFunc = function (data) {
      console.log('succ: ', data);
      var eventObj = {
        eventType: 'paymentSuccess',
        payment: {
          paymentToken: getParameterByName('paymentToken'),
          paymentMethodToken: data.paymentMethodToken
        }
      };
      parent.postMessage(eventObj, targetHost);
      console.log(eventObj);
    };
    var failFunc = function (data) {
      console.log('fail:', data);
      showGeneralError(data.errorMessage);
      var eventObj = {
        eventType: 'paymentError'
      };
      console.log(eventObj);
      parent.postMessage(eventObj, targetHost);
    };
    var res = zoozApi.addPaymentMethod(paymentRequest, succFunc, failFunc);
    console.log(res);
  }
  function getCardData() {
    return {
      cardNumber: document.querySelector(CARD_NUMBER).value,
      cvv:        document.querySelector(CVV).value,
      month:      document.querySelector(MONTH).value,
      year:       document.querySelector(YEAR).value
    }
  }

  function validateCardData(data) {
    var result = true;   
    var invalidCardCallBack = function(callback){
      console.log('validateCardData::callback', callback);
      if(callback.length_valid && callback.luhn_valid){
        return;
      }
      console.log(errorMessages.INVALID_CARD_NUMBER);
      showError('#c_no', errorMessages.INVALID_CARD_NUMBER);
      result =  false;
    };
    if (!validateCardNumber(data.cardNumber, invalidCardCallBack)) {
    }
    if (!validateCVV(data.cvv)) {
      console.log(errorMessages.INVALID_CVV);
      showError('#c_sec', errorMessages.INVALID_CVV);
      result =  false;
    }
    if (!validateMonth(data.month)) {
      console.log(errorMessages.INVALID_MONTH);
      showError('#month', errorMessages.INVALID_MONTH);
      result =  false;
    }
    if (!validateYear(data.year)) {
      console.log(errorMessages.INVALID_YEAR);
      showError('#year', errorMessages.INVALID_YEAR);
      result =  false;
    }
    return result;
  }

  function showError(selector, msg) {
    $(selector).parents(".form-group").addClass('has-error').addClass('has-danger');
    $(selector).next().text(msg);
  }
  function showGeneralError(msg){
    if(msg.indexOf('provided token has expired') !== -1){
      msg += ' Please refresh page.'
    }
    $('#general-error-block').parents(".form-group")    
    .addClass('has-error')
    .addClass('has-danger');
    $('#general-error-block').text(errorMessages.INVALID_GENERAL);
    $('#general-error-block-msg').text(msg)
    .addClass('has-error')
    .addClass('has-danger');
  }
  function getParameterByName(parameterName) {
    parameterName = new RegExp('[?&]' + encodeURIComponent(parameterName) + '=([^&]*)').exec(location.search);
    if (parameterName) {
      return decodeURIComponent(parameterName[1]);
    }
  };
  function validateMonth(month) {
    if (!/^[0-9]{2}$/.test(month)) return false;
    return Number(month) > 0 && Number(month) <= 12;
  }


  function validateYear(year) {
    var currentYear = new Date().getFullYear();
    return Number(year) >= currentYear;
  }


  function validateCardNumber(cardNumber, callback) {
    return Zooz.Checkout.validateCreditCard.validate(cardNumber, callback);
  }

  function validateCVV(cvv) {
    return /^[0-9]{3,4}$/.test(cvv);
  }
}());
