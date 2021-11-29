<template>
  <nav class="navbar navbar-expand-md navbar-dark fixed-top bg-dark">
    <div class="container-fluid">
      <router-link class="navbar-brand" to="/">GraphQL</router-link>
      <div class="text-right">
        <button
          class="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarCollapse"
          aria-controls="navbarCollapse"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarCollapse">
          <ul class="navbar-nav mb-2 mb-md-0">
            <li class="nav-item">
              <router-link class="nav-link" to="/">Home</router-link>
            </li>
            <li v-if="isAuth" class="nav-item">
              <router-link class="nav-link" to="/article">Article</router-link>
            </li>
            <li v-if="!isAuth" class="nav-item">
              <router-link class="nav-link" to="/login">Login</router-link>
            </li>
            <li v-if="!isAuth" class="nav-item">
              <router-link class="nav-link" to="/register">Register</router-link>
            </li>
            <li v-if="isAuth" class="nav-item" id="logout">
              <div class="nav-link" v-on:click="userLogout">Logout</div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </nav>
</template>

<script>
import { mapState,mapActions } from "vuex";

export default {
  name:'Navbar',
  computed:mapState('user',['isAuth']),
  methods: {
    ...mapActions('user',['logout']),
    userLogout(){
      this.logout();
    }
  },
};
</script>

<style>
.navbar {
  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.3), 0 6px 12px 0 rgba(0, 0, 0, 0.5);
}

#logout:hover {
  cursor: pointer;
}
</style>
