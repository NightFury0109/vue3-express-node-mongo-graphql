<script>
import {mapState} from 'vuex';

export default {
  computed: mapState('article',['article']),
  beforeCreate() {
    this.$store.dispatch('article/getArticle',this.$route.params.articleId);
  },
};
</script>

<template>
  <div class="d-flex article-view">
    <div class="container">
      <h2>{{ article.title }}</h2>
      <p>
        Submitted by {{ article.creator.name }} on
        {{ article.createdAt.slice(0, 10) + " " + article.createdAt.slice(11, 19) }}
      </p>
      <hr />
      <div class="d-flex justify-content-start">
        <img :src="article.imageUrl" alt="image" style="width:150px,height:150px" />
        <span class="text-start ms-3">{{ article.content }}</span>
      </div>
      <hr />
      <router-link to="/article">
        <Button type="button" class="btn btn-secondary">Back</Button>
      </router-link>
    </div>
  </div>
</template>

<style scoped>
.article-view {
  margin-top: 80px;
}
</style>
