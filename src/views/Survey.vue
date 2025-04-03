<template>
  <div>
    <div class="user-stats">
      <span class="username">{{ surveyName }} | {{ username }}</span>
      <span class="rating-stats">
        Oylanan Resim: {{ ratedImagesCount }}/{{ totalImagesCount }}
      </span>
    </div>

    <div class="image-grid">
      <div
        v-for="item in images"
        :key="item.id"
        class="card"
        :class="{
          'no-rating-border': item.rating === 0,
          'has-rating-border': item.rating > 0,
        }"
      >
        <span class="image-id">{{ item.guid }}</span>
        <div class="image-container" @click="openImageModal(item)">
          <img :src="item.imageUrl" alt="Random Image" />
        </div>
        <button
          :class="item.isCommentExist ? 'view-comment-btn' : 'comment-btn'"
          @click="openCommentModal(item)"
        >
          {{ item.isCommentExist ? "Yorumunu Gör" : "Yorum Yap" }}
        </button>
        <div
          class="rating"
          :class="{
            'no-rating': item.rating === 0,
            'has-rating': item.rating > 0,
          }"
        >
          <span
            v-for="star in 5"
            :key="star"
            class="star"
            :class="{ filled: star <= item.rating }"
            @click="rateImage(item.id, star)"
          >
            ★
          </span>
        </div>
      </div>
    </div>

    <!-- Yorum Modalı -->
    <div v-if="showCommentModal" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h3>{{ modalTitle }}</h3>
          <button class="close-btn" @click="closeCommentModal">×</button>
        </div>
        <div class="modal-body">
          <textarea
            v-if="!isViewMode"
            v-model="newComment"
            placeholder="Yorumunuzu buraya yazın..."
            rows="5"
          ></textarea>
          <div v-else class="existing-comment" @dblclick="enableEditMode">
            <p>{{ currentCommentItem.comment }}</p>
          </div>
        </div>
        <div class="modal-footer">
          <button v-if="!isViewMode" class="save-btn" @click="saveComment">
            Kaydet
          </button>
          <button class="cancel-btn" @click="closeCommentModal">Kapat</button>
        </div>
      </div>
    </div>

    <!-- Resim Modalı -->
    <div v-if="showImageModal" class="modal-overlay">
      <div class="image-modal-content">
        <div class="modal-header">
          <h3>Resim Önizleme</h3>
          <button class="close-btn" @click="closeImageModal">×</button>
        </div>
        <div class="modal-body">
          <img :src="currentImageUrl" alt="Full Size Image" class="full-image" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "Survey",
  data() {
    return {
      images: [],
      surveyName: "",
      username: "",
      showCommentModal: false,
      currentCommentItem: null,
      x: null,
      newComment: "",
      isViewMode: false,
      isEditing: false,
      showImageModal: false,
      currentImageUrl: null,
    };
  },
  computed: {
    modalTitle() {
      if (this.isEditing) return "Yorumu Düzenle";
      if (this.isViewMode) return "Yorumunuz";
      return "Yorum Ekle";
    },
    surveyId() {
      return this.$route.params.id;
    },
    userId() {
      return this.$route.params.userId;
    },
    ratedImagesCount() {
      return this.images.filter((img) => img.rating > 0).length;
    },
    totalImagesCount() {
      return this.images.length;
    },
  },
  mounted() {
    this.fetchImages();
  },
  methods: {
    async fetchImages() {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("Token bulunamadı!");
          return;
        }
        const url = `https://localhost:7263/api/Survey/GetSurvey/${this.surveyId}/${this.userId}`;
        const response = await axios.get(url, {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("Response:", response.data);

        this.surveyName = response.data.data.surveyName;
        this.username = response.data.data.username;

        this.images = response.data.data.listItem.map((item) => ({
          id: item.id,
          guid: item.guid,
          imageUrl: `https://localhost:7263/img/${item.imageUrl}`,
          rating: item.rating || 0,
          isCommentExist: item.isCommentExist || false,
          comment: item.comment || null,
          orderNumber: item.orderNumber,
        }));

        this.images.forEach((item, index) => {
          console.log(`Item ${index + 1}:`, {
            id: item.id,
            guid: item.guid,
            imageUrl: item.imageUrl,
            rating: item.rating,
            isCommentExist: item.isCommentExist,
            comment: item.comment,
            orderNumber: item.orderNumber,
          });
        });
      } catch (error) {
        console.error("Resimler yüklenirken hata oluştu:", error);
        if (error.response) {
          console.error("Hata yanıtı:", error.response.data);
          console.error("Hata kodu:", error.response.status);
        }
      }
    },
    async rateImage(photoId, rating) {
      const image = this.images.find((img) => img.id === photoId);
      if (image) {
        image.rating = rating;
        await this.saveVote(image);
      }
    },
    openCommentModal(item) {
      this.currentCommentItem = item;
      this.newComment = item.comment || "";
      this.isViewMode = item.isCommentExist;
      this.isEditing = false;
      this.showCommentModal = true;
    },
    enableEditMode() {
      this.isViewMode = false;
      this.isEditing = true;
      this.newComment = this.currentCommentItem.comment;
    },
    async saveComment() {
      if (!this.currentCommentItem) return;

      this.currentCommentItem.comment = this.newComment;
      this.currentCommentItem.isCommentExist = true;

      await this.saveVote(this.currentCommentItem);

      this.isViewMode = true;
      this.isEditing = false;
    },
    closeCommentModal() {
      this.showCommentModal = false;
      this.currentCommentItem = null;
      this.newComment = "";
      this.isViewMode = false;
      this.isEditing = false;
    },
    async saveVote(item) {
      try {
        const voteData = {
          id: 0,
          surveyId: parseInt(this.surveyId),
          photoId: item.id,
          userId: parseInt(this.userId),
          voteCount: item.rating,
          comment: item.comment || null,
        };

        const token = localStorage.getItem("token");
        if (!token) {
          console.error("Token bulunamadı!");
          return;
        }

        const response = await axios.post(
          "https://localhost:7263/api/Vote/CreateOrEditVote",
          voteData,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        this.x = response.data;
      } catch (error) {
        console.error("Veri gönderilirken hata oluştu:", error);
        if (error.response) {
          console.error("Hata yanıtı:", error.response.data);
          console.error("Hata kodu:", error.response.status);
        }
      }
    },
    openImageModal(item) {
      this.currentImageUrl = item.imageUrl;
      this.showImageModal = true;
    },
    closeImageModal() {
      this.showImageModal = false;
      this.currentImageUrl = null;
    },
  },
};
</script>

