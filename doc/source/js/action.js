const LanguageTranslatorV3 = require('ibm-watson/language-translator/v3');
const lt = new LanguageTranslatorV3({
    // TODO: Inserir a API Key do serviço do Language Translator
    iam_apikey: '',
    version: '2018-05-01',
    url: 'https://gateway.watsonplatform.net/language-translator/api'
});

const NaturalLanguageUnderstandingV1 = require('ibm-watson/natural-language-understanding/v1');
const nlu = new NaturalLanguageUnderstandingV1({
    // TODO: Inserir a API Key do serviço do Natural Language Translator (ou NLU)
    iam_apikey: '',
    version: '2019-07-12',
    url: 'https://gateway.watsonplatform.net/natural-language-understanding/api'
});

const request = require('request-promise');
const btoa = require('btoa');

function main(params) {
    if (params.type === 'ML') {
        return predictInvestmentProfile(params.salario, params.gastoMensal, params.filhos, params.escolaridade);
    } else if (params.type === 'Emotions') {
        return analyzeEmotions(params.text);
    } else {
        console.error('error: try to send which type of service you are requesting for.');
        return { err: true, response: 'Resource not found' };
    }
}

function analyzeEmotions(text) {
    return lt.translate({
        text: text,
        model_id: 'pt-en'
    })
        .then(result => {
            const analyzeParams = {
                html: result.translations[0].translation,
                features: {
                    emotion: {},
                },
                language: 'en-US'
            };
            // TODO: Desenvolver a chamada de API (seja por SDK ou HTTP Request) para o Natural Language Understanding
            // usando a constante analizeParams

        })
        .catch(err => {
            console.error(`error: ${err.message}`);
            return err;
        });
}

function predictInvestmentProfile(salario, gasto_mensal, filhos, escolaridade) {
    // TODO: Inserir a API Key do serviço do Watson Machine Learning
    const apikey = '';
    const IBM_Cloud_IAM_uid = 'bx';
    const getToken = () => {
        const options = {
            url: 'https://iam.bluemix.net/oidc/token',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Authorization: 'Basic ' + btoa(IBM_Cloud_IAM_uid + ':' + IBM_Cloud_IAM_uid),
            },
            body: 'apikey=' + apikey + '&grant_type=urn:ibm:params:oauth:grant-type:apikey',
            json: true
        };
        return new Promise((resolve, reject) => {
            request.post(options, (error, resp, body) => {
                return error ? reject(error) : resolve(body.access_token);
            });
        });
    };

    return getToken().then(token => {
        const options = {
            method: 'POST',
            // TODO: Inserir a URL gerada pelo treinamento do modelo preditivo no Modeler Flow
            // (dentro do Watson Studio)
            url: '',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: {
                fields: ['salario', 'gasto_mensal', 'filhos', 'escolaridade'],
                values: [[Number(salario), Number(gasto_mensal), Number(filhos), escolaridade]]
            },
            json: true
        };
        return request(options)
            .then(body => {
                return body.errors ? {
                    err: true,
                    produto: body.errors[0].message
                } : {
                        err: false,
                        produto: body.values[0][0]
                    };
            })
            .catch(err => {
                console.error(`error: ${err.message}`);
                return err;
            })
    })
        .catch(err => {
            console.error(`error: ${err.message}`);
            return err;
        });

}

exports.main = main;
