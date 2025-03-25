<template>
    <div class="container">
      <!-- Üst Kısım -->
      <div class="card upper-section mb-4">
        <div class="card-body">
          <div class="row align-items-start">
            <div class="col-12 col-md-4 image-container">
              <img :src="imageUrl" alt="API'den gelen resim" class="responsive-image" />
            </div>
            <div class="col-12 col-md-8 info-container">
              <h5>Görsel Bilgileri</h5>
              <p class="text-xs font-weight-bold">
                Resim Adı: {{ imageName || 'Belirtilmemiş' }}
              </p>
              <h5>Değerlendirme Bilgileri</h5>
              <p class="text-xs font-weight-bold">
                Toplam Değerlendirme Sayısı: {{ totalReviews }}
              </p>
              <p class="text-xs font-weight-bold">
                Toplam Değerlendirme Puanı: {{ totalScore }}
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
              <div v-if="comments.length === 0" class="text-center text-xs font-weight-bold">
                Yorum bulunamadı
              </div>
              <div v-else class="comment" v-for="comment in comments" :key="comment.id">
                <p class="text-xs font-weight-bold mb-1">{{ comment.author }}</p>
                <p class="text-xxs">{{ comment.text }}</p>
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
                <li v-for="(person, index) in reviewers" :key="index" class="text-xs">
                  {{ index + 1 }}. {{ person }}
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
                <li v-for="(person, index) in pendingReviewers" :key="index" class="text-xs">
                  {{ index + 1 }}. {{ person }}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
export default {
  name: 'ReviewScreen',
  data() {
    return {
      // Sahte API Verileri
      imageUrl: 'https://cdnuploads.aa.com.tr/uploads/Contents/2025/03/10/thumbs_b_c_29ca0918a3c0f56e80df05cbd3ff3791.jpg',
      imageName: '', // Resim adı için alan (boşsa "Belirtilmemiş" yazacak)
      totalReviews: 42,
      totalScore: 4.7,
      comments: [
        { id: 1, author: 'Ahmet Yılmaz', text: 'Çok güzel bir ürün, kesinlikle tavsiye ederim!' },
        { id: 2, author: 'Ayşe Kaya', text: 'Fiyat performans açısından harika.' },
        { id: 3, author: 'Mehmet Demir', text: 'Teslimat biraz gecikti ama ürün iyi.' }
      ],
      reviewers: [
        'Ali Veli',
        'Zeynep Çelik',
        'Caner Öztürk',
        'Elif Şahin'
      ],
      pendingReviewers: [
        'Burak Güneş',
        'Selin Aksoy',
        'Ece Yılmaz',
        'Kaan Arslan'
      ]
    };
  }
};
</script>
<style scoped>
.container {
  width: 100%;
  max-width: 100%;
  margin: 0 auto;
  padding: 20px; /* Daha düzenli boşluk */
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden; /* Taşmayı önlemek için */
}

.card {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0; /* Hafif kenarlık */
  background-color: #fff;
}

.upper-section {
  flex: 0 0 auto; /* Sabit yükseklik yerine esnek */
  margin-bottom: 20px;
}

.lower-section {
  flex: 1; /* Kalan alanı kaplar */
  overflow-y: auto; /* İçerik taşarsa kaydırma */
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

/* Resim Düzeni */
.image-container {
  padding-right: 15px; /* Sağda boşluk */
}

.responsive-image {
  width: 100%; /* Konteynerin genişliğine uyum */
  max-height: 200px; /* Maksimum yükseklik sınırı */
  object-fit: cover; /* Taşmayı önler, resmi kırpar */
  border-radius: 6px;
  border: 1px solid #e2e8f0; /* Hafif kenarlık */
}

/* Bilgi Alanı */
.info-container {
  padding-left: 15px; /* Solda boşluk */
}

.info-container h5 {
  color: #1e3a8a;
  font-weight: 600;
  font-size: 1rem;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e2e8f0; /* Altına ince çizgi */
}

.info-container p {
  color: #475569;
  margin-bottom: 10px;
}

/* Yorumlar */
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

/* Listeler */
.lists-section .card {
  height: 48%; /* Daha nizami bölünme */
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

/* Yazı Boyutları */
.text-xs {
  font-size: 0.8rem;
}

.font-weight-bold {
  font-weight: 600;
}

.text-xxs {
  font-size: 0.75rem;
}

/* Responsive Tasarım */
@media (max-width: 768px) {
  .container {
    padding: 15px;
  }
  .upper-section {
    margin-bottom: 15px;
  }
  .image-container {
    padding-right: 0;
    margin-bottom: 15px; /* Resim aşağı kaydığında boşluk */
  }
  .info-container {
    padding-left: 0;
  }
  .responsive-image {
    max-height: 150px; /* Küçük ekranlarda daha az yer kaplar */
  }
  .comments-section, .lists-section {
    margin-bottom: 15px;
  }
  .lists-section .card {
    height: auto; /* Esnek yükseklik */
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
    max-height: 120px; /* Daha küçük ekranlar için */
  }
}
</style>