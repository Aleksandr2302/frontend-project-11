import {
  rssParser, generatorId, addFidId, singlePostRender,
} from './rssParser.js';
import ruLocaleKeys from './locales/ru.js';

const updatePosts = (watchedState) => {
  console.log('UPDATEPOSTS');
  const existingURL = Object.keys(watchedState.existingURL);
  console.log('existingURL', existingURL);
  existingURL.forEach((url) => fetch(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(`${url}`)}`)
    .then((response) => {
      if (response.ok) {
        return response;
      }
      throw new Error(ruLocaleKeys.statusText.newWorkProblems['01NP']);
    })

    .then((data) => {
      console.log('data', data);
      watchedState.updateRssStatus = 'Success';// eslint-disable-line no-param-reassign
      return data.json();
    })

    .then((dataJson) => {
      const dataText = dataJson.contents;
      const xml = rssParser(dataText);
      const postLists = xml.querySelectorAll('item');
      // const loadedPosts = watchedState.posts.filter((post)=> post.dependsOnTheURL === url );
      // const loadedPostsIds = new Set(loadedPosts.map((post) => post.id));

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
