<template>
  <div>
    <div class="fr-container">
      <p style="font-size: 14px; cursor: pointer">
        <a @click="gotoHomePage()" style="cursor: pointer">Accueil</a>
        &nbsp;&nbsp;&nbsp;>&nbsp;&nbsp;&nbsp;{{ schema.title }}
      </p>
    </div>

    <div v-if="schema" class="fr-container fr-pb-6w fr-pt-1w">
      <div style="display: flex">
        <div v-if="schema && schema.schema_type == 'tableschema'" style="flex: 2">
          <p class="title-page">{{ $t("selected.title") }}</p>

          <p class="subtitle-page">{{ $t("selected.subtitle") }}</p>
          <p>{{ $t("selected.already_yes") }}</p>
          <p>{{ $t("selected.already_no") }}<br /><br /></p>

          <div class="choice-box">
            <span @click="goto('upload')" class="choice-no-selected">{{ $t("global.yes") }}</span>
            <span
              @click="noDataChoice = !noDataChoice"
              v-if="noDataChoice && schema"
              class="choice-no-selected"
              >{{ $t("global.no") }}</span
            >
            <span
              @click="noDataChoice = !noDataChoice"
              v-if="!noDataChoice && schema"
              class="choice-selected"
              >{{ $t("global.no") }}</span
            >
            <div v-if="!noDataChoice">
              <br /><br />
              <p>{{ $t("selected.tool_description") }}</p>
              <p>{{ $t("selected.proceed_question") }}</p>
              <br />
              <span @click="goto('form')" class="choice-no-selected"
                >{{ $t("selected.fill_form") }}</span
              >
              <span @click="goto('table')" class="choice-no-selected"
                >{{ $t("selected.fill_spreadsheet") }}</span
              >
            </div>
          </div>
        </div>
        <div v-else :style="{ 'padding-right': '200px' }">
          {{ $t("selected.unsupported_schema") }} ({{ schema.schema_type }}).
          <br />
          {{ $t("selected.publish_directly")}} <a href="https://www.data.gouv.fr/fr/admin/dataset/new/">data.gouv.fr</a>.
        </div>
        <div style="flex: 1">
          <div class="infobox">
            <div class="infobox-title">{{ $t("selected.useful_resources") }}</div>
            <div class="infobox-content">
              <div class="infobox-content-item">
                <p @click="btnDocClick()">
                  <img src="../static/images/foreign.png" width="12" />
                  &nbsp;
                  <u>{{ $t("selected.read_doc") }}</u>
                </p>
              </div>
              <div v-for="item in this.schema.examples" v-bind:key="item.title">
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
                  <u>{{ $t("selected.explore_files") }}</u>
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
  name: "selectfillingmode",
  components: {},
  data() {
    return {
      schemaName: this.$route.query.schema,
      schemaUrl: this.$route.query.schema_url,
      schemas: null,
      noDataChoice: true,
      schema: {},
    };
  },
  mounted() {
    const loader = this.$loading.show();
    fetch(`${SCHEMAS_CATALOG_URL}`)
      .then((r) => r.json())
      .then((data) => {
        this.schemas = data.schemas;
        this.schema = this.schemas.find(
          (s) => s.name === this.schemaName || s.schema_url === this.schemaUrl
        );
        if (this.schema && !this.schemaName) this.schemaName = this.schema.name;
        if (this.schema)
          this.schema.version =
            this.schema.versions[this.schema.versions.length - 1][
              "version_name"
            ];
        if (!this.schema) {
          fetch(this.schemaUrl)
            .then((r) => r.json())
            .then((data2) => {
              console.log(data2);
              if (
                data2.$schema &&
                (data2.$schema ==
                  "https://specs.frictionlessdata.io/schemas/table-schema.json" ||
                  data2.$schema ==
                    "https://frictionlessdata.io/schemas/table-schema.json")
              ) {
                console.log(this.schema);
                var obj = {};
                obj["contact"] = "";
                obj["description"] = "";
                obj["examples"] = [];
                obj["name"] = data2.name;
                obj["schema_type"] = "tableschema";
                obj["schema_url"] = this.schemaUrl;
                obj["title"] = data2.title;
                obj["versions"] = [];
                this.schema = obj;
              }
            });
        }
      })
      .finally(() => {
        loader.hide();
      });
  },
  computed: {},
  watch: {},
  methods: {
    goto(type) {
      if (this.$route.query.schema)
        this.$router.push({
          name: type,
          params: { lang: this.$route.params.lang },
          query: { schema: this.$route.query.schema },
        });

      if (this.$route.query.schema_url)
        this.$router.push({
          name: type,
          params: { lang: this.$route.params.lang },
          query: { schema_url: this.$route.query.schema_url },
        });
    },
    gotoHomePage() {
      this.$router.push({
        name: "home",
        params: { lang: this.$route.params.lang },
      });
    },
    btnDocClick() {
      window.open(`https://schema.data.gouv.fr/${this.schemaName}/latest.html`);
    },
    btnFilesClick() {
      window.open(`${DGV_BASE_URL}/datasets/?schema=${this.schemaName}`);
    },
    gotoExemple(url) {
      window.open(url);
    },
  },
};
</script>
