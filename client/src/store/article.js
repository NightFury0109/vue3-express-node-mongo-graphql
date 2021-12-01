// import router from '../router/index';
import { notify } from "@kyvg/vue3-notification";

import baseURL from './baseUrl';

const { graphql_api, upload_api } = baseURL;

const state = {
  articles: [],
  articles2: [],
  article: {},
  status: false,
  isUpdate: false,
  oldPath: '',
  articleID: null,
  isImageVisible: false,
  isModalVisible: false,
  imageFile: null,
  error: ''
}

const getters = {
  articles: state => state.articles,
  isUpdate: state => state.isUpdate,
  article: state => state.article,
}

const actions = {
  addAndUpdateArticle({ commit, dispatch }, data) {
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
            mutation UpdateExistingPost($id: ID!, $title: String!, $content: String!, $tags: String!, $imageUrl: String!, $alterText: String!) {
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
          console.log(resData);
          if (resData.errors[0].data) {
            commit('setError', resData.errors[0].data[0]);
          } else {
            commit('setError', resData.errors[0].message);
          }
          if (this.state.editPost) {
            throw new Error('Could not edit post');
          } else {
            throw new Error('Post creation failed');
          }
        }

        notify({
          text: "Article successfully saved",
          duration: 5000,
          type: 'success'
        });
        commit('setError', '');
        commit('setArticle', {});
        commit('setModalVisible', false);
        commit('setImageVisible', false);
        commit('changeUpdateStatus', false);
        commit('setImage', null);
        dispatch('getArticles');
      })
      .catch(err => {
        console.log(err);
      });
  },
  getArticles({ commit }) {
    const page = 1;
    const graphqlQuery = {
      query: `
        query FetchPosts($page: Int) {
          posts(page: $page) {
            posts {
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
            totalPosts
          }
        }
      `,
      variables: {
        page: page
      }
    }

    fetch(graphql_api, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': localStorage.token
      },
      body: JSON.stringify(graphqlQuery)
    })
      .then(res => {
        return res.json();
      })
      .then(resData => {
        if (resData.errors) {
          console.log(resData.errors)
          throw new Error('Failed to fetch posts.');
        }

        commit('setArticles', resData.data.posts.posts);
        commit('setArticles2', resData.data.posts.posts);
      })
      .catch(err => {
        console.log(err)
      });
  },
  getArticle({ commit }, articleId) {
    const graphqlQuery = {
      query: `
        query FetchSinglePost($postId: ID!) {
          post(postId: $postId) {
            _id
            title
            content
            imageUrl
            creator {
              name
            }
            createdAt
          }
        }
      `,
      variables: {
        postId: articleId
      }
    }

    fetch(graphql_api, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': localStorage.token
      },
      body: JSON.stringify(graphqlQuery)
    })
      .then(res => res.json())
      .then(resData => {
        if (resData.errors) {
          console.log(resData.errors);
          throw new Error('Failed to load post');
        }
        // console.log(resData.data.post)
        commit('setArticle', resData.data.post);
      })
      .catch(err => {
        console.log(err);
        throw new Error('Error');
      });
  }
};

const mutations = {
  setStatus(state) {
    state.status = true;
  },
  changeUpdateStatus(state, status) {
    state.isUpdate = status;
  },
  setOldPath(state, path) {
    state.oldPath = path;
  },
  setArticleId(state, id) {
    state.articleID = id;
  },
  setArticles(state, articles) {
    state.articles = articles;
  },
  setArticles2(state, articles) {
    state.articles2 = articles;
  },
  setArticle(state, article) {
    state.article = article;
  },
  setImageVisible(state, status) {
    state.isImageVisible = status;
  },
  setModalVisible(state, status) {
    state.isModalVisible = status;
  },
  setError(state, err) {
    state.error = err;
  },
  setImage(state, image) {
    state.imageFile = image;
  }
};

export const article = {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};