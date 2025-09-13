import requests
from google import genai
import re
import os

folder_id = "b1gu835v82q677s36ekg"
target_language = "tt"
source_language = "ru"

def translate_text(api_key, folder_id, text, source_language="ru", target_language="tt"):
    url = "https://translate.api.cloud.yandex.net/translate/v2/translate"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Api-Key {api_key}",
    }
    body = {
        "sourceLanguageCode": source_language,
        "targetLanguageCode": target_language,
        "texts": [text],
        "folderId": folder_id,
    }
    response = requests.post(url, json=body, headers=headers)
    if response.ok:
        result = response.json()
        return result["translations"][0]["text"]
    else:
        return f"Ошибка: {response.status_code}\n{response.text}"


def generate_content(text_input):
     URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"

     headers = {
        "x-goog-api-key": "AIzaSyAx-9gxZXrQWP4rImAYAxNehvwiC1pXHnA",
        "Content-Type": "application/json"
    }

     payload = {
        "contents": [
            {
                "parts": [
                    {
                        "text": text_input
                    }
                ]
            }
        ]
     }

     response = requests.post(URL, headers=headers, json=payload, timeout=30)
     if response.status_code == 200:
        data = response.json()
        answer = data['candidates'][0]['content']['parts'][0]['text']
        return answer
     else:
         print(response.json())


def ask_yandex_gpt(prompt):
    url = "https://llm.api.cloud.yandex.net/foundationModels/v1/completion"

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Api-Key AQVN1439cSbZ3zvfEBeKusU4CPtgTVpvxMa5BOQb"
    }

    messages = [
        {"role": "system", "text": "Ты умный помощник"},
        {"role": "user", "text": prompt}
    ]

    data = {
        "modelUri": f"gpt://b1gu835v82q677s36ekg/yandexgpt-lite",  
        "completionOptions": {
            "stream": False,
            "temperature": 0.6,
            "maxTokens": 500
        },
        "messages": messages
    }

    response = requests.post(url, headers=headers, json=data)
    response.raise_for_status()
    response_json = response.json()

    return response_json["result"]["alternatives"][0]["message"]["text"]



def find_mistakes(text):
    payload = {
        "spell": f'''<p class="p1" style="font-variant-numeric: normal; font-variant-east-asian: normal; font-variant-alternates: normal; font-size-adjust: none; font-kerning: auto; font-optical-sizing: auto; font-feature-settings: normal; font-variation-settings: normal; font-variant-position: normal; font-variant-emoji: normal; font-stretch: normal; line-height: normal; margin: 0px;">
        <font face="Helvetica Neue"><span style="font-size: 13px;">{text}</span></font></p>''',
        "lang": "tt"
    }
    headers = {"Content-Type": "application/x-www-form-urlencoded"}
    response = requests.post(
        "https://grammar.corpus.tatar/search/spellcheck.php",
        data=payload,
        headers=headers
    )
    html = response.json()['text']
    pattern = r"<span class='spelltip'[^>]*>(.*?)</span>"

    words = []
    spans = []

    for match in re.finditer(pattern, html):
        word = re.sub(r"<.*?>", "", match.group(1))  
        words.append(word)
        spans.append((match.start(1), match.end(1)))

    return words, list(zip(words, spans))


class TextGenerator:
     def __init__(self, text, model):
        self.text = text
        self.model = model

     def create_tatar_text(self):
        if self.model == 'yandex':
           #text = translate_text("AQVN1439cSbZ3zvfEBeKusU4CPtgTVpvxMa5BOQb", folder_id, self.text, source_language="tt", target_language="ru")

           text = ask_yandex_gpt(self.text)
         #  print("Ответ модели:", text)
           text = translate_text("AQVN1439cSbZ3zvfEBeKusU4CPtgTVpvxMa5BOQb", folder_id, text, source_language="ru", target_language="tt")
         #  print(f"Перевод: {text}")
        else:
            text = translate_text("AQVN1439cSbZ3zvfEBeKusU4CPtgTVpvxMa5BOQb", folder_id, self.text, source_language="tt", target_language="ru")
            text = generate_content(self.text)
            text = translate_text("AQVN1439cSbZ3zvfEBeKusU4CPtgTVpvxMa5BOQb", folder_id, text, source_language="ru", target_language="tt")
        return {"text": text} 
        


class Corrector:
        def __init__(self, text, model):
          self.text = text
          self.model = model
            
        def corrector(self):
          tt2ru = translate_text("AQVN1439cSbZ3zvfEBeKusU4CPtgTVpvxMa5BOQb", folder_id, self.text, source_language="tt", target_language="ru")
          if self.model == 'yandex':
              model_answer = ask_yandex_gpt(tt2ru)
          else:  
            model_answer = generate_content(tt2ru)
        
          ru2tt = translate_text("AQVN1439cSbZ3zvfEBeKusU4CPtgTVpvxMa5BOQb", folder_id, model_answer, source_language="ru", target_language="tt")
          print(ru2tt)
          mistakes, inds = find_mistakes(ru2tt)
          if mistakes:
             ru2tt = generate_content(f"Исправь неправильно написанные слова на татарском в этом тексте на татарском: {ru2tt}. Слова с ошибками: {', '.join(mistakes)}")

          return {"text": ru2tt}

               
            

    