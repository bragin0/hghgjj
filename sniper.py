import requests
from aiogram import Bot, Dispatcher, types
from aiogram.types import ReplyKeyboardMarkup, KeyboardButton
from aiogram.contrib.fsm_storage.memory import MemoryStorage
from aiogram.dispatcher import FSMContext
from aiogram.dispatcher.filters.state import State, StatesGroup
from aiogram.utils import executor
import asyncio

# Инициализация бота
API_KEY = '7985083424:AAGhStJNtT6ahJ7MF-Jsvoa-stlm3APje-o'  # Вставьте ваш API ключ
bot = Bot(token=API_KEY)
storage = MemoryStorage()
dp = Dispatcher(bot, storage=storage)

# Начальные параметры
user_balances = {}  # Словарь для хранения балансов пользователей
previous_balance_in_usd = 0
user_chat_ids = set()
increase_threshold = 1
decrease_threshold = -5
sharp_drop_threshold = -10  # Порог резкого падения

# ID администратора (замените на ваш chat_id)
ADMIN_ID = 511301057  # Вставьте ваш chat_id администратора

# Добавляем новое состояние
class Form(StatesGroup):
    set_tokens = State()
    set_increase_threshold = State()
    set_decrease_threshold = State()
    set_sharp_drop_threshold = State()  # Новое состояние

def update_keyboard(chat_id):
    keyboard = ReplyKeyboardMarkup(resize_keyboard=True)
    
    # Получаем баланс и проверяем его тип
    balance = user_balances.get(chat_id, 0)
    
    # Если баланс - целое число, форматируем его как целое
    formatted_balance = f"{balance}" if isinstance(balance, int) else f"{balance:.0f}"
    
    keyboard.add(KeyboardButton(f"🪙 Указать токены ({formatted_balance} FPI)"))
    keyboard.add(KeyboardButton(f"📈 Порог увеличения: {increase_threshold} USD"))
    keyboard.add(KeyboardButton(f"📉 Порог уменьшения: {abs(decrease_threshold)} USD"))
    keyboard.add(KeyboardButton(f"🚨 Порог резкого падения: {abs(sharp_drop_threshold)} USD"))
    
    return keyboard

@dp.message_handler(commands=['start'])
async def send_welcome(message: types.Message):
    user_chat_ids.add(message.chat.id)  # Добавление ID чата в список пользователей
    welcome_text = (f"Бот уведомлят Вас о увеличении или падении вашего баланса\n\n"
                    f"🪙 *Ваш баланс (токены)*: `{user_balances.get(message.chat.id, 0):.0f}` *FPI*\n\n"
                    f"📈 *Порог увеличения*: `{increase_threshold:.0f}` *USD*\n\n"
                    f"📉 *Порог уменьшения*: `{abs(decrease_threshold):.0f}` *USD*\n\n"
                    f"🚨 *Порог резкого падения*: `{abs(sharp_drop_threshold):.0f}` *USD*\n\n"
                    f"♻️ Обновление курса происходит каждые *10* сек для точности курса\n\n_баланс может отличаться от BLUM, курс берется с dexscreener_")
                    
    await message.answer(welcome_text, parse_mode='Markdown', reply_markup=update_keyboard(message.chat.id))


@dp.message_handler(lambda message: message.text.startswith("🪙 Указать токены") or 
                                    message.text.startswith("📈 Порог увеличения") or 
                                    message.text.startswith("📉 Порог уменьшения") or 
                                    message.text.startswith("🚨 Порог резкого падения"))
async def process_buttons(message: types.Message):
    if message.text.startswith("🪙 Указать токены"):
        await message.answer("Введите количество токенов:")
        await Form.set_tokens.set()
    elif message.text.startswith("📈 Порог увеличения"):
        await message.answer("Введите порог увеличения баланса в USD:")
        await Form.set_increase_threshold.set()
    elif message.text.startswith("📉 Порог уменьшения"):
        await message.answer("Введите порог уменьшения баланса в USD:")
        await Form.set_decrease_threshold.set()
    elif message.text.startswith("🚨 Порог резкого падения"):
        await message.answer("Введите порог резкого падения баланса в USD:")
        await Form.set_sharp_drop_threshold.set()

@dp.message_handler(text="🪙 Указать токены")
async def process_set_tokens_button(message: types.Message):
    await message.answer("Введите количество токенов:")
    await Form.set_tokens.set()

@dp.message_handler(text="📈 Порог увеличения")
async def process_set_increase_threshold_button(message: types.Message):
    await message.answer("Введите порог увеличения баланса в USD:")
    await Form.set_increase_threshold.set()

@dp.message_handler(text="📉 Порог уменьшения")
async def process_set_decrease_threshold_button(message: types.Message):
    await message.answer("Введите порог уменьшения баланса в USD:")
    await Form.set_decrease_threshold.set()

@dp.message_handler(text="🚨 Порог резкого падения")
async def process_set_sharp_drop_threshold_button(message: types.Message):
    await message.answer("Введите порог резкого падения баланса в USD:")
    await Form.set_sharp_drop_threshold.set()

