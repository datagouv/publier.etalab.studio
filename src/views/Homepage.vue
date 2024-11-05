<template>
  <div>
    <div class="fr-container fr-pb-6w fr-pt">
      <br /><br />
      <div class="boxes">
        <div class="homepage-box">
          <div style="text-align: left; font-size: 35px; line-height: 40px">
            {{ $t("home.catchline") }}
          </div>

          <div class="sub-title">
            <p class="sub-title-p">
              {{ $t("home.description") }}
              <a href="http://www.data.gouv.fr">data.gouv.fr</a> !
            </p>
          </div>

          <div>
            <b-button href="#search-bar" class="sub-title-btn fr-btn">
              {{ $t("home.select_button") }}&nbsp;&nbsp;
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
        <p>{{ $t("home.process_caption") }}</p>
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
      <h3>{{ $t("home.select_title") }}</h3>
      <br />
      <div class="fr-search-bar" id="header-search">
        <label class="fr-label" for="header-search-input">
          {{ $t("home.search_bar_label") }}
        </label>
        <input
          v-model="searchText"
          v-on:input="filterSchema()"
          class="fr-input"
          :placeholder="$t('home.search_bar_placeholder')"
          type="search"
          id="header-search-input"
          name="header-search-input"
        />
        <button class="fr-btn" title="Rechercher un schéma de données">
          <span> {{ $t("home.search_bar_placeholder") }} </span>
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
        <div v-if ="schemasToShow.length === 0" class="fr-search-bar">
          Vous pouvez renseigner l'URL d'un schéma qui n'est pas référencé pour publier des données :
          <input
            v-model="externalSchemaUrl"
            class="fr-input"
            :placeholder="$t('home.external_schema_url')"
            type="search"
          />
          <button
            class="fr-btn"
            title="Entrer l'URL d'un schéma de données externe"
            @click="submitExternal"
          ></button>
        </div>
        <br /><br />
        <p><b>{{ invalidUrlEntered }}</b></p>
        <p v-if="missingProperties.length > 0">Propriétés manquantes : {{ missingProperties.join(', ') }}</p>
      </div>
    </div>
  </div>
</template>

<style>
</style>

<script>
import latinize from "latinize";

const SCHEMAS_CATALOG_URL = process.env.VUE_APP_SCHEMAS_CATALOG_URL;

export default {
  name: "homepage",
  components: {},
  data() {
    return {
      schemas: null,
      schemasToShow: null,
      searchText: "",
      messageSchema: "",
      externalSchemaUrl: "",
      invalidUrlEntered: "",
      missingProperties: [],
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
          this.messageSchema = "Aucun schéma ne correspond à cette recherche.";
        }
      } else {
        this.schemasToShow = this.schemas;
      }
    },
    btnGuideClick() {
      window.open(
        "https://guides.data.gouv.fr/publier-des-donnees/guide-qualite/maitriser-les-schemas-de-donnees"
      );
    },
    submitExternal() {
      const url = this.externalSchemaUrl;
      const expectedProperties = ['$schema', 'name', 'homepage', 'fields'];
      fetch(url)
        .then((response) => {
          if (!response.ok) {
            this.invalidUrlEntered = "La récupération du schéma a échoué. Assurez-vous que le lien est bien correct.";
          }
          return response.text();
        })
        .then((text) => {
          try {
            const json = JSON.parse(text);
            this.missingProperties = expectedProperties.filter(property => !json.hasOwnProperty(property));
            if (this.missingProperties.length > 0) {
              this.invalidUrlEntered = 'Le schéma ne contient pas tous les champs requis.';
            }
            else {
              this.$router.push({
                name: "select",
                params: { lang: this.$route.params.lang },
                query: { schema_url: url },
              });
            }
          } catch (e) {
            this.invalidUrlEntered = 'La récupération du schéma a échoué. Assurez-vous que le lien est bien correct.';
          }
        });
    }
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