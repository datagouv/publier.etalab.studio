<template>
<div @click="clickPage()">
    <div class="rf-container">
      <p style="font-size: 14px; cursor: pointer;">
        <a @click="gotoHomePage()" >Accueil</a>
        &nbsp;&nbsp;&nbsp;>&nbsp;&nbsp;&nbsp;
        <a @click="gotoSelectPage()" >{{ schema.title }}</a>
        &nbsp;&nbsp;&nbsp;>&nbsp;&nbsp;&nbsp;
        Tableur
      </p>
    </div>
    <div v-if="displayMenuBox" class="menuBox" :style="`top: ${topDiv}px; left: ${leftDiv}px;`">
      <div class="menuElement" @click="columnOperation('info')">
        <img src="../static/images/info-button-white.png" width="15" />
        &nbsp;&nbsp;
        Informations
      </div>
      <div class="menuElement" @click="columnOperation('rename')">
        <img src="../static/images/edit-white.png" width="15" />
        &nbsp;&nbsp;
        Renommer
      </div>
      <div class="menuElement" @click="columnOperation('remove')">
        <img src="../static/images/trash-white.png" width="15" />
        &nbsp;&nbsp;
        Supprimer
      </div>
    </div>


    <div v-if="displayInfoBox" class="infoBox" :style="`top: ${topDiv}px; left: ${leftDiv}px;`">
      <span v-if="displayInformations && messageInfo != ''">
        <p>Description :</p>
        <p><i>{{ messageInfo }}</i></p>
        <p>Exemple(s) : {{ exempleInfo }}</p>
      </span>      
      <span v-if="displayInformations && messageInfo == ''">
        <p>Vous avez ajouté cette colonne.</p>
        <p>Pas d'informations</p>
      </span>
      <span v-if="displayRename || displayRemove">
        {{ this.columnModalP }}
      </span>
    </div>

    <div v-if="displayErrorBox" class="errorBox" :style="`top: ${topDivError}px; left: ${leftDivError}px;`">
        <p style="font-size: 14px;">Oups, une erreur !</p>
        <p v-if="warningInfo != ''">{{ warningInfo }}</p>
        <p v-if="errorInfo != null & errorInfo != ''">
          Message d'erreur :
          <br />
          <b><i>{{ errorInfo }}</i></b>
          <br />
          <br />
          Exemple(s) :
          <br />
          <b><i>{{ exempleInfo }}</i></b>
        </p>
    </div>

    <div v-if="displayArrayBox" class="arrayBox" :style="`top: ${topDivError}px; left: ${leftDivError}px;`">
      <div v-for="item in currentArrayItems" v-bind:key="item.value">
        <input type="checkbox" @click="addArrayValue(item)" :checked="item.selected"> {{ item.value }}
      </div>
    </div>


    <div v-if="displayGeopointBox" class="arrayBox" :style="`width: 500px; top: ${topDivError}px; left: ${leftDivError}px;`">
      <l-map
        :center="center"
        :zoom="zoom"
        style="height: 300px; width: 100%"
      >
        <l-tile-layer :url="url" :attribution="attribution" />
        <l-marker
          :lat-lng="markerLocation"
          :draggable="true"
          @update:latLng="onMarkerMove"
        >
          <l-tooltip>
            Déplacez moi<br />
            pour mettre à jour<br />
            les coordonnées
          </l-tooltip>
        </l-marker>
      </l-map>
    </div>

    <div class="rf-container">
      <div>
        <input
          v-model="filename"
          class="title-page title-input"
          :placeholder="filename"
          id="filename-input"
          name="filename-input"
          style="font-size: 35px; min-width: 200px;"
          onkeypress="this.style.width = ((this.value.length + 1) * 18) + 'px';"
        >
        <span @click="csvLinkData" class="title-box"><img src="../static/images/download-blue.png" width="20" /></span>
        <span  @click="showModalDelete()" class="title-box"><img src="../static/images/trash.png" width="20" /></span>
        <br />
        <div style="display: flex;">
          <div style="flex: 1;">
            <span @click="btnDocClick()" class="schema-box">
              <img src="../static/images/foreign-blue.png" width="10" />
              &nbsp;&nbsp;
              {{ this.schema.title }}
            </span>
          </div>
          <div style="flex: 1; text-align: right;">
            <button
              style="margin-right: 20px"
              @click="submit()"
              type="submit"
              class="rf-btn"
            >
              Vérifier le fichier
              &nbsp;
              <img src="../static/images/gauge.png" width="30" />
            </button>
          </div>
        </div>
      </div>
    </div>
    <div ref="test">
      <div :style="{ width: `94%`, marginLeft: `3%`, marginRight: `3%`, height: `${this.rows.length*43+100}px` }">
        <div :style="{ width: `97%`, float: `left` }">
          <div class="tableur" :style="{ overflowY: `scroll`, height: `${this.rows.length*43}px` }">
            <vue-editable-grid
                class="grid"
                ref="grid"
                id="mygrid"
                :column-defs="columnDefs"
                :actualCol="colIndex"
                :actualRow="rowIndex"
                :nbLinesFile="realRowsIds.length"
                :row-data="rows"
                :row-data-color="rowsColor"
                :field-names="fieldNames"
                row-data-key='id'
                @cell-updated="cellUpdated"
                @row-selected="rowSelected"
                @link-clicked="linkClicked"
                @context-menu="contextMenu"
                @add-empty-row='addEmptyRow'
                @maybe-add-row='maybeAddRow'
                @add-multiple-rows='addMultipleRows'
                @column-operation='columnOperation'
                @moveHeaderMenu='moveHeaderMenu'
                @show-errors='showErrors'
                @remove-boxes='removeBoxes'
                @rename-field='renameField'
                @show-array-enum='showArrayEnum'
                @show-geopoint='showGeopoint'
                @get-identifier='getIdentifier'
                >
            </vue-editable-grid>
          </div>
          <div>
            <b-button @click="addEmptyRow()" :style="`width: ${widthPlus}px;`" class="addLineButton">+</b-button>
          </div>
        </div>
        <div :style="{ width: `3%`, height: `${this.rows.length*43}px`, float: `left` }">
          <b-button @click="addNewField()" class="addColumnButton">+</b-button>
        </div>
      </div>
    </div>

    <b-modal
      class="rf-container rf-pb-6w rf-pt-2w"
      ref="modalDelete"
      id="modalDelete"
      hide-footer
      title="Réinitialiser le fichier"
    >
      <p>Etes-vous sûr de vouloir effacer toutes les données contenues dans ce tableur ?</p>
      <br/>
      <b-button @click="reinitRows()" class="rf-btn">Je suis sûr</b-button>
      &nbsp;&nbsp;&nbsp;
      <span @click="hideModalDelete()" style="cursor: pointer;"><u>Je ne souhaite pas réinitialiser mes données</u></span>
    </b-modal>


    <b-modal
      class="rf-container rf-pb-6w rf-pt-2w"
      ref="modal3"
      id="modal3"
      hide-footer
      :title="titleVerificationModal"
    >
      <div>
        <br />
        <error-report
          v-if="!publicationOK"
          style="margin-left: 20px"
          :report="report"
          :reportValidStatus="reportValidStatus"
          :badgeUrl="badgeUrl"
          :reportErrorInfo="reportErrorInfo"
          :reportStructureErrors="reportStructureErrors"
          :reportIntegrityErrors="reportIntegrityErrors"
          :reportContentErrors="reportContentErrors"
          :reportRecos="reportRecos"
          :reportJson="reportJson"
        ></error-report>

            <div v-if="!publicationReady" :class="validBox ? 'valid-box' : 'invalid-box'">
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
                <b-button @click="showReport = !showReport" v-if="infoboxType == 3 || infoboxType == 4" class="infobox-button">
                  Voir le rapport d'erreur
                  &nbsp;
                  <img src="../static/images/align-left.png" width="15" />
                </b-button>
                <b-button @click="publicationReady = true; titleVerificationModal = 'Publier vos données sur data.gouv.fr'" v-if="infoboxType == 1 || infoboxType == 2" class="infobox-button">
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

            <div v-if="!publicationReady">
                <div v-if="this.infoboxType == 4">
                  <br />
                  <p v-if="schemaMeta.examples && schemaMeta.examples.length > 0">Vous pouvez vous appuyer sur <span v-if="schemaMeta.examples.length > 1">les fichiers suivants :</span> <span v-if="schemaMeta.examples.length = 1">le fichier suivant :</span></p>
                  <ul v-for="example in schemaMeta.examples" v-bind:key="example.title">
                    <li @click="gotoExemple(example.path)" style="cursor: pointer;"><u>{{ example.title }}</u></li>
                  </ul>
                </div>
                <div v-if="(this.infoboxType == 3 || this.infoboxType == 4 || this.infoboxType == 5) && this.schemaMeta.contact && this.schemaMeta.contact != ''">
                  <p>
                    En cas de problèmes persistants, vous pouvez contacter les producteurs du schéma de données : 
                    <a :href="'mailto:'+this.schemaMeta.contact">{{ this.schemaMeta.contact }}</a>
                  </p>
                  <p>Malgré ces erreurs, vous pouvez publier votre fichier en l'état (cependant, il ne sera pas relié à un schéma) <a @click="publicationReady = true; publishWithSchema = false;" style="cursor: pointer;">en cliquant ici</a></p>
                </div>
            </div>


        <div class="rf-container rf-pb-1w rf-pt-2w" v-if="publicationReady & !publicationOK">
            <publish-form-upload
                v-model="dataToPublish"
                :filename="filename"
                :schemaName="schemaName"
                :schemaMeta="schemaMeta"
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
                <button type="submit" class="rf-btn-light" title="Publier sur datagouv">Publier</button>
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

      </div>
    </b-modal>


    <b-modal
      class="rf-container rf-pb-6w rf-pt-2w"
      ref="modal4"
      id="modal4"
      hide-footer
      :title="columnModalHeader"
    >
      <div>
        {{ columnModalP }}
        <br/>
        <div v-if="shouldRenameColumn">
          <input
            v-model="newFieldName"
            class="rf-input"
            placeholder="Entrer le nom du champs"
            type="search" id="new-fieldname-input"
            name="new-fieldname-input"
          >
          <br/>
          <div style="text-align: center;">
            <button
              style="margin-right: 20px;"
              @click="renameColumn()"
              type="submit"
              class="rf-btn"
            >
              Renommer la colonne
            </button>
          </div>
        </div>
      </div>
    </b-modal>


    <b-modal
      class="rf-container rf-pb-6w rf-pt-2w"
      ref="modalConnectLaunch"
      id="modalConnectLaunch"
      hide-footer
      title="Autoriser publier.etalab.studio"
    >
      <div>
        <br />
        <p><img src="../static/images/cancel-mark.png" width="10"/>&nbsp;&nbsp;Vous n'avez pas autorisé <b>publier.etalab.studio</b> à accéder à votre compte <b>data.gouv.fr</b>.</p>
        <p>Pour publier des données, publier.etalab.studio a besoin :<ul><li>d'accéder à votre profil et à vos organisations sur data.gouv.fr</li><li>de publier un jeu de données pour vous sur data.gouv.fr</li></ul></p>
        <p>Merci de cliquer sur le bouton ci-dessous et d'accepter ces autorisations si vous souhaitez publier vos données sur dat.</p>
        <br />
        <b-button class="rf-btn" @click="submitLogin">
          Je me connecte&nbsp;&nbsp;&nbsp;<img src="../static/images/check.png" width="10"/>
        </b-button>
        &nbsp;&nbsp;&nbsp;
        <span @click="hideModal()" style="cursor: pointer;"><u>Je ne souhaite pas publier mes données sur data.gouv.fr</u></span>
      </div>
    </b-modal>

    </div>
