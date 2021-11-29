<template>
  <div class="d-flex justify-content-center align-content-center">
    <main class="box">
      <h2>Register</h2>
      <form @submit.prevent="handleSubmit" novalidate>
        <div class="inputBox">
          <label for="username">User's name</label>
          <input
            type="text"
            name="username"
            id="username"
            placeholder="type your username"
            v-model="userData.name"
          />
        </div>
        <div class="inputBox">
          <label for="email">Email</label>
          <input
            type="text"
            name="email"
            id="email"
            placeholder="type your email"
            v-model="userData.email"
          />
        </div>
        <div class="inputBox">
          <label for="userPassword">Password</label>
          <input
            type="password"
            name="userPassword"
            id="userPassword"
            placeholder="type your password"
            v-model="userData.password"
          />
        </div>
        <div class="inputBox">
          <label for="userConfirmPassword">Confirm Password</label>
          <input
            type="password"
            name="userPassword"
            id="userConfirmPassword"
            placeholder="confirm your password"
            v-model="userData.password2"
          />
        </div>
        <button type="submit" name="" style="float: left">Register</button>
        <router-link class="button" style="float: left" to="/login">Login</router-link>
      </form>
    </main>
    <footer></footer>
  </div>
</template>

<script>
import { mapActions } from "vuex";

export default {
  name: "Register",
  data() {
    return {
      userData: {
        name: "",
        email: "",
        password: "",
        password2: "",
      },
    };
  },
  
  methods: {
    ...mapActions("user", ["register"]),
    handleSubmit() {
      if(this.userData.password===this.userData.password2){
        this.register(this.userData);
      }else{
        console.log('dismatch')
      }
    },
  },
};
</script>

<style scoped>
.box {
  background-color: rgba(0, 0, 0, 0.8);
  border-radius: 10px;
  box-shadow: 0 15px 25px rgba(0, 0, 0, 0.8);
  margin-top: 80px;
  padding: 40px;
  /* position: absolute;
  top: 50%;
  left: 50%; */
  /* transform: translate(-50%, -50%); */
  text-align: left;
  width: 60vw;
  min-width: 350px;
}

.box h2 {
  margin: 0 0 30px 0;
  padding: 0;
  color: #fff;
  text-align: center;
}

.box .inputBox label {
  color: #fff;
}

.box .inputBox input {
  background: transparent;
  border: none;
  border-bottom: 1px solid #fff;
  color: #fff;
  font-size: 18px;
  letter-spacing: 2px;
  margin-bottom: 30px;
  outline: none;
  padding: 10px 0;
  width: 100%;
}

.box input[type="submit"],
.box button[type="submit"],
a.button {
  font-family: sans-serif;
  background: #03a9f4;
  /* font-size: 11px; */
  border: none;
  border-radius: 5px;
  color: #fff;
  cursor: pointer;
  /* font-weight: 600; */
  padding: 10px 20px;
  letter-spacing: 2px;
  outline: none;
  /* text-transform: uppercase; */
  text-decoration: none;
  margin: 2px 10px 2px 0;
  display: inline-block;
}

.box input[type="submit"]:hover,
.box button[type="submit"]:hover,
a.button:hover {
  opacity: 0.8;
}
</style>
