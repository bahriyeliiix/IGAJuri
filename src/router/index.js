import { createRouter, createWebHistory } from "vue-router";
import Dashboard from "../views/Dashboard.vue";
import Profile from "../views/Profile.vue";
import Signup from "../views/Signup.vue";
import Signin from "../views/Signin.vue";
import Jüriler from "../views/Juriler.vue";
import Survey from "../views/Survey.vue";
import SurveyDetailChart from "../views/SurveyDetailChart.vue";
import ReviewScreen from "../views/ReviewScreen.vue";
import UnauthorizedPage from "../views/UnauthorizedPage.vue";
import SurveyContent from "../views/SurveyContent.vue";
import Anketler from "../views/Anketler.vue";

const routes = [
  {
    path: "/",
    name: "/",
    redirect: "/signin",
  },
  {
    path: "/dashboard-default",
    name: "Dashboard",
    component: Dashboard,
    meta: { requiresAuth: true, allowedRoles: [1] } // Auth gerektirir
  },
  {
    path: "/jurry",
    name: "JÜRİLER",
    component: Jüriler,
    meta: { requiresAuth: true, allowedRoles: [1] } // Sadece admin (role 1)
  },
  {
    path: "/401",
    name: "UnauthorizedPage",
    component: UnauthorizedPage,
    meta: { public: true } // Token gerektirmemeli
  },
  {
    path: '/survey-content/:id',
    name: 'ANKET İÇERİĞİ',
    component: SurveyContent,
    meta: { requiresAuth: true }
  },
  {
    path: '/survey-detail-chart/:id',
    name: 'ANKET DETAY GRAFİKLERİ',
    component: SurveyDetailChart,
    meta: { requiresAuth: true }
  },
  {
    path: '/survey/:id/:userId',
    name: "ANKET",
    component: Survey,
    meta: { requiresAuth: true, allowedRoles: [2] } // Sadece jüri (role 2)
  },
  {
    path: "/surveyList",
    name: "ANKETLER",
    component: Anketler,
    meta: { requiresAuth: true,  allowedRoles: [1,2] } // Sadece admin
  },
  {
    path: '/review-screen/:surveyId/:photoId',
    name: 'RESİM ÖZET EKRANI',
    component: ReviewScreen,
    meta: { requiresAuth: true }
  },
  {
    path: "/profile",
    name: "Profile",
    component: Profile,
    meta: { requiresAuth: true }
  },
  {
    path: "/signin",
    name: "Signin",
    component: Signin,
    meta: { public: true } // Auth gerektirmez
  },
  {
    path: "/signup",
    name: "Signup",
    component: Signup,
    meta: { public: true }
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
  linkActiveClass: "active",
});
// Global Auth Kontrolü
router.beforeEach((to, from, next) => {

  const token = localStorage.getItem("token");
  const userRole = parseInt(localStorage.getItem("role"), 10);


  // 1. Public sayfaları kontrol et
  if (to.meta.public) {
    return next();
  }

  // 2. Token kontrolü
  if (!token) {
    return next('/401');
  }

  // 3. Role kontrolü (eğer route'ta tanımlıysa)
  if (to.meta.allowedRoles) {
    console.log("Route için gerekli roller:", to.meta.allowedRoles);
    if (!to.meta.allowedRoles.includes(userRole)) {
      return next('/401');
    }
  }

  next();
});

export default router;

