<template>
    <div style="min-height: 500px" >

        <div v-if="schema && !publicationReady" class="rf-container rf-pb-6w rf-pt-2w">
            <h3>{{ schema.title }} - Chargement des données</h3>
            <br />

            <div class="large-12 medium-12 small-12 cell">
                <label>Veuillez charger votre fichier :
                    <input type="file" id="file" ref="file" v-on:change="handleFileUpload()"/>
                </label>
                <br/><br/>
            </div>
            <br/>
            <br/>
            <error-report
              :report="report"
              :reportValidStatus="reportValidStatus"
              :badgeUrl="badgeUrl"
              :reportErrorInfo="reportErrorInfo"
              :reportStructureErrors="reportStructureErrors"
              :reportContentErrors="reportContentErrors"
              :reportRecos="reportRecos"
              :reportJson="reportJson"
            ></error-report>
            <br/><br/>
            <div v-if="wrongFormat">
              <p>Le fichier soumis n'est pas au format attendu.</p>
            </div>
            <span v-if="this.schema.schema_type == 'tableschema' && this.file && !this.wrongFormat">
              <button
                type="submit"
                style="margin-right: 20px"
                class="rf-btn-light"
                title="Editer le fichier"
                @click="editFile()"
              >
                Editer ce fichier
              </button>
            </span>
            <span v-if="publication">
                <button
                  type="submit"
                  style="margin-right: 20px"
                  class="rf-btn"
                  title="Publier sur datagouv"
                  @click="publicationForm()"
                >
                  {{ publicationMessage }}
                </button>
            </span>
        </div>

        <div v-if="publicationReady && !publicationOK" class="rf-container rf-pb-6w rf-pt-2w">
            <publish-form-upload
                v-model="dataToPublish"
                :schemaName="schemaName"
                :organizations="userOrganizations"
                :publicationIntro="publicationIntro"
                v-on:form-state-change="togglePublishButtonState"
            />
            <div v-if="!publishButtonDisabled">
                <button
                  type="submit"
                  class="rf-btn"
                  title="Publier sur datagouv"
                  @click="publishDataset()"
                >
                  Publier
                </button>
            </div>
            <div v-if="publishButtonDisabled">
                <button
                  type="submit"
                  class="rf-btn-light"
                  title="Publier sur datagouv"
                >
                  Publier
                </button>
            </div>
        </div>

        <div v-if="publicationOK" class="rf-container rf-pb-6w rf-pt-2w">
            <h3>Félicitations, votre fichier a été uploadé sur datagouv avec succès !</h3>
            <br/><br/><br/>
            <div style="text-align: center;">
                <button
                  @click="btnClick()"
                  class="rf-btn"
                  title="Voir le jeu de données sur Datagouv"
                >
                  Voir le jeu de données sur Datagouv
                </button>
            </div>
        </div>

        <b-modal
          class="rf-container rf-pb-6w rf-pt-2w"
          ref="modal1"
          id="modal1"
          hide-footer
          title="Attention, vous n'êtes pas connecté"
        >
          <div>
            <p>Pour publier vos données sur datagouv, il est nécessaire de vous connecter.</p>
          </div>
            <div class="button-boxes">
                <div style="padding-right: 30px; text-align: center;">
                  <client-only>
                      <nav-user />
                  </client-only>
                </div>
                <br /><br /><br />
                <div style="padding-right: 30px; text-align: center;">
                  <button
                    class="rf-btn-light"
                    block
                    @click="hideModal"
                  >
                    Je n'ai pas l'intention de publier mes données
                  </button>
                </div>
              </div>
        </b-modal>
    </div>
</template>

<script>

import ClientOnly from 'vue-client-only';

import PublishFormUpload from '../components/PublishFormUpload.vue';
import NavUser from '../components/NavUser.vue';

import ErrorReport from '../components/ErrorReport.vue';

import PublishRessources from '../mixins/PublishResources.vue';
import GetReport from '../mixins/GetReport.vue';

const VALIDATA_API_URL = process.env.VUE_APP_VALIDATA_API_URL;

