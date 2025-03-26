import { createRouter, createWebHistory } from "vue-router";
import Dashboard from "../views/Dashboard.vue";
import Profile from "../views/Profile.vue";
import Signup from "../views/Signup.vue";
import Signin from "../views/Signin.vue";
import Anketler from "../views/Anketler.vue";
import Jüriler from "../views/Juriler.vue";
import Survey from "../views/Survey.vue";
import ReviewScreen from "../views/ReviewScreen.vue";


import SurveyContent from "../views/SurveyContent.vue";
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
  },
  {
      path: "/JURRY",
      name: "JÜRİLER",
      component: Jüriler,
  },
  {
    path: '/survey-content/:id', // :id parametresi zorunlu
    name: 'SurveyContent',
    component: SurveyContent,
  },
  {
    path: '/survey/:id', // :id parametresi zorunlu
    name: "Survey",
    component: Survey,
  },
  {
    path: "/anketler",
    name: "ANKETLER",
    component: Anketler,
  },
  {
    path: '/review-screen/:surveyId/:photoId', // ReviewScreen rotası
    name: 'ReviewScreen',
    component: ReviewScreen,
  },
  
  {
    path: "/profile",
    name: "Profile",
    component: Profile,
  },

  {
    path: "/signin",
    name: "Signin",
    component: Signin,
  },
  {
    path: "/signup",
    name: "Signup",
    component: Signup,
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
  linkActiveClass: "active",
});

export default router;