</template>

<script>
import Vue from 'vue';
import StringField from '../components/StringField.vue';
import SelectField from '../components/SelectField.vue';
import RadioField from '../components/RadioField.vue';

import PublishFormUpload from '../components/PublishFormUpload.vue';
import ErrorReport from '../components/ErrorReport.vue';

import VueEditableGrid from '../grid/VueEditableGrid.vue';

import PublishRessources from '../mixins/PublishResources.vue';
import GetReport from '../mixins/GetReport.vue';

import { LMap, LTileLayer, LMarker, LTooltip } from 'vue2-leaflet'

const VALIDATA_API_URL = process.env.VUE_APP_VALIDATA_API_URL;

const GEO_WIDGET_INITIAL_CENTER = [46.8, 2.11] // Center of France
const GEO_DECIMAL_COUNT = 2
// Geographical map is based on Jawg (https://www.jawg.io/) raster tiles
// Request for a free API token and pass it through VUE_APP_GEO_ACCESS_TOKEN env variable
const accessToken = process.env.VUE_APP_GEO_ACCESS_TOKEN
const GEO_TILES_URL = `https://tile.jawg.io/jawg-sunny/{z}/{x}/{y}.png?access-token=${accessToken}`

export default {
  name: 'fillDataTable',
  mixins: [
    PublishRessources,
    GetReport,
  ],
  components: {
    VueEditableGrid,
    PublishFormUpload,
    ErrorReport,
    LMap,
    LTileLayer,
    LMarker,
    LTooltip
  },
  data() {
    return {
      selectedRow: null,
      errors: {},
      faultyFields: [],
      lines: [],
      formValidated: false,
      fieldNodes: [],
      columnDefs: [
        {
          field: 'selectCol',
          headerName: '',
          size: '40px',
          type: 'supp',
          rename: false,
        },
      ],
      emptyRow: {},
      emptyRowInfo: {},
      emptyRowError: {},
      emptyRowColor: {},
      rows: [],
      rowsInfo: [],
      rowsError: [],
      rowsColor: [],
      toRemove: 0,
      messageInfo: 'Veuillez sélectionner une cellule',
      exempleInfo: '',
      warningInfo: null,
      validInfo: '',
      errorInfo: null,
      publicationReady: false,
      publicationButtons: false,
      publicationOK: false,
      dataToPublish: {},
      newFieldName: '',
      realRowsIds: [],
      colIndex: 0,
      rowIndex: 1,
      columnModalHeader: "",
      columnModalP: "",
      shouldRenameColumn: false,
      oldColumnName: "",
      filename: "Monfichier",
      topDiv: "200",
      leftDiv: "200",
      menuSelected: false,
      displayMenuBox: false,
      operationHeaderColumn: null,
      infoSelected: false,
      displayInfoBox: false,
      displayRename: false,
      displayRemove: false,
      displayInformations: false,
      displayErrorBox: false,
      displayArrayBox: false,
      displayGeopointBox: false,
      arraySelected: false,
      geopointSelected: false,
      errorSelected: false,
      topDivError: "200",
      leftDivError: "200",
      widthPlus: "400",
      validBox: true,
      infoboxTitle: 'Bravo ! Votre fichier est parfaitement conforme.',
      infoboxContent: '',
      infoboxType: 1,
      editButtonTitle: 'Prévisualiser le fichier',
      editButtonImg: 'checked.png',
      showReport: false,
      showInfobox: false,
      currentArrayItems: [],
      currentArrayValues: [],
      rowCurrentArray: null,
      colCurrentArray: null,
      colindexCurrentArray: null,
      rowCurrentGeopoint: null,
      colCurrentGeopoint: null,
      center: GEO_WIDGET_INITIAL_CENTER,
      markerLocation: GEO_WIDGET_INITIAL_CENTER,
      zoom: 5,
      accessToken: null,
      url: GEO_TILES_URL,
      attribution: `<a href="http://jawg.io" title="Tiles Courtesy of Jawg Maps" target="_blank"
                     class="jawg-attrib">&copy; <b>Jawg</b>Maps</a>
                     | <a href="https://www.openstreetmap.org/copyright"
                     title="OpenStreetMap is open data licensed under ODbL" target="_blank"
                     class="osm-attrib">&copy; OSM contributors</a>`,
      value: '',
      floatPrecision: GEO_DECIMAL_COUNT,
    };
  },
  watch: {
    schemaMeta() {
      this.buildForm();
    },
  },
  mounted() {
    this.buildForm();
    this.rows.push(this.emptyRow);
    this.rowsInfo.push({ ...this.emptyRowInfo });
    this.rowsError.push({ ...this.emptyRowError });
    this.rowsColor.push({ ...this.emptyRowColor });

    window.setInterval(() => {
        this.saveRows()
      }, 5000)

    this.widthPlus = this.$refs.grid.$el.offsetWidth.toString();
  },
  computed: {
    ongoingData() {
      return this.$store.state.data;
    },
  },
  created() {
    window.addEventListener('scroll', this.handleScroll);
  },
  methods: {
    addArrayValue(item) {
      if(!item.selected) {
        if(!this.rows[this.rowCurrentArray][this.colCurrentArray]) {
          this.rows[this.rowCurrentArray][this.colCurrentArray] = []
        }
        this.rows[this.rowCurrentArray][this.colCurrentArray].push(item.value);
      } else {
        if(this.rows[this.rowCurrentArray][this.colCurrentArray]) {
          this.rows[this.rowCurrentArray][this.colCurrentArray] = this.rows[this.rowCurrentArray][this.colCurrentArray].filter(el => el != item.value);
        }
      }
      this.currentArrayItems.forEach((el) => {
        if(el.value == item.value) el.selected = !el.selected;
      });
      this.$refs.grid.selectCell(this.rowCurrentArray, this.colindexCurrentArray);
    },
    showArrayEnum(row, col, column, val, pos){
      this.displayErrorBox = false;
      this.arraySelected = false;
      this.rowCurrentArray = row;
      this.colindexCurrentArray = col;
      this.colCurrentArray = column;
      this.topDivError = window.scrollY+pos.y+40;
      this.leftDivError = pos.x;
      this.displayArrayBox = true;
      this.schema.fields.forEach((field) => {
        if(field.name == column){
          this.currentArrayItems = []
          field.arrayItem.constraints.enum.forEach((el) => {
            var obj = {}
            if(this.rows[row][column]) {
              obj['selected'] = this.rows[row][column].includes(el);
            } else {
              obj['selected'] = false;
            }
            obj['value'] = el
            this.currentArrayItems.push(obj);
          });
        }
      });
    },

    // Called after marker has been moved
    // either dragging it or setting its location
    onMarkerMove(latLng) {
      // marker location
      this.markerLocation = latLng
      // formatted value: "lon, lat"
      var format = null
      
      this.columnDefs.forEach((cd) => {
        if(cd.headerName == this.colCurrentGeopoint) {
          format = cd.format;
        }
      });

      this.schema.fields.forEach((field) => { 
        if(field.name == this.colCurrentGeopoint){
          format = field.format;
        }
      });
      
      const value =  this.formatLatLng(latLng, format)
      // update text input
      // Hey! value has changed
      this.rows[this.rowCurrentGeopoint][this.colCurrentGeopoint] = value;
    },

    // Format longLat object to string
    formatLatLng(lngLat, format) {
      const fp = this.floatPrecision
      const { lat, lng } = lngLat
      if (format == "array") {
        return `[${lng.toFixed(fp)},${lat.toFixed(fp)}]`
      }
      if (format == "object") {
        return `{"lon": ${lng.toFixed(fp)}, "lat": ${lat.toFixed(fp)}}`
      }
      return `${lng.toFixed(fp)},${lat.toFixed(fp)}`
    },

    showGeopoint(row, col, column, val, pos){
      this.displayErrorBox = false;
      this.geopointSelected = false;
      this.rowCurrentGeopoint = row;
      this.colindexCurrentGeopoint = col;
      this.colCurrentGeopoint = column;
      this.topDivError = window.scrollY+pos.y+40;
      this.leftDivError = pos.x;
      this.displayGeopointBox = true;
    },
    getIdentifier(row, col, column, val, pos) {
      fetch('https://www.uuidgenerator.net/api/version1').then((r) => r.text()).then((data) => {
        this.rows[row][column] = data;
      });
    },
    handleScroll () {
      this.scrolled = window.scrollY > 0;
    },
    maybeAddRow($event){
      if ($event.rowIndex === (this.rows.length - 1)) {
        this.addEmptyRow()
      }
    },
    addMultipleRows($event) {
      for(let i = 0;i<$event.rowsToAdd;i++) {
        this.addEmptyRow()
      }
    },
    addNewField(header=null) {
        var new_name = ''
        if(header) {
          new_name = header
        } else {
          new_name = "nouvelle_colonne_"+this.columnDefs.length.toString()
        }
        this.fieldNames.push(new_name);
        const myobj = {};
        myobj.sortable = false;
        myobj.filter = true;
        myobj.field = new_name;
        myobj.headerName = new_name;
        myobj.editable = true;
        myobj.optional = true;
        myobj.rename = false;
        var lenCharacter = new_name.length*10+70
        myobj.size = (lenCharacter+100).toString()+"px";

        this.emptyRow[new_name] = '';
        this.emptyRowInfo[new_name] = '';
        this.emptyRowError[new_name] = '';

        this.columnDefs.push(myobj);
        
    },
    buildForm() {
      const loader = this.$loading.show();

      fetch(this.schemaMeta.schema_url).then((r) => r.json()).then((data) => {
        this.schema = data;

        this.schema.fields.forEach((field) => {
          this.fieldNames.push(field.name);
          const myobj = {};
          myobj.sortable = false;
          myobj.filter = true;
          myobj.field = field.name;
          myobj.headerName = field.name;
          myobj.editable = true;
          
          if(field.type == 'geopoint') { 
            this.emptyRow[field.name] = '';
            this.emptyRowInfo[field.name] = '';
            this.emptyRowError[field.name] = '';
            myobj.type = 'geopoint'
            myobj.format = field.format;
          }

          if(field.type == 'array') {
            this.emptyRow[field.name] = '';
            this.emptyRowInfo[field.name] = '';
            this.emptyRowError[field.name] = '';
            if(field.arrayItem && field.arrayItem.constraints && field.arrayItem.constraints.enum) {
              myobj.type = 'arrayEnum';
            } else {
              myobj.type = 'array';
            }
            //myobj.enumList = field.arrayItem.constraints.enum;
          }

          if (field.type === 'string') {
            this.emptyRow[field.name] = '';
            this.emptyRowInfo[field.name] = '';
            this.emptyRowError[field.name] = '';
            if(field.constraints && field.constraints.enum) {
              myobj.type = 'stringEnum';
              myobj.enumList = field.constraints.enum;
            }
          } else if (field.type === 'date') {
            
            //myobj.type = 'date';
            myobj.type = 'string';
            //myobj.format = defaultDateTimeFormat;
            var dateFormat = 'yyyy-MM-dd'
            if (field.format) {
              dateFormat = field.format.replace('%Y','yyyy').replace('%m','MM').replace('%d','dd')
            }
            myobj.format = dateFormat;
            this.emptyRow[field.name] = null;
            this.emptyRowInfo[field.name] = null;
            this.emptyRowError[field.name] = null;
          } else if (field.type === 'number') {
            myobj.type = 'numeric';
            this.emptyRow[field.name] = null;
            this.emptyRowInfo[field.name] = null;
            this.emptyRowError[field.name] = null;
          } else if (field.type === 'integer') {
            myobj.type = 'numeric';
            this.emptyRow[field.name] = null;
            this.emptyRowInfo[field.name] = null;
            this.emptyRowError[field.name] = null;
          }

          var lenCharacter = field.name.length*10+70;
          myobj.size = lenCharacter.toString()+"px";
          this.columnDefs.push(myobj);
        });
        const uniqueid = this.makeid(15);
        this.emptyRow.idRowVEG = uniqueid;
        this.emptyRowInfo.idRowVEG = uniqueid;
        this.emptyRowError.idRowVEG = uniqueid;
        this.emptyRowColor.idRowVEG = '#ebebeb';

        for(var i = 0; i<25; i++){
          this.addEmptyRow()
        }

        if(this.ongoingData) {
          if(this.ongoingData.schema === this.schemaMeta.name) {
            if(this.fromFile == 'yes'){
              //var diff = this.ongoingData.fileHeader.filter(x => !this.fieldNames.includes(x));
              this.ongoingData.fileHeader.forEach((header) => {
                if(!this.fieldNames.includes(header)){
                  this.newFieldName = header;
                  this.addNewField(header);
                }
              });
              var rowNb = 0;
              if(this.ongoingData.fileNbRows > 25){
                var max = 2500
                if (this.ongoingData.fileNbRows < 2500) {
                  max = this.ongoingData.fileNbRows
                }
                for(var k = 0; k < max; k++) {
                  this.addEmptyRow()
                }
              }
              this.ongoingData.fileRows.forEach((row) => {
                for(var col in row) {
                  this.rows[rowNb][col] = row[col]; 
                }
                rowNb++;
              });
              
              for(var l = 0; l < this.ongoingData.fileRows.length ; l++) {
                this.realRowsIds.push(this.rows[l]['idRowVEG'])
                this.realRowsIds = [...new Set(this.realRowsIds)];
              }

              this.submit();
            }
            else {
              this.columnDefs = this.ongoingData.columnDefs;
              this.rows = this.ongoingData.rows;
              this.realRowsIds = this.ongoingData.realRowsIds;
            }
          }
        }

      }).catch((_) => _)
        .finally(() => {
        loader.hide();
      });
    },
    buildLine(line) {
      let linecsv = '';
      let cpt = 0;
      var notEmpty = false;
      this.fieldNames.forEach((field) => {
        if(line[field] != "" && line[field] != null){
          notEmpty = true;
        }
      });
      if(notEmpty) {
        this.fieldNames.forEach((field) => {
          var fi = line[field];
          if(Array.isArray(line[field])) {
            fi = '['
            var cpt2 = 0
            line[field].forEach((l) => {
              if(cpt2 == 0) {
                cpt2 = 1
                fi = fi+'""'+l+'""'
              } else {
                fi = fi+',""'+l+'""'
              }
            });
            fi = fi+']'
          }
          this.columnDefs.forEach((cd) => {
            if(cd.headerName == field) {
              if(cd.type == 'array') {
                if(line[field]) {
                  var tab = line[field].replaceAll("[","").replaceAll("]","").replaceAll("'",'').replaceAll('"','').replaceAll(', ',',').replaceAll(' ',',').split(',')
                  fi = '['
                  var cpt2 = 0
                  tab.forEach((l) => {
                    if(cpt2 == 0) {
                      cpt2 = 1
                      fi = fi+'""'+l+'""'
                    } else {
                      fi = fi+',""'+l+'""'
                    }
                  });
                  fi = fi+']'
                }
              }
            }
          });
          if(fi == null){
            fi = ''
          }
          if (cpt === 0) {
            linecsv = `"${fi}"`;
            cpt = 1;
          } else {
            linecsv = `${linecsv},"${fi}"`;
          }
        });
      }
      return linecsv;
    },
    buildCurrentCsvContent() {
      let finalcsv = '';
      var stopBuilding = false;
      finalcsv = this.buildHeaderLine();
      this.rows.forEach((row) => {
        var currentLine = this.buildLine(row);
        if(currentLine != '' && stopBuilding == false) { 
          finalcsv = `${finalcsv}\r\n`;
          finalcsv += currentLine;
        } else{
          stopBuilding = true;
        }
      });
      return finalcsv;
    },
    csvLinkData() {
      const blob = new Blob([`${this.buildCurrentCsvContent()}`], { type: 'text/csv' });
      const a = document.createElement('a');
      const url = window.URL.createObjectURL(blob);
      a.href = url;
      a.download = this.filename;
      a.click();
    },
    getCSVBlob() {
      return new Blob([`${this.buildCurrentCsvContent()}`], { type: 'text/csv' });
    },
    addField(field) {
      const hasEnum = field.constraints && field.constraints.enum;
      const isBoolean = field.type === 'boolean';

      // eslint-disable-next-line no-shadow
      const factory = (klass, field) => {
        const className = Vue.extend(klass);
        // eslint-disable-next-line new-cap
        const instance = new className({ propsData: { field } });
        instance.$mount();
        return this.$refs.test.appendChild(instance.$el);
      };

      if (hasEnum) {
        return factory(SelectField, field);
      }
      if (isBoolean) {
        return factory(RadioField, field);
      }
      return factory(StringField, field);
    },
    submit() {

      this.report = null;
      this.reportJson = []
      this.reportValidStatus = null;
      this.badgeUrl = null;
      this.publicationMessage = null;

      this.reportValidStatus = null;
      this.reportStructureErrors = [];
      this.reportIntegrityErrors = [];
      this.reportGeneralErrors = [];
      this.reportContentErrors = [];
      this.reportRecos = [];
      this.reportErrorInfo = null;

      this.showModal3();
      const loader = this.$loading.show();
      this.rowsError.forEach((re) => {
        // eslint-disable-next-line no-restricted-syntax
        for (var property in re) {
          if (property !== 'idRowVEG') {
            // eslint-disable-next-line no-param-reassign
            re[property] = '';
          }
        }
      });

      this.rowsColor.forEach((rc) => {
        // eslint-disable-next-line no-restricted-syntax
        for (var property in rc) {
          if (property !== 'idRowVEG') {
            // eslint-disable-next-line no-param-reassign
            rc[property] = '';
          }
        }
      });
      fetch(`${VALIDATA_API_URL}/validate`, {
        method: 'POST',
        body: this.buildFormData(),
      })
        .then((r) => r.json())
        .then((data) => {
          this.faultyFields = [];
          const errors = data.report.tasks
            ? data.report.tasks[0].errors // new validation report
            : data.report.tables[0].errors; // legacy validation report
          if (errors && errors.length > 0) {
            this.validInfo = 'Il y a des erreurs TBC...';
            this.publicationReady = false;
            this.publicationButtons = false;

            errors.forEach((error) => {
              // eslint-disable-next-line no-bitwise
              if (error.code === 'type-error' | error.code === 'constraint-error') {
                this.rowsError[error.rowNumber - 1][error.fieldName] = error.name;
                this.rowsColor[error.rowNumber - 1][error.fieldName] = '#F4CDA4';
                this.$refs.grid.selectCell(this.rowIndex-1, this.colIndex+1);
              }
            });
          } else {
            this.validInfo = 'Fichier valide et prêt pour publication';
            this.publicationReady = false;
            this.publicationButtons = true;
            this.lines.push(this.getCurrentLine());
          }
          this.getValidataReport(data);
        }).finally(() => {
          loader.hide();
        });
    },
    formatRow(row) {
      const red = '#ffe5e5';
      const green = '#b6f7b6';
      const { happiness } = row;
      const priceRateBgColor = happiness > 0.6 ? green : red;
      // eslint-disable-next-line no-param-reassign
      row.$cellStyle = {
        happiness: priceRateBgColor && { backgroundColor: priceRateBgColor },
      };
      if (row.eyeColor === 'blue') {
        // eslint-disable-next-line no-param-reassign
        row.$rowStyle = { color: 'blue' };
      }
    },
    countLines(){
      var cpt = 0;
      var property;
      var empty = true;
      this.rows.forEach((row) => {
        for (property in row) {
          if (property != 'idRowVEG' && row[property] && row[property] != "") {
            empty = false;
          }
        }
        if (!empty) {
          cpt = cpt + 1;
          empty = true;
        }
      });
      return cpt;
    },
    cellUpdated($event) {
      // Reinit color once change
      if($event.column.field in this.rowsColor[$event.rowIndex]) {
        delete this.rowsColor[$event.rowIndex][$event.column.field];
        delete this.rowsError[$event.rowIndex][$event.column.field];
      }
      
      this.realRowsIds.push(this.rows[$event.rowIndex]['idRowVEG'])
      this.realRowsIds = [...new Set(this.realRowsIds)];


      if ($event.column.field.toLowerCase().includes('insee')) {
        this.handleInseeInput($event);
      }
      if ($event.column.field.toLowerCase().includes('siret')) {
        this.handleSiretInput($event);
      }
      if ($event.column.field.toLowerCase().includes('siren')) {
        this.handleSirenInput($event);
      }
      // eslint-disable-next-line no-bitwise
      if ($event.column.field.toLowerCase().includes('codepostal') | $event.column.field.toLowerCase().includes('code-postal') | $event.column.field.toLowerCase().includes('code_postal')) {
        this.handlePostcodeInput($event);
      }
    },
    rowSelected($event) {
      
      if ($event.colIndex) {
        if(this.colIndex != $event.colIndex) {
          this.arraySelected = true;
          this.geopointSelected = true;
        }
        this.colIndex = $event.colIndex;
      }
      if ($event.rowIndex != null) {
        if(this.rowIndex != $event.rowIndex+1) {
          this.arraySelected = true;
          this.geopointSelected = true;
        }
        this.rowIndex = $event.rowIndex+1;
      }
      this.selectedRow = $event.rowData;

      if (this.schema.fields) {
        this.schema.fields.forEach((field) => {
          if ($event.colData) {
            if (field.name === $event.colData.field) {
              this.messageInfo = field.description;
              this.exempleInfo = `${field.example}`;
            }
          }
        });
      }
      if ($event.colData) {
        this.warningInfo = this.rowsInfo[$event.rowIndex][$event.colData.field];
        this.errorInfo = this.rowsError[$event.rowIndex][$event.colData.field];
        if ($event.colData.field === 'selectCol') {
          this.removeCurrentRow();
          this.$refs.grid.selectCell(0, 1);
        }
      }
    },
    linkClicked() {
    },
    removeCurrentRow() {
      this.realRowsIds = this.realRowsIds.filter(e => e !== this.selectedRow.idRowVEG);
      this.rows = this.rows.filter((row) => row.idRowVEG !== this.selectedRow.idRowVEG);
    },
    contextMenu() {
    },
    addEmptyRow() {
      const myobj = {};
      const myobjInfo = {};
      const myobjError = {};
      const myobjColor = {};

      this.schema.fields.forEach((field) => {
        if (field.type === 'string' || field.type === 'stringEnum' || field.type === 'geopoint') {
          myobj[field.name] = '';
          myobjInfo[field.name] = '';
          myobjError[field.name] = '';
        } else if(field.type == 'arrayEnum') {
          myobj[field.name] = [];
          myobjInfo[field.name] = '';
          myobjError[field.name] = '';
        } else if (field.type === 'date') {
          //myobj.type = 'date';
          
          myobj[field.name] = null;
          //myobjInfo.type = 'date';
          //myobjInfo.format = defaultDateTimeFormat;
          myobjInfo[field.name] = null;
          //myobjError.type = 'date';
          //myobjError.format = defaultDateTimeFormat;
          myobjError[field.name] = null;
        } else if (field.type === 'number') {
          //myobj.type = 'numeric';
          myobj[field.name] = null;
          //myobjInfo.type = 'numeric';
          myobjInfo[field.name] = null;
          //myobjError.type = 'numeric';
          myobjError[field.name] = null;
        } else if (field.type === 'integer') {
          //myobj.type = 'numeric';
          myobj[field.name] = null;
          //myobjInfo.type = 'numeric';
          myobjInfo[field.name] = null;
          //myobjError.type = 'numeric';
          myobjError[field.name] = null;
        }
      });
      let uniqueid = this.makeid(15);
      myobj.idRowVEG = uniqueid;
      myobjInfo.idRowVEG = uniqueid;
      myobjError.idRowVEG = uniqueid;
      myobjColor.idRowVEG = '#ebebeb';
      this.rows.push(myobj);
      //console.log(myobj);
      this.rowsInfo.push(myobjInfo);
      this.rowsError.push(myobjError);
      this.rowsColor.push(myobjColor);
    },
    makeid(length) {
      let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let charactersLength = characters.length;
      let result = '';
      // eslint-disable-next-line no-plusplus
      for (let i = 0; i < length; i++) {
        // eslint-disable-next-line no-const-assign
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
      }
      return result;
    },
    handleInseeInput(event) {
      fetch(`https://geo.api.gouv.fr/communes/${event.value}`).then((r) => {
        if (!r.ok) {
          this.city = null;
          throw new Error('Not 200 response');
        }
        return r.json();
      }).then((data) => {
        this.city = data.nom;
        this.rowsInfo[event.rowIndex][event.column.field] = `Info : Ce code INSEE correspond à ${data.nom}.`;
        this.$refs.grid.selectCell(event.rowIndex, event.columnIndex);
      }).catch((_) => _);
    },
    handleSiretInput(event) {
      this.siretDescription = null;
      if (event.value.length !== 14) return;

      fetch(`https://entreprise.data.gouv.fr/api/sirene/v3/etablissements/${event.value}`).then((r) => {
        if (!r.ok) {
          this.siretDescription = null;
          throw new Error('Not 200 response');
        }
        return r.json();
      }).then((data) => {
        this.siretDescription = data.etablissement.unite_legale.denomination;
        this.rowsInfo[event.rowIndex][event.column.field] = `Info : Ce SIRET correspond à ${data.etablissement.unite_legale.denomination}.`;

        this.$refs.grid.selectCell(event.rowIndex, event.columnIndex);
      }).catch((_) => _);
    },
    handleSirenInput(event) {
      this.sirenDescription = null;
      if (event.value.length !== 9) return;

      fetch(`https://entreprise.data.gouv.fr/api/sirene/v3/unites_legales/${event.value}`).then((r) => {
        if (!r.ok) {
          this.sirenDescription = null;
          throw new Error('Not 200 response');
        }
        return r.json();
      }).then((data) => {
        this.sirenDescription = data.unite_legale.denomination;
        this.rowsInfo[event.rowIndex][event.column.field] = `Info : Ce SIREN correspond à ${data.unite_legale.denomination}.`;

        this.$refs.grid.selectCell(event.rowIndex, event.columnIndex);
      }).catch((_) => _);
    },
    handlePostcodeInput(event) {
      fetch(`https://geo.api.gouv.fr/communes?codePostal=${event.value}&boost=population`).then((r) => {
        if (!r.ok) {
          this.city = null;
          throw new Error('Not 200 response');
        }
        return r.json();
      }).then((data) => {
        this.city = data.map((c) => c.nom).join(' ou ');
        this.rowsInfo[event.rowIndex][event.column.field] = `Info : Ce code postal correspond à ${data.map((c) => c.nom).join(' ou ')}.`;

        this.$refs.grid.selectCell(event.rowIndex, event.columnIndex);
      }).catch((_) => _);
    },
    fieldHasKeyword(keyword) {
      const name = this.field.name.toLowerCase();
      const description = (this.field.description || '').toLowerCase();
      return name.includes(keyword) || new RegExp(`\\b${keyword}\\b`).test(description);
    },
    publishDataset() {
      // Get structured publish form content
      const publishContent = this.dataToPublish;
      // Si resource id : on modifie resource
      // Si pas de ressource id mais dataset id, on ajoute une ressource
      // Si pas de dataset id on créé un dataset avec ou sans orga avec la ressource

      if (publishContent.existingResource !== '') {
        // Mise à jour dataset
        // Ecrasement resource
        // Modification metadonnées
        this.updateDatasetUpdateResource(publishContent, this.getCSVBlob());
      } else if (publishContent.existingDataset !== '') {
        // Mise à jour dataset
        // création nouvelle ressource
        // modiciation métaonnées
        this.updateDatasetCreateResource(publishContent, this.getCSVBlob());
      } else {
        // Création dataset
        // création ressource
        // modification métadonnées
        this.createDatasetCreateResource(publishContent, this.getCSVBlob());
      }
    },
    saveRows(){
      this.$store.dispatch('data/fillSchemaNameData', this.schemaMeta.name)
      this.$store.dispatch('data/fillSchemaRowsData', this.rows)
      this.$store.dispatch('data/fillColumnDefsData', this.columnDefs)
      this.$store.dispatch('data/fillRealRowsIds', this.realRowsIds)
    },
    reinitRows(){
      this.$store.dispatch('data/reinitStateData');
      this.columnDefs = [
        {
          field: 'selectCol',
          headerName: '',
          size: '40px',
          type: 'supp',
          rename: false,
        },
      ];
      this.rows = [];
      this.rowsInfo = [];
      this.rowsError = [];
      this.rowsColor = [];
      this.fieldNames = [];
      this.realRowsIds = [];
      this.buildForm();
      this.hideModalDelete();
    },
    showModalDelete() {
      this.$refs.modalDelete.show();
    },
    hideModalDelete() {
      this.$refs.modalDelete.hide();
    },
    showModal3() {
      this.$refs.modal3.show();
    },
    hideModal3() {
      this.$refs.modal3.hide();
    },
    showModal4() {
      this.$refs.modal4.show();
    },
    hideModal4() {
      this.$refs.modal4.hide();
    },
    columnOperation(type) {
      this.displayRename = false;
      this.displayRemove = false;
      this.displayInformations = false;
      var column = this.operationHeaderColumn;
      if(type != "default") {
        var mandatory = false;
        var desc = "";
        var example = "";
        this.schema.fields.forEach((field) => {
          if(field.name == column) {
            mandatory = true;
            desc = field.description;
            example = field.example;
          }
        });
        if(type == "rename") {
          this.columnModalHeader = "Renommer une colonne"
          this.displayInfoBox = true;
          this.displayRename = true;
          this.infoSelected = true;
          this.columnModalP = "Impossible de renommer la colonne "+column+". Cette colonne doit être obligatoirement présente pour que le fichier puisse être conforme au schéma."
        } else if(type == "remove") {
          this.columnModalP = "Impossible de supprimer la colonne "+column+". Cette colonne doit être obligatoirement présente pour que le fichier puisse être conforme au schéma."
          this.columnModalHeader = "Supprimer une colonne"
          this.displayInfoBox = true;
          this.displayRemove = true;
          this.infoSelected = true;
        } else if(type == "info") {
          this.infoSelected = true;
          this.displayInfoBox = true;
          this.displayInformations = true;
          this.messageInfo = desc;
          this.exempleInfo = example;
        }
        if(!mandatory){
          if(type == "rename"){
            this.shouldRenameColumn = true;
            this.oldColumnName = column;
            this.columnModalP = "Renommer le champs \""+column+"\"."
            this.columnDefs.forEach((c) => {
              if(c.field == this.operationHeaderColumn) {
                c.rename = true;
                c.size = "200px";
              }
            });
          } else if(type == "remove") {
            this.removeColumn(column);
            this.columnModalP = "La colonne \""+column+"\" a été supprimée."
          }
        }
        // if(type != 'info') this.showModal4();
      }
    },
    removeColumn(column) {
      this.columnDefs = this.columnDefs.filter(e => e.field !== column);
      this.fieldNames = this.fieldNames.filter(e => e !== column);
      delete this.emptyRow[column]
      delete this.emptyRowColor[column]
      delete this.emptyRowError[column]
      delete this.emptyRowInfo[column]
      this.rows.forEach((row) => {
        delete row[column]
      });
      this.rowsColor.forEach((row) => {
        delete row[column]
      });
      this.rowsError.forEach((row) => {
        delete row[column]
      });
      this.rowsInfo.forEach((row) => {
        delete row[column]
      });
    },
    renameField(newNameHeader,oldNameHeader) { 

      this.columnDefs.forEach((col) =>{
        if(col.field == oldNameHeader) {
          col.field = newNameHeader;
          col.headerName = newNameHeader;
          col.rename = false;
        }
      });

      this.fieldNames = this.fieldNames.filter(e => e !== oldNameHeader);
      this.fieldNames.push(newNameHeader);

      this.emptyRow[newNameHeader] = this.emptyRow[oldNameHeader];
      delete this.emptyRow[oldNameHeader]

      this.emptyRowColor[newNameHeader] = this.emptyRowColor[oldNameHeader];
      delete this.emptyRowColor[oldNameHeader]

      this.emptyRowError[newNameHeader] = this.emptyRowError[oldNameHeader];
      delete this.emptyRowError[oldNameHeader]

      this.emptyRowInfo[newNameHeader] = this.emptyRowInfo[oldNameHeader];
      delete this.emptyRowInfo[oldNameHeader]

      this.rows.forEach((row) => {
        row[newNameHeader] = row[oldNameHeader]
        delete row[oldNameHeader]
      });
      this.rowsColor.forEach((row) => {
        row[newNameHeader] = row[oldNameHeader]
        delete row[oldNameHeader]
      });
      this.rowsError.forEach((row) => {
        row[newNameHeader] = row[oldNameHeader]
        delete row[oldNameHeader]
      });
      this.rowsInfo.forEach((row) => {
        row[newNameHeader] = row[oldNameHeader]
        delete row[oldNameHeader]
      });
      this.shouldRenameColumn = false;
      newNameHeader = "";
      
    },
    btnDocClick() {
      window.open(`https://schema.data.gouv.fr/${this.schemaName}/latest.html`);
    },
    moveHeaderMenu(event, column){
      this.operationHeaderColumn = column;
      this.menuSelected = true;
      this.displayMenuBox = true;
      this.topDiv = window.scrollY+event.y+27;
      this.leftDiv = event.x-10;
    },
    clickPage(){
      if(!this.menuSelected) this.displayMenuBox = false;
      this.menuSelected = false;
      if(!this.infoSelected) {
        this.displayInfoBox = false;
        this.displayInformations = false;
      }
      this.infoSelected = false;
      if(!this.errorSelected) {
        this.displayErrorBox = false;
      }
      this.errorSelected = false;
      if(this.arraySelected) {
        this.displayArrayBox = false;
      }
      if(this.geopointSelected) {
        this.displayGeopointBox = false;
      }
    },
    showErrors(event,row,col,pos){
      if(this.rowsError[row][this.columnDefs[col].field]) {
        this.topDivError = window.scrollY+pos.y+40;
        this.leftDivError = pos.x;
        this.errorSelected = true;
        if(this.displayArrayBox != true) this.displayErrorBox = true;
      } else{
        this.displayErrorBox = false;
      }
      if(this.arraySelected) this.displayArrayBox = false;
      if(this.geopointSelected) this.displayGeopointBox = false;
    },
    removeBoxes(){
      this.displayErrorBox = false;
      this.displayGeopointBox = false;
      this.displayInfoBox = false;
      this.displayInformations = false;
      this.displayMenuBox = false;
      this.displayRemove = false;
      this.displayRename = false;
      this.displayArrayBox = false;
      this.columnModalP = '';
    }
  },
};
</script>

<style lang="scss">
#gridview {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  font-size: 14px;
  height: 400px;
}

.grid {
  height: 100%;
}

.ml-1 {
  margin-left: 10px;
}

.warningInfo {
    color: green;
    font-style: italic;
}
.errorInfo {
    color: red;
    font-style: italic;
}


div.modal-dialog.modal-md {
  max-width: 70%;
}


</style>
