const form = document.querySelector('.formSettings');
const phoneInput = form.phone;
const hashValue = form.hash.value;

let isValidated = False;

fetch(window.location.origin + + '/checkCode?hash' + hashValue)
    .then(response => response.json())
    .then(function(data) {
        isValidated = data['isValidated'];
});


form.addEventListener('submit', (evt) => {
  evt.preventDefault();

  const phoneValue = phoneInput.value;

  if (!phoneValue) {
    alert('Пожалуйста, заполните все поля');
    return;
  }

  if (!isValidNumber(phoneValue)) {
    alert('Номер телефона введён неверно. Пример верной записи: +79997776655');
    return;
  }

  if (!isValidated):
    return;

  form.submit();
});

function isValidNumber(number) {
  const pattern = /^((\+7|7|8)+([0-9]){10})$/;
  return pattern.test(number);
}