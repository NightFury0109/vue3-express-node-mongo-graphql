// import router from '../router/index';

import baseURL from './baseUrl';

const { graphql_api, upload_api } = baseURL;

const state = {
  article: {
    title: '',
    content: '',
    tags: '',
    imageUrl: '',
    alterText: ''
  },
  status: false,
  isUpdate: false,
  oldPath: '',
  articleID: null
}

const getters = {
  article: state => state.article,
  isUpdate: state => state.isUpdate,
}

const actions = {
  addAndUpdateArticle({ commit }, data) {
    commit('setStatus');

    const { formData, articleData } = data;
    fetch(upload_api, {
      method: 'PUT',
      headers: {
        'Authorization': localStorage.token
      },
      body: formData
    })
      .then(res => res.json())
      .then(fileResData => {
        let imageUrl = fileResData.filePath;

        if (imageUrl) {
          imageUrl = imageUrl.replace('\\', '/');
        }
        let graphqlQuery = {
          query: `
          mutation CreateNewPost($title: String!, $content: String!, $tags: String!, $imageUrl: String!, $alterText: String!) {
            createPost(postInput:{title: $title, content: $content, tags: $tags, imageUrl: $imageUrl, alterText: $alterText}) {
              _id
              title
              content
              tags
              imageUrl
              alterText
              creator {
                name
              }
              createdAt
            }
          }
        `,
          variables: {
            title: articleData.title,
            content: articleData.content,
            tags: articleData.tags,
            imageUrl: imageUrl,
            alterText: articleData.alterText
          }
        }

        if (state.isUpdate) {
          graphqlQuery = {
            query: `
            mutation UpdateExistingPost($id: ID!, $title: String!, $content: String!, tags: String!, $imageUrl: String!, alterText: String!) {
              updatePost(postId: $id, postInput:{title: $title, content: $content, tags: $tags, imageUrl: $imageUrl, alterText: $alterText}) {
                _id
                title
                content
                tags
                imageUrl
                alterText
                creator {
                  name
                }
                createdAt
              }
            }
          `,
            variables: {
              id: state.articleID,
              title: articleData.title,
              content: articleData.content,
              tags: articleData.tags,
              imageUrl: imageUrl || 'undefined',
              alterText: articleData.alterText
            }
          }
        }

        return fetch(graphql_api, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': localStorage.token
          },
          body: JSON.stringify(graphqlQuery)
        });
      })
      .then(res => res.json())
      .then(resData => {
        if (resData.errors) {
          console.log(resData.errors);
          if (this.state.editPost) {
            throw new Error('Could not edit post');
          } else {
            throw new Error('Post creation failed');
          }
        }
        console.log(resData);
      })
      .catch(err => {
        console.log(err);
      });
  }
};

const mutations = {
  setStatus(state) {
    state.status = true;
  },
  setUpdateStatus(state, status) {
    state.isUpdate = status;
  },
  setOldPath(state, path) {
    state.oldPath = path;
  },
  setArticleId(state, id) {
    state.articleID = id;
  },
  setArticle(state, articleData) {
    state.title = articleData.title;
    state.content = articleData.content;
    state.tags = articleData.tags;
    state.imageUrl = articleData.imageUrl;
    state.alterText = articleData.alterText;
  }
};

export const article = {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};