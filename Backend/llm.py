from yandex_cloud_ml_sdk import YCloudML
import requests
import os



sdk = YCloudML(
    folder_id=os.getenv('YANDEX_FOLDER_ID'),
    auth=os.getenv('YANDEX_API_KEY'),
)

class GPT:
    def __init__(self, message, data, model):
        self.message = message
        self.data = data
        self.model = model
        self.GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
        self.GEMINI_URL = f"https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key={self.GEMINI_API_KEY}"

    def is_composer_query(self, text):
        # List of Russian classical composers
        composers = [
            'Чайковский', 'Рахманинов', 'Мусоргский', 'Римский-Корсаков',
            'Бородин', 'Глинка', 'Скрябин', 'Прокофьев', 'Шостакович',
            'Стравинский', 'Балакирев', 'Лядов', 'Танеев', 'Глазунов'
        ]
        
        # Check if any composer name is mentioned in the text
        return any(composer.lower() in text.lower() for composer in composers)

    def save_to_file(self, content):
        try:
            with open('info.txt', 'w', encoding='utf-8') as f:
                f.write(content)
            return True
        except Exception as e:
            print(f"Error saving to file: {e}")
            return False

    def generate(self):
        if self.is_composer_query(self.message):
            prompt = f"""Ты музыкальный помощник в образовании. Твой функционал: ответы о русских композиторах, консультирование и оценка по музыкальным произведением, подготовка докладов по музыкальной литературе.
            Тебе нужно подготовить ответ на вопрос: {self.message}
            Ответ по композитору должен быть структурирован по следующим пунктам:
            1. Краткая биография
            2. Основные произведения
            3. Стиль и влияние
            4. Интересные факты
            Используй маркированный список для каждого пункта.
            Прочие ответы должны быть подробными и ярко отражать суть вопроса. Если вопрос о музыке, никогда не уходи от ответа, дай на него хотя бы краткую информацию в любом случае! Ты в первую очередь музыкальный помощник, поэтому говори только о музыке"""
        else:
            prompt = f"{self.message}\n\nЕсли вопрос не касается русских классических композиторов, вежливо предложи перейти к обсуждению русских классических композиторов, а на сам вопрос не отвечай. Ответ должен быть кратким и вежливым."

        if self.model == 'gemini':
            headers = {"Content-Type": "application/json"}
            body = {
                "contents": [
                    {
                        "parts": [
                            {"text": prompt}
                        ]
                    }
                ]
            }
            
            response = requests.post(self.GEMINI_URL, headers=headers, json=body)
            
            if response.ok:
                result = response.json()
                answer = result["candidates"][0]["content"]["parts"][0]["text"]
                if self.is_composer_query(self.message):
                    self.save_to_file(answer)
                    return "Информация о композиторе сохранена"
                return answer
            else:
                return f"Error: {response.status_code} - {response.text}"
        
        elif self.model == 'yandex':
            model = sdk.models.completions("yandexgpt")
            model = model.configure(temperature=0.8)
            result = model.run(prompt)
            answer = result.alternatives[0].text
            
            if self.is_composer_query(self.message):
                self.save_to_file(answer)
                return "Информация о композиторе сохранена"
            return answer





