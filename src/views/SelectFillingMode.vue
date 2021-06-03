<template>
    <div>
        <div v-if="schema"  class="rf-container rf-pb-6w rf-pt-1w">
            <p style="font-size: 14px; cursor: pointer;"><a @click="gotoHomePage()" >Accueil</a>&nbsp;&nbsp;&nbsp;>&nbsp;&nbsp;&nbsp;{{ schema.title }}</p>
            
            <div style="display: flex;">
              <div style="flex: 2;">
                <p class="title-page">Saisir ou charger mes données</p>
                
                <p class="subtitle-page" v-if="schema && (schema.schema_type == 'tableschema' || schema.schema_type == 'jsonschema')">Vos données sont-elles déjà structurées ?</p>
                <p>Si vous avez déjà un fichier en votre possession, répondez oui.</p><p>Si vous partez de zéro, répondez non !
                <br /><br />
                <div class="choice-box" v-if="schema && (schema.schema_type == 'tableschema' || schema.schema_type == 'jsonschema')">
                  <span @click="goto('upload')" class="choice-no-selected">Oui</span>
                  <span @click="noDataChoice = !noDataChoice" v-if="noDataChoice && schema && schema.schema_type == 'tableschema'" class="choice-no-selected">Non</span>
                  <span @click="noDataChoice = !noDataChoice" v-if="!noDataChoice && schema && schema.schema_type == 'tableschema'" class="choice-selected">Non</span>
                  <div v-if="!noDataChoice">
                    <br /><br />
                    <p>Notre outils vous aide à construire votre fichier !</p>
                    <p>Comment souhaitez-vous procéder ?</p>
                    <br />
                    <span @click="goto('form')" class="choice-no-selected">Remplir un formulaire</span>
                    <span @click="goto('table')" class="choice-no-selected">Utiliser l'outil de tableur</span>
                  </div>
                </div>
                <p  v-if="schema && schema.schema_type == 'other'">Ce schéma obéit à un standard indépendant, notre outil ne propose pas la saisie de ces données</p>
                </div>
                <div style="flex: 1">
                  <div class="infobox">
                    <div class="infobox-title">Ressources utiles</div>
                    <div class="infobox-content">
                      <div v-for="item in this.schema.examples" v-bind:key="item.title">
                        <div class="infobox-content-item">
                          <p @click="btnDocClick()">
                              <img src="../static/images/foreign.png" width="12" />
                              &nbsp;
                              <u>Lire la documentation</u> du schéma
                          </p>
                        </div>
                        <div class="infobox-content-item">
                          <span @click="gotoExemple(item.path)">
                              <img src="../static/images/download.png" width="12" />
                              &nbsp;
                              <u>{{ item.title }}</u>
                          </span>
                        </div>
                      </div>
                      <div class="infobox-content-item">
                        <p @click="btnFilesClick()">
                            <img src="../static/images/view.png" width="15" />
                            &nbsp;
                            <u>Explorer les fichiers</u> sur data.gouv.fr
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
        </div>
    </div>
</template>

<script>

const SCHEMAS_CATALOG_URL = process.env.VUE_APP_SCHEMAS_CATALOG_URL;
const DGV_BASE_URL = process.env.VUE_APP_DATAGOUV_API_URL;

export default {
  name: 'selectfillingmode',
  components: {},
  data() {
    return {
      schemaName: this.$route.query.schema,
      schemas: null,
      noDataChoice: true,
    };
  },
  mounted() {
    const loader = this.$loading.show();
    fetch(`${SCHEMAS_CATALOG_URL}`).then((r) => r.json()).then((data) => {
      this.schemas = data.schemas;
    }).finally(() => {
      loader.hide();
    });
  },
  computed: {
    schema() {
      if (!this.schemaName) return;
      if (!this.schemas) return;
      // eslint-disable-next-line consistent-return
      return this.schemas.find((s) => s.name === this.schemaName);
    },
  },
  watch: {
  },
  methods: {
    goto(type) {
      this.$router.push(`${type}?schema=${this.$route.query.schema}`);
    },
    gotoHomePage() {
      this.$router.push('/');
    },
    btnDocClick() {
      window.open(`https://schema.data.gouv.fr/${this.schemaName}/latest.html`);
    },
    btnFilesClick() {
      window.open(`${DGV_BASE_URL}/datasets/?schema=${this.schemaName}`);
    },
    gotoExemple(url){
      window.open(url)
    }
  },
};
</script>
