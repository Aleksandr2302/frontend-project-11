// @ts-check

import './styles.scss';
import 'bootstrap';
import i18next from 'i18next';
import initilizationView from './view.js';
import resources from './locales/ru.js';

// elements
const elements = {
  form: document.querySelector('.rss-form.text-body'),
  inputField: document.getElementById('url-input'),
  validationMessage: document.querySelector('.feedback.m-0.position-absolute.small.text-success'),
  fiedContainer: document.querySelector('.col-md-10.col-lg-4.mx-auto.order-0.order-lg-1 feeds'),
  infoPElement: document.querySelector('.feedback.m-0.position-absolute.small'),
};

// initilization State
const init = () => ({
  formValue: elements.inputField.value,
  existingURL: {},
  validationStatus: 'success',
  getRssStatus: '',
  rssId: '',
  validationId: '',
});

const state = init();

// Initilization i18n
const i18n = i18next.createInstance();
await i18n.init({
  lng: 'ru',
  debug: false,
  resources,
});

elements.inputField.addEventListener('input', () => {
  state.formValue = elements.inputField.value;
});

// const {watchedState, validation} = validationWatchedRender(state);

// console.log(state);
elements.form.addEventListener('submit', (e) => {
  e.preventDefault();
  console.log(state.formValue);
  initilizationView(state, elements, i18n);
});

// render(state,elements);

// elements.form.addEventListener('submit', (e)=> {
//   e.preventDefault();
//   console.log(state.formValue)
//   validation(state)
//   .then(() => {

//     render(state, elements);
//     console.log(state);
//   })
//   .catch((error) => {
//     render(state, elements);
//     console.log(state);
//   });

//   //render(state,elements);

// })
// //console.log(state);
