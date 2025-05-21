<template>
    <div class="container" :style="{ backgroundColor: form.backgroundColor }">
      <div class="card mb-4">
        <div class="card-header">
          <h5>{{ form.title }}</h5>
        </div>
        <div class="card-body">
          <!-- Form Açıklaması -->
          <p v-if="form.description" class="mb-4">{{ form.description }}</p>
  
          <!-- Mevcut Sayfa -->
          <div v-if="form.pages[currentPageIndex]" class="mb-4">
            <h6>Sayfa {{ currentPageIndex + 1 }}</h6>
            <div v-for="(question, qIndex) in form.pages[currentPageIndex].questions" :key="qIndex" class="mb-3">
              <!-- Soru Medya -->
              <div v-if="question.mediaUrl" class="mb-2">
                <img
                  v-if="isImage(question.mediaUrl)"
                  :src="question.mediaUrl"
                  class="img-fluid"
                  style="max-width: 300px;"
                  alt="Soru Medyası"
                />
                <video
                  v-else-if="isVideo(question.mediaUrl)"
                  :src="question.mediaUrl"
                  controls
                  class="img-fluid"
                  style="max-width: 300px;"
                ></video>
                <audio
                  v-else-if="isAudio(question.mediaUrl)"
                  :src="question.mediaUrl"
                  controls
                  class="mb-2"
                ></audio>
                <img
                  v-else-if="isGif(question.mediaUrl)"
                  :src="question.mediaUrl"
                  class="img-fluid"
                  style="max-width: 300px;"
                  alt="Soru GIF"
                />
              </div>
              <!-- Soru Metni -->
              <label class="question-number">{{ question.order }}. {{ question.text }}</label>
              <!-- Soru Tiplerine Göre Giriş Alanları -->
              <div v-if="question.type === 'text'">
                <input
                  v-model="answers[currentPageIndex][qIndex]"
                  type="text"
                  class="form-control"
                  placeholder="Yanıtınızı girin"
                />
              </div>
              <div v-if="question.type === 'textarea'">
                <textarea
                  v-model="answers[currentPageIndex][qIndex]"
                  class="form-control"
                  placeholder="Yanıtınızı girin"
                ></textarea>
              </div>
              <div v-if="question.type === 'radio'">
                <div v-for="(option, optIndex) in question.options" :key="optIndex" class="form-check">
                  <input
                    type="radio"
                    class="form-check-input"
                    :name="'q-' + currentPageIndex + '-' + qIndex"
                    :value="option.value"
                    v-model="answers[currentPageIndex][qIndex]"
                    @change="handleNavigation(currentPageIndex, qIndex, optIndex)"
                  />
                  <label class="form-check-label d-flex align-items-center">
                    {{ toRoman(optIndex + 1) }}. {{ option.text }}
                    <img
                      v-if="option.imageUrl"
                      :src="option.imageUrl"
                      class="ml-2"
                      style="max-width: 50px;"
                      alt="Seçenek Resmi"
                    />
                    <span v-if="option.isDefault" class="ml-2 text-muted">(Varsayılan)</span>
                  </label>
                </div>
              </div>
              <div v-if="question.type === 'checkbox'">
                <div v-for="(option, optIndex) in question.options" :key="optIndex" class="form-check">
                  <input
                    type="checkbox"
                    class="form-check-input"
                    :value="option.value"
                    v-model="answers[currentPageIndex][qIndex]"
                    @change="handleNavigation(currentPageIndex, qIndex, optIndex)"
                  />
                  <label class="form-check-label d-flex align-items-center">
                    {{ toRoman(optIndex + 1) }}. {{ option.text }}
                    <img
                      v-if="option.imageUrl"
                      :src="option.imageUrl"
                      class="ml-2"
                      style="max-width: 50px;"
                      alt="Seçenek Resmi"
                    />
                    <span v-if="option.isDefault" class="ml-2 text-muted">(Varsayılan)</span>
                  </label>
                </div>
              </div>
              <div v-if="question.type === 'file'">
                <input
                  type="file"
                  class="form-control"
                  @change="handleFileUpload(currentPageIndex, qIndex, $event)"
                />
              </div>
              <div v-if="question.type === 'message' && question.message" class="mt-2">
                <p class="text-muted" style="white-space: pre-wrap;">{{ question.message }}</p>
              </div>
            </div>
          </div>
  
          <!-- Sayfa Navigasyonu -->
          <div class="d-flex justify-content-between mb-3">
            <button
              class="btn btn-outline-secondary"
              :disabled="currentPageIndex === 0"
              @click="currentPageIndex--"
            >
              Önceki Sayfa
            </button>
            <button
              class="btn btn-outline-secondary"
              :disabled="currentPageIndex === form.pages.length - 1"
              @click="currentPageIndex++"
            >
              Sonraki Sayfa
            </button>
          </div>
  
          <!-- Gönder Butonu -->
          <div class="text-right">
            <button class="btn btn-primary" @click="submitResponse">
              Gönder
            </button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import Swal from "sweetalert2";
  
  export default {
    name: "FormRespond",
    data() {
      return {
        form: {
          id: null,
          title: "",
          description: "",
          backgroundColor: "#ffffff",
          pages: [],
        },
        currentPageIndex: 0,
        answers: [],
      };
    },
    mounted() {
      const formId = this.$route.params.id;
      if (formId) {
        this.fetchForm(formId);
      }
    },
    methods: {
      async fetchForm(id) {
        try {
          // TODO: Replace with actual API call: GET /api/Form/GetById?id={id}
          // Mock response for now
          Swal.fire("Bilgi", `Form ID ${id} için veri çekiliyor (API ile bağlanacak).`, "info");
          // Mock form data (replace with API response)
          this.form = {
            id: id,
            title: "Örnek Form",
            description: "Bu bir test formudur.",
            backgroundColor: "#f3f4f6",
            pages: [
              {
                questions: [
                  {
                    text: "Adınız nedir?",
                    type: "text",
                    order: 1,
                  },
                  {
                    text: "Geri bildiriminiz nedir?",
                    type: "textarea",
                    order: 2,
                  },
                  {
                    text: "Memnuniyet düzeyiniz nedir?",
                    type: "radio",
                    options: [
                      { text: "Çok Memnun", value: 5, order: 1, isDefault: false },
                      { text: "Memnun", value: 4, order: 2, isDefault: true },
                      { text: "Nötr", value: 3, order: 3, isDefault: false },
                    ],
                    hasNavigationRules: true,
                    navigationRules: [
                      { targetType: "page", targetIndex: 1 },
                      { targetType: "page", targetIndex: 0 },
                      { targetType: "question", targetIndex: 0 },
                    ],
                    order: 3,
                  },
                  {
                    text: "Hangi özellikleri beğendiniz?",
                    type: "checkbox",
                    options: [
                      { text: "Kullanım Kolaylığı", value: 1, order: 1, isDefault: false },
                      { text: "Tasarım", value: 2, order: 2, isDefault: false },
                    ],
                    order: 4,
                  },
                  {
                    text: "Belge yükleyin",
                    type: "file",
                    order: 5,
                  },
                  {
                    text: "Hoş Geldiniz",
                    type: "message",
                    message: "Bu formu doldurduğunuz için teşekkürler!",
                    order: 6,
                  },
                ],
              },
              {
                questions: [
                  {
                    text: "Ek yorumlarınız?",
                    type: "textarea",
                    order: 1,
                  },
                ],
              },
            ],
          };
          this.initializeAnswers();
        } catch (error) {
          Swal.fire("Hata", "Form yüklenemedi!", "error");
        }
      },
      initializeAnswers() {
        this.answers = this.form.pages.map((page) =>
          page.questions.map((q) => (q.type === "checkbox" ? [] : q.type === "message" ? null : null))
        );
      },
      handleNavigation(pageIndex, questionIndex, optionIndex) {
        const question = this.form.pages[pageIndex].questions[questionIndex];
        if (question.hasNavigationRules && question.navigationRules[optionIndex]) {
          const rule = question.navigationRules[optionIndex];
          if (rule.targetType === "page") {
            this.currentPageIndex = rule.targetIndex;
            Swal.fire({
              icon: "info",
              title: "Yönlendirme",
              text: `Sayfa ${rule.targetIndex + 1}'e yönlendirildiniz.`,
              timer: 1500,
              showConfirmButton: false,
            });
          } else if (rule.targetType === "question") {
            Swal.fire({
              icon: "info",
              title: "Yönlendirme",
              text: `Soru ${this.form.pages[pageIndex].questions[rule.targetIndex].order}'e yönlendirildiniz.`,
              timer: 1500,
              showConfirmButton: false,
            });
            // Scroll to question (requires ref or DOM manipulation)
          }
        }
      },
      handleFileUpload(pageIndex, questionIndex, event) {
        const file = event.target.files[0];
        if (file) {
          // Store file reference or upload to backend
          this.answers[pageIndex][questionIndex] = file;
          Swal.fire("Bilgi", "Dosya seçildi, ancak yükleme API ile bağlanacak.", "info");
        }
      },
      async submitResponse() {
        // Validate required fields (optional)
        for (let pageIndex = 0; pageIndex < this.form.pages.length; pageIndex++) {
          for (let qIndex = 0; qIndex < this.form.pages[pageIndex].questions.length; qIndex++) {
            const question = this.form.pages[pageIndex].questions[qIndex];
            if (question.type !== "message" && !this.answers[pageIndex][qIndex]) {
              Swal.fire({
                icon: "warning",
                title: "Eksik Yanıt",
                text: `Soru ${question.order} (${question.text}) için yanıt gerekli!`,
              });
              return;
            }
          }
        }
  
        // Prepare response payload
        const responsePayload = {
          formId: this.form.id,
          answers: this.form.pages.map((page, pageIndex) =>
            page.questions.map((question, qIndex) => ({
              questionOrder: question.order,
              answer: this.answers[pageIndex][qIndex],
            }))
          ),
        };
  
        try {
          // TODO: Replace with actual API call: POST /api/Form/SubmitResponse
          Swal.fire("Bilgi", "Yanıtlar gönderiliyor (API ile bağlanacak).", "info");
          console.log("Response Payload:", responsePayload);
          Swal.fire({
            icon: "success",
            title: "Başarılı",
            text: "Yanıtlarınız gönderildi!",
            timer: 2000,
            showConfirmButton: false,
          });
          // Reset form
          this.initializeAnswers();
          this.currentPageIndex = 0;
        } catch (error) {
          Swal.fire("Hata", "Yanıtlar gönderilemedi!", "error");
        }
      },
      isImage(url) {
        return /\.(jpg|jpeg|png|bmp|webp)$/i.test(url);
      },
      isVideo(url) {
        return /\.(mp4|webm|ogg)$/i.test(url);
      },
      isAudio(url) {
        return /\.(mp3|wav|ogg)$/i.test(url);
      },
      isGif(url) {
        return /\.gif$/i.test(url);
      },
      toRoman(num) {
        const romanValues = [
          { value: 1000, numeral: "M" },
          { value: 900, numeral: "CM" },
          { value: 500, numeral: "D" },
          { value: 400, numeral: "CD" },
          { value: 100, numeral: "C" },
          { value: 90, numeral: "XC" },
          { value: 50, numeral: "L" },
          { value: 40, numeral: "XL" },
          { value: 10, numeral: "X" },
          { value: 9, numeral: "IX" },
          { value: 5, numeral: "V" },
          { value: 4, numeral: "IV" },
          { value: 1, numeral: "I" },
        ];
        let result = "";
        for (let i = 0; i < romanValues.length; i++) {
          while (num >= romanValues[i].value) {
            result += romanValues[i].numeral;
            num -= romanValues[i].value;
          }
        }
        return result;
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
    min-height: 100vh;
  }
  
  .card {
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    border: none;
    width: 100%;
    background-color: #fff;
  }
  
  .card-header {
    background-color: #f8fafc;
    padding: 12px 20px;
    border-bottom: 1px solid #e2e8f0;
    border-radius: 12px 12px 0 0;
    text-align: left;
  }
  
  .card-body {
    padding: 20px;
  }
  
  .btn-primary {
    background-color: #60a5fa;
    border: none;
    padding: 8px 16px;
    font-size: 0.85rem;
    border-radius: 6px;
    color: #fff;
    font-weight: 600;
    text-transform: uppercase;
    transition: all 0.3s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  .btn-primary:hover {
    background-color: #3b82f6;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
  
  .btn-outline-secondary {
    background-color: #fff;
    color: #475569;
    border: 1px solid #cbd5e1;
    padding: 6px 12px;
    font-size: 0.85rem;
    border-radius: 6px;
  }
  .btn-outline-secondary:hover {
    background-color: #e2e8f0;
  }
  
  .form-control {
    width: 100%;
    padding: 8px;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    font-size: 0.9rem;
  }
  
  .question-number {
    font-weight: 600;
    color: #1e3a8a;
    display: block;
    margin-bottom: 0.5rem;
  }
  
  .text-muted {
    color: #475569;
  }
  
  .d-flex {
    display: flex;
  }
  .align-items-center {
    align-items: center;
  }
  .justify-content-between {
    justify-content: space-between;
  }
  .mb-3 {
    margin-bottom: 1rem;
  }
  .mb-4 {
    margin-bottom: 1.5rem;
  }
  .ml-2 {
    margin-left: 0.5rem;
  }
  .mt-2 {
    margin-top: 0.5rem;
  }
  .text-right {
    text-align: right;
  }
  
  .form-check {
    margin-bottom: 0.5rem;
  }
  .form-check-input {
    margin-right: 0.5rem;
  }
  .form-check-label {
    font-size: 0.9rem;
  }
  
  @media (min-width: 1200px) {
    .container {
      padding: 20px 40px;
    }
  }
  
  @media (max-width: 768px) {
    .card-header {
      text-align: center;
    }
    .form-control,
    .btn {
      font-size: 0.8rem;
    }
  }
  
  @media (max-width: 576px) {
    .card {
      padding: 15px;
    }
    .btn-primary,
    .btn-outline-secondary {
      padding: 6px 12px;
      font-size: 0.8rem;
    }
  }
  </style>