# Обработчики ввода данных
@dp.message_handler(state=Form.set_tokens)
async def process_set_tokens(message: types.Message, state: FSMContext):
    global user_balances
    try:
        user_balance = float(message.text)
        user_balances[message.chat.id] = user_balance  # Обновляем баланс пользователя
        # Форматируем баланс, чтобы убрать .0, если число целое
        formatted_balance = f"{user_balance:.0f}" if user_balance.is_integer() else str(user_balance)
        await message.answer(f"Баланс обновлен: `{formatted_balance}` FPI", parse_mode='Markdown', reply_markup=update_keyboard(message.chat.id))
    except ValueError:
        await message.answer("Пожалуйста, введите корректное число.")
    await state.finish()


@dp.message_handler(state=Form.set_increase_threshold)
async def process_set_increase_threshold(message: types.Message, state: FSMContext):
    global increase_threshold
    try:
        increase_threshold = float(message.text)
        await message.answer(f"Порог увеличения обновлен: `{increase_threshold}` USD", parse_mode='Markdown', reply_markup=update_keyboard(message.chat.id))
    except ValueError:
        await message.answer("Пожалуйста, введите корректное число.")
    await state.finish()

@dp.message_handler(state=Form.set_decrease_threshold)
async def process_set_decrease_threshold(message: types.Message, state: FSMContext):
    global decrease_threshold
    try:
        decrease_threshold = -abs(float(message.text))
        await message.answer(f"Порог уменьшения обновлен: `{abs(decrease_threshold)}` USD", parse_mode='Markdown', reply_markup=update_keyboard(message.chat.id))
    except ValueError:
        await message.answer("Пожалуйста, введите корректное число.")
    await state.finish()

# Обработчик установки порога резкого падения
@dp.message_handler(state=Form.set_sharp_drop_threshold)
async def process_set_sharp_drop_threshold(message: types.Message, state: FSMContext):
    global sharp_drop_threshold
    try:
        sharp_drop_threshold = -abs(float(message.text))  # Значение всегда отрицательное
        await message.answer(f"Порог резкого падения обновлен: `{abs(sharp_drop_threshold)}` USD", parse_mode='Markdown', reply_markup=update_keyboard(message.chat.id))
    except ValueError:
        await message.answer("Пожалуйста, введите корректное число.")
    await state.finish()

# Получение текущей цены токена
async def get_token_price():
    url = "https://api.dexscreener.com/latest/dex/pairs/ton/eqayrrajgsuyhrggo1himnbgv9tvlndz3uoclaoytw_fgegd"
    try:
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()
        price = float(data['pair']['priceUsd'])
        print(f"Текущая цена: {price}")
        return price
    except Exception as e:
        print(f"Ошибка при получении цены: {e}")
        return None

# Отправка сообщений в Telegram
async def send_telegram_message(chat_id, message):
    try:
        await bot.send_message(chat_id, message)
        print(f"Сообщение отправлено: {message}")
    except Exception as e:
        print(f"Ошибка при отправке сообщения: {e}")

# Функция отслеживания цены
async def track_price():
    global previous_balance_in_usd, user_balances, increase_threshold, decrease_threshold, sharp_drop_threshold, current_price
    while True:
        try:
            current_price = await get_token_price()
            if current_price is None:
                continue

            for chat_id, user_balance in user_balances.items():
                current_balance_in_usd = user_balance * current_price
                message = f"Текущий баланс в USD: {current_balance_in_usd:.2f}"

                if previous_balance_in_usd != 0:
                    change = current_balance_in_usd - previous_balance_in_usd
                    if change >= increase_threshold:
                        notification_message = (f"🟢 Ваш баланс увеличился на {change:.2f} USD!\n\n"
                                                f"💰 Текущий баланс: {current_balance_in_usd:.2f} USD")
                        await send_telegram_message(chat_id, notification_message)

                    elif change <= decrease_threshold:
                        notification_message = (f"🔴 Ваш баланс уменьшился на {abs(change):.2f} USD!\n\n"
                                                f"💰Текущий баланс: {current_balance_in_usd:.2f} USD")
                        await send_telegram_message(chat_id, notification_message)

                    if change <= sharp_drop_threshold:
                        notification_message = (f"🚨 ВНИМАНИЕ! РЕЗКОЕ ПАДЕНИЕ 🚨\n\n"
                                                f"🆘 Резко упал на {abs(change):.2f} USD!\n\n"
                                                f"💰Текущий баланс: {current_balance_in_usd:.2f} USD")
                        await send_telegram_message(chat_id, notification_message)

                previous_balance_in_usd = current_balance_in_usd
                print(message)

        except Exception as e:
            print(f"Ошибка: {e}")
        await asyncio.sleep(10)

# Обработчик команды /list
@dp.message_handler(commands=['list'])
async def list_users(message: types.Message):
    if message.chat.id == ADMIN_ID:  # Проверяем, является ли пользователь администратором
        if user_balances:
            response = "Список пользователей и их балансов:\n"
            for chat_id, balance in user_balances.items():
                response += f"Пользователь {chat_id}: {balance} FPI\n"
            await message.answer(response)
        else:
            await message.answer("Нет зарегистрированных пользователей.")

if __name__ == "__main__":
    loop = asyncio.get_event_loop()
    loop.create_task(track_price())
    executor.start_polling(dp)