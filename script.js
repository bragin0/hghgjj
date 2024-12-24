// Проверка доступности WebApp и активация полноэкранного режима сразу после загрузки
if (window.WebApp) {
    // Функция для автоматического перехода в полноэкранный режим
    function enterFullscreen() {
        window.WebApp.requestFullscreen().catch((error) => {
            console.error('Failed to enter fullscreen mode:', error);
        });
    }

    // Автоматически активируем полноэкранный режим при активации WebApp
    window.WebApp.onEvent('activated', () => {
        console.log('Web App Activated');
        enterFullscreen(); // Переводим приложение в полноэкранный режим сразу после активации
    });

    // Обработчик события для переключения полноэкранного режима
    window.WebApp.onEvent('fullscreenChanged', (event) => {
        console.log('Fullscreen mode changed:', event);
        if (event.isFullscreen) {
            document.getElementById("fullscreenButton").style.display = "inline-block";
        } else {
            document.getElementById("fullscreenButton").style.display = "none";
        }
    });

    // Выход из полноэкранного режима (кнопка)
    document.getElementById("fullscreenButton").addEventListener("click", () => {
        window.WebApp.exitFullscreen().catch((error) => {
            console.error('Failed to exit fullscreen mode:', error);
        });
    });

    // Проверка, когда WebApp будет готов к работе
    window.WebApp.onEvent('deactivated', () => {
        console.log('Web App Deactivated');
    });
}
