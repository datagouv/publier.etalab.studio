<template>
    <div style="min-height: 500px" >
        <div class="fr-container">
          <p style="font-size: 14px; cursor: pointer;">
            <a @click="gotoHomePage()" style="cursor: pointer;">Accueil</a>
            &nbsp;&nbsp;&nbsp;>&nbsp;&nbsp;&nbsp;
            <a @click="gotoSelectPage()" style="cursor: pointer;">{{ schema.title }}</a>
            &nbsp;&nbsp;&nbsp;>&nbsp;&nbsp;&nbsp;
            {{ $t("upload.title") }}
          </p>
        </div>
        <div v-if="schema && !publicationReady" class="fr-container fr-pb-6w fr-pt-2w">
            <p class="title-page">{{ $t("upload.check_existing") }}</p>
            <span @click="btnDocClick()" class="schema-box"><img src="../static/images/foreign-blue.png" width="10" />&nbsp;&nbsp;{{ this.schema.title }}</span>
            
            <input class="inputfile" type="file" ref="file" name="file" id="file" v-on:change="handleFileUpload()"/>
            <label v-if="!showInfobox" for="file"><img src="../static/images/upload.png" width="40" /><br /><br />{{ $t("upload.upload_file") }}</label>
            <label v-if="showInfobox" for="file">
              <img src="../static/images/upload.png" width="40" />
              <br /><br />
              {{ $t("upload.file_name") }} : {{ filename }}
              <span v-if="sizeFile"><br />{{ $t("upload.file_size") }} : {{ sizeFile/1000 }} ko</span>
            </label>

            <div v-if="showInfobox" :class="validBox ? 'valid-box' : 'invalid-box'">
              <div class="infobox-title">
                <span v-if="validBox">
                  <img src="../static/images/checked.png" width="20" />
                </span>
                <span v-if="!validBox">
                  <img src="../static/images/warning-black.png" width="20" />
                </span>
                &nbsp;
                {{ reportValidStatus }}
              </div>
              <div class="infobox-content">
                <div v-if="infoboxType != 1">
                  {{ infoboxContent }}
                  <span v-if="tooMuchLines">
                    <br /><br /><i>{{ $t("upload.too_many_rows") }}</i>
                  </span>
                  <br /><br />
                </div>
                <b-button @click="editFile()" v-if="!tooMuchLines && (infoboxType == 1 || infoboxType == 2 || infoboxType == 3) && schema.schema_type && schema.schema_type == 'tableschema'" class="infobox-button">
                  {{ editButtonTitle }}
                  &nbsp;
                  <img v-if="infoboxType == 1 || infoboxType == 2" src="../static/images/view.png" width="20" />
                  <img v-if="infoboxType == 3" src="../static/images/pen.png" width="20" />
                </b-button>
                <b-button @click="editFile()" v-if="!tooMuchLines && (infoboxType == 1 || infoboxType == 2) && schema.schema_type && schema.schema_type == 'tableschema'" class="infobox-button">
                  {{ $t("upload.edit_file") }}
                  &nbsp;
                  <img v-if="infoboxType == 1 || infoboxType == 2" src="../static/images/pen.png" width="20" />
                </b-button>
                <b-button @click="showReport = !showReport" v-if="infoboxType == 3 || infoboxType == 4" class="infobox-button">
                  {{ $t("upload.see_report") }}
                  &nbsp;
                  <img src="../static/images/align-left.png" width="15" />
                </b-button>
                <b-button @click="publicationReady = true" v-if="infoboxType == 1 || infoboxType == 2" class="infobox-button">
                  {{ $t("global.publish") }}
                  &nbsp;
                  <img src="../static/images/link.png" width="15" />
                </b-button>
                <b-button @click="btnDocClick()" v-if="infoboxType == 4 || infoboxType == 5" class="infobox-button">
                  {{ $t("upload.read_doc") }}
                  &nbsp;
                  <img src="../static/images/foreign.png" width="15" />
                </b-button>
                <error-report v-if="showReport"
                  :report="report"
                  :reportValidStatus="reportValidStatus"
                  :badgeUrl="badgeUrl"
                  :reportErrorInfo="reportErrorInfo"
                  :reportStructureErrors="reportStructureErrors"
                  :reportIntegrityErrors="reportIntegrityErrors"
                  :reportGeneralErrors="reportGeneralErrors"
                  :reportContentErrors="reportContentErrors"
                  :reportRecos="reportRecos"
                  :reportJson="reportJson"
                  :validBox="validBox"
                  :infoboxType="infoboxType"
                  :editButtonTitle="editButtonTitle"
                ></error-report>
              </div>
            </div>
            <div v-if="this.infoboxType == 4">
              <br />
              <p v-if="schema.examples.length > 0">{{ $t("upload.see_example1") }} <span v-if="schema.examples.length > 1">{{ $t("upload.see_example2") }} :</span> <span v-if="schema.examples.length = 1">{{ $t("upload.see_example3") }} :</span></p>
              <ul v-for="example in schema.examples" v-bind:key="example.title">
                <li @click="gotoExemple(example.path)" style="cursor: pointer;"><u>{{ example.title }}</u></li>
              </ul>
            </div>
            <div v-if="(this.infoboxType == 3 || this.infoboxType == 4 || this.infoboxType == 5) && this.schema.contact && this.schema.contact != ''">
              <p>
                {{ $t("upload.if_issues") }} : 
                <a :href="'mailto:'+this.schema.contact">{{ this.schema.contact }}</a>
              </p>
              <p>{{ $t("upload.publish_anyway1") }} <a @click="publicationReady = true; publishWithSchema = false;" style="cursor: pointer;"> <u>{{ $t("upload.publish_anyway2") }}</u> </a></p>
            </div>
        </div>

        <div v-if="publicationReady && !publicationOK" class="fr-container fr-pb-6w fr-pt-2w">
            <p class="title-page">{{ $t("global.publish") }}</p>
            <publish-form-upload
                :filename="filename"
                v-model="dataToPublish"
                :schemaName="schemaName"
                :schemaMeta="schemaMeta"
                :organizations="userOrganizations"
                :publicationIntro="publicationIntro"
                v-on:form-state-change="togglePublishButtonState"
            />
            <div v-if="!publishButtonDisabled">
                <button
                  type="submit"
                  class="fr-btn"
                  title="Publier sur datagouv"
                  @click="publishDataset()"
                >
                {{ $t("global.publish_short") }}
                </button>
            </div>
            <div v-if="publishButtonDisabled">
                <button
                  type="submit"
                  class="fr-btn-light"
                  title="Publier sur datagouv"
                >
                {{ $t("global.publish_short") }}
                </button>
            </div>
        </div>

        <div v-if="publicationOK" class="fr-container fr-pb-6w fr-pt-2w">
            <h3>{{ $t("global.congrats") }}</h3>
            <br/><br/><br/>
            <div style="text-align: center;">
                <button
                  @click="btnClick()"
                  class="fr-btn"
                  :title="$t('global.see_datagouv')"
                >
                {{ $t("global.see_datagouv") }}
                </button>
            </div>
        </div>


    <b-modal
      class="fr-container fr-pb-6w fr-pt-2w"
      ref="modalConnectLaunch"
      id="modalConnectLaunch"
      hide-footer
      :title="$t('global.authorize_publier')"
    >
    <div>
        <br />
        <p><img src="../static/images/cancel-mark.png" width="10"/>&nbsp;&nbsp;{{ $t("global.access_forbidden") }}</p>
        <p>{{ $t("global.publier_needs1") }}<ul><li>{{ $t("global.publier_needs2") }}</li><li>{{ $t("global.publier_needs3") }}</li></ul></p>
        <p>{{ $t("global.please_click") }}</p>
        <br />
        <b-button class="fr-btn" @click="submitLogin">
          {{ $t("global.connect") }}&nbsp;&nbsp;&nbsp;<img src="../static/images/check.png" width="10"/>
        </b-button>
        &nbsp;&nbsp;&nbsp;
        <span @click="hideModal()" style="cursor: pointer;"><u>{{ $t("global.not_datagouv") }}</u></span>
      </div>
    </b-modal>


    </div>
