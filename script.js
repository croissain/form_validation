function Validator(options) {
    var selectorRules = {};

    function Validate(inputElement, rule) {
        var errorElement = inputElement.parentElement.querySelector(
            options.errorSelector
        );
        var errorMessage = rule.test(inputElement.value);

        // Lấy ra các rule của selector
        var rules = selectorRules[rule.selector];

        // Lặp qua từng rule và kiểm tra, nếu có lỗi thì dừng
        for (var i = 0; i < rules.length; ++i) {
            errorMessage = rules[i](inputElement.value);
            if (errorMessage) break;
        }

        if (errorMessage) {
            errorElement.innerText = errorMessage;
            // console.log(errorElement)
            errorElement.classList.add("invalid");
        } else {
            // errorElement.innerText = "";
            errorElement.classList.remove("invalid");
        }

        return !errorMessage;
    }

    var formElement = document.querySelector(options.form);
    if (formElement) {
        formElement.onsubmit = function (e) {
            e.preventDefault();

            var isFormValid = true;

            // Lặp qua từng rules và validate
            options.rules.forEach(function (rule) {
                var inputElement = formElement.querySelector(rule.selector);
                var isValid = Validate(inputElement, rule);
                if (!isValid) {
                    isFormValid = false;
                }
            });
            

            if (isFormValid) {
                if (typeof options.onSubmit === "function") {
                    var enableInputs = formElement.querySelectorAll('[name]:not([disabled])');
                    var formValues = Array.from(enableInputs).reduce(function (values,input) {
                        values[input.name] = input.value;
                        return values;
                    }, {});
                    options.onSubmit(formValues);
                } else {
                    formElement.submit()
                }
            }
        };

        // Lặp qua mỗi rule & xử lý
        options.rules.forEach(function (rule) {
            // Lưu lại các rules cho mỗi input
            if (Array.isArray(selectorRules[rule.selector])) {
                selectorRules[rule.selector].push(rule.test);
            } else {
                selectorRules[rule.selector] = [rule.test];
            }

            var inputElement = formElement.querySelector(rule.selector);

            if (inputElement) {
                // Xử lý khi đang nhập
                var errorElement =
                    inputElement.parentElement.querySelector(
                        ".error-message-box"
                    );
                inputElement.oninput = function () {
                    errorElement.classList.remove("invalid");
                };

                // Xử lý blur ra ngoài
                inputElement.onblur = function () {
                    Validate(inputElement, rule);
                };
            }
        });
    }
}

Validator.isRequired = function (selector, message) {
    return {
        selector: selector,
        test: function (value) {
            return value.trim()
                ? undefined
                : message || "Vui lòng nhập trường này!";
        },
    };
};

Validator.isEmail = function (selector) {
    return {
        selector: selector,
        test: function (value) {
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return regex.test(value) ? undefined : "Email không tồn tại!";
        },
    };
};

Validator.minLength = function (selector, min) {
    return {
        selector: selector,
        test: function (value) {
            return value.length >= min
                ? undefined
                : `Vui lòng nhập tối thiểu ${min} ký tự`;
        },
    };
};

Validator.isConfirmed = function (selector, getConfirmValue, message) {
    return {
        selector: selector,
        test: function (value) {
            return value === getConfirmValue()
                ? undefined
                : message || "Giá trị nhập vào không trùng khớp";
        },
    };
};
