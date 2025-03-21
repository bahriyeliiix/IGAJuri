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

onBeforeMount(() => {
  store.state.hideConfigButton = true;
  store.state.showNavbar = false;
  store.state.showSidenav = false;
  store.state.showFooter = false;
  body.classList.remove("bg-gray-100");

  // Google Identity Services scriptini dinamik olarak ekle
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
    const response = await axios.post("http://213.238.181.142/api/Auth/login", {
      email: email.value,
      password: password.value,
    });

    const token = response.data.token.access_token;

    store.dispatch("saveToken", token);
    localStorage.setItem("authToken", token);

    router.push({ name: "Dashboard" });
  } catch (error) {
    console.error("Login failed:", error);
  }
};

// Google Login için handleLogin fonksiyonu
const handleLogin = async (response) => {
  try {
    // Google'dan gelen credential (token)
    const googleToken = response.credential;
    console.log("Google ID Token:", googleToken);

    // Backend'e Google token'ı gönder (örnek bir endpoint varsayıyorum)
    const apiResponse = await axios.post(
      "http://localhost:5031/api/Auth/outsource-login",
      {
        token: googleToken,
        registerSource: 2,
      }
    );
    console.log("API Response:", apiResponse.data);
    const token = apiResponse.data.token.access_token;

    // Token'ı Vuex ve localStorage'a kaydet
    store.dispatch("saveToken", token);
    localStorage.setItem("authToken", token);

    // Dashboard'a yönlendir
    router.push({ name: "Dashboard" });
  } catch (error) {
    console.error("Google Login failed:", error);
  }
};

// Google callback fonksiyonunu globale tanımla
onBeforeMount(() => {
  window.handleCredentialResponse = handleLogin;
});
</script>
<template>
  <div class="container top-0 position-sticky z-index-sticky">
    <div class="row">
      <div class="col-12">
        <!-- <navbar
          isBlur="blur  border-radius-lg my-3 py-2 start-0 end-0 mx-4 shadow"
          v-bind:darkMode="true"
          isBtn="bg-gradient-success"
        /> -->
      </div>
    </div>
  </div>
  <main class="mt-0 main-content">
    <section>
      <div class="page-header min-vh-100">
        <div class="container">
          <div class="row">
            <div
              class="col-xl-4 col-lg-5 col-md-7 d-flex flex-column mx-auto mx-lg-0"
            >
              <div class="card card-plain">
                <div class="card-header pb-0 text-start">
                  <h4 class="font-weight-bolder">Giriş yap</h4>
                  <p class="mb-0">Email ve şifrenizi giriniz</p>
                </div>
                <div class="card-body">
                  <form role="form" @submit.prevent="login">
                    <div class="mb-3">
                      <argon-input
                        id="email"
                        type="email"
                        placeholder="Email"
                        name="email"
                        size="lg"
                        v-model="email"
                      />
                    </div>
                    <div class="mb-3">
                      <argon-input
                        id="password"
                        type="password"
                        placeholder="Password"
                        name="password"
                        size="lg"
                        v-model="password"
                      />
                    </div>
                    <!-- <argon-switch id="rememberMe" name="remember-me">Beni hatırla</argon-switch> -->
                    <div class="text-center">
                      <argon-button
                        class="mt-4"
                        variant="gradient"
                        color="success"
                        full-width
                        size="lg"
                        type="submit"
                      >
                        Giriş yap
                      </argon-button>
                    </div>
                    <br />
                   
                  </form>
                </div>
                <div class="card-footer px-1 pt-0 text-center px-lg-2">
                  <!-- 
                  <p class="mb-4 text-sm mx-auto">
                    Don't have an account?
                    <a href="/signup" class="text-success text-gradient font-weight-bold">Sign up</a>
                  </p>
                --></div>
              </div>
            </div>
            <div
              class="col-6 d-none d-lg-flex h-100 my-auto pe-0 position-absolute top-0 end-0 justify-content-center flex-column"
            >
              <div
                class="position-relative bg-gradient-primary h-100 m-3 px-7 border-radius-lg d-flex flex-column justify-content-center overflow-hidden"
                style="
                  background-image: url(&quot;https://s3.amazonaws.com/images.skyscrapercenter.com/thumbs/104924_500x650.jpg&quot;);
                  background-size: cover;
                "
              >
                <span class="mask bg-gradient-success opacity-6"></span>
                <h4
                  class="mt-5 text-white font-weight-bolder position-relative"
                >
                  IGA JURI
                </h4>
                <p class="text-white position-relative">
                 Yönetici Paneli
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>
<style>
</style>
