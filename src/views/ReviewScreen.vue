<template>
  <div class="container">
    <!-- Üst Kısım -->
    <div class="card upper-section mb-4">
      <div class="card-body">
        <div class="row align-items-start">
          <div class="col-12 col-md-4 image-container">
            <img
              :src="imageUrl || 'https://via.placeholder.com/200x200?text=Resim+Yok'"
              alt="API'den gelen resim"
              class="responsive-image"
            />
          </div>
          <div class="col-12 col-md-8 info-container">
            <h5>Görsel Bilgileri</h5>
            <p class="text-xs font-weight-bold">
              Resim Adı: {{ imageName || "Belirtilmemiş" }}
            </p>
            <h5>Değerlendirme Bilgileri</h5>
            <p class="text-xs font-weight-bold">
              Toplam Değerlendirme Sayısı: {{ totalReviews || 0 }}
            </p>
            <p class="text-xs font-weight-bold">
              Toplam Değerlendirme Puanı: {{ totalScore || 0 }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Alt Kısım -->
    <div class="row lower-section">
      <!-- Yorumlar -->
      <div class="col-12 col-md-6 comments-section mb-4">
        <div class="card">
          <div class="card-header">
            <h5>Yorumlar ({{ comments.length }})</h5>
          </div>
          <div class="card-body">
            <div
              v-if="comments.length === 0"
              class="text-center text-xs font-weight-bold"
            >
              Yorum bulunamadı
            </div>
            <div
              v-else
              class="comment"
              v-for="comment in comments"
              :key="comment.id"
            >
              <p class="text-xs font-weight-bold mb-1">
                {{ comment.author || "Bilinmeyen Yazar" }}
              </p>
              <p class="text-xxs">{{ comment.text || "Yorum yok" }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Değerlendirme Listeleri -->
      <div class="col-12 col-md-6 lists-section">
        <div class="card mb-4">
          <div class="card-header">
            <h5>Değerlendirme Yapanlar ({{ reviewers.length }})</h5>
          </div>
          <div class="card-body">
            <ul>
              <li
                v-for="(person, index) in reviewers"
                :key="index"
                class="text-xs"
              >
                {{ index + 1 }}. {{ person || "Bilinmeyen Kişi" }}
              </li>
            </ul>
          </div>
        </div>
        <div class="card">
          <div class="card-header">
            <h5>Değerlendirme Beklenenler ({{ pendingReviewers.length }})</h5>
          </div>
          <div class="card-body">
            <ul>
              <li
                v-for="(person, index) in pendingReviewers"
                :key="index"
                class="text-xs"
              >
                {{ index + 1 }}. {{ person || "Bilinmeyen Kişi" }}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "ReviewScreen",
  computed: {
    surveyId() {
      return this.$route.params.surveyId;
    },
    photoId() {
      return this.$route.params.photoId;
    },
  },
  data() {
    return {
      imageUrl: "",
      imageName: "",
      totalReviews: 0,
      totalScore: 0,
      comments: [],
      reviewers: [],
      pendingReviewers: [],
    };
  },
  async mounted() {
    await this.fetchReviewData();
  },
  methods: {
    async fetchReviewData() {
      try {
        const token = localStorage.getItem("token");

        const response = await axios.get(
          `https://localhost:7263/api/Survey/review-screen/${this.surveyId}/${this.photoId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`, // Token'ı header'a ekliyoruz
            },
          }
        );

        // API'den gelen veriyi kontrol ederek data'ya yerleştiriyoruz
        const data = response.data || {};
        this.imageUrl = data.imageInfo?.imageUrl || "";
        this.imageName = data.imageInfo?.imageName || "";
        this.totalReviews = data.reviewSummary?.totalReviews ?? 0; // null veya undefined ise 0
        this.totalScore = data.reviewSummary?.totalScore ?? 0; // null veya undefined ise 0
        this.comments = data.comments || [];
        this.reviewers = data.reviewers?.reviewers || [];
        this.pendingReviewers = data.reviewers?.pendingReviewers || [];
      } catch (error) {
        console.error("API isteği sırasında hata oluştu:", error);
        alert("Veriler yüklenirken bir hata oluştu.");
      }
    },
  },
};
</script>

<style scoped>
/* Mevcut stil kodlarınız aynen kalabilir, değişiklik gerekmiyor */
.container {
  width: 100%;
  max-width: 100%;
  margin: 0 auto;
  padding: 20px;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.card {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  background-color: #fff;
}

.upper-section {
  flex: 0 0 auto;
  margin-bottom: 20px;
}

.lower-section {
  flex: 1;
  overflow-y: auto;
}

.card-header {
  background-color: #f8fafc;
  padding: 12px 15px;
  border-bottom: 1px solid #e2e8f0;
  border-radius: 12px 12px 0 0;
  text-align: left;
}

.card-header h5 {
  margin: 0;
  color: #1e3a8a;
  font-weight: 600;
  font-size: 1rem;
}

.card-body {
  padding: 15px;
}

.image-container {
  padding-right: 15px;
}

.responsive-image {
  width: 100%;
  max-height: 200px;
  object-fit: cover;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
}

.info-container {
  padding-left: 15px;
}

.info-container h5 {
  color: #1e3a8a;
  font-weight: 600;
  font-size: 1rem;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e2e8f0;
}

.info-container p {
  color: #475569;
  margin-bottom: 10px;
}

.comments-section .card {
  height: 100%;
}

.comment {
  padding: 10px 0;
  border-bottom: 1px solid #edf2f7;
}

.comment:last-child {
  border-bottom: none;
}

.comment p {
  margin: 0;
  color: #475569;
}

.lists-section .card {
  height: 48%;
  margin-bottom: 15px;
}

.lists-section ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.lists-section li {
  padding: 8px 0;
  color: #475569;
  border-bottom: 1px solid #edf2f7;
}

.lists-section li:last-child {
  border-bottom: none;
}

.text-xs {
  font-size: 0.8rem;
}

.font-weight-bold {
  font-weight: 600;
}

.text-xxs {
  font-size: 0.75rem;
}

@media (max-width: 768px) {
  .container {
    padding: 15px;
  }
  .upper-section {
    margin-bottom: 15px;
  }
  .image-container {
    padding-right: 0;
    margin-bottom: 15px;
  }
  .info-container {
    padding-left: 0;
  }
  .responsive-image {
    max-height: 150px;
  }
  .comments-section,
  .lists-section {
    margin-bottom: 15px;
  }
  .lists-section .card {
    height: auto;
  }
  .card-header h5 {
    font-size: 0.9rem;
  }
  .info-container h5 {
    font-size: 0.9rem;
  }
  .text-xs {
    font-size: 0.75rem;
  }
  .text-xxs {
    font-size: 0.7rem;
  }
}

@media (max-width: 576px) {
  .card-header {
    padding: 10px 12px;
  }
  .card-body {
    padding: 12px;
  }
  .comment {
    padding: 8px 0;
  }
  .lists-section li {
    padding: 6px 0;
  }
  .responsive-image {
    max-height: 120px;
  }
}
</style>