/* eslint-disable no-param-reassign */

import onChange from 'on-change';
import * as yup from 'yup';

// Validation
const validation = (watchedState, state) => {
  // yup
  const schema = yup.object().shape({
    formValue: yup.string()
      .required('Заполните это поле.')
      .url('Ссылка должна быть валидным URL')
      .trim()
      .notOneOf(Object.keys(state.existingURL), 'URL уже существует'),
  });

  return schema.validate(state)
    .then(() => {
      // eslint-disable-next-line no-param-reassign
      watchedState.validationError = '';
      watchedState.validationStatus = 'success';
    })
    .catch((error) => {
      watchedState.validationError = error.message;
      watchedState.validationStatus = 'failed';

      return Promise.reject(error);
    });
};

// Clean status,errors
const cleanRssAndValidationStatusAndText = (watchedState) => {
  watchedState.getRssStatus = '';
  watchedState.getRssSuccessText = '';
  watchedState.validationError = '';
  watchedState.validationStatus = '';
  console.log('Очищенное состояние:', watchedState);
};

// render
const render = (state, elements) => {
  console.log('render');

  // Validation failed
  switch (state.validationStatus) {
    case 'failed':
      elements.infoPElement.textContent = state.validationError;
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
          elements.infoPElement.textContent = state.getRssSuccessText;

          elements.inputField.classList.contains('is-invalid') ? elements.inputField.classList.remove('is-invalid') : undefined;
          elements.inputField.value = '';
          elements.inputField.focus();
          break;

        // getRss failed
        case 'failed':
          !elements.infoPElement.classList.contains('text-danger') ? elements.infoPElement.classList.add('text-danger') : undefined;
          elements.infoPElement.classList.contains('text-success') ? elements.infoPElement.classList.remove('text-success') : undefined;
          elements.infoPElement.textContent = state.getRssError;

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
  return fetch(`https://allorigins.hexlet.app/get?url=${encodeURIComponent(`${url}`)}`)
    .then((response) => {
      if (response.ok) {
        return response;
      }
      watchedState.getRssStatus = 'failed';
      watchedState.getRssError = 'Ресурс не содержит валидный RSS';
      throw new Error('Network response was not ok.');
    })

    .then((data) => {
      console.log('data', data);
      return data.json();
    })

    .then((data) => {
      console.log('dataJson', data);
      const dataText = data.contents;
      console.log('dataText', dataText);
      const parser = new window.DOMParser();
      const xmlDoc = parser.parseFromString(dataText, 'text/xml');
      console.log('xmlDoc', xmlDoc);

      const channelElement = xmlDoc.getElementsByTagName('channel')[0];

      if (channelElement) {
        watchedState.getRssStatus = 'success';
        watchedState.getRssSuccessText = 'RSS успешно загружен';
        watchedState.existingURL[url] = true;
        console.log(data);
      } else {
        // В ответе нет данных, считаем, что ресурс не существует
        watchedState.getRssStatus = 'failed';
        watchedState.getRssError = 'Ресурс не содержит валидный RSS';
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
const initilizationView = (state, elements) => {
  const watchedState = onChange(state, (path, value) => {
    state[path] = value;
  });

  cleanRssAndValidationStatusAndText(watchedState);
  console.log('Initial state:', state);

  validation(watchedState, state)

    .then(() => getRssInfo(state.formValue, watchedState))
    .then(() => {
      console.log(state);
      // render(state, elements, watchedState);
      console.log(state);
      console.log('state.existingURL', state.existingURL);
    })
    .catch((error) => {
      console.error('Error during initialization:', error);
      console.log(state);
      // render(state, elements, watchedState);
      console.log(state);
    })
    .finally(() => {
      render(state, elements, watchedState);
    });
};

export default initilizationView;
