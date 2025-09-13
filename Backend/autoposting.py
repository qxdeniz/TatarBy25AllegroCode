import telebot
import schedule
import time
import threading
import requests
import datetime
import sys


def usage_and_exit():
    print("Использование:")
    print('  python autoposting.py <TG_BOT_TOKEN> <CHANNEL_ID> "PROMPT_MORNING" "PROMPT_MIDDAY" "PROMPT_EVENING"')
    print("Пример:")
    print('  python autoposting.py 123:ABC -1001234567890 "Утренний промпт" "Дневной промпт" "Вечерний промпт"')
    sys.exit(1)

if len(sys.argv) < 6:
    usage_and_exit()

TG_BOT_TOKEN = sys.argv[1]
CHANNEL_ID_RAW = sys.argv[2]
PROMPT_MORNING = sys.argv[3]
PROMPT_MIDDAY = sys.argv[4]
PROMPT_EVENING = sys.argv[5]

# Приводим channel id к int, если возможно (telebot принимает int)
try:
    CHANNEL_ID = int(CHANNEL_ID_RAW)
except ValueError:
    CHANNEL_ID = CHANNEL_ID_RAW  # оставить как строку, если не число

bot = telebot.TeleBot(TG_BOT_TOKEN)


def send_message(prompt_text, channel_id):
    API_KEY = "AIzaSyDtZAT116i-LPhhtJ5Zm2gXbZsnOyNjRu8"
    URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"

    headers = {
        "x-goog-api-key": API_KEY,
        "Content-Type": "application/json"
    }

    payload = {
        "contents": [
            {
                "parts": [
                    {
                        "text": prompt_text
                    }
                ]
            }
        ]
    }

    try:
        response = requests.post(URL, headers=headers, json=payload, timeout=30)
    except Exception as e:
        print("Ошибка запроса к генеративному API:", e)
        return

    if response.status_code == 200:
        data = response.json()
        # безопасно пытаться достать текст из ответа
        try:
            answer = data['candidates'][0]['content']['parts'][0]['text']
        except Exception as e:
            print("Не удалось распарсить ответ генератора:", e)
            print("Полный ответ:", data)
            return
        try:
            bot.send_message(chat_id=channel_id, text=answer)
            print(f"Отправлено в {channel_id} в {datetime.datetime.now()}")
        except Exception as e:
            print("Ошибка отправки в Telegram:", e)
    else:
        print(f"❌ Ошибка от генератора ({response.status_code}): {response.text}")


def schedule_messages(channel_id, prompt_morning, prompt_midday, prompt_evening):
    # Планируем три отправки: 06:00, 12:00, 21:00
    schedule.clear()
    schedule.every().day.at("06:00").do(send_message, prompt_text=prompt_morning, channel_id=channel_id)
    schedule.every().day.at("12:00").do(send_message, prompt_text=prompt_midday, channel_id=channel_id)
    schedule.every().day.at("21:00").do(send_message, prompt_text=prompt_evening, channel_id=channel_id)

    print("Автопостинг запущен с расписанием 06:00, 12:00, 21:00")
    print("Канал:", channel_id)
    while True:
        try:
            schedule.run_pending()
            time.sleep(1)
        except KeyboardInterrupt:
            print("Остановка по Ctrl+C")
            break
        except Exception as e:
            print("Ошибка в цикле расписания:", e)
            time.sleep(5)


if __name__ == "__main__":
    # Запускаем планировщик в основном потоке (можно вынести в поток, если нужно)
    schedule_messages(CHANNEL_ID, PROMPT_MORNING, PROMPT_MIDDAY, PROMPT_EVENING)