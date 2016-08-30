function handleMessage(event) {
            debugger;
            console.log('Message received; event origin:'+event.origin+' merchant domain:'+merchantDomain);
			var message;
            //TBD: uncomment
			// if ( !(event.origin === merchantDomain ) ) {
			// 	return false;
			// }
            selectedMonth = $('#month').find("option:selected").text();
            selectedYear = $('#year').find("option:selected").text();
            console.log('Message processed ');
            var data = event.data;
            //alert(data);

            if (data.action == "checkFormData") {

                error = 0;

                cardNumber = $("#c_no").val();
                card_cvv = $("#c_sec").val();

                if (cardNumber == '') {
                    error = 1;
                }
                else if (!valid_credit_card(cardNumber)) {
                    error = 2;
                }
                else if (selectedMonth == '0' || selectedYear == '0') {
                    error = 3;
                }
                else if (card_cvv == '') {
                    error = 4;
                }
                else if (!validateCVV(card_cvv)) {
                    error = 5;
                }

                var dataToSend = {
                    action: "formFields",
                    error: error
                };
                console.log('Before decision');
                parent.postMessage(dataToSend, event.origin);
                console.log('After decision');

            } else if (data.action == "addPaymentToken") {
                
                cardNumber = $("#c_no").val();
                card_cvv = $("#c_sec").val();

                var jSONdata = {
                    paymentToken: data.paymentToken,
                    email: data.email,
                    paymentMethod: {
                        paymentMethodType: "CreditCard",
                        paymentMethodDetails: {
                            cardNumber: cardNumber,
                            cardHolderName: data.name,
                            month: selectedMonth,
                            year: selectedYear,
                            cvvNumber: card_cvv
                        },
                        configuration: {
                            rememberPaymentMethod: true
                        }
                    }
                };

                addPaymentMethod(jSONdata, event.origin);
            }
        }

function valid_credit_card(value) {
    // accept only digits, dashes or spaces
    if (/[^0-9-\s]+/.test(value)) return false;

    // The Luhn Algorithm. It's so pretty.
    var nCheck = 0, nDigit = 0, bEven = false;
    value = value.replace(/\D/g, "");

    for (var n = value.length - 1; n >= 0; n--) {
        var cDigit = value.charAt(n),
        nDigit = parseInt(cDigit, 10);

        if (bEven) {
            if ((nDigit *= 2) > 9) nDigit -= 9;
        }

        nCheck += nDigit;
        bEven = !bEven;
    }

    return (nCheck % 10) == 0;
}

function validateCVV(cvv) {            
    var cvvTemp = new RegExp('^[0-9]{3,4}$');

    if(!cvvTemp.test(cvv)) {
        return false;                
    } else {
        return true;
    }
}        