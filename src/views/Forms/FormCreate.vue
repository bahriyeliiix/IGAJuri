<template>
    <div class="container" :style="{ backgroundColor: form.backgroundColor }">
      <div class="card mb-4">
        <div class="card-header">
          <h5>Form {{ isViewMode ? 'Görüntüle' : 'Oluştur' }}</h5>
        </div>
        <div class="card-body">
          <!-- Düzenleme Moduna Geç Butonu -->
          <div v-if="isViewMode" class="mb-3 text-right">
            <button class="btn btn-warning btn-sm" @click="toggleEditMode">
              Düzenleme Moduna Geç
            </button>
          </div>
  
          <!-- Arka Plan Rengi Seçimi -->
          <div v-if="!isViewMode" class="mb-3">
            <label class="form-label">Form Arka Plan Rengi</label>
            <div class="d-flex align-items-center">
              <input
                v-model="form.backgroundColor"
                type="color"
                class="form-control mr-2"
                style="width: 50px; height: 38px; padding: 0;"
              />
              <div class="color-palette d-flex flex-wrap">
                <button
                  v-for="color in colorPalette"
                  :key="color"
                  class="color-swatch"
                  :style="{ backgroundColor: color }"
                  :class="{ selected: form.backgroundColor === color }"
                  @click="form.backgroundColor = color"
                  :title="color"
                ></button>
              </div>
            </div>
          </div>
          <div v-else class="mb-3">
            <label class="form-label">Form Arka Plan Rengi</label>
            <div
              class="color-swatch"
              :style="{ backgroundColor: form.backgroundColor }"
              style="width: 50px; height: 38px; display: inline-block;"
            ></div>
          </div>
  
          <!-- Form Başlığı ve Açıklaması -->
          <input
            v-model="form.title"
            type="text"
            class="form-control mb-3"
            placeholder="Form Başlığı"
            :readonly="isViewMode"
          />
          <textarea
            v-model="form.description"
            class="form-control mb-3"
            placeholder="Form Açıklaması"
            :readonly="isViewMode"
          ></textarea>
  
          <!-- Sayfalar -->
          <div class="mb-4">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h6 class="mb-0">Sayfalar</h6>
              <button
                v-if="!isViewMode"
                class="btn btn-outline-primary btn-sm"
                @click="addPage"
              >
                Yeni Sayfa Ekle
              </button>
            </div>
            <div class="page-tabs">
              <button
                v-for="(page, index) in form.pages"
                :key="index"
                :class="['page-tab', { active: currentPageIndex === index }]"
                @click="currentPageIndex = index"
              >
                Sayfa {{ index + 1 }}
                <span
                  v-if="!isViewMode && form.pages.length > 1"
                  class="delete-page"
                  @click.stop="deletePage(index)"
                >
                  ×
                </span>
              </button>
            </div>
          </div>
  
          <!-- Sorular (Sürükle-Bırak ile) -->
          <div
            v-if="currentQuestions.length"
            v-sortable="{ onEnd: onSortEnd, disabled: isViewMode, handle: '.drag-handle' }"
            class="question-list"
          >
            <div
              v-for="(question, qIndex) in currentQuestions"
              :key="qIndex"
              class="card mb-3 question-card"
              :class="{ 'message-card': question.type === 'message' }"
            >
              <!-- Soru Başlığı (Her zaman görünür) -->
              <div class="question-header d-flex align-items-center p-2">
                <span
                  v-if="!isViewMode"
                  class="drag-handle mr-2"
                  style="cursor: move;"
                  title="Sürükle"
                >
                  ☰
                </span>
                <span
                  v-if="question.type !== 'message'"
                  class="question-number mr-2"
                >
                  {{ getDisplayOrder(currentPageIndex, qIndex) }}.
                </span>
                <input
                  v-model="question.text"
                  type="text"
                  class="form-control mr-2"
                  placeholder="Soru Metni"
                  :readonly="isViewMode"
                />
                <select
                  v-model="question.type"
                  class="form-control mr-2"
                  style="width: 200px;"
                  :disabled="isViewMode"
                  @change="clearQuestionData(currentPageIndex, qIndex)"
                >
                  <option value="text">Kısa Yanıt</option>
                  <option value="textarea">Paragraf</option>
                  <option value="radio">Çoktan Seçmeli</option>
                  <option value="checkbox">Onay Kutusu</option>
                  <option value="file">Dosya Yükleme</option>
                  <option value="message">Mesaj</option>
                </select>
                <!-- Sıra Kontrolleri -->
                <div v-if="!isViewMode" class="d-flex align-items-center">
                  <input
                    v-model.number="question.order"
                    type="number"
                    class="form-control mr-2"
                    style="width: 60px;"
                    min="1"
                    :max="currentQuestions.length"
                    @change="reorderQuestionByInput(currentPageIndex, qIndex)"
                  />
                  <button
                    class="btn btn-outline-secondary btn-sm mr-1"
                    :disabled="qIndex === 0"
                    @click="moveQuestionUp(currentPageIndex, qIndex)"
                  >
                    ↑
                  </button>
                  <button
                    class="btn btn-outline-secondary btn-sm mr-1"
                    :disabled="qIndex === currentQuestions.length - 1"
                    @click="moveQuestionDown(currentPageIndex, qIndex)"
                  >
                    ↓
                  </button>
                  <!-- Akordiyon Toggle -->
                  <button
                    class="btn btn-outline-primary btn-sm"
                    @click="toggleQuestionCollapse(qIndex)"
                  >
                    <span v-if="question.isExpanded">▲</span>
                    <span v-else>▼</span>
                  </button>
                </div>
              </div>
              <!-- Soru Detayları (Akordiyon İçeriği) -->
              <div v-if="question.isExpanded || isViewMode" class="card-body">
                <!-- Mesaj Textarea (Sadece message tipi için) -->
                <div v-if="question.type === 'message'" class="mb-3">
                  <label class="form-label">Mesaj</label>
                  <textarea
                    v-model="question.message"
                    class="form-control"
                    placeholder="Kullanıcıya gösterilecek mesaj"
                    :readonly="isViewMode"
                  ></textarea>
                </div>
                <!-- Soru Medya URL Toggle (Sadece radio ve checkbox için) -->
                <div v-if="!isViewMode && (question.type === 'radio' || question.type === 'checkbox')" class="mb-3">
                  <div class="form-check mb-2">
                    <input
                      type="checkbox"
                      class="form-check-input"
                      :id="'media-url-' + currentPageIndex + '-' + qIndex"
                      v-model="question.hasMediaUrl"
                      @change="toggleMediaUrl(currentPageIndex, qIndex)"
                    />
                    <label class="form-check-label" :for="'media-url-' + currentPageIndex + '-' + qIndex">
                      Soru Medya URL Ekle (Resim/Video/Ses/GIF)
                    </label>
                  </div>
                  <div v-if="question.hasMediaUrl">
                    <input
                      v-model="question.mediaUrl"
                      type="url"
                      class="form-control"
                      placeholder="Medya URL'si (örn. https://example.com/image.jpg)"
                    />
                  </div>
                </div>
                <!-- Medya Önizleme -->
                <div v-if="question.mediaUrl" class="mb-3">
                  <img
                    v-if="isImage(question.mediaUrl)"
                    :src="question.mediaUrl"
                    class="img-fluid mb-2"
                    style="max-width: 200px;"
                    alt="Soru Medyası"
                  />
                  <video
                    v-else-if="isVideo(question.mediaUrl)"
                    :src="question.mediaUrl"
                    controls
                    class="img-fluid mb-2"
                    style="max-width: 200px;"
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
                    class="img-fluid mb-2"
                    style="max-width: 200px;"
                    alt="Soru GIF"
                  />
                </div>
                <!-- Cevap Şıkları Grubu Seçimi (radio ve checkbox için) -->
                <div v-if="!isViewMode && (question.type === 'radio' || question.type === 'checkbox')" class="mb-3">
                  <label class="form-label">Cevap Şıkları Grubu</label>
                  <select
                    v-model="question.answerOptionGroupId"
                    class="form-control"
                    @change="applyAnswerOptionGroup(currentPageIndex, qIndex)"
                  >
                    <option :value="null">Özel Şıklar</option>
                    <option
                      v-for="group in answerOptionGroups"
                      :key="group.id"
                      :value="group.id"
                    >
                      {{ group.name }}
                    </option>
                  </select>
                </div>
                <!-- Seçenekler (Çoktan Seçmeli, Onay Kutusu için) -->
                <div
                  v-if="question.type === 'radio' || question.type === 'checkbox'"
                  class="mt-3"
                >
                  <div
                    v-for="(option, optIndex) in question.options"
                    :key="optIndex"
                    class="mb-3"
                  >
                    <div class="d-flex mb-2 align-items-center">
                      <span class="option-number mr-2">{{ toRoman(optIndex + 1) }}.</span>
                      <input
                        v-model="option.text"
                        type="text"
                        class="form-control mr-2"
                        placeholder="Seçenek Metni"
                        :readonly="isViewMode"
                      />
                      <input
                        v-if="!isViewMode"
                        v-model.number="option.value"
                        type="number"
                        class="form-control mr-2"
                        style="width: 100px;"
                        placeholder="Değer"
                      />
                      <button
                        v-if="!isViewMode"
                        class="btn btn-danger btn-sm"
                        @click="removeOption(currentPageIndex, qIndex, optIndex)"
                      >
                        Sil
                      </button>
                    </div>
                    <div v-if="!isViewMode" class="ml-4 mb-2">
                      <div class="form-check mb-2">
                        <input
                          type="checkbox"
                          class="form-check-input"
                          :id="'option-image-' + currentPageIndex + '-' + qIndex + '-' + optIndex"
                          v-model="option.hasImageUrl"
                          @change="toggleOptionImageUrl(currentPageIndex, qIndex, optIndex)"
                        />
                        <label class="form-check-label" :for="'option-image-' + currentPageIndex + '-' + qIndex + '-' + optIndex">
                          Seçenek Resim URL Ekle
                        </label>
                      </div>
                      <div v-if="option.hasImageUrl">
                        <input
                          v-model="option.imageUrl"
                          type="url"
                          class="form-control"
                          placeholder="Resim URL'si (örn. https://example.com/option.jpg)"
                        />
                      </div>
                    </div>
                    <div v-if="option.imageUrl" class="ml-4">
                      <img
                        :src="option.imageUrl"
                        class="img-fluid"
                        style="max-width: 100px;"
                        alt="Seçenek Resmi"
                      />
                    </div>
                    <div v-if="!isViewMode" class="ml-4">
                      <div class="form-check">
                        <input
                          type="checkbox"
                          class="form-check-input"
                          v-model="option.isDefault"
                        />
                        <label class="form-check-label">Varsayılan Seçenek</label>
                      </div>
                    </div>
                  </div>
                  <button
                    v-if="!isViewMode"
                    class="btn btn-outline-primary btn-sm"
                    @click="addOption(currentPageIndex, qIndex)"
                  >
                    Seçenek Ekle
                  </button>
                </div>
                <!-- Dosya Yükleme için Not -->
                <div v-if="question.type === 'file'" class="mt-3">
                  <p class="text-sm text-muted">Kullanıcılar bu soruya dosya yükleyebilir.</p>
                </div>
                <!-- Yönlendirme Kuralı Ekle -->
                <div v-if="!isViewMode && (question.type === 'radio' || question.type === 'checkbox')" class="mt-3">
                  <div class="form-check mb-2">
                    <input
                      type="checkbox"
                      class="form-check-input"
                      :id="'nav-rule-' + currentPageIndex + '-' + qIndex"
                      v-model="question.hasNavigationRules"
                      @change="toggleNavigationRules(currentPageIndex, qIndex)"
                    />
                    <label class="form-check-label" :for="'nav-rule-' + currentPageIndex + '-' + qIndex">
                      Yönlendirme Kuralı Ekle
                    </label>
                  </div>
                  <div v-if="question.hasNavigationRules">
                    <h6>Yönlendirme Kuralları</h6>
                    <div
                      v-for="(option, optIndex) in question.options"
                      :key="optIndex"
                      class="d-flex mb-2 align-items-center"
                    >
                      <span class="option-number mr-2">{{ toRoman(optIndex + 1) }}.</span>
                      <span class="mr-2">{{ option.text }}</span>
                      <select
                        v-model="question.navigationRules[optIndex].targetType"
                        class="form-control mr-2"
                        style="width: 150px;"
                      >
                        <option value="page">Sayfaya Git</option>
                        <option value="question">Soruya Git</option>
                      </select>
                      <select
                        v-if="question.navigationRules[optIndex].targetType === 'page'"
                        v-model="question.navigationRules[optIndex].targetIndex"
                        class="form-control"
                        style="width: 150px;"
                      >
                        <option
                          v-for="(page, pIndex) in form.pages"
                          :key="pIndex"
                          :value="pIndex"
                        >
                          Sayfa {{ pIndex + 1 }}
                        </option>
                      </select>
                      <select
                        v-if="question.navigationRules[optIndex].targetType === 'question'"
                        v-model="question.navigationRules[optIndex].targetIndex"
                        class="form-control"
                        style="width: 150px;"
                      >
                        <option
                          v-for="(q, qIdx) in form.pages[currentPageIndex].questions"
                          :key="qIdx"
                          :value="qIdx"
                        >
                          Soru {{ getDisplayOrder(currentPageIndex, qIdx) }}
                        </option>
                      </select>
                    </div>
                  </div>
                </div>
                <div v-if="!isViewMode" class="text-right mt-2">
                  <button
                    class="btn btn-danger btn-sm"
                    @click="removeQuestion(currentPageIndex, qIndex)"
                  >
                    Soruyu Sil
                  </button>
                </div>
              </div>
            </div>
          </div>
          <p v-else class="text-muted text-center">Bu sayfada henüz soru yok.</p>
  
          <!-- Yeni Soru Ekle -->
          <button
            v-if="!isViewMode"
            class="btn btn-primary mb-3"
            @click="addQuestion"
          >
            Yeni Soru Ekle
          </button>
  
          <!-- Sayfa Çıktısı -->
          <div class="mb-4">
            <h6>Sayfa Çıktısı</h6>
            <pre class="form-control" style="height: 200px; overflow-y: auto;">{{ JSON.stringify(form, null, 2) }}</pre>
          </div>
  
          <!-- Kaydet, Paylaş ve Önizleme -->
          <div class="d-flex justify-content-end align-items-center">
            <button
              v-if="!isViewMode"
              class="btn btn-primary mr-2"
              @click="saveForm"
            >
              Kaydet
            </button>
            <button class="btn btn-secondary mr-2" @click="shareForm">
              Paylaş
            </button>
            <button class="btn btn-info" @click="previewForm">
              Önizleme
            </button>
          </div>
        </div>
      </div>
  
      <!-- Önizleme Modal -->
      <div v-if="showPreview" class="preview-modal">
        <div class="preview-content" :style="{ backgroundColor: form.backgroundColor }">
          <div class="preview-header">
            <h5>{{ form.title }} - Önizleme</h5>
            <button class="btn btn-danger btn-sm" @click="showPreview = false">
              Kapat
            </button>
          </div>
          <div class="preview-body">
            <p>{{ form.description }}</p>
            <div v-for="(page, pageIndex) in form.pages" :key="pageIndex" class="mb-4">
              <h6>Sayfa {{ pageIndex + 1 }}</h6>
              <div v-for="(question, qIndex) in page.questions" :key="qIndex" class="mb-3">
                <!-- Soru Medya Önizleme -->
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
                <label
                  class="question-label"
                  :class="{ 'question-number': question.type !== 'message' }"
                >
                  <span v-if="question.type !== 'message'">{{ getDisplayOrder(pageIndex, qIndex) }}.</span>
                  {{ question.text }}
                </label>
                <div v-if="question.type === 'text'">
                  <input type="text" class="form-control" placeholder="Yanıtınızı girin" v-model="previewAnswers[pageIndex][qIndex]" />
                </div>
                <div v-if="question.type === 'textarea'">
                  <textarea class="form-control" placeholder="Yanıtınızı girin" v-model="previewAnswers[pageIndex][qIndex]"></textarea>
                </div>
                <div v-if="question.type === 'radio'">
                  <div v-for="(option, optIndex) in question.options" :key="optIndex" class="form-check">
                    <input
                      type="radio"
                      class="form-check-input"
                      :name="'q-' + pageIndex + '-' + qIndex"
                      :value="option.value"
                      v-model="previewAnswers[pageIndex][qIndex]"
                      @change="handleNavigation(pageIndex, qIndex, optIndex)"
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
                      v-model="previewAnswers[pageIndex][qIndex]"
                      @change="handleNavigation(pageIndex, qIndex, optIndex)"
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
                  <input type="file" class="form-control" disabled />
                </div>
                <div v-if="question.type === 'message' && question.message" class="mt-2">
                  <p class="text-muted" style="white-space: pre-wrap;">{{ question.message }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import Swal from "sweetalert2";
  import Sortable from "sortablejs";
  import { v4 as uuidv4 } from "uuid";
  import axios from "axios";
  
  export default {
    name: "FormCreate",
    directives: {
      sortable: {
        bind(el, binding) {
          const options = {
            handle: ".drag-handle",
            animation: 150,
            disabled: binding.value.disabled || false,
            onEnd: (evt) => {
              if (binding.value.onEnd) {
                binding.value.onEnd(evt);
              }
            },
          };
          new Sortable(el, options);
        },
      },
    },
    data() {
      return {
        form: {
          id: null,
          title: "",
          description: "",
          backgroundColor: "#ffffff",
          pages: [
            {
              id: null,
              questions: [],
            },
          ],
        },
        currentPageIndex: 0,
        isViewMode: false,
        showPreview: false,
        previewAnswers: [],
        colorPalette: [
          "#ffffff", // White
          "#f3f4f6", // Light Gray
          "#60a5fa", // Blue
          "#34d399", // Green
          "#f87171", // Red
          "#facc15", // Yellow
          "#a78bfa", // Purple
          "#2dd4bf", // Teal
          "#fb923c", // Orange
          "#4b5563", // Dark Gray
        ],
        answerOptionGroups: [],
      };
    },
    computed: {
      currentQuestions: {
        get() {
          return [...(this.form.pages[this.currentPageIndex]?.questions || [])].sort((a, b) => a.order - b.order);
        },
        set(newQuestions) {
          this.form.pages[this.currentPageIndex].questions = newQuestions;
        },
      },
    },
    async mounted() {
      await this.fetchAnswerOptionGroups();
      const formId = this.$route.params.id;
      this.isViewMode = this.$route.path.includes("/view");
      if (formId) {
        await this.fetchForm(formId);
      }
      this.initializePreviewAnswers();
    },
    methods: {
      async fetchAnswerOptionGroups() {
        try {
          const response = await axios.get("/api/AnswerOptionGroup/GetAll");
          this.answerOptionGroups = response.data.map(group => ({
            id: group.id,
            name: group.name,
            options: group.options.map(opt => ({
              id: opt.id,
              text: opt.text,
              value: opt.value,
              imageUrl: opt.imageUrl,
              hasImageUrl: opt.hasImageUrl,
              order: opt.order,
              isDefault: opt.isDefault
            }))
          }));
        } catch (error) {
          Swal.fire("Hata", "Cevap şıkları grupları yüklenemedi: " + (error.response?.data || error.message), "error");
        }
      },
      getDisplayOrder(pageIndex, questionIndex) {
        const questions = this.form.pages[pageIndex].questions.sort((a, b) => a.order - b.order);
        let displayOrder = 0;
        for (let i = 0; i <= questionIndex; i++) {
          if (questions[i].type !== "message") {
            displayOrder++;
          }
        }
        return displayOrder;
      },
      async fetchForm(id) {
        try {
          const response = await axios.get(`/api/Form/GetById?id=${id}`);
          this.form = {
            ...response.data,
            pages: response.data.pages.map(page => ({
              ...page,
              id: page.id || uuidv4(),
              questions: page.questions.map(question => ({
                ...question,
                id: question.id || uuidv4(),
                options: question.options.map(option => ({
                  ...option,
                  id: option.id || uuidv4()
                })),
                navigationRules: question.navigationRules.map(rule => ({
                  ...rule,
                  id: rule.id || uuidv4()
                })),
                isExpanded: false
              }))
            }))
          };
          Swal.fire("Başarılı", "Form yüklendi.", "success");
        } catch (error) {
          Swal.fire("Hata", "Form yüklenemedi: " + (error.response?.data || error.message), "error");
        }
      },
      addPage() {
        this.form.pages.push({
          id: uuidv4(),
          questions: []
        });
        this.currentPageIndex = this.form.pages.length - 1;
        this.initializePreviewAnswers();
      },
      deletePage(index) {
        if (this.form.pages.length <= 1) {
          Swal.fire("Hata", "En az bir sayfa olmalı!", "warning");
          return;
        }
        Swal.fire({
          title: "Sayfa silinsin mi?",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Evet, Sil",
          cancelButtonText: "Hayır",
        }).then((result) => {
          if (result.isConfirmed) {
            this.form.pages.splice(index, 1);
            if (this.currentPageIndex >= this.form.pages.length) {
              this.currentPageIndex = this.form.pages.length - 1;
            }
            this.initializePreviewAnswers();
          }
        });
      },
      addQuestion() {
        const newQuestion = {
          id: uuidv4(),
          text: "",
          type: "text",
          hasMediaUrl: false,
          mediaUrl: "",
          message: "",
          options: [],
          answerOptionGroupId: null,
          hasNavigationRules: false,
          navigationRules: [],
          order: this.currentQuestions.length + 1,
          isExpanded: false,
        };
        this.form.pages[this.currentPageIndex].questions.push(newQuestion);
        this.initializePreviewAnswers();
      },
      addOption(pageIndex, questionIndex) {
        const newOption = {
          id: uuidv4(),
          text: "",
          value: 0,
          imageUrl: "",
          hasImageUrl: false,
          order: this.form.pages[pageIndex].questions[questionIndex].options.length + 1,
          isDefault: false,
        };
        this.form.pages[pageIndex].questions[questionIndex].options.push(newOption);
        if (this.form.pages[pageIndex].questions[questionIndex].hasNavigationRules) {
          this.form.pages[pageIndex].questions[questionIndex].navigationRules.push({
            id: uuidv4(),
            optionId: newOption.id,
            targetType: "page",
            targetIndex: 0,
          });
        }
      },
      removeOption(pageIndex, questionIndex, optionIndex) {
        const optionId = this.form.pages[pageIndex].questions[questionIndex].options[optionIndex].id;
        this.form.pages[pageIndex].questions[questionIndex].options.splice(optionIndex, 1);
        if (this.form.pages[pageIndex].questions[questionIndex].hasNavigationRules) {
          const ruleIndex = this.form.pages[pageIndex].questions[questionIndex].navigationRules.findIndex(r => r.optionId === optionId);
          if (ruleIndex !== -1) {
            this.form.pages[pageIndex].questions[questionIndex].navigationRules.splice(ruleIndex, 1);
          }
        }
        this.form.pages[pageIndex].questions[questionIndex].options.forEach((opt, idx) => {
          opt.order = idx + 1;
        });
      },
      applyAnswerOptionGroup(pageIndex, questionIndex) {
        const question = this.form.pages[pageIndex].questions[questionIndex];
        const groupId = question.answerOptionGroupId;
        if (groupId) {
          const group = this.answerOptionGroups.find((g) => g.id === groupId);
          if (group) {
            question.options = group.options.map(opt => ({
              id: uuidv4(),
              text: opt.text,
              value: opt.value,
              imageUrl: opt.imageUrl,
              hasImageUrl: opt.hasImageUrl,
              order: opt.order,
              isDefault: opt.isDefault
            }));
            if (question.hasNavigationRules) {
              question.navigationRules = question.options.map(opt => ({
                id: uuidv4(),
                optionId: opt.id,
                targetType: "page",
                targetIndex: 0,
              }));
            }
          }
        } else {
          question.options = [];
          question.navigationRules = [];
        }
      },
      toggleMediaUrl(pageIndex, questionIndex) {
        const question = this.form.pages[pageIndex].questions[questionIndex];
        if (!question.hasMediaUrl) {
          question.mediaUrl = "";
        }
      },
      toggleOptionImageUrl(pageIndex, questionIndex, optionIndex) {
        const option = this.form.pages[pageIndex].questions[questionIndex].options[optionIndex];
        if (!option.hasImageUrl) {
          option.imageUrl = "";
        }
      },
      clearQuestionData(pageIndex, questionIndex) {
        const question = this.form.pages[pageIndex].questions[questionIndex];
        if (question.type !== "message") {
          question.message = "";
        }
        if (question.type !== "radio" && question.type !== "checkbox") {
          question.hasMediaUrl = false;
          question.mediaUrl = "";
          question.options = [];
          question.answerOptionGroupId = null;
          question.hasNavigationRules = false;
          question.navigationRules = [];
        }
        if (question.type === "radio" || question.type === "checkbox") {
          question.message = "";
        }
      },
      toggleQuestionCollapse(questionIndex) {
        const question = this.form.pages[this.currentPageIndex].questions[questionIndex];
        question.isExpanded = !question.isExpanded;
      },
      moveQuestionUp(pageIndex, questionIndex) {
        if (questionIndex === 0) return;
        const questions = [...this.currentQuestions];
        const question = questions[questionIndex];
        questions[questionIndex] = questions[questionIndex - 1];
        questions[questionIndex - 1] = question;
        this.updateQuestionOrders(questions);
        this.currentQuestions = questions;
      },
      moveQuestionDown(pageIndex, questionIndex) {
        if (questionIndex === this.currentQuestions.length - 1) return;
        const questions = [...this.currentQuestions];
        const question = questions[questionIndex];
        questions[questionIndex] = questions[questionIndex + 1];
        questions[questionIndex + 1] = question;
        this.updateQuestionOrders(questions);
        this.currentQuestions = questions;
      },
      reorderQuestionByInput(pageIndex, questionIndex) {
        const questions = [...this.currentQuestions];
        const question = questions[questionIndex];
        let newOrder = question.order;
        if (isNaN(newOrder) || newOrder < 1) {
          newOrder = 1;
        } else if (newOrder > questions.length) {
          newOrder = questions.length;
        }
        questions.splice(questionIndex, 1);
        questions.splice(newOrder - 1, 0, question);
        this.updateQuestionOrders(questions);
        this.currentQuestions = questions;
      },
      updateQuestionOrders(questions) {
        questions.forEach((q, idx) => {
          q.order = idx + 1;
        });
      },
      onSortEnd(evt) {
        const questions = [...this.currentQuestions];
        const [moved] = questions.splice(evt.oldIndex, 1);
        questions.splice(evt.newIndex, 0, moved);
        this.updateQuestionOrders(questions);
        this.currentQuestions = questions;
      },
      removeQuestion(pageIndex, questionIndex) {
        this.form.pages[pageIndex].questions.splice(questionIndex, 1);
        this.updateQuestionOrders(this.currentQuestions);
        this.initializePreviewAnswers();
      },
      toggleNavigationRules(pageIndex, questionIndex) {
        const question = this.form.pages[pageIndex].questions[questionIndex];
        if (question.hasNavigationRules) {
          question.navigationRules = question.options.map(opt => ({
            id: uuidv4(),
            optionId: opt.id,
            targetType: "page",
            targetIndex: 0,
          }));
        } else {
          question.navigationRules = [];
        }
      },
      async saveForm() {

        console.log("Form data:", this.form); // Debugging line

        if (!this.form.title.trim()) {
          Swal.fire({
            icon: "warning",
            title: "Eksik Bilgi",
            text: "Form başlığı zorunludur!",
          });
          return;
        }
        try {
          const endpoint = this.form.id ? '/api/Form/UpdateForm' : '/api/Form/SaveForm';

          console.log("Form data:", this.form); // Debugging line
          console.log("Endpoint:", endpoint); // Debugging line
          const response = await axios.post(endpoint, this.form);
          this.form = {
            ...response.data,
            pages: response.data.pages.map(page => ({
              ...page,
              questions: page.questions.map(question => ({
                ...question,
                isExpanded: false
              }))
            }))
          };
          Swal.fire({
            icon: "success",
            title: "Başarılı",
            text: "Form kaydedildi!",
            timer: 2000,
            showConfirmButton: false,
          });
        } catch (error) {

            console.log("Form data:", this.form); // Debugging line
          Swal.fire({
            icon: "error",
            title: "Hata",
            text: "Form kaydedilemedi: " + (error.response?.data || error.message),
          });
        }
      },
      shareForm() {
        if (!this.form.id) {
          Swal.fire({
            icon: "warning",
            title: "Form Kaydedilmemiş",
            text: "Lütfen önce formu kaydedin!",
          });
          return;
        }
        const shareUrl = `${window.location.origin}/form/${this.form.id}/respond`;
        Swal.fire({
          title: "Form Paylaş",
          html: `<input type="text" value="${shareUrl}" class="form-control" readonly>`,
          showCancelButton: true,
          confirmButtonText: "Kopyala",
          cancelButtonText: "Kapat",
        }).then((result) => {
          if (result.isConfirmed) {
            navigator.clipboard.writeText(shareUrl);
            Swal.fire({
              icon: "success",
              title: "Kopyalandı!",
              text: "Bağlantı panoya kopyalandı.",
              timer: 2000,
              showConfirmButton: false,
            });
          }
        });
      },
      toggleEditMode() {
        this.isViewMode = false;
        this.$router.push(`/form/${this.form.id}/edit`);
      },
      previewForm() {
        this.showPreview = true;
      },
      initializePreviewAnswers() {
        this.previewAnswers = this.form.pages.map((page) =>
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
          }
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
  
  .question-card {
    background-color: #f5f5f5;
    border: 1px solid #e2e8f0;
  }
  
  .message-card {
    background-color: #e6f3ff;
    border: 1px solid #bfdbfe;
  }
  
  .question-header {
    background-color: #e2e8f0;
    border-bottom: 1px solid #cbd5e1;
    padding: 10px;
    border-radius: 6px 6px 0 0;
  }
  
  .color-palette {
    gap: 8px;
  }
  
  .color-swatch {
    width: 30px;
    height: 30px;
    border-radius: 4px;
    border: 1px solid #e2e8f0;
    cursor: pointer;
    transition: transform 0.2s ease;
  }
  
  .color-swatch:hover {
    transform: scale(1.1);
  }
  
  .color-swatch.selected {
    border: 2px solid #1e3a8a;
    transform: scale(1.1);
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
  
  .btn-secondary {
    background-color: #e2e8f0;
    color: #475569;
    border: none;
    padding: 8px 16px;
    font-size: 0.85rem;
    border-radius: 6px;
    font-weight: 600;
    transition: all 0.3s ease;
  }
  .btn-secondary:hover {
    background-color: #cbd5e1;
    color: #334155;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  .btn-outline-primary {
    background-color: #fff;
    color: #60a5fa;
    border: 1px solid #60a5fa;
    padding: 6px 12px;
    font-size: 0.85rem;
    border-radius: 6px;
    transition: all 0.3s ease;
  }
  .btn-outline-primary:hover {
    background-color: #60a5fa;
    color: #fff;
  }
  
  .btn-outline-secondary {
    background-color: #fff;
    color: #475569;
    border: 1px solid #cbd5e1;
    padding: 4px 8px;
    font-size: 0.8rem;
    border-radius: 4px;
  }
  .btn-outline-secondary:hover {
    background-color: #e2e8f0;
  }
  
  .btn-danger {
    background-color: #f87171;
    color: #fff;
    border: none;
    padding: 6px 12px;
    font-size: 0.8rem;
    border-radius: 6px;
    transition: all 0.3s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  .btn-danger:hover {
    background-color: #ef4444;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
  
  .btn-warning {
    background-color: #facc15;
    color: #1e3a8a;
    border: none;
    padding: 6px 12px;
    font-size: 0.8rem;
    border-radius: 6px;
    transition: all 0.3s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  .btn-warning:hover {
    background-color: #eab308;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
  
  .btn-info {
    background-color: #22d3ee;
    color: #fff;
    border: none;
    padding: 8px 16px;
    font-size: 0.85rem;
    border-radius: 6px;
    transition: all 0.3s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  .btn-info:hover {
    background-color: #06b6d4;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
  
  .form-control {
    width: 100%;
    padding: 8px;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    font-size: 0.9rem;
  }
  
  .form-label {
    font-size: 0.85rem;
    font-weight: 500;
    color: #1e3a8a;
  }
  
  .page-tabs {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
  }
  
  .page-tab {
    padding: 8px 16px;
    border: 1px solid #60a5fa;
    border-radius: 6px;
    background-color: #fff;
    color: #60a5fa;
    font-size: 0.85rem;
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;
  }
  .page-tab:hover {
    background-color: #60a5fa;
    color: #fff;
  }
  .page-tab.active {
    background-color: #3b82f6;
    color: #fff;
    border-color: #3b82f6;
  }
  .delete-page {
    position: absolute;
    top: -8px;
    right: -8px;
    background-color: #f87171;
    color: #fff;
    border-radius: 50%;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 0.8rem;
  }
  .delete-page:hover {
    background-color: #ef4444;
  }
  
  .question-number {
    font-weight: 600;
    color: #1e3a8a;
    min-width: 30px;
  }
  
  .question-label {
    display: block;
    font-size: 0.9rem;
    margin-bottom: 0.5rem;
  }
  
  .option-number {
    font-weight: 600;
    color: #1e3a8a;
    min-width: 30px;
  }
  
  .text-sm {
    font-size: 0.85rem;
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
  .justify-content-end {
    justify-content: flex-end;
  }
  .mb-3 {
    margin-bottom: 1rem;
  }
  .ml-4 {
    margin-left: 1.5rem;
  }
  .mr-2 {
    margin-right: 0.5rem;
  }
  .mt-3 {
    margin-top: 1rem;
  }
  .mb-2 {
    margin-bottom: 0.5rem;
  }
  .text-right {
    text-align: right;
  }
  
  .preview-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }
  .preview-content {
    border-radius: 12px;
    width: 90%;
    max-width: 800px;
    max-height: 80vh;
    overflow-y: auto;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  .preview-header {
    padding: 12px 20px;
    border-bottom: 1px solid #e2e8f0;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .preview-body {
    padding: 20px;
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
    .page-tab {
      padding: 6px 12px;
      font-size: 0.8rem;
    }
    .color-swatch {
      width: 25px;
      height: 25px;
    }
  }
  
  @media (max-width: 576px) {
    .card {
      padding: 15px;
    }
    .btn-primary,
    .btn-secondary,
    .btn-info,
    .btn-warning {
      padding: 6px 12px;
      font-size: 0.8rem;
    }
    .preview-content {
      width: 95%;
    }
    .color-swatch {
      width: 20px;
      height: 20px;
    }
  }
  </style>