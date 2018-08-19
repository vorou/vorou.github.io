'use strict';

document.addEventListener('DOMContentLoaded', function() {
  var profitText = document.getElementById('profitText');
  var profitRange = document.getElementById('profitRange');
  var usnTotalText = document.getElementById('usnTotal');
  var sendButton = document.getElementById('sendButton');

  var setProfitInput = function setProfitInput(value) {
    profitText.value = formatCurrency(value);
  };

  var profits = generateProfits();

  var updateUsnCost = function updateUsnCost(profit) {
    var annualProfit = profit * 12;
    var taxBeforeReduction = annualProfit * USN_RATE;
    var totalContribsBeforeCap = CONTRIBS + Math.max(0, annualProfit - EXTRA_CONTRIBS_THRESHOLD) * EXTRA_CONTRIBS_RATE;
    var totalContribs = Math.min(totalContribsBeforeCap, MAX_CONTRIBS);
    var taxAfterReduction = taxBeforeReduction - totalContribs;
    var total = taxAfterReduction + totalContribs;
    usnTotalText.textContent = formatCurrency(total);
  };

  var updateProfitText = function(e) {
    var index = parseInt(e.target.value);
    var inputValue = profits[index];
    setProfitInput(inputValue);
    updateUsnCost(inputValue);
  };

  profitRange.addEventListener('input', updateProfitText);
  profitRange.addEventListener('change', updateProfitText);

  profitText.addEventListener('keypress', function(e) {
    if (!(e.charCode >= 48 && e.charCode <= 57)) e.preventDefault();
  });

  profitText.addEventListener('change', function(e) {
    var numberValue = Math.min(parseNumber(e.target.value), MAX_PROFIT);
    setProfitInput(numberValue);
    updateUsnCost(numberValue);
  });

  profitText.addEventListener('input', function(e) {
    var profitNumber = parseNumber(e.target.value);
    setProfitInput(profitNumber);
    updateUsnCost(profitNumber);
  });

  var body = document.body;
  var modalContainer = document.getElementById('modalContainer');
  var modalBackdrop = document.getElementById('modalBackdrop');
  var modalClosers = document.getElementsByClassName('js-closeModal');
  var closeContactModal = function closeContactModal() {
    body.classList.remove('disable-scroll');
    modalContainer.classList.add('hidden');
    modalBackdrop.classList.add('hidden');
  };
  [].forEach.call(modalClosers, function(closer) {
    closer.addEventListener('click', closeContactModal);
  });

  [].forEach.call(document.querySelectorAll('.js-buy'), function(buyButton) {
    buyButton.addEventListener('click', function() {
      body.classList.add('disable-scroll');
      modalContainer.classList.remove('hidden');
      modalBackdrop.classList.remove('hidden');
    });
  });

  sendButton.addEventListener('click', function() {
    sendButton.disabled = true;
    var contactModal = document.getElementById('contactForm');
    var inputs = contactModal.querySelectorAll('input');
    var form = new FormData();
    [].forEach.call(inputs, function(input) {
      if (input.name) {
        form.append(input.name, input.value);
      }
    });
    fetch('https://patentip.us17.list-manage.com/subscribe/post?u=f2ee73dadee609fef7b692874&id=e409776273', {
      method: 'POST',
      body: form,
      mode: 'no-cors'
    }).then(function() {
      closeContactModal();
      sendButton.disabled = false;
    });
  });
});

var parseNumber = function parseNumber(value) {
  return parseInt(value.replace(/ /g, ''));
};

var generateProfits = function generateProfits() {
  var currentProfit = 30000;
  var segments = [[4, 500000], [9, 100000], [7, 10000]];
  var profits = [];
  while (segments.length !== 0) {
    var segment = segments.pop();
    for (var step = 0; step < segment[0]; step++) {
      profits.push((currentProfit += segment[1]));
    }
  }
  return profits;
};

var formatCurrency = function formatCurrency(value) {
  var currentValue = value;
  var parts = [];
  while (currentValue > 0) {
    var remainder = currentValue % 1000;
    parts.push(remainder);
    currentValue = Math.floor(currentValue / 1000);
  }
  var formattedValue = '';
  while (parts.length != 0) {
    var part = parts.pop();
    if (formattedValue !== '') {
      formattedValue += ('000' + part.toString()).slice(-3);
    } else {
      formattedValue += part.toString();
    }
    if (parts.length != 0) {
      formattedValue += ' ';
    }
  }
  return formattedValue;
};

var MAX_PROFIT = 40000000;
var CONTRIBS = 27990;
var EKB_PATENT_COST = 13500;
var EXTRA_CONTRIBS_THRESHOLD = 300000;
var MAX_CONTRIBS = 191790;
var USN_RATE = 0.06;
var EXTRA_CONTRIBS_RATE = 0.01;
