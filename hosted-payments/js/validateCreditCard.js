var Zooz = Zooz || {};
Zooz.Checkout = Zooz.Checkout || {};

Zooz.Checkout.ValidateCreditCard = function() {
};
Zooz.Checkout.ValidateCreditCard.prototype = function() {
    var __indexOf = [].indexOf || function(item) {
        for (var i = 0, l = this.length; i < l; i++) {
            if (i in this && this[i] === item) return i;
        }
        return -1;
    };


    var card_types = [
        {
            name: 'amex',
            zooz_card: 'AmericanExpress',
            pattern: /^3[47]/,
            cardNumberGrouping: [4, 6, 5],
            segmentationPattern: '{{9999}} {{999999}} {{99999}}',
            valid_length: [15],
            cvv_length:4,
            hasClass:true
        },
        {
            name: 'diners_club_carte_blanche',
            zooz_card: 'Diners',
            pattern: /^30[0-5]/,
            cardNumberGrouping: [4, 6, 4],
            segmentationPattern: '{{9999}} {{999999}} {{9999}}',
            valid_length: [14],
            cvv_length:3,
            hasClass:true
        },
        {
            name: 'diners_club_international',
            zooz_card: 'Diners',
            pattern: /^3[68]/,
            cardNumberGrouping: [4, 6, 4],
            segmentationPattern: '{{9999}} {{999999}} {{9999}}',
            valid_length: [14],
            cvv_length:3,
            hasClass:true
        },
        {
            name: 'jcb',
            zooz_card: 'JCB',
            pattern: /^35(2[89]|[3-8][0-9])/,
            cardNumberGrouping: [4, 4, 4, 4],
            segmentationPattern: '{{9999}} {{9999}} {{9999}} {{9999}}',
            valid_length: [16],
            cvv_length:3,
            hasClass:true
        },
        {
            name: 'visa_electron',
            zooz_card: 'VISA',
            pattern: /^(4026|417500|4508|4844|491(3|7))/,
            cardNumberGrouping: [4, 4, 4, 4],
            segmentationPattern: '{{9999}} {{9999}} {{9999}} {{9999}}',
            valid_length: [16],
            cvv_length:3,
            hasClass:false
        },
        {
            name: 'visa',
            zooz_card: 'VISA',
            pattern: /^4/,
            cardNumberGrouping: [4, 4, 4, 4],
            segmentationPattern: '{{9999}} {{9999}} {{9999}} {{9999}}',
            valid_length: [16],
            cvv_length:3,
            hasClass:true
        },
        {
            name: 'visa',
            zooz_card: 'LeumiVisa',
            pattern: /^4580/,
            cardNumberGrouping: [4, 4, 4, 4],
            segmentationPattern: '{{9999}} {{9999}} {{9999}} {{9999}}',
            valid_length: [16],
            cvv_length:3,
            hasClass:true
        },
        {
            name: 'mastercard',
            zooz_card: 'MasterCard',
            pattern: /^5[1-5]/,
            cardNumberGrouping: [4, 4, 4, 4],
            segmentationPattern: '{{9999}} {{9999}} {{9999}} {{9999}}',
            valid_length: [16],
            cvv_length:3,
            hasClass:true
        },
        {
            name: 'mastercard',
            zooz_card: 'LeumiMasterCard',
            pattern: /^518954|510049|518955|518953|547718|558331|552176|552177|545134|545138/,
            cardNumberGrouping: [4, 4, 4, 4],
            segmentationPattern: '{{9999}} {{9999}} {{9999}} {{9999}}',
            valid_length: [16],
            cvv_length:3,
            hasClass:true
        },
        {
            name: 'maestro',
            zooz_card: 'Maestro',
            pattern: /^(5[0|7-9]|60[0|2-8]|6011[5,6]|6011[84|85]|60117[0-3|5-6]|60118[0-5]|6220|601[6-9]|6[1|6|8-9]|5641[0-7]|6221[0,1]|62212[0-5]|6229980[1-8]|63311[1-9]|6331[2-9]|633[0,2|4-9]|62[3,7,9]|63[0-2|4-9]|64[0-3]|622998[1-9]|601[2-9]|6767[0-6]|67677[1-3|5-9]|676[0-6]|675[0-8]|67[0-4]|56[0-3]|628[0-1|9]|67[7-9]|676[8-9]|63310|564180|6229809|622999|5640|64181)/,
            cardNumberGrouping: [6, 6, 7],
            segmentationPattern: '{{999999}} {{999999}} {{9999999}}',
            valid_length: [12, 13, 14, 15, 16, 17, 18, 19],
            cvv_length:3,
            hasClass:true
        },
        {
            name: 'maestro',
            zooz_card: 'MaestroUK',
            pattern: /^(67677[0,4]|633110|6333|6759|564182)/,
            cardNumberGrouping: [6, 6, 7],
            segmentationPattern: '{{999999}} {{999999}} {{9999999}}',
            valid_length: [12, 13, 14, 15, 16, 17, 18, 19],
            cvv_length:3,
            hasClass:true
        },
        {
            name: 'union-pay',
            zooz_card: 'UnionPay',
            pattern: /^(622[1-9]|62[4-6]|628[2-8])/,
            cardNumberGrouping: [4, 4, 4, 4],
            segmentationPattern:  '{{9999}} {{9999}} {{9999}} {{9999}}',
            valid_length: [16],
            cvv_length:3,
            hasClass:true
        },
        {
            name: 'discover',
            zooz_card: 'Discover',
            pattern: /^(6011[0|2-4]|64[4-9]|65|60117[4|7-9]|60111|60118[6-9]|60119)/,
            cardNumberGrouping: [4, 4, 4, 4],
            segmentationPattern: '{{9999}} {{9999}} {{9999}} {{9999}}',
            valid_length: [16],
            cvv_length:3,
            hasClass:true
        }
    ];

    var getClassName = function(zooz_card, callbackFunc) {
        var card = $.grep(card_types, function(e) {
                    return e.zooz_card == zooz_card && e.hasClass == true  ;
                })[0];
        return callbackFunc(
        {card_type:card}
                );
    };


    var options, _ref;
    if (options == null) {
        options = {};
    }
    if ((_ref = options.accept) == null) {
        options.accept = (function() {
            var _i, _len, _results;
            _results = [];
            for (_i = 0,_len = card_types.length; _i < _len; _i++) {
                card = card_types[_i];
                _results.push(card.name);
            }
            return _results;
        })();
    }


    var get_card_type = function(number) {
        var _j, _len1, _ref2;
        _ref2 = (function() {
            var _k, _len1, _ref2, _results;
            _results = [];
            for (_k = 0,_len1 = card_types.length; _k < _len1; _k++) {
                card = card_types[_k];
                if (_ref2 = card.name,__indexOf.call(options.accept, _ref2) >= 0) {
                    _results.push(card);
                }
            }
            return _results;
        })();
        for (_j = 0,_len1 = _ref2.length; _j < _len1; _j++) {
            var card_type = _ref2[_j];
            if (number.match(card_type.pattern)) {
                return card_type;
            }
        }
        return null;
    };
    var is_valid_luhn = function(number) {
        var digit, n, sum, _j, _len1, _ref2;
        sum = 0;
        _ref2 = number.split('').reverse();
        for (n = _j = 0,_len1 = _ref2.length; _j < _len1; n = ++_j) {
            digit = _ref2[n];
            digit = +digit;
            if (n % 2) {
                digit *= 2;
                if (digit < 10) {
                    sum += digit;
                } else {
                    sum += digit - 9;
                }
            } else {
                sum += digit;
            }
        }
        return sum % 10 === 0;
    };
    var is_valid_length = function(number, card_type) {
        var _ref2;
        return _ref2 = number.length,__indexOf.call(card_type.valid_length, _ref2) >= 0;
    };
    var validate_number = function(number, callback) {
        var length_valid, luhn_valid;
        var card_type = get_card_type(number);
        luhn_valid = false;
        length_valid = false;
        if (card_type != null) {
            luhn_valid = is_valid_luhn(number);
            length_valid = is_valid_length(number, card_type);
        }
        var card =
        {
            card_type: card_type,
            luhn_valid: luhn_valid,
            length_valid: length_valid
        };

        return callback ? callback(card) : card;

    };
    var validate = function(number, callback) {
       var valid = validate_number(number, callback); //Zooz.Checkout.removeCardFormat(number)
        return valid;
    };

    return {
        validate:validate,
        getClassName:getClassName
    };
}();

Zooz.Checkout.validateCreditCard = new Zooz.Checkout.ValidateCreditCard();