</template>

<script>
import PublishFormUpload from "../components/PublishFormUpload.vue";
import ErrorReport from "../components/ErrorReport.vue";

import PublishRessources from "../mixins/PublishResources.vue";
import GetReport from "../mixins/GetReport.vue";

const VALIDATA_API_URL = process.env.VUE_APP_VALIDATA_API_URL;

export default {
  name: "fillDataUpload",
  mixins: [PublishRessources, GetReport],
  components: {
    PublishFormUpload,
    ErrorReport,
  },
  data() {
    return {
      schemaObject: null,
      file: "",
      publicationReady: false,
      dataToPublish: {},
      publicationOK: false,
      linkDgv: "",
      contentFile: "",
      wrongFormat: false,
      infoboxTitle: "Bravo ! Votre fichier est parfaitement conforme.",
      infoboxContent: "",
      infoboxType: 1,
      editButtonTitle: "Prévisualiser le fichier",
      editButtonImg: "checked.png",
      validBox: true,
      showReport: false,
      showInfobox: false,
      filename: "Monfichier",
      sizeFile: null,
    };
  },
  computed: {},
  watch: {},
  methods: {
    handleFileUpload() {
      this.sizeFile = null;
      this.filename = "Monfichier";
      this.showInfobox = true;
      this.showReport = false;
      this.editButtonTitle = this.$t('error.preview');
      this.wrongFormat = false;
      this.file = this.$refs.file.files[0];
      if (this.file.name) this.filename = this.file.name;
      if (this.file.size) this.sizeFile = this.file.size;
      this.report = null;
      this.reportJson = [];
      this.reportValidStatus = null;
      this.badgeUrl = null;
      this.publication = false;
      this.publicationMessage = null;

      this.reportValidStatus = null;
      this.reportStructureErrors = [];
      this.reportIntegrityErrors = [];
      this.reportGeneralErrors = [];
      this.reportContentErrors = [];
      this.reportRecos = [];
      this.reportErrorInfo = null;

      if (
        this.schema.schema_type == "tableschema" &&
        this.$refs.file.files[0]["name"].includes(".csv")
      ) {
        // eslint-disable-next-line prefer-destructuring
        const formData = new FormData();
        formData.append("file", this.file);
        formData.append("schema", this.schema.schema_url);

        fetch(`${VALIDATA_API_URL}/validate`, {
          method: "POST",
          body: formData,
        })
          .then((r) => r.json())
          .then((data) => {
            this.getValidataReport(data);
          })
          .finally(() => {
            // eslint-disable-next-line no-console
            console.log("finally");
          });
      } else if (
        this.schema.schema_type == "jsonschema" &&
        this.$refs.file.files[0]["name"].includes("json")
      ) {
        var reader = new FileReader();
        reader.onloadend = () => {
          this.contentFile = reader.result;

          let bod = JSON.stringify({
            schema: this.schema.schema_url,
            json: JSON.parse(this.contentFile),
          });

          fetch("https://jsonschema.app.etalab.studio/validate", {
            method: "POST",
            body: bod,
          })
            .then((r) => r.json())
            .then((data) => {
              this.getJsonSchemaReport(data);
            });
        };
        reader.readAsText(this.$refs.file.files[0]);
      } else {
        this.wrongFormat = true;
        this.reportValidStatus = "Votre fichier n'est pas au format attendu.";
        this.validBox = false;
        if (this.schema.schema_type == "tableschema") {
          this.infoboxContent =
            "Le fichier que vous venez de charger n'est pas au format CSV. Le format CSV est le format obligatoire pour ce type de données.";
        }
        if (this.schema.schema_type == "jsonschema") {
          this.infoboxContent =
            "Le fichier que venez de charger n'est pas au format JSON. Le format JSON est le format obligatoire pour ce type de données.";
        }
        this.infoboxType = 5;
      }
    },
    publicationForm() {
      this.publicationReady = true;
    },
    publishDataset() {
      // Get structured publish form content
      const publishContent = this.dataToPublish;
      // Dataset creation
      // Si resource id : on modifie resource
      // Si pas de ressource id mais dataset id, on ajoute une ressource
      // Si pas de dataset id on créé un dataset avec ou sans orga avec la ressource
      if (publishContent.existingResource !== "") {
        this.updateDatasetUpdateResource(publishContent, this.file, this.ext);
      } else if (publishContent.existingDataset !== "") {
        this.updateDatasetCreateResource(publishContent, this.file, this.ext);
      } else {
        this.createDatasetCreateResource(publishContent, this.file, this.ext);
      }
    },
    editFile() {
      console.log("begin");
      const Papa = require("papaparse");

      var reader = new FileReader();
      reader.onloadend = () => {
        var content = reader.result;
        var csvdata = Papa.parse(content);

        var prepareRows = [];
        var prepareHeaders = [];
        var isHeader = true;
        csvdata.data.forEach((row) => {
          if (!isHeader) {
            var obj = {};
            for (var itemData in row) {
              obj[prepareHeaders[itemData]] = row[itemData];
            }
            prepareRows.push(obj);
          } else {
            for (var itemHeader in row) {
              prepareHeaders.push(row[itemHeader]);
            }
            isHeader = false;
          }
        });

        this.$store.dispatch("data/fillSchemaNameData", this.schemaMeta.name);
        this.$store.dispatch("data/fillFileHeaderData", prepareHeaders);
        this.$store.dispatch("data/fillFileRowsData", prepareRows);
        this.$store.dispatch("data/fillFileNbRowsData", prepareRows.length);

        if (this.schemaName)
          this.$router.push({
            name: "table",
            params: { lang: this.$route.params.lang },
            query: {
              schema: this.schemaName,
              fromFile: "yes",
            },
          });
        if (this.schemaUrl)
          this.$router.push({
            name: "table",
            params: { lang: this.$route.params.lang },
            query: {
              schema_url: this.schemaUrl,
              fromFile: "yes",
            },
          });
      };
      reader.readAsText(this.$refs.file.files[0]);
    },
    btnDocClick() {
      window.open(`https://schema.data.gouv.fr/${this.schemaName}/latest.html`);
    },
    gotoExemple(url) {
      window.open(url);
    },
  },
  mounted() {
    fetch(this.schema.schema_url)
      .then((r) => r.json())
      .then((data) => {
        this.schemaObject = data;
      });
  },
};
</script>

<style>
.vsa-list {
  min-height: 50px;
}
.vsa-item {
  border-bottom: 1px solid #ebebeb;
  width: 100%;
  height: 100%;
}
.vsa-item__trigger {
  width: 100%;
  height: 50px;
  border: 0px;
  text-align: left;
  background-color: white;
}
.vsa-item__content {
  margin-top: 20px;
  margin-bottom: 20px;
}
</style>
