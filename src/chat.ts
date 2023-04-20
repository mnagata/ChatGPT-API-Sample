import { Configuration, OpenAIApi, ChatCompletionRequestMessage, CreateChatCompletionResponse } from 'openai';
import readline from 'readline';
import { isNil } from 'ramda';

// 初期値に役割を与える
const chatMessage: Array<ChatCompletionRequestMessage> = [
    //{ role: 'system', content: 'あなたは女子高校生です。可愛い口調で答えてください'}
    { role: 'system', content: 'あなたはツンデレの女の子役で答えてください'}
];

// プロンプト入力
const inputUserContext = async (question: string): Promise<string> => {
    const readLineInterface = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    return new Promise((resolve) => {
        readLineInterface.question(question, (context) => {
            resolve(context);
            readLineInterface.close();
        });
    });
}

// ChatGPT API
const chatGptAask = async (): Promise<CreateChatCompletionResponse> => {
    const response = await openai.createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages: chatMessage
    });

    return response.data;
}

const configuration = new Configuration({
    organization: process.env.OPENAI_ORGANIZATION,
    apiKey: process.env.OPENAI_API_KEY
});

const openai = new OpenAIApi(configuration);

(async () => {
    while(true) {
        console.log('');
        const userContext = await inputUserContext('user> ');
        chatMessage.push({ role: 'user', content: userContext});
    
        const responseData = await chatGptAask();
        const assistantContext = responseData.choices[0].message?.content;

        console.log('assistant>');
        console.log(assistantContext);
        chatMessage.push({ role: 'assistant', content: isNil(assistantContext) ? "" : assistantContext})
    }
})();
