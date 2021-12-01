<script>
import {mapState} from 'vuex';

export default {
  data() {
    return {
      articleData:{
        title:'',
        content:'',
        imageUrl:'',
        alterText:'',
        createdAt:'',
        creator:'',
        tags:[]
      }
    }
  },
  computed: mapState('article',['article']),
  beforeCreate() {
    // console.log(this.$route.params.articleId)
    this.$store.dispatch('article/getArticle',this.$route.params.articleId);
  },
  beforeUnmount() {
    this.$store.commit('article/setArticle',{});
  },
  mounted() {
    // console.log(this.article)
    this.articleData.title=this.article.title;
    this.articleData.content=this.article.content;
    this.articleData.imageUrl=this.article.imageUrl;
    this.articleData.alterText=this.article.alterText;
    this.articleData.createdAt=this.article.createdAt;
    this.articleData.creator=this.article.creator.name;

    if(this.article.tags){
      this.articleData.tags=this.article.tags.split(',');
    }
  }
};
</script>

<template>
  <div class="d-flex article-view">
    <div class="container">
      <h2>{{ articleData.title }}</h2>
      <p>
        Submitted by {{ articleData.creator }} on
        {{ articleData.createdAt.slice(0, 10) + " " + articleData.createdAt.slice(11, 19) }}
      </p>
      <hr />
      <div class="d-flex justify-content-start">
        <img :src="articleData.imageUrl" alt="image" class="image" />
        <span class="text-start ms-3">{{ articleData.content }}</span>
      </div>
      <hr />
      <p>Tags:
        <span class="tag" v-for="(tag, key) in this.articleData.tags" :key="key">
          {{" "+tag}}
        </span>
      </p>
      <router-link to="/article">
        <button type="button" class="btn btn-secondary">Back</button>
      </router-link>
    </div>
  </div>
</template>

<style scoped>
.article-view {
  margin-top: 80px;
}

.image{
  width: 25%;
  height: auto;
}

.tag:hover {
  text-decoration: 1px underline blue;
  cursor: pointer;
  color: blue;

}
</style>
