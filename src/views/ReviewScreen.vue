<template>
  <div class="container">
    <!-- Üst Kısım -->
    <div class="row upper-section">
      <!-- Sol Üst Resim -->
      <div class="col-12 col-md-6 col-lg-5 left-image mb-3">
        <div class="card">
          <div class="card-body">
            <img
              :src="
                imageUrl || 'https://via.placeholder.com/400x500?text=Resim+Yok'
              "
              alt="API'den gelen resim"
              class="responsive-image"
            />
          </div>
        </div>
      </div>

      <!-- Sağ Üst Bilgiler -->
      <div class="col-12 col-md-6 col-lg-7 right-info mb-3">
        <div class="card">
          <div class="card-body">
            <div class="row info-boxes">
              <div class="col-12 col-sm-4 mb-2">
                <div class="info-box">
                  <h6>Resim Adı</h6>
                  <p class="text-xs font-weight-bold">
                    {{ originalImageName || "Belirtilmemiş" }}
                  </p>
                </div>
              </div>
              <div class="col-12 col-sm-4 mb-2">
                <div class="info-box">
                  <h6>Toplam Değerlendirme Sayısı</h6>
                  <p class="text-xs font-weight-bold">
                    {{ totalReviews || 0 }}
                  </p>
                </div>
              </div>
              <div class="col-12 col-sm-4 mb-2">
                <div class="info-box">
                  <h6>Toplam Değerlendirme Puanı</h6>
                  <p class="text-xs font-weight-bold">
                    {{ totalScore || 0 }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Alt Kısım -->
    <div class="row lower-section">
      <!-- Değerlendirme Yapanlar -->
      <div class="col-12 col-md-6 col-lg-4 mb-3">
        <div class="card">
          <div class="card-header">
            <h5>Değerlendirme Yapanlar ({{ reviewers.length }})</h5>
          </div>
          <div class="card-body scrollable">
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
      </div>

      <!-- Değerlendirme Beklenenler -->
      <div class="col-12 col-md-6 col-lg-4 mb-3">
        <div class="card">
          <div class="card-header">
            <h5>Değerlendirme Beklenenler ({{ pendingReviewers.length }})</h5>
          </div>
          <div class="card-body scrollable">
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

      <!-- Yorumlar -->
      <div class="col-12 col-md-12 col-lg-4 mb-3">
        <div class="card">
          <div class="card-header">
            <h5>Yorumlar ({{ comments.length }})</h5>
          </div>
          <div class="card-body scrollable">
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
      originalImageName: "",
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
          `https://scorezone.igairport.aero:7263/api/Survey/review-screen/${this.surveyId}/${this.photoId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`, // Token'ı header'a ekliyoruz
            },
          }
        );

        // API'den gelen veriyi kontrol ederek data'ya yerleştiriyoruz
        const data = response.data.data || {};

        this.imageUrl =
          `https://scorezone.igairport.aero:7263/img/${data.imageInfo?.imageUrl}` ||
          "";
        this.imageName = data.imageInfo?.imageName || "";
        this.originalImageName = data.imageInfo?.originalImageName || "";
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

.upper-section {
  flex: 0 0 auto;
  margin-bottom: 20px;
}

.left-image .responsive-image {
  width: 100%;
  height: auto; /* Resim kırpılmadan orijinal oranında gösterilecek */
  max-height: 400px; /* Resim divi bir tık büyük */
  object-fit: contain; /* Resim kırpılmadan div içinde yer alır */
  border-radius: 6px;
  border: 1px solid #e2e8f0;
}

.right-info .card-body {
  padding: 15px;
}

.info-boxes {
  display: flex;
  flex-wrap: wrap;
  gap: 15px; /* Kareler arasında boşluk */
}

.info-box {
  background-color: #f8fafc;
  padding: 15px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  text-align: center;
  flex: 1;
  min-width: 0; /* Flex içinde taşmayı önler */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.info-box h6 {
  color: #1e3a8a;
  font-weight: 600;
  font-size: 0.9rem;
  margin-bottom: 10px;
}

.info-box p {
  color: #475569;
  margin: 0;
  word-wrap: break-word; /* Uzun metinler için kırılma */
}

.lower-section {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-wrap: wrap;
}

.card {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  background-color: #fff;
  height: 100%;
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

.scrollable {
  max-height: 250px; /* Liste ve yorumlar için kaydırma alanı */
  overflow-y: auto;
}

.comment {
  padding: 10px 0;
  border-bottom: 1px solid #edf2f7;
}

.comment:last-child {
  border-bottom: none;
}

ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

li {
  padding: 8px 0;
  color: #475569;
  border-bottom: 1px solid #edf2f7;
}

li:last-child {
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

@media (max-width: 1200px) {
  .left-image {
    flex: 0 0 50%;
    max-width: 50%;
  }
  .right-info {
    flex: 0 0 50%;
    max-width: 50%;
  }
}

@media (max-width: 992px) {
  .left-image {
    flex: 0 0 100%;
    max-width: 100%;
  }
  .right-info {
    flex: 0 0 100%;
    max-width: 100%;
  }
  .info-box {
    flex: 0 0 calc(33.33% - 10px); /* 3 kare yan yana */
  }
  .lower-section > div {
    flex: 0 0 50%;
    max-width: 50%;
  }
  .scrollable {
    max-height: 200px;
  }
}

@media (max-width: 768px) {
  .lower-section > div {
    flex: 0 0 100%;
    max-width: 100%;
  }
  .left-image .responsive-image {
    max-height: 350px;
  }
  .info-box {
    flex: 0 0 calc(50% - 7.5px); /* 2 kare yan yana */
  }
  .scrollable {
    max-height: 150px;
  }
}

@media (max-width: 576px) {
  .container {
    padding: 10px;
  }
  .left-image .responsive-image {
    max-height: 300px;
  }
  .info-box {
    flex: 0 0 100%; /* 1 kare tam genişlik */
  }
  .info-box h6 {
    font-size: 0.85rem;
  }
  .scrollable {
    max-height: 120px;
  }
  .card-header h5 {
    font-size: 0.9rem;
  }
  .text-xs {
    font-size: 0.75rem;
  }
  .text-xxs {
    font-size: 0.7rem;
  }
}
</style>
