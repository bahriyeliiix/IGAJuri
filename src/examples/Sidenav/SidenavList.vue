<script setup>
import { computed, ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import SidenavItem from "./SidenavItem.vue";

const store = useStore();
const router = useRouter();
const route = useRoute();
const isRTL = computed(() => store.state.isRTL);
const hasToken = ref(false);
const userRole = ref(null);

// Token ve rol kontrolü yap
onMounted(() => {
  hasToken.value = !!localStorage.getItem('token');
  userRole.value = parseInt(localStorage.getItem('role'), 10);
});

const getRoute = () => {
  const routeArr = route.path.split("/");
  return routeArr[1];
};

const handleLogout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('role');
  store.commit('clearAuthData');
  hasToken.value = false;
  userRole.value = null;
  router.push('/signin').catch(() => {});
};
</script>

<template>
  <div
    v-if="hasToken"
    class="collapse navbar-collapse w-auto h-auto h-100"
    id="sidenav-collapse-main"
  >
    <ul class="navbar-nav">
      <li class="nav-item">
        <sidenav-item
          to="/surveyList"
          :class="getRoute() === 'surveyList' ? 'active' : ''"
          navText="ANKETLER"
        >
          <template v-slot:icon>
            <i class="ni ni-single-02 text-warning text-sm opacity-10"></i>
          </template>
        </sidenav-item>
      </li>
      
      <!-- Sadece admin (role 1) görsün -->
      <li v-if="userRole === 1" class="nav-item">
        <sidenav-item
          to="/jurry"
          :class="getRoute() === 'jurry' ? 'active' : ''"
          navText="JÜRİLER"
        >
          <template v-slot:icon>
            <i class="ni ni-single-02 text-warning text-sm opacity-10"></i>
          </template>
        </sidenav-item>
      </li>

      <li v-if="userRole === 1" class="nav-item">
        <sidenav-item
          to="/forms"
          :class="getRoute() === 'jurry' ? 'active' : ''"
          navText="FORMLAR"
        >
          <template v-slot:icon>
            <i class="ni ni-single-02 text-warning text-sm opacity-10"></i>
          </template>
        </sidenav-item>
      </li>
      
      <li v-if="userRole === 1" class="nav-item">
        <sidenav-item
          to="/questions"
          :class="getRoute() === 'jurry' ? 'active' : ''"
          navText="SORULAR"
        >
          <template v-slot:icon>
            <i class="ni ni-single-02 text-warning text-sm opacity-10"></i>
          </template>
        </sidenav-item>
      </li>
      <li v-if="userRole === 1" class="nav-item">
        <sidenav-item
          to="/answers"
          :class="getRoute() === 'jurry' ? 'active' : ''"
          navText="CEVAPLAR"
        >
          <template v-slot:icon>
            <i class="ni ni-single-02 text-warning text-sm opacity-10"></i>
          </template>
        </sidenav-item>
      </li>
      <li class="nav-item">
  <sidenav-item
    to="/cekilisler"
    :class="getRoute() === 'cekilisler' ? 'active' : ''"
    navText="ÇEKİLİŞLER"
  >
    <template v-slot:icon>
      <i class="ni ni-single-02 text-warning text-sm opacity-10"></i>
    </template>
  </sidenav-item>
</li>
      
      <li class="nav-item mt-auto">
        <div
          @click="handleLogout"
          class="cursor-pointer d-flex align-items-center px-3 py-2 ps-4"
          :class="isRTL ? 'pe-4' : 'ps-4'"
        >
          <i class="ni ni-user-run text-danger text-sm opacity-10 me-2"></i>
          <span class="nav-link-text ms-1">ÇIKIŞ YAP</span>
        </div>
      </li>
    </ul>
  </div>
  
  <!-- Token yoksa boş bir div -->
  <div v-else></div>
</template>