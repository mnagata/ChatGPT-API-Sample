import { Configuration, OpenAIApi, ChatCompletionRequestMessage, CreateChatCompletionResponse } from 'openai';
import { isNil, path, defaultTo } from 'ramda';

const defaultToArgs = defaultTo("");
const defaultToMessage = defaultTo(<ChatCompletionRequestMessage>{});

const model = 'gpt-3.5-turbo-0613';

// 外部API mock
const getCurrentWeather = (location: string, unit="fahrenheit"): string => {
    const weatherInfo = {
        "location": location,
        "temperature": "30",
        "unit": unit,
        "forecast": ["sunny", "windy"],
    }
    return JSON.stringify(weatherInfo);
}

const configuration = new Configuration({
    organization: process.env.OPENAI_ORGANIZATION,
    apiKey: process.env.OPENAI_API_KEY
});
const openai = new OpenAIApi(configuration);

const question = '東京都港区の天気を教えてください。';

(async () => {
    const response = await openai.createChatCompletion({
        model: model,
        messages: [
            {'role': 'user', 'content': question}
        ],
        functions: [
            {
                "name": "getCurrentWeather",
                "description": "指定した場所の現在の天気を取得する。",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "location": {
                            "type": "string",
                            "description": "都市名や地名、県名など",
                        },
                        "unit": {"type": "string", "enum": ["celsius", "fahrenheit"]},
                    },
                    "required": ["location"],
                },
            }        
        ],
        function_call: 'auto'
    });

    const message = defaultToMessage(response.data.choices[0].message);

    if (path(['function_call', 'name'], message)) {
        const args = defaultToArgs(message?.function_call?.arguments);
        const functionName = message?.function_call?.name;

        const functionResponse = getCurrentWeather(JSON.parse(args).location);

        const secoundResponse = await openai.createChatCompletion({
            model: model,
            messages: [
                {'role': 'user', 'content': question},
                message,
                {'role': 'function', 'name': functionName, 'content': functionResponse}
            ]
        });
        console.log(secoundResponse.data.choices[0].message?.content);
    } else {
        console.log(message?.content);
    }
})();
