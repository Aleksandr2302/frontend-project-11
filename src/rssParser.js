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
    // id: watchedState.fid.length + 1,
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
  };

  watchedState.posts.push(newPost);
  addFidId(watchedState);
};

const createInitialPostHtml = `
  <div class="card border-0">
    <div class="card-body">
      <h2 class="card-title h4">Посты</h2>
    </div>
    <ul class="list-group border-0 rounded-0">
    </ul>
  </div>
`;

const createInitialFidHtml = `
<div class="card border-0">
  <div class="card-body">
    <h2 class="card-title h4">Фиды</h2>
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
  `<li class="list-group-item d-flex justify-content-between align-items-start border-0 border-end-0"><a href="${link.textContent}" class="fw-bold" data-id="2" target="_blank" rel="noopener noreferrer">${postTitle}</a><button type="button" class="btn btn-outline-primary btn-sm" data-id="2" data-bs-toggle="modal" data-bs-target="#modal">Просмотр</button></li>
  `);

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
  const newSection = document.querySelector('.container-fluid.container-xxl.p-5');
  console.log('section', newSection);
  // fidTitle
  const fidTitle = xml.querySelector('title').textContent;
  // Новые уроки на Хекслете
  console.log('fidTitle', fidTitle);
  // fidTitleDesc
  const fidTitleDesc = xml.querySelector('description').textContent;
  // Практические уроки по программированию
  console.log('fidTitleDesc', fidTitleDesc);
  addFidInfoInState(fidTitle, fidTitleDesc, watchedState);
  const liFidElement = createLiFidElement(fidTitle, fidTitleDesc);
  console.log('fidUlClass', fidUlClass);
  fidUlClass.insertAdjacentHTML('afterbegin', liFidElement);
  // Imems
  const postLists = xml.querySelectorAll('item');
  postLists.forEach((post) => {
    const postTitle = post.querySelector('title').textContent;
    console.log('postTitle', postTitle);
    const link = post.querySelector('link');
    addPostInfoInState(postTitle, link, watchedState);
    const newPostTitle = createNewPostTitle(postTitle, link);
    const postDescription = post.querySelector('description').textContent;
    document.querySelector('.modal-title').textContent = postTitle;
    document.querySelector('.modal-body.text-break').textContent = postDescription;
    console.log('postListClass', postListClass);
    postListClass.insertAdjacentHTML('afterbegin', newPostTitle);
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
  // xmlRender(xmlDoc);
  return xmlDoc;
};

export {
  rssParser, xmlRender, generatorId, addPostInfoInState, addFidId, singlePostRender,
};
