import { notify } from "@kyvg/vue3-notification";

import router from '../router/index';

import baseURL from './baseUrl';

const { graphql_api } = baseURL;

const state = {
  isAuth: false,
  registerRes: false,
  user: [],
  error: ''
}

const getters = {
  isAuth: state => state.isAuth,
  user: state => state.user
}

const actions = {
  register({ commit }, userData) {
    commit('authState', false);

    const graphqlQuery = {
      query: `
          mutation CreateNewUser($name: String!, $email: String!, $password: String!) {
            createUser(userInput:{name: $name, email: $email, password: $password}) {
              _id
            }
          }
        `,
      variables: {
        name: userData.name,
        email: userData.email,
        password: userData.password
      }
    };

    fetch(graphql_api,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(graphqlQuery)
      }).then(res => {
        return res.json();
      })
      .then(resData => {
        if (resData.errors) {
          console.log(resData);
          if (resData.errors[0].data) {
            commit('setError', resData.errors[0].data[0]);
          } else {
            commit('setError', resData.errors[0].message);
          }
          throw new Error('Validation failed');
        }

        notify({
          text: "User successfully registered",
          duration: 5000,
          type: 'success'
        });
        commit('setError', '');
        router.push('./login');
      })
      .catch(err => {
        console.log(err);
      });
  },
  login({ commit }, userData) {
    commit('authState', false);
    const graphqlQuery = {
      query: `
        query UserLogin($email: String!, $password: String!) {
          login(loginInput:{email: $email, password: $password}) {
            token
            userId
          }
        }
      `,
      variables: {
        email: userData.email,
        password: userData.password
      }
    }

    fetch(graphql_api, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(graphqlQuery)
    })
      .then(res => {
        return res.json();
      })
      .then(resData => {
        if (resData.errors) {
          console.log(resData);
          if (resData.errors[0].data) {
            commit('setError', resData.errors[0].data[0]);
          } else {
            commit('setError', resData.errors[0].message);
          }
          throw new Error('Validation failed');
        }

        commit('setError', '');
        localStorage.setItem('token', resData.data.login.token);
        localStorage.setItem('userId', resData.data.login.userId);
        commit('authState', true);
        router.push('/article');
      })
      .catch(err => {
        console.log(err);
      });
  },
  logout({ commit }) {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    commit('authState', false);
    router.push('./login');
  },
  sendResetPwRequest({ commit }, email) {
    commit('authState', false);
    const graphqlQuery = {
      query: `
        query SendMail($email: String!) {
          sendMail(email: $email) {
            msg
          }
        }
      `,
      variables: {
        email: email
      }
    }

    fetch(graphql_api, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(graphqlQuery)
    })
      .then(res => {
        return res.json();
      })
      .then(resData => {
        if (resData.errors) {
          console.log(resData);
          if (resData.errors[0].data) {
            commit('setError', resData.errors[0].data[0]);
          } else {
            commit('setError', resData.errors[0].message);
          }
          throw new Error('Validation failed');
        }

        console.log(resData);
      })
      .catch(err => {
        console.log(err);
      });
  },
  resetPassword({ commit }, data) {
    commit('authState', false);

    const graphqlQuery = {
      query: `
          mutation ResetPassword($userId: String!, $token: String!, $password: String!, $password2: String!) {
            resetPassword(data:{userId: $userId, token: $token, password: $password, password2: $password2})
          }
        `,
      variables: {
        userId: data.userId,
        token: data.token,
        password: data.password,
        password2: data.password2,
      }
    };

    fetch(graphql_api,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(graphqlQuery)
      }).then(res => {
        return res.json();
      })
      .then(resData => {
        if (resData.errors) {
          console.log(resData);
          if (resData.errors[0].data) {
            commit('setError', resData.errors[0].data[0]);
          } else {
            commit('setError', resData.errors[0].message);
          }
          throw new Error('Validation failed');
        }

        notify({
          text: "Password successfully changed",
          duration: 5000,
          type: 'success'
        });
        commit('setError', '');
        router.push('./login');
      })
      .catch(err => {
        console.log(err);
      });
  }
};

const mutations = {
  authState(state, status) {
    state.isAuth = status;
  },
  setError(state, err) {
    state.error = err;
  }
};

export const user = {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};