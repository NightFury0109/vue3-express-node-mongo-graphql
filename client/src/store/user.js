// import { userService } from '../services/userService';
import router from '../router/index';

import baseURL from './baseUrl';

const { graphql_api } = baseURL;

const state = {
  isAuth: false,
  registerRes: false,
  user: []
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
          throw new Error('Validation failed');
        }
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
          throw new Error('Validation failed');
        }
        // console.log(resData);
        localStorage.setItem('token', resData.data.login.token);
        localStorage.setItem('userId', resData.data.login.userId);
        commit('authState', true);
        router.push('/article')
        // const remainingMilliseconds = 60 * 60 * 1000;
        // const expiryDate = new Date(
        //   new Date().getTime() + remainingMilliseconds
        // );
        // localStorage.setItem('expiryDate', expiryDate.toISOString());
        // this.setAutoLogout(remainingMilliseconds);
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
  }
};

const mutations = {
  authState(state, status) {
    state.isAuth = status;
  }
};

export const user = {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};