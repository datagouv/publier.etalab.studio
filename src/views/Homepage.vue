<template>
  <div>
    <div class="fr-container fr-pb-6w fr-pt">
      <br /><br />
      <div class="boxes">
        <div class="homepage-box">
          <div style="text-align: left; font-size: 35px; line-height: 40px">
            Saisissez, validez et publiez
            <br />
            vos données structurées
          </div>

          <div class="sub-title">
            <p class="sub-title-p">
              Vous utilisez un schéma de référence pour vos données ?
              <br />
              Validez et corriger vos fichiers en quelques clics
              <br />
              et publiez-les directement sur
              <a href="http://www.data.gouv.fr">data.gouv.fr</a> !
            </p>
          </div>

          <div>
            <b-button href="#search-bar" class="sub-title-btn fr-btn">
              Sélectionner un type de données&nbsp;&nbsp;
              <img src="../static/images/down-arrow.png" width="15" />
            </b-button>
          </div>
        </div>
        <div class="homepage-box homepage-logo">
          <img src="../static/images/logo.png" width="450" />
        </div>
      </div>
      <br /><br />
      <br />
    </div>
    <div
      class="fr-container-fluid banner-title-background fr-centered fr-pb-6w fr-pt-2w"
    >
      <div class="title-banner">
        <p>Produire des données de qualité, en 4 étapes !</p>
      </div>
      <div
        class="fr-grid-row fr-grid-row--center fr-grid-row--gutter"
        style="max-width: 1100px; margin: auto"
      >
        <img src="../static/images/steps.png" width="100%" />
      </div>
    </div>

    <div id="search-bar" class="fr-container fr-pb-6w fr-pt-2w">
      <br />
      <h3>Sélectionner un type de jeu de données</h3>
      <!--<br />
            <p>
                Les types de jeux de données ci-dessous sont issues du référentiel de schéma de
                la plateforme schema.data.gouv.fr.
            </p>-->
      <br />
      <div class="fr-search-bar" id="header-search">
        <label class="fr-label" for="header-search-input">
          Label de la barre de recherche
        </label>
        <input
          v-model="searchText"
          v-on:input="filterSchema()"
          class="fr-input"
          placeholder="Rechercher un type de jeu de données"
          type="search"
          id="header-search-input"
          name="header-search-input"
        />
        <button class="fr-btn" title="Rechercher un type de jeu de données">
          <span> Rechercher un type de jeu de données </span>
        </button>
      </div>
    </div>
    <div style="background-color: #efefef">
      <div class="fr-container fr-pb-6w fr-pt-2w">
        <p>{{ messageSchema }}</p>
        <div class="boxes">
          <div
            class="box style-schema"
            v-for="schema in schemasToShow"
            :key="schema.name"
            @click="goto(schema)"
          >
            <div style="color: black" class="box-header">
              {{ schema.title }}
            </div>
            <div class="box-logo">
              <img
                src="../static/images/diagram_black.png"
                width="30"
                height="30"
              />
            </div>
            <div style="color: black" class="box-content">
              {{ truncateText(schema.description) }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
</style>

<script>
import latinize from "latinize";

import { VsaItem, VsaHeading, VsaContent } from "vue-simple-accordion";

const SCHEMAS_CATALOG_URL = process.env.VUE_APP_SCHEMAS_CATALOG_URL;

export default {
  name: "homepage",
  components: {
    VsaItem,
    VsaHeading,
    VsaContent,
  },
  data() {
    return {
      schemas: null,
      schemasToShow: null,
      searchText: "",
      messageSchema: "",
    };
  },
  mounted() {
    const loader = this.$loading.show();
    fetch(`${SCHEMAS_CATALOG_URL}`)
      .then((r) => r.json())
      .then((data) => {
        this.schemas = data.schemas.filter(
          (s) => s.schema_type != "datapackage"
        );
        this.schemasToShow = this.schemas;
      })
      .finally(() => {
        loader.hide();
      });
  },
  computed: {},
  watch: {},
  methods: {
    truncateText(desc) {
      if (desc.length > 200) {
        return desc.slice(0, 200) + " [...]";
      }
      return desc;
    },
    goto(schema) {
      this.$router.push({
        name: "select",
        params: { lang: this.$route.params.lang },
        query: { schema: schema.name },
      });
    },
    filterSchema() {
      if (this.searchText !== "") {
        const obj = [];
        this.schemas.forEach((schema) => {
          if (
            latinize(schema.title.toLowerCase()).includes(
              latinize(this.searchText.toLowerCase())
            )
          ) {
            obj.push(schema);
          }
        });
        this.schemasToShow = obj;
        if (this.schemasToShow.length === 0) {
          this.messageSchema = "Aucun schéma trouvé";
        }
      } else {
        this.schemasToShow = this.schemas;
      }
    },
    btnGuideClick() {
      window.open(
        "https://guides.etalab.gouv.fr/producteurs-schemas/#a-qui-s-adresse-ce-guide"
      );
    },
  },
};
</script>

<style scoped>
.sub-title {
  margin-top: 20px;
}
.sub-title-p {
  font-size: 20px;
  line-height: 25px;
}
</style>