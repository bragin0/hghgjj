let menuVisible = false;

function toggleMenu() {
  const menu = document.getElementById('country-menu');
  menu.style.display = menuVisible ? 'none' : 'block';
  menuVisible = !menuVisible;
}

function selectCountry(event) {
  const countryCode = event.target.dataset.code;
  const selectedCountryText = event.target.textContent;
  document.getElementById('selected-country').textContent = selectedCountryText;
  document.getElementById('phone').value = countryCode + ' ';
  toggleMenu(); // Закрыть меню после выбора
}

// Добавляем обработчики событий для каждого элемента меню
const menuItems = document.querySelectorAll('.menu-item');
menuItems.forEach(item => {
  item.addEventListener('click', selectCountry);
});

// Устанавливаем код страны по умолчанию
window.onload = function() {
  updatePhoneCode();
};

function updatePhoneCode() {
  const countrySelect = document.getElementById('selected-country');
  const countryCode = '+7'; // Значение для России
  const phoneInput = document.getElementById('phone');
  phoneInput.value = countryCode + ' '; // Обновляем поле телефона с кодом страны
}

function goToCodeStep() {
  const phone = document.getElementById('phone').value;
  if (!phone || phone.length < 10) {
    alert('Введите корректный номер телефона!');
    return;
  }
  alert('Дальше...');
}
