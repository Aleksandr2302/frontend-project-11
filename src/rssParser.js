import ruLocaleKeys from './locales/ru.js';

const generatorId = (() => {
  let startId = 0;

  return () => {
    startId += 1;
    return startId;
  };
})();

const addFidInfoInState = (fidTitle, fidTitleDesc, watchedState) => {
  const arrExistingURL = Object.keys(watchedState.existingURL);
  const newFid = {
    title: fidTitle,
    description: fidTitleDesc,
    dependsOnTheURL: arrExistingURL[arrExistingURL.length - 1],
    fidId: generatorId(),

  };
  watchedState.fid.push(newFid);
};

const addFidId = (watchedState) => {
  const fidIdMapping = watchedState.fid.reduce((acc, fid) => {
    acc[fid.dependsOnTheURL] = fid.fidId;
    return acc;
  }, {});

  watchedState.posts.forEach(((post) => {
    if (post.fidId === '') {
      post.fidId = fidIdMapping[post.dependsOnTheURL];// eslint-disable-line no-param-reassign
    }
  }));
};

const addPostInfoInState = (postTitle, postLink, watchedState) => {
  const arrExistingURL = Object.keys(watchedState.existingURL);
  const newPost = {
    // id: watchedState.posts.length + 1,
    title: postTitle,
    link: postLink.textContent,
    dependsOnTheURL: arrExistingURL[arrExistingURL.length - 1],
    postId: generatorId(),
    fidId: '',
    isReaded: false,
  };

  watchedState.posts.push(newPost);
  addFidId(watchedState);
};

const createInitialPostHtml = `
  <div class="card border-0">
    <div class="card-body">
      <h2 class="card-title h4">${ruLocaleKeys.posts.title}</h2>
    </div>
    <ul class="list-group border-0 rounded-0">
    </ul>
  </div>
`;

const createInitialFidHtml = `
<div class="card border-0">
  <div class="card-body">
    <h2 class="card-title h4">${ruLocaleKeys.feeds.title}</h2>
  </div>
  <ul class="list-group border-0 rounded-0">
  </ul>
</div>`;

const createLiFidElement = (fidTitle, fidTitleDesc) => (
  `<li class="list-group-item border-0 border-end-0">
  <h3 class="h6 m-0">${fidTitle}</h3>
  <p class="m-0 small text-black-50">${fidTitleDesc}</p>
  </li>`);

const createNewPostTitle = (postTitle, link) => (
  `<li class="list-group-item d-flex justify-content-between align-items-start border-0 border-end-0"><a href="${link.textContent}" class="fw-bold" data-id="2" target="_blank" rel="noopener noreferrer">${postTitle}</a><button type="button" class="btn btn-outline-primary btn-sm" data-id="2" data-bs-toggle="modal" data-bs-target="#modal">${ruLocaleKeys.posts.button}</button></li>
  `);

const showButtonFunction = (watchedState, button) => {
  const liElement = button.closest('li');
  const aElement = liElement.querySelector('a[data-id="2"]');
  const titleAElement = aElement.textContent.trim();

  if (aElement.classList.contains('fw-bold')) {
    aElement.classList.remove('fw-bold');
    aElement.classList.add('fw-normal');
  }
  watchedState.posts.forEach((post) => {
    if (post.title === titleAElement) {
      post.isReaded = true;// eslint-disable-line no-param-reassign
    }
  });
};

const addPost = (post, watchedState, postListClass) => {
  const postTitle = post.querySelector('title').textContent;
  console.log('post', post);
  const link = post.querySelector('link');
  addPostInfoInState(postTitle, link, watchedState);
  const newPostTitle = createNewPostTitle(postTitle, link);
  const postDescription = post.querySelector('description').textContent;
  document.querySelector('.modal-title').textContent = postTitle;
  document.querySelector('.modal-body.text-break').textContent = postDescription;
  const divModalFooter = document.querySelector('.modal-footer');
  const articleLink = divModalFooter.querySelector('.btn.btn-primary.full-article');
  articleLink.href = link.textContent;
  postListClass.insertAdjacentHTML('afterbegin', newPostTitle);
};

const xmlRender = (xml, watchedState) => {
  // Feed div
  const mainFidDiv = document.querySelector('.col-md-10.col-lg-4.mx-auto.order-0.order-lg-1.feeds');
  // Post div
  const mainPostDiv = document.querySelector('.col-md-10.col-lg-8.order-1.mx-auto.posts');
  if (!document.querySelector('.card.border-0')) {
    mainPostDiv.insertAdjacentHTML('beforeend', createInitialPostHtml);
    mainFidDiv.insertAdjacentHTML('beforeend', createInitialFidHtml);
  }
  const postListClass = mainPostDiv.querySelector('.list-group.border-0.rounded-0');
  const fidUlClass = mainFidDiv.querySelector('.list-group.border-0.rounded-0');
  // const newSection = document.querySelector('.container-fluid.container-xxl.p-5');
  // fidTitle
  const fidTitle = xml.querySelector('title').textContent;
  // fidTitleDesc
  const fidTitleDesc = xml.querySelector('description').textContent;
  addFidInfoInState(fidTitle, fidTitleDesc, watchedState);
  const liFidElement = createLiFidElement(fidTitle, fidTitleDesc);
  fidUlClass.insertAdjacentHTML('afterbegin', liFidElement);
  // Imems
  const postLists = xml.querySelectorAll('item');
  postLists.forEach((post) => {
    addPost(post, watchedState, postListClass);
  });
  const buttons = document.querySelectorAll('.btn.btn-outline-primary.btn-sm');
  buttons.forEach((button) => {
    button.addEventListener(('click'), () => {
      showButtonFunction(watchedState, button);
    });
  });
};

const singlePostRender = (newPost) => {
  const mainPostDiv = document.querySelector('.col-md-10.col-lg-8.order-1.mx-auto.posts');
  const postListClass = mainPostDiv.querySelector('.list-group.border-0.rounded-0');
  const postTitle = newPost.querySelector('title').textContent;
  const link = newPost.querySelector('link');
  const newPostTitle = createNewPostTitle(postTitle, link);
  const postDescription = newPost.querySelector('description').textContent;
  document.querySelector('.modal-title').textContent = postTitle;
  document.querySelector('.modal-body.text-break').textContent = postDescription;
  postListClass.insertAdjacentHTML('afterbegin', newPostTitle);
};
const rssParser = (data) => {
  const parser = new window.DOMParser();
  const xmlDoc = parser.parseFromString(data, 'text/xml');
  return xmlDoc;
};

export {
  rssParser, xmlRender, generatorId, addPostInfoInState, addFidId, singlePostRender,
};
