import { Configuration, OpenAIApi, ListModelsResponse } from 'openai';
import { AxiosResponse } from 'axios';

const configuration = new Configuration({
    organization: "org-6tZwB9tHgRGZgIf5tdcY01a1",
    apiKey: process.env.OPENAI_API_KEY
});

const openai = new OpenAIApi(configuration);

(async () => {
    const response = await openai.listModels();

    response.data.data.forEach((d) => {
        console.log(d.id);
    });
})();
