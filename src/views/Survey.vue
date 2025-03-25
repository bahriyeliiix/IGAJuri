<template>
    <div>
    <div class="user-stats">
      <span class="username">Kullanici123</span>
      <span class="rating-stats">
        Oylanan Resim: {{ ratedImagesCount }}/{{ totalImagesCount }}
      </span>
    </div>

    <div class="image-grid">
      <div v-for="item in images" :key="item.id" class="card" :class="{
        'no-rating-border': item.rating === 0,
        'has-rating-border': item.rating > 0
      }">
        <span class="image-id">{{ item.id }}</span>
        <a :href="item.imageUrl" target="_blank" class="image-container">
          <img :src="item.imageUrl" alt="Random Image" />
        </a>
        <button
          :class="item.isCommentExist ? 'view-comment-btn' : 'comment-btn'"
          @click="handleComment(item)"
        >
          {{ item.isCommentExist ? 'Yorumunu Gör' : 'Yorum Yap' }}
        </button>
        <div
          class="rating"
          :class="{ 'no-rating': item.rating === 0, 'has-rating': item.rating > 0 }"
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
    </div>
  </template>
  
  <script>
import axios from 'axios'

export default {
  name: 'ImageGrid',
  data() {
    return {
      images: [],
    }
  },
  computed: {
    // Oylanan resim sayısını hesapla
    ratedImagesCount() {
      return this.images.filter(img => img.rating > 0).length
    },
    // Toplam resim sayısını hesapla
    totalImagesCount() {
      return this.images.length
    }
  },
  mounted() {
    this.fetchImages()
  },
  methods: {
    async fetchImages() {
      try {
        const response = await axios.get('https://localhost:7263/WeatherForecast/random')
        this.images = response.data.map((item) => ({
          ...item,
          rating: item.rating || 0,
          isCommentExist: item.isCommentExist || false,
        }))
      } catch (error) {
        console.error('Resimler yüklenirken hata oluştu:', error)
      }
    },
    async rateImage(imageId, rating) {
      const image = this.images.find((img) => img.id === imageId)
      if (image) {
        image.rating = rating
        try {
          await axios.post('https://localhost:7263/WeatherForecast/sendVote', {
            imageId,
            rating,
          })
          console.log(`Puan gönderildi: ${imageId} - ${rating}`)
        } catch (error) {
          console.error('Puan gönderilirken hata oluştu:', error)
        }
      }
    },
    handleComment(item) {
      console.log(
        item.isCommentExist ? `Viewing comment for ${item.id}` : `Adding comment for ${item.id}`,
      )
    },
  },
}
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
  
  /* Border classes for rating status */
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
  }
  
  .card img {
    width: 100%;
    height: 200px;
    object-fit: contain; /* Changed from cover to contain */
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
  /* Yeni eklenen stil */
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
  </style>