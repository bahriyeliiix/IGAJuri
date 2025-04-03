<script setup>
import { onBeforeUnmount, onBeforeMount } from "vue";
import { useStore } from "vuex";
import { ref, computed } from "vue";
import axios from "axios";
import { useRouter } from "vue-router";

import ArgonInput from "@/components/ArgonInput.vue";
import ArgonButton from "@/components/ArgonButton.vue";

const body = document.getElementsByTagName("body")[0];
const store = useStore();
const router = useRouter();

// Reaktif değişkenler
const firstName = ref("");
const lastName = ref("");
const fullEmail = ref(""); // Tam e-posta adresini tutacak
const password = ref("");
const phoneNumber = ref("");
const statusMessage = ref("");
const firstNameError = ref("");
const lastNameError = ref("");
const emailError = ref(""); // E-posta için hata mesajı

// Şifre kuralları
const hasMinLength = () => password.value.length >= 8;
const hasUpperCase = () => /[A-Z]/.test(password.value);
const hasLowerCase = () => /[a-z]/.test(password.value);
const hasNumber = () => /\d/.test(password.value);
const hasSpecialChar = () => /[!@#$%^&*(),.?":{}|<>]/.test(password.value);
const isPasswordValid = () => hasMinLength() && hasUpperCase() && hasLowerCase() && hasNumber() && hasSpecialChar();

// First Name ve Last Name için sadece harf kontrolü
const validateName = (value) => /^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]*$/.test(value);
const handleFirstNameInput = (event) => {
  const value = event.target.value;
  if (validateName(value)) {
    firstName.value = value;
    firstNameError.value = "";
  } else {
    firstNameError.value = "Sadece harf girebilirsiniz!";
  }
};
const handleLastNameInput = (event) => {
  const value = event.target.value;
  if (validateName(value)) {
    lastName.value = value;
    lastNameError.value = "";
  } else {
    lastNameError.value = "Sadece harf girebilirsiniz!";
  }
};

// E-posta formatını doğrulama
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Basit bir e-posta format kontrolü
  return emailRegex.test(email);
};
const handleEmailInput = (event) => {
  const value = event.target.value;
  fullEmail.value = value;
  if (value && !validateEmail(value)) {
    emailError.value = "Hatalı girdiniz!";
  } else {
    emailError.value = "";
  }
};

