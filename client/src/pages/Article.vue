<template>
  <div class="d-flex">
    <div class="container-fluid text-start article">
      <div class="row gx-4 d-flex">
        <div class="col-3">
          <div class="form-group">
            <label for="search" class="mb-2">Search</label>
            <hr class="mt-0 mb-2" />
            <input
              type="search"
              name="search"
              id="search"
              class="form-control form-control-sm mb-3"
            />
          </div>
          <button type="button" class="btn btn-primary" @click="showModal">
            Add Article
          </button>
        </div>
        <div class="col-9">
          <p>asdfdsaf</p>
        </div>
      </div>
    </div>
    <Modal v-show="isModalVisible" @close="closeModal" :save="saveArticle" />
  </div>
</template>

<script>
import { mapState, mapActions } from "vuex";
import Modal from "../components/Modal.vue";
export default {
  data() {
    return {
      isModalVisible: false,
    };
  },
  components: {
    Modal,
  },
  computed: mapState("article", ["isUpdate", "article", "oldPath"]),
  methods: {
    ...mapActions("article", ["addAndUpdateArticle"]),
    showModal() {
      this.isModalVisible = true;
    },
    closeModal() {
      this.isModalVisible = false;
    },
    saveArticle(article, image) {
      const formData = new FormData();

      formData.append("image", image);

      if (this.isUpdate) {
        formData.append("oldPath", this.oldPath);
      }

      this.addAndUpdateArticle({
        formData:formData,
        articleData:article
      });
    },
  },
};
</script>

<style scoped>
.article {
  margin-top: 90px;
}
</style>
