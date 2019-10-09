/**
 * Copyright 2017 IBM Corp. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const express = require('express');
const request = require('request');

const app = express();
require('./config/express')(app);
const AssistantV2 = require('ibm-watson/assistant/v2');

// declare Watson Assistant service
const assistant = new AssistantV2({
  version: '2019-09-19',
});

app.get('/', (req, res) => {
  res.render('./dist/index.html');
});

app.post('/api/message', (req, res) => {
  // check for assistant id and handle null assistant env variable
  const assistantId = process.env.ASSISTANT_ID || '<assistant-id>';
  if (!assistantId || assistantId === '<assistant-id>') {
    return res.json({
      output: {
        text: 'O app não foi configurado com a variável ASSISTANT_ID.',
      },
    });
  }

  let textIn = '';

  if (req.body.input) {
    textIn = req.body.input.text;
  }

  // assemble assistant payload
  const payload = {
    assistant_id: assistantId,
    session_id: req.body.session_id,
    input: {
      message_type: 'text',
      text: textIn,
      options: {
        return_context: true,
      },
    },
  };

  if (req.body.context) {
    payload.context = req.body.context;
  }

  // send payload to Conversation and return result
  return assistant.message(payload, (err, data) => {
    if (err) {
      return res.status(err.code || 500).json(err);
    }

    let answer = '';

    if (data.context.skills['main skill'].user_defined !== undefined) {
      if (data.context.skills['main skill'].user_defined.submit === true) {
        request.post('https://b375c779.us-south.apiconnect.appdomain.cloud/e054daea-1472-4ea2-b56b-ceee29d727b3/validation', {
          json: {
            id: process.env.USERNAME,
            url: process.env.ASSISTANT_URL,
            apikey: process.env.ASSISTANT_IAM_APIKEY,
            assistant_id: process.env.ASSISTANT_ID,
          },
        }, (error, _, body) => {
          if (error) {
            console.error(error);
          } else {
            const myData = {
              ...data,
              userMsg: body.msg,
            };
            answer = res.json(myData);
          }
        });
      } else {
        answer = res.json(data);
      }
    } else {
      answer = res.json(data);
    }

    return answer;
  });
});

app.get('/api/session', (req, res) => {
  assistant.createSession({
    assistant_id: process.env.ASSISTANT_ID || '{assistant_id}',
  }, (error, response) => {
    if (error) {
      console.log(error);
      return res.status(error.code || 500).send(error);
    }
    return res.send(response);
  });
});

module.exports = app;
