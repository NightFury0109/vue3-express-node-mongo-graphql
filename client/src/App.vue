<template>
  <Navbar />
  <router-view />
  <notifications />
</template>

<script>
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.min.js";
import "./App.css";

import jwt_decode from "jwt-decode";

import Navbar from "./components/Navbar.vue";

export default {
  name: "App",
  components: {
    Navbar,
  },
  mounted() {
    if(localStorage.token){
      const decoded = jwt_decode(localStorage.token);
      // Check for expired token
      const currentTime = Date.now() / 1000;
  
      if (decoded.exp < currentTime) {
        this.$store.dispatch("user/logout");
        this.$router.push("/login");
      }else{
        this.$store.commit('user/authState',true);
        // console.log('auth')
      }
    }
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>
