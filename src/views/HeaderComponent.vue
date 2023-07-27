<template>
  <header class="fr-header">
    <div
      style="
        width: 100%;
        height: 50px;
        background-color: #ffcb00;
        color: #0054b3;
        text-align: center;
        line-height: 50px;
      "
    >
      <img
        src="../static/images/chemistry-lab-instrument.png"
        height="30"
      />&nbsp;&nbsp;&nbsp;Ce site est un <b>nouveau service</b>, toujours en
      expérimentation. N'hésitez pas à
      <a href="mailto:schema@data.gouv.fr">nous contacter</a> pour toute
      question.
    </div>
    <div class="fr-container" style="height: 130px">
      <div class="header-body">
        <div class="brand-rf">
          <a class="fr-logo" href="/" title="République française">
            <span class="fr-logo__title">
              République
              <br />française
            </span>
          </a>
        </div>
        <div class="main-title">
          <div class="fr-service">
            <a class="fr-service__title" href="/" title="<%= appName %>">
              publier.etalab.studio
            </a>
            <p class="fr-service__tagline">
              <i>{{ $t("header.description") }}</i>
            </p>
          </div>
          <div class="fill-remaining-space"></div>
          <div class="navuser">
            <client-only>
              <nav-user />
            </client-only>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script>
import ClientOnly from "vue-client-only";
import NavUser from "../components/NavUser.vue";

export default {
  components: {
    ClientOnly,
    NavUser,
  },
};
</script>

<style scoped>
.fill-remaining-space {
  flex: auto;
}

.main-title {
  color: black;
  width: 100%;
}

.brand-rf {
  width: 150px;
  margin-bottom: 20px;
  margin-top: 20px;
  font-size: 0.75rem;
  font-family: "Marianne";
}

.header-body {
  display: flex;
}

.main-title {
  display: flex;
}

.fr-service {
  margin-bottom: 40px;
  margin-top: 40px;
  width: 400px;
}

.fr-service__title {
  font-size: 1.25rem;
  font-weight: bold;
  font-family: "Marianne";
}

.navuser {
  float: right;
  margin-top: 50px;
}
</style>