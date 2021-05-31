<template>
  <div  class="rf-container rf-pb-6w rf-pt-2w">
    <h2>{{ this.pageTitle }}</h2>
    <br />  
    <div v-if="showLevel1">
        <b-form @submit="onSubmit1" @reset="onReset" v-if="show">
            <h3>Informations générales</h3>
            <br />
            <b-form-group id="input-group-name" label="Nom court : " label-for="input-name">
                <b-form-input
                    id="input-name"
                    class="rf-input"
                    v-model="form.name"
                    placeholder="lieux-covoiturage, accessibilite-erp, arbres-urbains..."
                    required
                ></b-form-input>
                <template slot="description">
                    <p>Nom court du schéma, sans accent ni espace (séparer les mots d'un tiret).</p>
                </template>
            </b-form-group>

            <b-form-group id="input-group-title" label="Titre du schéma : " label-for="input-title">
                <b-form-input
                id="input-title"
                class="rf-input"
                v-model="form.title"
                placeholder="Entrer le titre de votre schéma."
                required
                ></b-form-input>
                <template slot="description">
                    <p>Titre du schéma. Qu'est-ce que ce schéma est censé représenté ?</p>
                </template>
            </b-form-group>

            <b-form-group id="input-group-keywords" label="Mots clés : " label-for="input-keywords">
                <b-form-tags
                    input-id="tags-pills"
                    class="add-style rf-input"
                    v-model="form.keywords"
                    separator=" ,;"
                    placeholder="Entrer les mots-clés en les séparant d'un espace"
                ></b-form-tags>
            </b-form-group>

            <br />
            <div style="text-align: center;">
                <b-button type="submit" class="rf-btn">Suivant</b-button>
        </div>
    </b-form>       
    <br />
    </div>
    <div v-if="showLevel2">
        <h3>Contributeurs</h3>
        <br />
        <b-button @click="showContributorForm = true" class="rf-btn" v-if="!showContributorForm">Ajouter un nouveau contributeur</b-button>
        <table class="table" v-if="form.contributors.length != 0">
            <thead>
                <tr>
                <th scope="col">Contributeur</th>
                <th scope="col">Email</th>
                <th scope="col">Organisation</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="contrib in form.contributors" v-bind:key="contrib.title">
                <td>{{ contrib.title }}</td>
                <td>{{ contrib.email }}</td>
                <td>{{ contrib.organisation }}</td>
                </tr>
            </tbody>
        </table>
        <b-form @submit="onSubmit2" v-if="showContributorForm">
            <b-form-group id="input-group-contributorTitle" label="Contributeur : " label-for="input-contributorTitle">
            <b-form-input
                id="input-contributorTitle"
                class="rf-input"
                v-model="contributor.title"
                placeholder="Pierre Dupont, Société..."
                required
                ></b-form-input>
                <template slot="description">
                    <p>Nom et prénom du contributeur.</p>
                </template>
            </b-form-group>
            <b-form-group id="input-group-contributorEmail" label="Email : " label-for="input-contributorEmail">
            <b-form-input
                id="input-contributorEmail"
                class="rf-input"
                v-model="contributor.email"
                placeholder="pierre.dupont@entite.xy"
                required
            ></b-form-input>
            <template slot="description">
                <p>Contact email.</p>
            </template>
            </b-form-group>
            <b-form-group id="input-group-contributorOrganisation" label="Organisation : " label-for="input-contributorOrganisation">
                <b-form-input
                    id="input-contributorOrganisation"
                    class="rf-input"
                    v-model="contributor.organisation"
                    placeholder="Entité XY"
                    required
                ></b-form-input>
                <template slot="description">
                    <p>Organisation du contributeur.</p>
                </template>
            </b-form-group>
            <br />
            <div style="text-align: center;">
                <b-button type="submit" class="rf-btn">Valider le contributeur</b-button>
            </div>
        </b-form>
        <br />
        <div style="text-align: center;" v-if="!showContributorForm">
            <b-button @click="previous1()" class="rf-btn">Précédent</b-button>&nbsp;&nbsp;
            <b-button @click="next1()" class="rf-btn">Suivant</b-button>
        </div>
      </div>
      
      <div v-if="showLevel3">
        <h3>Champs</h3>
        <br />
        <b-button @click="showFieldForm = true" class="rf-btn"  v-if="!showFieldForm">Ajouter un nouveau champs</b-button>
        <table class="table" v-if="form.fields.length != 0">
            <thead>
                <tr>
                <th scope="col">Nom</th>
                <th scope="col">Type</th>
                <th scope="col">Description</th>
                <th scope="col">Exemple</th>
                <th scope="col">Format</th>
                <th scope="col">Contraintes</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="field in form.fields" v-bind:key="field.name">
                <td>{{ field.name }}</td>
                <td>{{ field.type }}</td>
                <td>{{ field.description }}</td>
                <td>{{ field.example }}</td>
                <td>{{ field.format }}</td>
                <td>{{ isConstraint(field.constraints) }}</td>
                </tr>
            </tbody>
        </table>

        
        <b-form @submit="onSubmit3" v-if="showFieldForm">
            <b-form-group id="input-group-field-type" label="Type : " label-for="input-group-field-type">
                <b-form-select 
                    v-model="field.type" 
                    @change="getFormat($event)"
                    class="rf-select"
                    required
                >
                    <b-form-select-option disabled value="">Sélectionner un type...</b-form-select-option>
                    <b-form-select-option v-bind:key="dataType.name" v-bind:value="dataType.name" v-for="dataType in dataTypes">{{ dataType.nameFR }}</b-form-select-option>
                </b-form-select>
                <br />
            </b-form-group>
            <div v-if="field.formats && field.formats.length > 0">
                <b-form-group id="input-group-field-format" label="Format : " label-for="input-group-field-format">
                    <b-form-select 
                        v-model="field.format"    
                        class="rf-select"
                    >
                        <b-form-select-option disabled value="">Sélectionner un format...</b-form-select-option>
                        <b-form-select-option v-bind:key="format.name" v-bind:value="format.name" v-for="format in field.formats">{{ format.nameFR }}</b-form-select-option>
                    </b-form-select>
                    <br />
                </b-form-group>
                <div v-if="field.format == 'pattern'">   
                    <b-form-group id="input-group-formatPattern" label="Motif : " label-for="input-formatPattern">
                        <b-form-input
                        id="input-formatPattern"
                        class="rf-input"
                        v-model="field.formatPattern"
                        placeholder="Entrer le motif du format."
                        required
                        ></b-form-input>
                        <template slot="description">
                            <p>Motif du format.</p>
                        </template>
                    </b-form-group>
                </div>
            </div>
            <div>
                <div>
                    <b-form-group id="input-group-field-name" label="Nom du champs : " label-for="input-field-name">
                        <b-form-input
                        id="input-field-name"
                        v-model="field.name"
                        class="rf-input"
                        placeholder="siren_amenageur, code_insee, coordonnees_xy"
                        required
                        ></b-form-input>
                        <template slot="description">
                            <p>Le nom du champs. Dans la mesure du possible, choisir un nom sans majuscule, sans espace, sans accent et séparé par des underscores.</p>
                        </template>
                    </b-form-group>
                    <b-form-group id="input-group-field-description" label="Description du champs : " label-for="input-field-description">
                        <b-form-input
                        id="input-field-description"
                        class="rf-input"
                        v-model="field.description"
                        placeholder="Description..."
                        required
                        ></b-form-input>
                        <template slot="description">
                            <p>Description explicite du champs.</p>
                        </template>
                    </b-form-group>
                    <b-form-group id="input-group-field-example" label="Exemple : " label-for="input-field-example">
                        <b-form-input
                        id="input-field-example"
                        class="rf-input"
                        v-model="field.example"
                        placeholder="Exemple..."
                        required
                        ></b-form-input>
                        <template slot="description">
                            <p>Exemple représentatif d'une donnée attendue.</p>
                        </template>
                    </b-form-group>
                </div>
            </div>
            <div>
                <table class="table" v-if="Object.keys(field.constraints).length != 0">
                    <thead>
                        <tr>
                        <th scope="col">Contrainte</th>
                        <th scope="col">valeur(s)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(value, name) in field.constraints" v-bind:key="name">
                        <td>{{ name }}</td>
                        <td>{{ value }}</td>
                        </tr>
                    </tbody>
                </table>
                <b-button 
                    v-if="!showConstraintForm" 
                    @click="showConstraintForm = true" 
                    class="rf-btn-light"
                >
                    Ajouter une contrainte
                </b-button>
                <br />

                <div v-if="showConstraintForm">
                    <b-form-group id="input-group-constraint-name" label="Type : " label-for="input-constraint-name">
                        <b-form-select 
                            v-model="currentConstraint.name" 
                            @change="getConstraint($event)"
                            class="rf-select"
                        >
                            <b-form-select-option disabled value="">Sélectionner un type de contrainte...</b-form-select-option>
                            <b-form-select-option v-bind:key="constraint.name" v-bind:value="constraint.name" v-for="constraint in constraints">{{ constraint.nameFR }}</b-form-select-option>
                        </b-form-select>
                        <br />
                    </b-form-group>
                    <b-form-group v-if="currentConstraint && (currentConstraint.dataType == 'string' || currentConstraint.dataType == 'integer')" id="input-group-constraint-value-string-integer" label="Valeur : " label-for="input-constraint-value-string-integer">
                        <b-form-input
                        id="input-constraint-value-string-integer"
                        class="rf-input"
                        v-model="currentConstraint.value"
                        placeholder="Valeur..."
                        required
                        ></b-form-input>
                        <template slot="description">
                            <p>Valeur de la contrainte.</p>
                        </template>
                    </b-form-group>
                    <b-form-group v-if="currentConstraint && currentConstraint.dataType == 'boolean'" id="input-group-constraint-value-boolean" label="Type : " label-for="input-group-constraint-value-boolean">
                        <b-form-select 
                            v-model="currentConstraint.value" 
                            class="rf-select"
                        >
                            <b-form-select-option disabled value="">Sélectionner un type de contrainte...</b-form-select-option>
                            <b-form-select-option value="true">Oui</b-form-select-option>
                            <b-form-select-option value="false">Non</b-form-select-option>
                        </b-form-select>
                        <br />
                    </b-form-group>

                    <b-form-group v-if="currentConstraint && currentConstraint.dataType == 'array'" id="input-group-constraint-value-array" label="Liste de valeurs : " label-for="input-group-constraint-value-array">
                        <b-form-tags
                            input-id="input-group-constraint-value-array"
                            class="rf-input"
                            v-model="currentConstraint.values"
                            tag-variant="primary"
                            tag-pills
                            separator=" "
                            placeholder="Entrer la liste de valeurs"
                        ></b-form-tags>
                        <br />
                    </b-form-group>

                    <b-button @click="submitConstraintForm()" class="rf-btn-light" >Valider la contrainte</b-button>

                </div>

                    </div>
                <div>
                    <br />
                </div>  
                    <div style="text-align: center">
                        <b-button type="submit" class="rf-btn" >Valider le champs</b-button>
                    </div>
            </b-form>
            <div style="text-align: center;" v-if="!showFieldForm">
                <b-button @click="previous2()" class="rf-btn">Précédent</b-button>&nbsp;&nbsp;
                <b-button @click="next2()" class="rf-btn">Suivant</b-button>
            </div>

        </div>


    <div v-if="showLevel4">
        <div class="text-align: center;"><h3>Récapitulatif</h3></div>
        <p>Schéma {{ this.form.title }} (nom court : {{ this.form.name }})</p>
        <table class="table" v-if="form.contributors.length != 0">
            <thead>
                <tr>
                <th scope="col">Contributeur</th>
                <th scope="col">Email</th>
                <th scope="col">Organisation</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="contrib in form.contributors" v-bind:key="contrib.title">
                <td>{{ contrib.title }}</td>
                <td>{{ contrib.email }}</td>
                <td>{{ contrib.organisation }}</td>
                </tr>
            </tbody>
        </table>
        <table class="table" v-if="form.fields.length != 0">
            <thead>
                <tr>
                <th scope="col">Champs</th>
                <th scope="col">Type</th>
                <th scope="col">Description</th>
                <th scope="col">Exemple</th>
                <th scope="col">Format</th>
                <th scope="col">Contraintes</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="field in form.fields" v-bind:key="field.name">
                <td>{{ field.name }}</td>
                <td>{{ field.type }}</td>
                <td>{{ field.description }}</td>
                <td>{{ field.example }}</td>
                <td>{{ field.format }}</td>
                <td>{{ isConstraint(field.constraints) }}</td>
                </tr>
            </tbody>
        </table>
        <div style="text-align: center">
            <b-button @click="validateSchema()" class="rf-btn" >Valider le schéma</b-button>
        </div>
    </div>

    <div v-if="showLevel5">
        <div style="text-align: center">
            <br />
            <br />
            <b-button :href="this.linkSchemaCreated" class="rf-btn" >Télécharger votre schéma au format json</b-button>
            <br />
            <br />
            <b-button @click="goto()" class="rf-btn" >Saisir ou valider des données basées sur ce schéma.</b-button>
            <br />
            <br />
            <button 
                style="background-color: white; border: 1px solid #060191; padding: 20px; width: 100%; text-align: left; display: flex;" 
                @mouseover="mouseover()" 
                @mouseleave="mouseleave()"
                @click="onCopy()"
                type="button"
                v-clipboard:copy="this.linkSchemaCreated"
                v-clipboard:success="onCopy">
                <div style="flex: 11 1 auto;">
                    <b>Lien stable du schéma :</b> {{ this.linkSchemaCreated }}
                </div>
                <div style="flex: 1 1 auto;"> 
                    <span v-if="visibleCopy" style="background-color: #DFDFF1; color: #060191; padding: 5px;">{{ copyMessage }}</span>
                </div>
            </button>
        </div>
    </div>

  </div>
</template>

<script>
 
import axios from 'axios';

export default {
  name: 'createSchemaForm',
  mixins: [],
  components: {
  },
  data() {
    return {
        copyMessage: "Copier",
        visibleCopy: false,
        form: {
          name: '',
          title: '',
          keywords: [],
          contributors: [],
          fields: [
              
          ],
        },
        contributor: {
            title: '',
            email: '',
            organisation: '',
            role: 'contributor',
        },
        field: {
            name: null,
            description: null,
            type: null,
            example: null,
            format: null,
            formats: null,
            formatPattern: null,
            constraints: {

            },
        },
        dataTypes: [
            {
                name: 'string',
                nameFR: 'Chaîne de caractères',
                format: [
                    {
                        name: 'default',
                        nameFR: 'Pas de format imposé'

                    },
                    {
                        name: 'email',
                        nameFR: 'Adresse e-mail'
                    },
                    {
                        name: 'uri',
                        nameFR: 'Adresse URI (par exemple une adresse web)'
                    },
                    {
                        name: 'binary',
                        nameFR: 'Une chaîne de caractères encodée en base64'
                    },
                    {
                        name: 'uuid',
                        nameFR: 'Un identifiant unique universel'
                    }
                ]
            },
            {
                name: 'integer',
                nameFR: 'Nombre entier',
                format: []
            },
            {
                name: 'boolean',
                nameFR: 'Booléen',
                format: []
            },
            {
                name: 'object',
                nameFR: 'JSON',
                format: []
            },
            {
                name: 'array',
                nameFR: 'Tableau',
                format: []
            },
            {
                name: 'date',
                nameFR: 'Date',
                format: [
                    {
                        name: 'default',
                        nameFR: 'Norme ISO8601 YYYY-MM-DD'
                    },
                    {
                        name: 'any',
                        nameFR: 'Pas de format imposé (non conseillé)'
                    },
                    {
                        name: 'pattern',
                        nameFR: 'Motif parsable'
                    }
                ]
            },
            {
                name: 'time',
                nameFR: 'Time',
                format: [
                    {
                        name: 'default',
                        nameFR: 'Norme ISO8601 hh:mm:ss'
                    },
                    {
                        name: 'any',
                        nameFR: 'Pas de format imposé (non conseillé)'
                    },
                    {
                        name: 'pattern',
                        nameFR: 'Motif parsable'
                    }
                ]
            },
            {
                name: 'datetime',
                nameFR: 'Datetime',
                format: [
                    {
                        name: 'default',
                        nameFR: 'Norme ISO8601 YYYY-MM-DDThh:mm:ssZ'
                    },
                    {
                        name: 'any',
                        nameFR: 'Pas de format imposé (non conseillé)'
                    },
                    {
                        name: 'pattern',
                        nameFR: 'Motif parsable'
                    }
                ]
            },
            {
                name: 'year',
                nameFR: 'Année (YYYY)',
                format: []
            },
            {
                name: 'yearmonth',
                nameFR: 'Mois (YYYY-MM)',
                format: []
            },
            {
                name: 'duration',
                nameFR: 'Durée (format ISO8601)',
                format: []
            },
            {
                name: 'geopoint',
                nameFR: 'Coordonnées géographiques (longitude et latitude)',
                format: [
                    {
                        name: 'default',
                        nameFR: 'Simple (ex : 90,45)'
                    },
                    {
                        name: 'array',
                        nameFR: 'Tableau (ex : [90,45])'
                    },
                    {
                        name: 'object',
                        nameFR: 'Objet (ex: {"lon": lon, "lat": lat})'
                    }
                ]
            },
            {
                name: 'geojson',
                nameFR: 'GeoJson',
                format: [
                    {
                        name: 'default',
                        nameFR: 'Objet GeoJson'
                    },
                    {
                        name: 'topojson',
                        nameFR: 'Objet TopoJson'
                    }
                ]
            },
            {
                name: 'any',
                nameFR: 'Tout type',
                format: []
            }
        ],
        constraints: [
            {
                name: 'required',
                nameFR: 'Champs requis',
                dataType: 'boolean'
            },
            {
                name: 'unique',
                nameFR: 'Données uniques',
                dataType: 'boolean'
            },
            {
                name: 'minLength',
                nameFR: 'Taille minimum',
                dataType: 'integer'
            },
            {
                name: 'maxLength',
                nameFR: 'Taille maximum',
                dataType: 'integer'
            },
            {
                name: 'minimum',
                nameFR: 'Valeur minimum',
                dataType: 'string'
            },
            {
                name: 'maximum',
                nameFR: 'Valeur maximum',
                dataType: 'string'
            },
            {
                name: 'pattern',
                nameFR: 'Motif (expression régulière)',
                dataType: 'string'
            },
            {
                name: 'enum',
                nameFR: 'Liste restreinte de valeurs',
                dataType: 'array'
            }
        ],
        currentConstraint: {
            name: null,
            value: null,
            values: [],
            dataType: null,
        },
        show: true,
        showContributorForm: true,
        showFieldForm: true,
        showConstraintForm: false,
        showLevel1: true,
        showLevel2: false,
        showLevel3: false,
        showLevel4: false,
        showLevel5: false,
        linkSchemaCreated: '',
        pageTitle: 'Construire son schéma',
    };
  },
  computed: {
  },
  watch: {
  },
  methods: {
    onSubmit1(event) {
        event.preventDefault()
        this.showLevel1 = !this.showLevel1;
        this.showLevel2 = !this.showLevel2;
    },
    onSubmit2(event) {
        event.preventDefault()
        this.form.contributors.push({...this.contributor});
        this.showContributorForm = false;
        this.contributor.title = '';
        this.contributor.email = '';
        this.contributor.organisation = '';
    },
    next1(){
        this.showLevel2 = !this.showLevel2;
        this.showLevel3 = !this.showLevel3;
    },
    next2(){
        this.showLevel3 = !this.showLevel3;
        this.showLevel4 = !this.showLevel4;
    },
    previous1(){
        this.showLevel2 = !this.showLevel2;
        this.showLevel1 = !this.showLevel1;
    },
    previous2(){
        this.showLevel2 = !this.showLevel2;
        this.showLevel3 = !this.showLevel3;
    },
    onSubmit3(event) {
        console.log('test')
        event.preventDefault()
        if(this.field.format == 'pattern'){
            this.field.format = this.field.formatPattern;
        }
        if(!this.field.format){
            delete this.field.format
        }
        delete this.field.formatPattern;
        delete this.field.formats;
        this.form.fields.push({...this.field});
        this.field =  {
            name: null,
            description: null,
            type: null,
            example: null,
            format: null,
            formats: null,
            formatPattern: null,
            constraints: {
            }
        }
        this.showFieldForm = false;
    },
    onReset(event) {
    event.preventDefault()
    // Reset our form values
    this.form.email = ''
    this.form.name = ''
    this.form.food = null
    this.form.checked = []
    // Trick to reset/clear native browser form validation state
    this.show = false
    this.$nextTick(() => {
        this.show = true
    })
    },
    submitContributorForm(){
        this.form.contributors.push({...this.contributor});
        this.showContributorForm = false;
        this.contributor.title = '';
        this.contributor.email = '';
        this.contributor.organisation = '';
    },
    getFormat(val){
        this.field.formatPattern = null;
        this.field.formats = null;
        this.field.format = null;
        var formats = []
        this.dataTypes.forEach((dt) => {
            if(dt.name == val){
                formats = dt.format
            }
        });
        this.field.formats = formats;
    },
    getConstraint(val){
        this.currentConstraint.value = null;
        this.currentConstraint.values = null;
        var constraint = []
        this.constraints.forEach((c) => {
            if(c.name == val){
                constraint = c
                console.log(constraint);
            }
        });
        this.currentConstraint.dataType = constraint.dataType;
    },
    submitConstraintForm(){
        var constraint = {};
        var val = this.currentConstraint.value;
        if(this.currentConstraint.values && this.currentConstraint.values.length > 0){
            val = this.currentConstraint.values;
        }
        constraint[this.currentConstraint.name] = val;
        this.field.constraints = {...this.field.constraints, ...constraint };
        this.currentConstraint = {
            name: null,
            value: null,
            values: [],
            dataType: null
        };
        this.showConstraintForm = false;
    },
    isConstraint(constraint){
        console.log("a");
        console.log(Object.keys(constraint).length);
        console.log("v");
        if(Object.keys(constraint).length != 0){
            return "Oui"
        }
        return "Non"
    },
    validateSchema(){
        this.form.$schema = "https://specs.frictionlessdata.io/schemas/table-schema.json"
        this.form.countryCode = "FR"
        this.form.homepage = ""
        this.form.path = ""
        var lic = {}
        lic.title = "Etalab Licence Ouverte 2.0"
        lic.name = "etalab-2.0"
        lic.path = "https://spdx.org/licenses/etalab-2.0.html"
        this.form.licenses = []
        this.form.licenses.push({...lic})
        this.form.resources = []
        this.form.sources = []
        var yourDate = new Date()
        this.form.created = yourDate.toISOString().split('T')[0]
        this.form.lastModified = yourDate.toISOString().split('T')[0]
        this.form.version = "0.0.1"
        console.log(this.form)
        const token = process.env.VUE_APP_DATAGOUV_SCHEMA_TOKEN

        const instance = axios.create();
        const headers = { 
            'X-API-KEY': token,
            'accept': 'application/json'
        }

        const formData = new FormData();
        var jsonse = JSON.stringify(this.form);
        var blob = new Blob([jsonse], {type : "application/json"});
        //var file = new File([this.form], this.form.name+".json", {type:"application/json"});
        formData.append('file', blob, this.form.name+".json");

        instance.post(`${process.env.VUE_APP_DEMO_API_UR}/api/1/datasets/60b4b9b37b3c3a33db85ba89/upload/`, formData, { headers: headers })
            .then((response) => {
                console.log(response);
                this.showLevel4 = false;
                this.showLevel5 = true;
                this.linkSchemaCreated = response.data.latest
                this.pageTitle = "Félicitations, votre schéma est désormais disponible"
            })
            .catch(function (error) {
                console.log(error);
            });
        console.log('jhj')


    },
    goto(){
        this.$router.push(`select?schema_url=${this.linkSchemaCreated}`)
    },
    onCopy: function (e) {
      this.copyMessage = "Copié!"
    },
    mouseover() {
      this.visibleCopy = true;
    },
    mouseleave() {
      this.visibleCopy = false; 
      this.copyMessage = 'Copier';
    },
  },
  mounted() {
  },
};
</script>

<style>

.align-items-baseline {
    color: white;
    background-color: #060191;
}

.sr-only{
    display: none;
}

.b-form-tag-remove{
    background-color: red;
    border: none;
}
</style>
