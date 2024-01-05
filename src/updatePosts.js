import {
  rssParser, generatorId, addFidId, singlePostRender,
} from './rssParser.js';

const updatePosts = (watchedState) => {
  console.log('UPDATEPOSTS');
  const existingURL = Object.keys(watchedState.existingURL);
  console.log('existingURL', existingURL);
  existingURL.forEach((url) => fetch(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(`${url}`)}`)
    .then((response) => {
      if (response.ok) {
        return response;
      }
      throw new Error('Network response was not ok.');
    })

    .then((data) => {
      console.log('data', data);
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
        // console.log('postExist',postExists)

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
    .catch((e) => console.error(e.message))
    .finally(() => setTimeout(() => updatePosts(watchedState), 5000)));
};

export default updatePosts;
