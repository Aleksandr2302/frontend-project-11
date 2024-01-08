import axios from 'axios';
import {
  rssParser, generatorId, addFidId, singlePostRender,
} from './rssParser.js';
import ruLocaleKeys from './locales/ru.js';

const updatePosts = (watchedState) => {
  console.log('UPDATEPOSTS');
  const existingURL = Object.keys(watchedState.existingURL);
  console.log('existingURL', existingURL);
  existingURL.forEach((url) => axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(`${url}`)}`, { timeout: 5000 })
    .then((response) => {
      if (response.status !== 200) {
        watchedState.getRssStatus = 'failed';// eslint-disable-line no-param-reassign
        watchedState.rssId = '01NP';// eslint-disable-line no-param-reassign
        throw new Error(ruLocaleKeys.statusText.rssFailedId['01NP']);
      }
      console.log('response', response);
      return response;
    })

    .then((data) => {
      console.log('data', data);
      watchedState.updateRssStatus = 'Success';// eslint-disable-line no-param-reassign

      const dataText = data.data.contents;
      const xml = rssParser(dataText);
      const postLists = xml.querySelectorAll('item');

      postLists.forEach((post) => {
        const postTitle = post.querySelector('title').textContent;

        const postExists = watchedState.posts.some((existsPost) => existsPost.title === postTitle);
        if (!postExists) {
          watchedState.posts.push({
            title: postTitle,
            link: post.querySelector('link').textContent,
            dependsOnTheURL: url,
            postId: generatorId(),
            fidId: '',
          });
          addFidId(watchedState);
          singlePostRender(post);
        }
      });
      console.log('watchedState', watchedState);
    })
    .catch((error) => {
      console.error(error.message);
      watchedState.updateRssStatus = ruLocaleKeys.statusText.newWorkProblems['01NP'];// eslint-disable-line no-param-reassign
    })
    .finally(() => setTimeout(() => updatePosts(watchedState), 5000)));
};

export default updatePosts;