export default {
  name: 'fillDataUpload',
  mixins: [
    PublishRessources,
    GetReport,
  ],
  components: {
    PublishFormUpload,
    ClientOnly,
    NavUser,
    ErrorReport,
  },
  data() {
    return {
      schemaObject: null,
      file: '',
      publicationReady: false,
      dataToPublish: {},
      publicationOK: false,
      linkDgv: '',
      contentFile: '',
      wrongFormat:false,
    };
  },
  computed: {
  },
  watch: {
  },
  methods: {
    handleFileUpload() {
      this.wrongFormat = false;
      this.file = this.$refs.file.files[0];
      this.report = null;
      this.reportJson = []
      this.reportValidStatus = null;
      this.badgeUrl = null;
      this.publication = false;
      this.publicationMessage = null;

      this.reportValidStatus = null;
      this.reportStructureErrors = [];
      this.reportContentErrors = [];
      this.reportRecos = [];
      this.reportErrorInfo = null;

      if (this.schema.schema_type == 'tableschema' && this.$refs.file.files[0]['name'].includes('.csv')) {
        // eslint-disable-next-line prefer-destructuring
        const formData = new FormData();
        formData.append('file', this.file);
        formData.append('schema', this.schema.schema_url);

        fetch(`${VALIDATA_API_URL}/validate`, {
          method: 'POST',
          body: formData,
        })
        .then((r) => r.json())
        .then((data) => {

          this.getValidataReport(data);

          
        }).finally(() => {
          // eslint-disable-next-line no-console
          console.log('finally');
        });
      } else if (this.schema.schema_type == 'jsonschema' && this.$refs.file.files[0]['name'].includes('json')) {


        var reader = new FileReader();
        reader.onloadend = () => {
          this.contentFile = reader.result;

          let bod = JSON.stringify({schema: this.schema.schema_url, json: JSON.parse(this.contentFile)});

          fetch(('https://jsonschema.app.etalab.studio/validate'), {
            method: 'POST',
            body: bod,
          })
          .then((r) => r.json())
          .then((data) => {

            this.getJsonSchemaReport(data);

          });
        }
        reader.readAsText(this.$refs.file.files[0]);
        
      } else {
        this.wrongFormat = true;
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
      if (publishContent.existingResource !== '') {
        this.updateDatasetUpdateResource(publishContent,this.file,this.ext);
      } else if (publishContent.existingDataset !== '') {
        this.updateDatasetCreateResource(publishContent,this.file,this.ext);
      } else {
        this.createDatasetCreateResource(publishContent,this.file,this.ext);
      }
    },
    editFile(){
      
      console.log('begin');
      const Papa = require('papaparse');

      var reader = new FileReader();
      reader.onloadend = () => {
        var content = reader.result;
        var csvdata = Papa.parse(content);

        var prepareRows = []
        var prepareHeaders = []
        var isHeader = true;
        csvdata.data.forEach((row) => {
          if(!isHeader) {
            var obj = {}
            for(var itemData in row) {
              obj[prepareHeaders[itemData]] = row[itemData];
            }
            prepareRows.push(obj);
          } else {
            for(var itemHeader in row) {
              prepareHeaders.push(row[itemHeader])
            }
            isHeader = false;
          }
        });

        this.$store.dispatch('data/fillSchemaNameData', this.schemaName)
        this.$store.dispatch('data/fillFileHeaderData', prepareHeaders)
        this.$store.dispatch('data/fillFileRowsData', prepareRows)
        this.$store.dispatch('data/fillFileNbRowsData', prepareRows.length)

        this.$router.push(`table?schema=${this.schemaName}&fromFile=yes`);
        
      }
      reader.readAsText(this.$refs.file.files[0]);

    }
  },
  mounted() {
    fetch(this.schema.schema_url).then((r) => r.json()).then((data) => {
      this.schemaObject = data;
    });
  },
};
</script>

<style>
.vsa-list{
    min-height: 50px;
}
.vsa-item{
    border-bottom: 1px solid #ebebeb;
    width: 100%;
    height: 100%;
}
.vsa-item__trigger{
    width: 100%;
    height: 50px;
    border: 0px;
    text-align: left;
    background-color: white;
}
.vsa-item__content{
    margin-top: 20px;
    margin-bottom: 20px;
}
</style>
