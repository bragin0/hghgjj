    // Ссылка на элементы
    const inputField = document.getElementById('phone');
    const submitButton = document.getElementById('submitButton');

    // Слушатель на ввод текста
    inputField.addEventListener('input', () => {
      // Показываем кнопку, если длина текста равна 5
      if (inputField.value.length === 5) {
        submitButton.classList.add('active');
      } else {
        submitButton.classList.remove('active');
      }
    });