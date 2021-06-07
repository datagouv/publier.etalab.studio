<template>
  <div>
    <b-navbar-nav class="ml-auto">
      <b-navbar-nav v-if="user && !user.loggedIn">
        <b-nav-item @click="showModalConnectLaunch()">
          Se connecter
        </b-nav-item>
      </b-navbar-nav>

      <b-nav-item-dropdown right v-if="user && user.loggedIn">
        <!-- Using 'button-content' slot -->
        <template v-slot:button-content>
          {{ user.data.first_name }} {{ user.data.last_name }}
        </template>
        <b-dropdown-item :href="user.data.page">
          Mon profil
        </b-dropdown-item>
        <b-dropdown-divider></b-dropdown-divider>
        <b-dropdown-item @click="logout">
          Se déconnecter
        </b-dropdown-item>
      </b-nav-item-dropdown>
    </b-navbar-nav>

    <b-modal
      class="rf-container rf-pb-6w rf-pt-2w"
      ref="modalConnect"
      id="modalConnect"
      hide-footer
      title="Autoriser publier.etalab.studio"
    >
      <div>
        <p>Bonjour !</p>
        <p>Pour publier à votre place sur data.gouv.fr, nous avons besoin de votre autorisation.</p>
        <p>Le site publier.etalab.studio pourra :<ul><li>accéder à votre profil et à vos organisations sur data.gouv.fr</li><li>publier un jeu de données pour vous sur data.gouv.fr</li></ul></p>
        <p>Merci de vous cliquer sur le bouton ci-dessous et d'accepter ces autorisations.</p>
        <br />
        <b-button class="rf-btn" @click="submitLogin">
          Je suis d'accord&nbsp;&nbsp;&nbsp;<img src="../static/images/check.png" width="10"/>
        </b-button>
        &nbsp;&nbsp;&nbsp;
        <span @click="hideModalConnect()" style="cursor: pointer;"><u>Je ne suis pas d'accord</u></span>
      </div>
    </b-modal>


    
  </div>
</template>

<script>
import Auth from '../services/Auth';

const $auth = new Auth();

export default {
  created() {
    this.getUserConnections();
  },
  computed: {
    user() {
      return this.$store.state.auth.user;
    },
  },
  methods: {
    getUserConnections() {
    },
    submitLogin(evt) {
      if ((this.$route.name != 'login') & (this.$route.name != 'home')) {
        this.$store.dispatch('auth/fillLastPage',this.$route.name+'?schema='+this.$route.query.schema)
      } else {
        this.$store.dispatch('auth/fillLastPage','/')
      }
      evt.preventDefault();
      window.location = $auth.authUrl();
    },
    async logout() {
      await $auth.proceedLogout(this.$store.state.auth.user.token);
      this.$store.dispatch('auth/logout');
    },    
    showModalConnect() {
      this.$refs.modalConnect.show();
    },
    hideModalConnect() {
      this.$refs.modalConnect.hide();
    },
    showModalConnectLaunch() {
      this.$refs.modalConnectLaunch.show();
    },
    hideModalConnectLaunch() {
      this.$refs.modalConnectLaunch.hide();
    },
  },
  mounted() {
    this.polling = setInterval(() => {
      if (this.$store.state.auth.user.token !== '') {
        this.$store.dispatch('auth/checkToken');
      }
    }, 3000);
  },
};
</script>
