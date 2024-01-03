/* eslint-disable no-param-reassign */

import onChange from 'on-change';
import * as yup from 'yup';
import ruLocaleKeys from './locales/ru.js';
import { rssParser, xmlRender } from './rssParser.js';

// Description of Id statuses:
// for example 01VF - it means 01-number, VF- Validation Failed
// VS - validation success, RS- RSS Success, RF - RSS Failed

// Yup
yup.setLocale({
  string: {
    required: () => ({ key: 'ruLocaleKeys.statusText.validation.required' }),
    url: () => ({ key: 'ruLocaleKeys.statusText.validation.url' }),
    notOneOf: () => ({ key: 'ruLocaleKeys.statusText.rss.failed.alreadyExist' }),
    rssSuccess: () => ({ key: 'ruLocaleKeys.statusText.rss.success' }),
    rssFailedNotValid: () => ({ key: 'ruLocaleKeys.statusText.rss.failed.notValid' }),
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
      !elements.infoPElement.classList.contains('text-danger') ? elements.infoPElement.classList.add('text-danger') : undefined;
      !elements.inputField.classList.contains('is-invalid') ? elements.inputField.classList.add('is-invalid') : undefined;
      break;
      // Validation success
    case 'success':
      console.log('1 step render');
      // getRss success
      switch (state.getRssStatus) {
        case 'success':
          console.log('2 step render');
          elements.infoPElement.classList.contains('text-danger') ? elements.infoPElement.classList.remove('text-danger') : undefined;
          !elements.infoPElement.classList.contains('text-success') ? elements.infoPElement.classList.add('text-success') : undefined;
          elements.infoPElement.textContent = i18n.t(pathLocalRssSuccessID[state.rssId]);
          elements.inputField.classList.contains('is-invalid') ? elements.inputField.classList.remove('is-invalid') : undefined;
          elements.inputField.value = '';
          elements.inputField.focus();
          break;
        // getRss failed
        case 'failed':
          !elements.infoPElement.classList.contains('text-danger') ? elements.infoPElement.classList.add('text-danger') : undefined;
          elements.infoPElement.classList.contains('text-success') ? elements.infoPElement.classList.remove('text-success') : undefined;
          elements.infoPElement.textContent = i18n.t(pathLocalRssFailedID[state.rssId]);
          elements.inputField.classList.contains('is-invalid') ? elements.inputField.classList.remove('is-invalid') : undefined;
          break;
        default:
      }
      break;
    default:
  }
};

// Get Rss Info
const getRssInfo = (url, watchedState) => {
  console.log(' before getRssInfo', watchedState);
  return fetch(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(`${url}`)}`)
    .then((response) => {
      if (response.ok) {
        return response;
      }
      watchedState.getRssStatus = 'failed';
      watchedState.rssId = '01RF';
      throw new Error('Network response was not ok.');
    })

    .then((data) => {
      console.log('data', data);
      return data.json();
    })

    .then((data) => {
      console.log('dataJson', data);
      const dataText = data.contents;
      console.log(watchedState);
      console.log('dataText', dataText);
      const xmlDoc = rssParser(dataText);
      console.log('xmlDoc', xmlDoc);
      console.log('xmlDoc Channel', xmlDoc.querySelector('title'));
      console.log('xmlDoc Channel', xmlDoc.querySelector('description').textContent);
      console.log('xmlDoc item', xmlDoc.querySelectorAll('item'));
      xmlRender(xmlDoc, watchedState);

      const channelElement = xmlDoc.getElementsByTagName('channel')[0];

      if (channelElement) {
        watchedState.getRssStatus = 'success';
        watchedState.rssId = '01RS';
        watchedState.existingURL[url] = true;
        console.log(data);
      } else {
        // В ответе нет данных, считаем, что ресурс не существует
        watchedState.getRssStatus = 'failed';
        watchedState.rssId = '01RF';
        // watchedState.getRssError = i18n.t(ruLocaleKeys.errors.rss.failed.notValid);
        console.error('Resource does not exist');
        throw new Error('Resource does not exist');
      }
    })
    .catch((error) => {
      console.error('Error:', error);
      return Promise.reject(error);
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
      console.log('state.existingURL', state.existingURL);
    })
    .catch((error) => {
      console.error('Error during initialization:', error);
      console.log(state);
    })
    .finally(() => {
      render(state, elements, i18n);
    });
};

export default initilizationView;
