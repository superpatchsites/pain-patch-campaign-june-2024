$(document).ready(function () {
    $('.reviews').owlCarousel({
        loop: true,
        margin: 10,
        nav: true,
        responsive: {
            0: {
                items: 1
            },
            600: {
                items: 2
            },
            1000: {
                items: 3
            }
        }
    });

    const plusButton = document.querySelector('.plus-btn');
    const minusButton = document.querySelector('.minus-btn');
    const inputField = document.querySelector('.quantity');

    plusButton.addEventListener('click', function () {
      inputField.value = parseInt(inputField.value) + 1;
    });

    minusButton.addEventListener('click', function () {
      let currentValue = parseInt(inputField.value);
      if (currentValue > 1) {
        inputField.value = currentValue - 1;
      }
    });
});
