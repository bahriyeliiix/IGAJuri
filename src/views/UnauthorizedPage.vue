<template>
    <div class="unauthorized-container">
      <div class="error-card">
        <i class="bi bi-shield-lock fs-1 text-danger"></i>
        <h1>401 - Yetkisiz Erişim</h1>
        <p>Bu sayfayı görüntülemek için yetkiniz yok veya oturum açmanız gerekiyor.</p>
        <button @click="redirectToLogin" class="btn btn-primary">
          <i class="bi bi-box-arrow-in-right me-2"></i>
          Giriş Yap
        </button>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    methods: {
      redirectToLogin() {
        localStorage.clear(); // Token ve diğer verileri temizle
        this.$router.push('/signin');
      }
    }
  }
  </script>
  
  <style scoped>
  .unauthorized-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background-color: #f8f9fa;
  }
  
  .error-card {
    text-align: center;
    padding: 2rem;
    border-radius: 12px;
    background: white;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    max-width: 500px;
    width: 90%;
  }
  
  h1 {
    color: #dc3545;
    margin: 1rem 0;
  }
  
  .btn {
    margin-top: 1.5rem;
  }
  </style>