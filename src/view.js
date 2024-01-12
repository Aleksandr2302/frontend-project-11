/* eslint-disable no-param-reassign */

import onChange from 'on-change';
import * as yup from 'yup';
import axios from 'axios';
import ruLocaleKeys from './locales/ru.js';
import { rssParser, xmlRender } from './rssParser.js';
import updatePosts from './updatePosts.js';

// Description of Id statuses:
// for example 01VF - it means 01-number, VF- Validation Failed
// VS - validation success, RS- RSS Success, RF - RSS Failed

// Yup
yup.setLocale({
  string: {
    required: () => ({ key: 'ruLocaleKeys.statusText.validationFailedId[01VF]' }),
    url: () => ({ key: 'ruLocaleKeys.statusText.validationFailedId[02VF]' }),
    notOneOf: () => ({ key: 'ruLocaleKeys.statusText.validationFailedId[03VF]' }),
    rssSuccess: () => ({ key: 'ruLocaleKeys.statusText.rssSuccessId[01RS]' }),
    rssFailedNotValid: () => ({ key: 'ruLocaleKeys.statusText.rssFailedId[01RF]' }),
    // rssAlreadyExist: () => ({key: 'ruLocaleKeys.statusText.rss.failed.alreadyExist'}),
  },

});

// Validation
const validation = (watchedState, state) => {
  // yup
  const schema = yup.object().shape({
    formValue: yup.string()
      .required()
      .url()
      .trim()
      .notOneOf(Object.keys(state.existingURL)),
    // .test('notOneOf', i18n.t('ruLocaleKeys.errors.rss.failed.alreadyExist'), (value) => {
    //   // Проверка на уникальность URL
    //   return !Object.keys(state.existingURL).includes(value);
    // }),
    // .notOneOf(Object.keys(state.existingURL)),
  });

  return schema.validate(state)
    .then(() => {
      // eslint-disable-next-line no-param-reassign
      watchedState.validationId = '01VS';
      // watchedState.validationError = '';
      watchedState.validationStatus = 'success';
    })
    .catch((error) => {
      console.log(error.type);
      if (error.type === 'url') {
        watchedState.validationId = '02VF';
      } else if (error.type === 'notOneOf') {
        watchedState.validationId = '03VF';
      }
      watchedState.validationStatus = 'failed';
      return Promise.reject(error);
    });
};

// Clean status,errors
const cleanRssAndValidationStatusAndText = (watchedState) => {
  watchedState.validationId = '';
  watchedState.rssId = '';
  watchedState.getRssStatus = '';
  watchedState.validationStatus = '';
  console.log('Очищенное состояние:', watchedState);
};

// render
const render = (state, elements, i18n) => {
  console.log('render');
  const pathLocalValidationId = ruLocaleKeys.statusText.validationFailedId;
  const pathLocalRssSuccessID = ruLocaleKeys.statusText.rssSuccessId;
  const pathLocalRssFailedID = ruLocaleKeys.statusText.rssFailedId;
  // Validation failed
  switch (state.validationStatus) {
    case 'failed':
      elements.infoPElement.textContent = i18n.t(pathLocalValidationId[state.validationId]);
      if (!elements.infoPElement.classList.contains('text-danger')) {
        elements.infoPElement.classList.add('text-danger');
      } if (!elements.inputField.classList.contains('is-invalid')) {
        elements.inputField.classList.add('is-invalid');
      }
      break;
      // Validation success
    case 'success':
      console.log('1 step render');
      // getRss success
      switch (state.getRssStatus) {
        case 'success':
          console.log('2 step render');
          if (elements.infoPElement.classList.contains('text-danger')) {
            elements.infoPElement.classList.remove('text-danger');
          } if (!elements.infoPElement.classList.contains('text-success')) {
            elements.infoPElement.classList.add('text-success');
          }
          elements.infoPElement.textContent = i18n.t(pathLocalRssSuccessID[state.rssId]);
          if (elements.inputField.classList.contains('is-invalid')) {
            elements.inputField.classList.remove('is-invalid');
          } 
          elements.inputField.value = '';
          elements.inputField.focus();
          break;
        // getRss failed
        case 'failed':
          console.log('render Failed');
          if (!elements.infoPElement.classList.contains('text-danger')) {
            elements.infoPElement.classList.add('text-danger');
          } if (elements.infoPElement.classList.contains('text-success')) {
            elements.infoPElement.classList.remove('text-success');
          }
          elements.infoPElement.textContent = i18n.t(pathLocalRssFailedID[state.rssId]);
          if (elements.inputField.classList.contains('is-invalid')) {
            elements.inputField.classList.remove('is-invalid');
          }
          break;
        default:
      }
      break;
    default:
  }
};

// Get Rss Info
// const getRssInfo = (url, watchedState) => {
//   console.log('Before getRssInfo', watchedState);

//   return fetch(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`)
//     .then((response) => {

//       if (!response.ok) {
//         watchedState.getRssStatus = 'failed';
//         watchedState.rssId = '01NP';
//         throw new Error(ruLocaleKeys.statusText.rssFailedId['01NP']);
//       }
//       console.log('Response', response.type);
//       console.log('Response', response);
//       return response.json();  // Обработка тела ответа в формате JSON
//     })
//     .then((data) => {
//       const dataText = data.contents;
//       const xmlDoc = rssParser(dataText);
//       console.log('XML Document', xmlDoc);

//       const channelElement = xmlDoc.getElementsByTagName('channel')[0];

