<template>
    <div style="min-height: 500px" >

        <div v-if="schema && !publicationReady" class="rf-container rf-pb-6w rf-pt-2w">
            <p style="font-size: 14px; cursor: pointer;">
              <a @click="gotoHomePage()" >Accueil</a>
              &nbsp;&nbsp;&nbsp;>&nbsp;&nbsp;&nbsp;
              <a @click="gotoSelectPage()" >{{ schema.title }}</a>
              &nbsp;&nbsp;&nbsp;>&nbsp;&nbsp;&nbsp;
              Chargement des données
            </p>

            <p class="title-page">Vérifier un fichier existant</p>
            <span @click="btnDocClick()" class="schema-box"><img src="../static/images/foreign-blue.png" width="10" />&nbsp;&nbsp;{{ this.schema.title }}</span>
            <input class="inputfile" type="file" ref="file" name="file" id="file" v-on:change="handleFileUpload()"/>
            <label for="file"><img src="../static/images/upload.png" width="40" /><br /><br />Charger votre fichier</label>

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
                  <br /><br />
                </div>
                <b-button @click="editFile()" v-if="(infoboxType == 1 || infoboxType == 2 || infoboxType == 3) && schema.schema_type && schema.schema_type == 'tableschema'" class="infobox-button">
                  {{ editButtonTitle }}
                  &nbsp;
                  <img v-if="infoboxType == 1 || infoboxType == 2" src="../static/images/view.png" width="20" />
                  <img v-if="infoboxType == 3" src="../static/images/pen.png" width="20" />
                </b-button>
                <b-button @click="showReport = true" v-if="infoboxType == 3 || infoboxType == 4" class="infobox-button">
                  Voir le rapport d'erreur
                  &nbsp;
                  <img src="../static/images/align-left.png" width="15" />
                </b-button>
                <b-button @click="publicationReady = true" v-if="infoboxType == 1 || infoboxType == 2" class="infobox-button">
                  Publier sur data.gouv.fr
                  &nbsp;
                  <img src="../static/images/link.png" width="15" />
                </b-button>
                <b-button @click="btnDocClick()" v-if="infoboxType == 4 || infoboxType == 5" class="infobox-button">
                  Lire la documentation liée au schéma
                  &nbsp;
                  <img src="../static/images/foreign.png" width="15" />
                </b-button>
                <error-report v-if="showReport"
                  :report="report"
                  :reportValidStatus="reportValidStatus"
                  :badgeUrl="badgeUrl"
                  :reportErrorInfo="reportErrorInfo"
                  :reportStructureErrors="reportStructureErrors"
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
              <p v-if="schema.examples.length > 0">Vous pouvez vous appuyer sur <span v-if="schema.examples.length > 1">les fichiers suivants :</span> <span v-if="schema.examples.length = 1">le fichier suivant :</span></p>
              <ul v-for="example in schema.examples" v-bind:key="example.title">
                <li @click="gotoExemple(example.path)" style="cursor: pointer;"><u>{{ example.title }}</u></li>
              </ul>
            </div>
            <div v-if="(this.infoboxType == 3 || this.infoboxType == 4 || this.infoboxType == 5) && this.schema.contact && this.schema.contact != ''">
              <p>
                En cas de problèmes persistants, vous pouvez contacter les producteurs du schéma de données : 
                <a :href="'mailto:'+this.schema.contact">{{ this.schema.contact }}</a>
              </p>
            </div>
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
      infoboxTitle: 'Bravo ! Votre fichier est parfaitement conforme.',
      infoboxContent: '',
      infoboxType: 1,
      editButtonTitle: 'Prévisualiser le fichier',
      editButtonImg: 'checked.png',
      validBox: true,
      showReport: false,
      showInfobox: false,
    };
  },
  computed: {
  },
  watch: {
  },
  methods: {
    handleFileUpload() {
      this.showInfobox = true;
      this.showReport = false;
      this.editButtonTitle = 'Prévisualiser le fichier'
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
      this.reportGeneralErrors = [];
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
        this.reportValidStatus = 'Votre fichier n\'est pas au format attendu.';
        if(this.schema.schema_type == 'tableschema'){
          this.infoboxContent = 'Le fichier que vous venez de charger n\'est pas au format CSV. Le format CSV est le format obligatoire pour ce type de données.'
        }
        if(this.schema.schema_type =='jsonschema'){
          this.infoboxContent = 'Le fichier que venez de charger n\'est pas au format JSON. Le format JSON est le format obligatoire pour ce type de données.'
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

    },
    gotoHomePage() {
      this.$router.push('/');
    },
    gotoSelectPage() {
      this.$router.push('/select?schema='+this.schemaName);
    },
    btnDocClick() {
      window.open(`https://schema.data.gouv.fr/${this.schemaName}/latest.html`);
    },
    gotoExemple(url){
      window.open(url)
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
