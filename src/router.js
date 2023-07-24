import Vue from 'vue';
import Router from 'vue-router';
import FillDataForm from './views/FillDataForm.vue';
import Homepage from './views/Homepage.vue';
import FillDataTable from './views/FillDataTable.vue';
import SelectFillingMode from './views/SelectFillingMode.vue';
import FillDataUpload from './views/FillDataUpload.vue';
import CreateSchemaForm from './views/CreateSchemaForm.vue';
import Login from './views/Login.vue';

import i18n from './i18n'


Vue.use(Router);

let router = new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/:lang',
      component: {
        render: h => h('router-view')
      },
      children: [
        {
          path: '',
          name: 'home',
          component: Homepage,
        },
        {
          path: 'select',
          name: 'select',
          component: SelectFillingMode,
        },
        {
          path: 'form',
          name: 'form',
          component: FillDataForm,
        },
        {
          path: 'table',
          name: 'table',
          component: FillDataTable,
        },
        {
          path: 'upload',
          name: 'upload',
          component: FillDataUpload,
        },
        {
          path: 'login',
          name: 'login',
          component: Login,
        },
        {
          path: 'create',
          name: 'create',
          component: CreateSchemaForm,
        },
      ]
    },
  ],
});

router.beforeEach((to, from, next) => {
  const lang = to.params.lang;
  if (!['en', 'fr'].includes(lang)) {
    return next('fr');
  }

  if (i18n.locale !== lang) {
    i18n.locale = lang;
  }

  return next();
});

export default router;