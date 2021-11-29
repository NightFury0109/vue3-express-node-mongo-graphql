// import router from '../router/index';

import baseURL from './baseUrl';

const { graphql_api, upload_api } = baseURL;

const state = {
  articles: [],
  article: {},
  status: false,
  isUpdate: false,
  oldPath: '',
  articleID: null
}

const getters = {
  articles: state => state.articles,
  isUpdate: state => state.isUpdate,
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
          console.log(resData.errors);
          if (this.state.editPost) {
            throw new Error('Could not edit post');
          } else {
            throw new Error('Post creation failed');
          }
        }

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
      })
      .catch(err => {
        console.log(err)
      });
  },
  getArticle(context, articleId) {
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

        context.commit('setArticle', resData.data.post);
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
  setArticle(state, article) {
    state.article = article;
  }
};

export const article = {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};