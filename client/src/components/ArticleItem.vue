<script>
export default {
  props: {
    article: {
      type: Object,
    },
    selectArticle:{
      type: Function
    },
    setUpdateStatus:{
      type:Function
    },
    showArticle:{
      type:Function
    }
  },
  methods: {
    select(){
      this.selectArticle(this.article);
      this.setUpdateStatus(true);
    },
    show(){
      this.showArticle(this.article);
    }
  },
};
</script>

<template>
  <div class="article-item">
    <div class="d-flex justify-content-between align-items-end mt-2 px-2">
      <h4 class="m-0">{{ article.title }}</h4>
      <p class="m-0">
        {{ article.createdAt.slice(0, 10) + " " + article.createdAt.slice(11, 19) }}
      </p>
    </div>
    <hr class="my-2" />
    <p class="px-2">
      {{ article.content.substr(0, 150)
      }}<span v-if="article.content.length > 150">...</span>
    </p>
    <div class="d-flex justify-content-end">
      <router-link :to="'/article/' + article._id">
        <button type="button" class="btn btn-success btn-sm" @click="show">View</button>
      </router-link>
      <button type="button" class="btn btn-secondary btn-sm" @click="select">Edit</button>
      <!-- <button type="button" class="btn btn-danger btn-sm">Delete</button> -->
    </div>
  </div>
</template>

<style scoped>
.article-item {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.5);
  border-radius: 10px;
  padding: 10px;
  margin-bottom: 15px;
}

.btn {
  margin: 0 5px;
}
</style>
