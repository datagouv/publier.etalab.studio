<template>
  <div>
    <h1>Login page</h1>
    <a href="/">back</a>
  </div>
</template>

<script>
import $api from '../services/Api';
import Auth from '../services/Auth';

const $auth = new Auth();
export default {
  data() {
    return {
      token: undefined,
    };
  },
  computed: {
    user() {
      return this.$store.state.auth.user;
    },
  },
  async mounted() {
    if (!this.$store.state.auth.user.loggedIn) {
      try {
        await this.getToken();
      } catch (e) {
        // console.error(e.response.data)
        this.$router.push('/');
      }
      this.$store.dispatch('auth/login', this.token).then(() => {
        $api.get('me').then(
          (response) => {
            this.$store
              .dispatch('auth/fillUserData', response.data)
              .then(() => {
                this.$router.push(this.user.lastPage);
              });
          },
          (err) => {
            // eslint-disable-next-line
            console.log({ err })
          },
        );
      });
    } else {
      // console.log("Logged in", this.$store.state.auth.user)
      this.$router.push(this.user.lastPage);
    }
  },
  methods: {
    async getToken() {
      this.token = await $auth.retrieveToken({ ...this.$route.query });
    },
  },
};
</script>