//       if (channelElement) {
//         // Успешный ответ с каналами
//         watchedState.getRssStatus = 'success';
//         watchedState.rssId = '01RS';
//         watchedState.existingURL[url] = true;
//         console.log('XML Document with Channels', xmlDoc);
//         xmlRender(xmlDoc, watchedState);
//       } else {
//         // В ответе нет данных, считаем, что ресурс не существует
//         watchedState.getRssStatus = 'failed';
//         watchedState.rssId = '01RF';
//         throw new Error(ruLocaleKeys.statusText.rssFailedId['01RF']);
//       }
//     })
//     .catch((error) => {
//       console.log('Error message', error.message);
//       console.error('Error:', error);
//       return Promise.reject(error);
//     });
// };

// const getRssInfo = (url, watchedState) => {
//   console.log('Before getRssInfo', watchedState);

//   return axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`, { timeout: 5000 })
//     .then((response) => {
//       console.log('Response', response.type);
//       console.log('Response', response);
//       return response;
//     })
//     .then((data) => {
//       const dataText = data.data.contents;
//       const xmlDoc = rssParser(dataText);
//       console.log('XML Document', xmlDoc);

//       const channelElement = xmlDoc.getElementsByTagName('channel')[0];

//       if (channelElement) {
//         // Успешный ответ с каналами
//         watchedState.getRssStatus = 'success';
//         watchedState.rssId = '01RS';
//         watchedState.existingURL[url] = true;
//         console.log('XML Document with Channels', xmlDoc);
//         xmlRender(xmlDoc, watchedState);
//       } else {
//         // В ответе нет данных, считаем, что ресурс не существует
//         watchedState.getRssStatus = 'failed';
//         watchedState.rssId = '01RF';
//         throw new Error(ruLocaleKeys.statusText.rssFailedId['01RF']);
//       }
//     })
//     .catch((error) => {
//       if (error.code === 'ECONNABORTED') {
//         watchedState.getRssStatus = 'failed';
//         watchedState.rssId = '01NP';
//         throw new Error(ruLocaleKeys.statusText.rssFailedId['01NP']);
//       }
//       console.log('Error message', error.message);
//       console.error('Error:', error);
//       return Promise.reject(error);
//     });
// };
// const getRssInfo = (url, watchedState) => {
//   console.log('Before getRssInfo', watchedState);

//   // Создаем экземпляр CancelToken
//   const cancelTokenSource = axios.CancelToken.source();

//   // Устанавливаем тайм-аут в 5 секунд
//   const timeoutId = setTimeout(() => {
//     cancelTokenSource.cancel('Request timed out');
//   }, 5000);

//   return axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`, {
//     cancelToken: cancelTokenSource.token, // Передаем токен отмены в конфигурацию запроса
//   })
//     .then((response) => {
//       clearTimeout(timeoutId); // Очищаем таймер, так как запрос выполнен успешно
//       return response;
//     })
//     .then((data) => {
//       const dataText = data.data.contents;
//       const xmlDoc = rssParser(dataText);
//       console.log('XML Document', xmlDoc);

//       const channelElement = xmlDoc.getElementsByTagName('channel')[0];

//       if (channelElement) {
//         // Успешный ответ с каналами
//         watchedState.getRssStatus = 'success';
//         watchedState.rssId = '01RS';
//         watchedState.existingURL[url] = true;
//         console.log('XML Document with Channels', xmlDoc);
//         xmlRender(xmlDoc, watchedState);
//       } else {
//         // В ответе нет данных, считаем, что ресурс не существует
//         watchedState.getRssStatus = 'failed';
//         watchedState.rssId = '01RF';
//         throw new Error(ruLocaleKeys.statusText.rssFailedId['01RF']);
//       }
//     })
//     .catch((error) => {
//       console.log('Error message', error.message);

//       if (axios.isCancel(error)) {
//         // Запрос был отменен
//         console.log('Request canceled:', error.message);
//         watchedState.getRssStatus = 'failed';
//         watchedState.rssId = '01NP';
//       }
//     });
// };

const getRssInfo = (url, watchedState) => {
  console.log('Before getRssInfo', watchedState);

  return axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`)
    .catch(() => {
      watchedState.getRssStatus = 'failed';
      watchedState.rssId = '01NP';
      throw new Error(ruLocaleKeys.statusText.rssFailedId['01NP']);
    })
    .then((data) => {
      const dataText = data.data.contents;
      const xmlDoc = rssParser(dataText);
      console.log('XML Document', xmlDoc);

      const channelElement = xmlDoc.getElementsByTagName('channel')[0];

      if (channelElement) {
        // Успешный ответ с каналами
        watchedState.getRssStatus = 'success';
        watchedState.rssId = '01RS';
        watchedState.existingURL[url] = true;
        console.log('XML Document with Channels', xmlDoc);
        xmlRender(xmlDoc, watchedState);
      } else {
        // В ответе нет данных, считаем, что ресурс не существует
        watchedState.getRssStatus = 'failed';
        watchedState.rssId = '01RF';
        throw new Error(ruLocaleKeys.statusText.rssFailedId['01RF']);
      }
    });
};

// onChange + IinitilizationView
const initilizationView = (state, elements, i18n) => {
  const watchedState = onChange(state, (path, value) => {
    state[path] = value;
  });

  cleanRssAndValidationStatusAndText(watchedState);
  console.log('Initial state:', state);

  validation(watchedState, state, i18n)

    .then(() => getRssInfo(state.formValue, watchedState, i18n))
    .then(() => {
      console.log(state);
      console.log('state.existingURL', Object.keys(state.existingURL));
    })
    .catch((error) => {
      console.error('Error during initialization:', error);
      console.log(state);
    })
    .finally(() => {
      updatePosts(watchedState);
      render(state, elements, i18n);
    });
};

export default initilizationView;
