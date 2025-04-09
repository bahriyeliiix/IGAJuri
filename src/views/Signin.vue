<script setup>
import { ref, onBeforeMount, onBeforeUnmount } from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import ArgonInput from "@/components/ArgonInput.vue";
import ArgonButton from "@/components/ArgonButton.vue";
import axios from "axios";

const body = document.getElementsByTagName("body")[0];
const store = useStore();
const router = useRouter();

const email = ref("");
const password = ref("");
const isLoading = ref(false);
const errorMessage = ref("");
const successMessage = ref("");

onBeforeMount(() => {
  store.state.hideConfigButton = true;
  store.state.showNavbar = false;
  store.state.showSidenav = false;
  store.state.showFooter = false;
  body.classList.remove("bg-gray-100");

  const script = document.createElement("script");
  script.src = "https://accounts.google.com/gsi/client";
  script.async = true;
  script.defer = true;
  document.body.appendChild(script);
});

onBeforeUnmount(() => {
  store.state.hideConfigButton = false;
  store.state.showNavbar = true;
  store.state.showSidenav = true;
  store.state.showFooter = true;
  body.classList.add("bg-gray-100");
});

const login = async () => {
  try {
    isLoading.value = true;
    errorMessage.value = "";
    successMessage.value = "";

    const response = await axios.post("https://scorezone.igairport.aero:7263/api/Auth/login", {
      email: email.value,
      password: password.value,
    });

    const token = response.data.token.access_token;
    const role = response.data.token.role;
    const userId = response.data.token.userId;

    store.dispatch("saveToken", token);
    localStorage.setItem("authToken", token);
    store.dispatch("role", role);
    localStorage.setItem("role", role);
    store.dispatch("userId", userId);
    localStorage.setItem("userId", userId);

    successMessage.value = "Hoş geldin! Giriş yapılıyor...";
    setTimeout(() => {
      router.push({ name: "ANKETLER" });
    }, 1500);

  } catch (error) {
    // Use the specific error message from the API if available
    errorMessage.value = error.response?.data || "Bir hata oluştu, lütfen tekrar deneyin.";
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <main class="mt-0 main-content">
    <section>
      <div class="page-header min-vh-100">
        <div class="container">
          <div class="row align-items-center">
            <div class="col-xl-4 col-lg-5 col-md-7 ps-4">
              <div class="card card-plain login-card">
                <div class="card-header pb-0 text-start">
                  <h4 class="font-weight-bolder mb-2">Merhaba! 👋</h4>
                  <p class="mb-0 text-muted">Bilgilerini girerek giriş yap</p>
                </div>
                <div class="card-body p-4">
                  <form role="form" @submit.prevent="login">
                    <div class="mb-3">
                      <argon-input
                        id="email"
                        type="email"
                        placeholder="Email adresin"
                        name="email"
                        size="lg"
                        v-model="email"
                        class="soft-input"
                      />
                    </div>
                    <div class="mb-3">
                      <argon-input
                        id="password"
                        type="password"
                        placeholder="Şifren"
                        name="password"
                        size="lg"
                        v-model="password"
                        class="soft-input"
                      />
                    </div>

                    <!-- Success Message -->
                    <transition name="fade">
                      <div v-if="successMessage" class="alert alert-success">
                        <span>{{ successMessage }}</span>
                        <div class="small-spinner mt-2"></div>
                      </div>
                    </transition>

                    <!-- Error Message -->
                    <transition name="fade">
                      <div v-if="errorMessage" class="alert alert-danger">
                        {{ errorMessage }}
                      </div>
                    </transition>

                    <div>
                      <argon-button
                        class="mt-4 cute-button"
                        variant="gradient"
                        color="success"
                        full-width
                        size="lg"
                        type="submit"
                        :disabled="isLoading"
                      >
                        <span v-if="isLoading">
                          <i class="fas fa-heart fa-beat mr-2"></i> Bekle biraz...
                        </span>
                        <span v-else>
                          <i class="fas fa-sign-in-alt mr-2"></i> Giriş Yap
                        </span>
                      </argon-button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
            <div class="col-6 d-none d-lg-flex h-100 my-auto pe-0 position-absolute top-0 end-0 justify-content-center flex-column">
              <div class="position-relative bg-gradient-primary h-100 m-3 px-7 border-radius-lg d-flex flex-column justify-content-center overflow-hidden"
                style="background-image: url('https://s3.amazonaws.com/images.skyscrapercenter.com/thumbs/104924_500x650.jpg'); background-size: cover;">
                <span class="mask bg-gradient-success opacity-6"></span>
                <h4 class="mt-5 text-white font-weight-bolder position-relative">
                  IGA JURI
                </h4>
                <p class="text-white position-relative">
                  Yönetici Paneli 🌟
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
.login-card {
  border-radius: 1rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  background: #fff;
  transition: transform 0.3s ease;
  max-width: 400px;
}

.login-card:hover {
  transform: translateY(-5px);
}

.soft-input {
  border-radius: 0.75rem;
  border: 1px solid #e0e0e0;
  transition: all 0.3s ease;
}

.soft-input:focus {
  border-color: #82d616;
  box-shadow: 0 0 0 3px rgba(130, 214, 22, 0.2);
}

.cute-button {
  border-radius: 0.75rem;
  padding: 0.75rem 1.5rem;
  transition: all 0.3s ease;
}

.cute-button:hover {
  transform: scale(1.05);
  box-shadow: 0 5px 15px rgba(130, 214, 22, 0.3);
}

.alert {
  margin-top: 1rem;
  padding: 0.75rem;
  border-radius: 0.5rem;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.alert-success {
  background-color: #e6ffe6;
  color: #2d862d;
  border: 1px solid #b3ffb3;
}

.alert-danger {
  background-color: #ffe6e6;
  color: #862d2d;
  border: 1px solid #ffb3b3;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.small-spinner {
  width: 20px;
  height: 20px;
  border: 3px solid #b3ffb3;
  border-top: 3px solid #2d862d;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.mr-2 {
  margin-right: 0.5rem;
}
</style>