<style scoped>
.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

@media (min-width: 1200px) {
  .image-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

.card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 15px;
  border-radius: 8px;
  background-color: #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.existing-comment {
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 4px;
  border-left: 4px solid #28a745;
  cursor: pointer;
}

.existing-comment:hover {
  background-color: #f1f1f1;
}

.no-rating-border {
  border: 2px solid rgba(255, 0, 0, 0.3);
}

.has-rating-border {
  border: 2px solid rgba(0, 255, 0, 0.3);
}

.image-id {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
  word-break: break-all;
  text-align: center;
}

.image-container {
  width: 100%;
  margin-bottom: 10px;
  cursor: pointer;
}

.card img {
  width: 100%;
  height: 200px;
  object-fit: contain;
  border-radius: 6px;
  display: block;
}

.comment-btn,
.view-comment-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  margin-bottom: 10px;
}

.comment-btn {
  background-color: #007bff;
  color: #ffffff;
}

.comment-btn:hover {
  background-color: #0056b3;
}

.view-comment-btn {
  background-color: #28a745;
  color: #ffffff;
}

.view-comment-btn:hover {
  background-color: #218838;
}

.rating {
  display: flex;
  justify-content: center;
  padding: 5px;
  border-radius: 4px;
}

.no-rating {
  background-color: rgba(255, 0, 0, 0.1);
}

.has-rating {
  background-color: rgba(0, 255, 0, 0.1);
}

.star {
  font-size: 26px;
  color: #d0d0d0;
  cursor: pointer;
  margin: 0 4px;
  transition: color 0.2s ease;
}

.star.filled {
  color: #ffd700;
}

.star:hover {
  color: #ffcc00;
}

.user-stats {
  max-width: 1400px;
  margin: 20px auto;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.username {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.rating-stats {
  font-size: 16px;
  color: #666;
}

/* Modal stilleri */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.modal-header {
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
}

.modal-body {
  padding: 20px;
}

textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: vertical;
  font-family: inherit;
}

.existing-comment {
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 4px;
  border-left: 4px solid #28a745;
}

.modal-footer {
  padding: 15px 20px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.save-btn {
  padding: 8px 16px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.save-btn:hover {
  background-color: #218838;
}

.cancel-btn {
  padding: 8px 16px;
  background-color: #6c757d;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.cancel-btn:hover {
  background-color: #5a6268;
}

/* Image Modal Styles */
.image-modal-content {
  background-color: white;
  border-radius: 8px;
  width: 90%;
  max-width: 90vw;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.image-modal-content .modal-header {
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.image-modal-content .modal-header h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.image-modal-content .modal-body {
  padding: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  max-height: calc(90vh - 70px);
  overflow: auto;
}

.full-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}
</style>