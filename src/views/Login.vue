<template>
  <div>
    <h1>Login page</h1>
    <a href="/">back</a>
  </div>
</template>

<script>
import $api from "../services/Api";
import Auth from "../services/Auth";

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
        console.log("erreurrrr");
        this.$router.push({
          name: "home",
          params: { lang: this.$route.params.lang },
        });
      }
      this.$store.dispatch("auth/login", this.token).then(() => {
        $api.get("me").then(
          (response) => {
            this.$store
              .dispatch("auth/fillUserData", response.data)
              .then(() => {
                let page = this.user.lastPage.split("?")[0];
                if (page == "/") {
                  page = "home";
                }
                let obj = {};
                if (this.user.lastPage.split("?").length > 1) {
                  this.user.lastPage
                    .split("?")[1]
                    .split("&")
                    .forEach((item) => {
                      obj[item.split("=")[0]] = item.split("=")[1];
                    });
                }
                this.$router.push({
                  name: page,
                  params: { lang: this.$route.params.lang },
                  query: obj,
                });
              });
          },
          (err) => {
            // eslint-disable-next-line
            console.log({ err });
          }
        );
      });
    } else {
      // console.log("Logged in", this.$store.state.auth.user)
      let page = this.user.lastPage.split("?")[0];
      if (page == "/") {
        page = "home";
      }
      let obj = {};
      if (this.user.lastPage.split("?").length > 1) {
        this.user.lastPage
          .split("?")[1]
          .split("&")
          .forEach((item) => {
            obj[item.split("=")[0]] = item.split("=")[1];
          });
      }
      this.$router.push({
        name: page,
        params: { lang: this.$route.params.lang },
        query: obj,
      });

      this.$router.push({
        name: page,
        params: { lang: lang },
        query: obj,
      });
      //this.$router.push(this.user.lastPage);
    }
  },
  methods: {
    async getToken() {
      this.token = await $auth.retrieveToken(
        { ...this.$route.query },
        this.$route.params.lang
      );
    },
  },
};
</script>
