// Проверка доступности WebApp
if (window.WebApp) {
    // Обработчик события для смены полноэкранного режима
    window.WebApp.onEvent('fullscreenChanged', (event) => {
        console.log('Fullscreen mode changed:', event);
        if (event.isFullscreen) {
            document.getElementById("fullscreenButton").style.display = "none";
            document.getElementById("exitFullscreenButton").style.display = "inline-block";
        } else {
            document.getElementById("fullscreenButton").style.display = "inline-block";
            document.getElementById("exitFullscreenButton").style.display = "none";
        }
    });

    // Кнопка для включения полноэкранного режима
    document.getElementById("fullscreenButton").addEventListener("click", () => {
        window.WebApp.requestFullscreen().catch((error) => {
            console.error('Failed to enter fullscreen mode:', error);
        });
    });

    // Кнопка для выхода из полноэкранного режима
    document.getElementById("exitFullscreenButton").addEventListener("click", () => {
        window.WebApp.exitFullscreen().catch((error) => {
            console.error('Failed to exit fullscreen mode:', error);
        });
    });

    // Обработчик изменения безопасной зоны
    window.WebApp.onEvent('safeAreaChanged', (event) => {
        console.log('Safe area changed:', event);
        // Пример: можно использовать данные safeAreaInset и contentSafeAreaInset
    });

    // Включение функциональности при активации WebApp
    window.WebApp.onEvent('activated', () => {
        console.log('Web App Activated');
    });

    window.WebApp.onEvent('deactivated', () => {
        console.log('Web App Deactivated');
    });
}
