<script>
import { mapState } from "vuex";
export default {
  name: "Modal",
  data() {
    return {
      articleData: {
        title: "",
        content: "",
        tags: "",
        alterText: "",
        imageUrl: "",
      },
      image: null,
      isImageVisible: false,
    };
  },
  props: {
    save: {
      type: Function,
    },
  },
  computed: mapState("article", ["isUpdate", "article"]),
  updated() {
    if (this.isUpdate) {
      this.articleData.title = this.article.title;
      this.articleData.content = this.article.content;
      this.articleData.tags = this.article.tags;
      this.articleData.imageUrl = this.article.imageUrl;
      this.articleData.alterText = this.article.alterText;
      this.isImageVisible = true;
    }
  },
  methods: {
    close() {
      this.$emit("close");
      this.image = null;
      this.isImageVisible = false;
      this.articleData.title = "";
      this.articleData.content = "";
      this.articleData.tags = "";
      this.articleData.alterText = "";
    },
    selectFile(e) {
      const file = e.target.files[0];
      let reader = new FileReader();

      reader.onload = function () {
        document.getElementById("imageView").src = reader.result;
      };

      reader.readAsDataURL(file);
      this.image = file;
      this.isImageVisible = true;
    },
    saveArticle() {
      this.save(this.articleData, this.image);
    },
  },
};
</script>

<template>
  <transition name="modal-fade">
    <div class="modal-backdrop">
      <div
        class="modal"
        role="dialog"
        aria-labelledby="modalTitle"
        aria-describedby="modalDescription"
      >
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <header class="modal-header" id="modalTitle">
              <slot name="header">Add Article</slot>
              <button
                type="button"
                class="btn-close"
                @click="close"
                aria-label="Close modal"
              >
                &times;
              </button>
            </header>

            <section class="modal-body" id="modalDescription">
              <slot name="body">
                <form class="text-start" @submit.prevent="saveArticle" novalidate>
                  <div class="form-group">
                    <label for="title">Title</label>
                    <input
                      type="text"
                      name="title"
                      id="title"
                      class="form-control"
                      v-model="articleData.title"
                    />
                  </div>
                  <div class="form-group">
                    <label for="content">Content</label>
                    <textarea
                      name="content"
                      id="content"
                      rows="4"
                      class="form-control"
                      v-model="articleData.content"
                    />
                  </div>
                  <div class="form-group">
                    <label for="tags">Tags</label>
                    <input
                      type="text"
                      name="tags"
                      id="tags"
                      class="form-control"
                      v-model="articleData.tags"
                    />
                  </div>
                  <p class="info">
                    Enter a comma-separated list. For example: Amsterdam, Mexico City,
                    "Cleveland, Ohio"
                  </p>
                  <div class="form-group">
                    <label for="image">Image</label>
                    <input
                      type="file"
                      name="image"
                      id="image"
                      class="form-control"
                      @change="selectFile"
                      v-if="!isImageVisible"
                    />
                    <label class="d-block">
                      <img
                        :src="this.articleData.imageUrl"
                        alt="image"
                        class="d-block"
                        v-if="isImageVisible"
                        id="imageView"
                      />
                      <input type="file" style="display: none" @change="selectFile" />
                    </label>
                  </div>
                  <div class="form-group" v-if="isImageVisible">
                    <label for="alterText">Alternative text</label>
                    <input
                      type="text"
                      name="alterText"
                      id="alterText"
                      class="form-control"
                      v-model="articleData.alterText"
                    />
                  </div>
                  <p class="info" v-if="isImageVisible">
                    Short description of the image used by screen readers and displayed
                    when the image is not loaded. This is important for accessibility.
                  </p>
                  <button type="submit" class="btn btn-success">Save</button>
                  <button type="button" class="btn btn-secondary ms-3" @click="close">
                    Cancel
                  </button>
                </form>
              </slot>
            </section>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<style>
.modal-backdrop {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.3);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal {
  box-shadow: 2px 2px 20px 1px;
  overflow-x: auto;
  display: flex;
  flex-direction: column;
}

.modal-header,
.modal-footer {
  padding: 15px;
  display: flex;
}

.modal-header {
  position: relative;
  border-bottom: 1px solid #eeeeee;
  color: #4aae9b;
  justify-content: space-between;
}

.modal-footer {
  border-top: 1px solid #eeeeee;
  flex-direction: column;
}

.modal-content {
  padding: 15px;
}

.modal-dialog {
  width: 70%;
  min-width: 350px;
  max-width: 700px;
}

.modal-body {
  position: relative;
  padding: 10px 10px;
}

.btn-close {
  position: absolute;
  top: 0;
  right: 0;
  border: none;
  font-size: 20px;
  padding: 10px;
  cursor: pointer;
  font-weight: bold;
  color: #4aae9b;
  background: transparent;
}

.btn-green {
  color: white;
  background: #4aae9b;
  border: 1px solid #4aae9b;
  border-radius: 2px;
}

.modal-fade-enter,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.5s ease;
}

.form-group {
  margin: 10px 0;
}

#title {
  width: 60%;
}

#tags {
  width: 75%;
}

#alterText {
  width: 75%;
}

#image {
  width: 50%;
}

#imageView {
  width: 100px;
  height: 100px;
}

.info {
  font-size: 14px;
  color: grey;
}
</style>