// Telefon numarası formatlama
const formattedPhoneNumber = computed({
  get() {
    const digits = phoneNumber.value.replace(/\D/g, "").slice(0, 10); // Maksimum 10 hane
    if (!digits) return ""; // Boşsa tamamen boş döner
    if (digits.length <= 3) return `(${digits})`;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    if (digits.length <= 8) return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 8)}-${digits.slice(8, 10)}`;
  },
  set(newValue) {
    phoneNumber.value = newValue.replace(/\D/g, "").slice(0, 10); // Sadece rakamları al
  }
});

onBeforeMount(() => {
  store.state.hideConfigButton = true;
  store.state.showNavbar = false;
  store.state.showSidenav = false;
  store.state.showFooter = false;
  body.classList.remove("bg-gray-100");
});

const signup = async () => {
  if (!firstName.value || !lastName.value || !fullEmail.value || !password.value || !phoneNumber.value) {
    statusMessage.value = "Lütfen tüm alanları doldurun!";
    return;
  }

  if (firstNameError.value || lastNameError.value) {
    statusMessage.value = "Ad ve soyad sadece harf içermeli!";
    return;
  }

  if (!validateEmail(fullEmail.value)) {
    statusMessage.value = "Lütfen geçerli bir e-posta adresi girin!";
    return;
  }

  if (!isPasswordValid()) {
    statusMessage.value = "Şifre tüm kuralları karşılamalı!";
    return;
  }

  // Telefon numarasının tam 10 hane olduğundan emin ol
  if (phoneNumber.value.length !== 10) {
    statusMessage.value = "Telefon numarası eksik veya hatalı girildi!";
    return;
  }

  const dataToSend = {
    FirstName: firstName.value,
    LastName: lastName.value,
    Email: fullEmail.value,
    Password: password.value,
    PhoneNumber: phoneNumber.value,
    Role: 2, // Jüri rolü için sabit değer
  };

  try {
    const response = await axios.post("http://localhost:5073/api/Auth/register", dataToSend);

    if (response.status === 200) {
      const token = response.data.data?.access_token;
      statusMessage.value = "Kayıt başarılı! Jüri olarak kaydedildiniz.";
      store.dispatch("saveToken", token);
      localStorage.setItem("authToken", token);
      router.push({ name: "Dashboard" });
    }
  } catch (error) {
    console.error("Kayıt Hatası:", error);
    statusMessage.value = error.response?.data.message || "Kayıt başarısız!";
  }
};

onBeforeUnmount(() => {
  store.state.hideConfigButton = false;
  store.state.showNavbar = true;
  store.state.showSidenav = true;
  store.state.showFooter = true;
  body.classList.add("bg-gray-100");
});
</script>

<template>
  <main class="main-content mt-0" style="background-color: #4DD0E1; position: relative; min-height: 100vh; display: flex; align-items: center; justify-content: center;">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-xl-6 col-lg-7 col-md-8 mx-auto">
          <div class="card z-index-0">
            <div class="card-body" style="padding: 2rem;">
              <form role="form" @submit.prevent="signup">
                <!-- First Name -->
                <div class="mb-3">
                  <argon-input
                    id="firstName"
                    type="text"
                    placeholder="First Name"
                    aria-label="First Name"
                    v-model="firstName"
                    @input="handleFirstNameInput"
                    class="mb-1"
                    style="font-size: 1.1rem; padding: 0.65rem;"
                    required
                  />
                  <div v-if="firstNameError" class="text-danger text-sm">{{ firstNameError }}</div>
                </div>
                <!-- Last Name -->
                <div class="mb-3">
                  <argon-input
                    id="lastName"
                    type="text"
                    placeholder="Last Name"
                    aria-label="Last Name"
                    v-model="lastName"
                    @input="handleLastNameInput"
                    class="mb-1"
                    style="font-size: 1.1rem; padding: 0.65rem;"
                    required
                  />
                  <div v-if="lastNameError" class="text-danger text-sm">{{ lastNameError }}</div>
                </div>
                <!-- E-posta Input -->
                <div class="mb-3 position-relative">
                  <argon-input
                    id="email"
                    type="text"
                    placeholder="example@example.com"
                    aria-label="Email"
                    v-model="fullEmail"
                    @input="handleEmailInput"
                    class="mb-1"
                    style="font-size: 1.1rem; padding: 0.65rem;"
                    required
                  />
                  <div v-if="emailError" class="text-danger text-sm">{{ emailError }}</div>
                </div>
                <!-- Şifre -->
                <div class="mb-3">
                  <argon-input
                    id="password"
                    type="password"
                    placeholder="Password"
                    aria-label="Password"
                    v-model="password"
                    class="mb-2"
                    style="font-size: 1.1rem; padding: 0.65rem;"
                    required
                  />
                  <div class="password-rules text-sm">
                    <p :class="{ 'text-success': hasMinLength(), 'text-danger': !hasMinLength() }">. En az 8 karakter</p>
                    <p :class="{ 'text-success': hasUpperCase(), 'text-danger': !hasUpperCase() }">. Büyük harf (A-Z)</p>
                    <p :class="{ 'text-success': hasLowerCase(), 'text-danger': !hasLowerCase() }">. Küçük harf (a-z)</p>
                    <p :class="{ 'text-success': hasNumber(), 'text-danger': !hasNumber() }">. Sayı (0-9)</p>
                    <p :class="{ 'text-success': hasSpecialChar(), 'text-danger': !hasSpecialChar() }">. Özel karakter (!@#$%^&* vb.)</p>
                  </div>
                </div>
                <!-- Telefon Numarası -->
                <div class="mb-3">
                  <input
                    id="phoneNumber"
                    type="text"
                    v-model="formattedPhoneNumber"
                    placeholder="(5xx) xxx-xx-xx"
                    aria-label="Phone Number"
                    class="custom-input"
                    style="font-size: 1.1rem; padding: 0.65rem;"
                    required
                  />
                </div>
                <div class="text-center">
                  <argon-button
                    fullWidth
                    style="background: linear-gradient(90deg, #007bff, #0056b3); border: none; padding: 0.9rem 1.5rem; font-size: 1.1rem;"
                    class="my-3 mb-2"
                    @click="signup"
                  >Sign up</argon-button>
                </div>
              </form>
              <div v-if="statusMessage" class="text-center mt-3" :class="{ 'text-success': statusMessage.includes('başarılı'), 'text-danger': statusMessage.includes('başarısız') }">
                {{ statusMessage }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <img
      src="https://logodix.com/logo/2176245.png"
      alt="Logo"
      style="position: absolute; bottom: 20px; right: 20px; width: 150px; height: auto; z-index: 1; background-color: white; padding: 10px; border-radius: 10px;"
    />
  </main>
</template>

<style scoped>
.password-rules p {
  margin: 2px 0;
  font-size: 0.9rem;
}
.text-success {
  color: #28a745 !important;
}
.text-danger {
  color: #dc3545 !important;
}
.custom-input {
  width: 100%;
  border: 1px solid #ced4da;
  border-radius: 0.25rem;
}
</style>