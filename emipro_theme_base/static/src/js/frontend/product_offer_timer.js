odoo.define('emipro_theme_base.product_offer_timer', function(require) {
    'use strict';

    const publicWidget = require('web.public.widget');
    require('website_sale.website_sale');
    var timer;
    var core = require('web.core');
    var _t = core._t;

    publicWidget.registry.WebsiteSale.include({
        /**
         * added a product Timer
         */
        _onChangeCombination: function(ev, $parent, combination) {
            /**
             * while change the product attribute
             */
            this._super.apply(this, arguments);
            var current_date = combination.current_date
            var start_date = combination.start_date
            var end_date = combination.end_date
            var msg = combination.offer_msg
            if (end_date != parseInt($(".end_date").val())) {
                if (combination.is_offer && combination.current_date !== 'undefined') {
                    var append_date = "<div class='timer_input'><input type='hidden' class='current_date' value=" + current_date + "></input><input type='hidden' class='start_date' value=" + start_date + "></input><input type='hidden' class='end_date' value=" + end_date + "></input><div class='te_offer_timer_msg_div'><h6 class='te_offer_timer_prod'>" + msg + "</p></h6></div></div>"
                    $(".timer_data").html(append_date);
                    $(".current_date").trigger('change');
                } else {
                    $("#timer_portion_content_ept").removeClass("d-none");
                    var append_date = "<div class='timer_input'><input type='hidden' class='current_date' value=" + 0 + "></input><input type='hidden' class='start_date' value=" + 0 + "></input><input type='hidden' class='end_date' value=" + 0 + "></input></div>"
                    $(".timer_data").html(append_date);
                    $(".current_date").trigger('change');
                }
            }
            $(".js_product .te_discount, .js_product .te_discount_before").addClass('d-none');
            $(".js_product .te_discount, .js_product .te_percentage").hide()
            if (combination.has_discounted_price) {
                $(".js_product .te_discount, .js_product .te_discount_before").removeClass('d-none');
                var difference = combination.list_price - combination.price;
                var discount = Math.round(difference * 100 / combination.list_price);
                if (discount > 0) {
                    $(".js_product .te_discount_before .oe_currency_value").html(difference.toFixed(2));
                    $(".js_product .te_discount .te_percentage .discount_price").html(discount);
                    $(".js_product .te_discount, .js_product .te_percentage").show()
                }
            }
            setTimeout(function() {
                var addToCart = $('#product_details').find('#add_to_cart').attr('class');
                var buyNow = $('#product_details').find('.o_we_buy_now').attr('class');
                $('.prod_details_sticky_div #add_to_cart').attr('class', addToCart);
                $('.prod_details_sticky_div .o_we_buy_now').attr('class', buyNow);
            }, 200);

            /* For update price on ajax cart */
            var self = this;
            var $parent = $(".te_ajax_cart_content");
            if ($parent) {
                var $price = $parent.find(".oe_price:first .oe_currency_value");
                var $default_price = $parent.find(".oe_default_price:first .oe_currency_value");
                var $optional_price = $parent.find(".oe_optional:first .oe_currency_value");
                $price.text(self._priceToStr(combination.price));
                $default_price.text(self._priceToStr(combination.list_price));

                var isCombinationPossible = true;
                if (!_.isUndefined(combination.is_combination_possible)) {
                    isCombinationPossible = combination.is_combination_possible;
                }
                this._toggleDisable($parent, isCombinationPossible);

                if (combination.has_discounted_price) {
                    $default_price
                        .closest('.oe_website_sale')
                        .addClass("discount");
                    $optional_price
                        .closest('.oe_optional')
                        .removeClass('d-none')
                        .css('text-decoration', 'line-through');
                    $default_price.parent().removeClass('d-none');
                } else {
                    $default_price
                        .closest('.oe_website_sale')
                        .removeClass("discount");
                    $optional_price.closest('.oe_optional').addClass('d-none');
                    $default_price.parent().addClass('d-none');
                }
            }
        },
    });
    publicWidget.registry.timer_data = publicWidget.Widget.extend({
        selector: ".timer_data",
        events: {
            'change .current_date': 'initOfferTimer',
        },
        start: function() {
            this.redrow();
        },
        stop: function() {
            this.clean();
        },
        redrow: function(debug) {
            this.clean(debug);
            this.build(debug);
        },
        clean: function(debug) {
            this.$target.empty();
        },
        build: function(debug) {},
        initOfferTimer: function() {
            /* This method is called for initialize and update the offer timer in at product page*/
            var product_offer;
            clearInterval(timer);
            var count_start_date = parseInt($(".start_date").val());
            var count_end_date = parseInt($(".end_date").val());
            var current_date_time = parseInt($(".current_date").val());
            var current_date = current_date_time
            $("#timer_portion_content_ept").addClass("d-none");
            timer = setInterval(function() {

                if (count_start_date <= current_date && count_end_date >= current_date) {
                    var duration = count_end_date - current_date;
                    product_offer = true;
                } else {
                    product_offer = false;
                }
                if (duration > 0) {
                    var days = Math.floor(duration / (1000 * 60 * 60 * 24));
                    var hours = Math.floor((duration % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                    var minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
                    var seconds = Math.floor((duration % (1000 * 60)) / 1000);

                    if ((seconds + '').length == 1) {
                        seconds = "0" + seconds;
                    }
                    if ((days + '').length == 1) {
                        days = "0" + days;
                    }
                    if ((hours + '').length == 1) {
                        hours = "0" + hours;
                    }
                    if ((minutes + '').length == 1) {
                        minutes = "0" + minutes;
                    }
                }

                // If the count down is over, write some text
                if (duration <= 0) {
                    clearInterval(timer);
                    seconds = "00";
                    days = "00";
                    minutes = "00";
                    hours = "00";
                }
                if (product_offer == true && duration > 0) {
                    $("#days").text(days);
                    $("#hours").text(hours);
                    $("#minutes").text(minutes);
                    $("#seconds").text(seconds);
                    $(".te_offer_timer_prod").css("display", "block");
                    $("#timer_portion_content_ept").removeClass("d-none");
                }
                current_date = current_date + 1000
            }, 1000);
        }

    });

});
