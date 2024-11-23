    // Функция для смены гифки и текста через 10 секунд
    setTimeout(() => {
      const gifImage = document.getElementById('gifImage');
      const statusText = document.getElementById('statusText');
      
      gifImage.src = 'https://s13.gifyu.com/images/SGvH9.gif'; // Меняем гифку
      statusText.textContent = 'Ошибка в доступе'; // Меняем текст
    }, 10000); // 10 секунд (10000 миллисекунд)