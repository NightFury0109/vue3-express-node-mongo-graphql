<template>
  <div class="d-flex">
    <div class="container-fluid text-start article">
      <div class="row gx-4 d-flex">
        <div class="col-4 px-4">
          <div class="form-group">
            <label for="search" class="mb-2">Search</label>
            <hr class="mt-0 mb-2" />
            <input
              type="search"
              name="search"
              id="search"
              class="form-control form-control-sm mb-3"
              v-model="search_key"
              @input="search"
            />
          </div>
          <button type="button" class="btn btn-primary" @click="showModal">
            Add Article
          </button>
        </div>
        <div class="col-8 pe-4 mt-4">
          <div v-for="(article, key) in articles" :key="key">
            <ArticleItem
              v-bind:article="article"
              :selectArticle="editArticle"
              :setUpdateStatus="setUpdateStatus"
              :showArticle="showArticle"
            />
          </div>
        </div>
      </div>
    </div>
    <Modal v-show="isModalVisible" @close="closeModal" :save="saveArticle" />
  </div>
</template>

<script>
import { mapState, mapActions, mapMutations } from "vuex";

import Modal from "../components/Modal.vue";
import ArticleItem from "../components/ArticleItem.vue";

export default {
  data() {
    return {
      search_key: "",
    };
  },
  components: {
    Modal,
    ArticleItem,
  },
  mounted() {
    this.$store.dispatch("article/getArticles");
  },
  computed: mapState("article", [
    "isUpdate",
    "articles",
    "articles2",
    "oldPath",
    "isModalVisible",
  ]),
  methods: {
    ...mapActions("article", ["addAndUpdateArticle","getArticles"]),
    ...mapMutations("article", [
      "setArticle",
      "changeUpdateStatus",
      "setArticleId",
      "setOldPath",
      "setImageVisible",
      "setError",
      "setModalVisible",
      "setArticles"
    ]),
    showModal() {
      this.setModalVisible(true);
    },
    closeModal() {
      this.setModalVisible(false);
      this.setImageVisible(false);
      this.setArticle({});
      this.setError("");
    },
    saveArticle(article, image) {
      if (!image && !this.isUpdate) {
        this.setError("Select image");
      } else {
        const formData = new FormData();

        formData.append("image", image);

        if (this.isUpdate) {
          formData.append("oldPath", this.oldPath);
        }

        this.addAndUpdateArticle({
          formData: formData,
          articleData: article,
        });
      }
    },
    editArticle(article) {
      this.setArticle(article);

      this.setArticleId(article._id);
      this.setOldPath(article.imageUrl);
      this.setImageVisible(true);
      this.setModalVisible(true);
    },
    showArticle(article) {
      this.setArticle(article);
    },
    setUpdateStatus(status) {
      this.changeUpdateStatus(status);
    },
    search() {
      console.log('search')
      if (this.search_key) {
        const search_result = this.articles2.filter((article) => {
          return article.title.toLowerCase().search(this.search_key) !== -1;
        });

        this.setArticles(search_result);
      } else {
        this.getArticles();
      }
    },
  },
};
</script>

<style scoped>
.article {
  margin-top: 90px;
}
</style>
