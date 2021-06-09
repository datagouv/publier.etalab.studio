<script>
import { EventBus } from '../event-bus.js';

import $api from '../services/Api';

import Auth from '../services/Auth';

const $auth = new Auth();


const SCHEMAS_CATALOG_URL = process.env.VUE_APP_SCHEMAS_CATALOG_URL;
const DGV_BASE_URL = process.env.VUE_APP_DATAGOUV_API_URL;

export default {
  props: {
    field: Object,
  },
  data() {
    return {
      schemaName: this.$route.query.schema,
      schemaUrl: this.$route.query.schema_url,
      fieldNames: [],
      schemas: null,
      options: [],
      schema: {},
      schemaMeta: {},
      values: {},
      hasValues: false,
      publicationIntro: 'Publiez vos données dans un nouveau jeu de données',
      publishButtonDisabled: true,
      fromFile: this.$route.query.fromFile,
      publishWithSchema: true,
      titleVerificationModal: "Rapport de validation",
    };
  },
  mounted() {
    const loader = this.$loading.show();
    fetch(`${SCHEMAS_CATALOG_URL}`).then((r) => r.json()).then((data) => {
      this.schemas = data.schemas;
      this.options = this.schemas.map((s) => ({ 
        value: s.name, 
        text: s.title || s.name 
      }));
      this.schema = this.schemas.find((s) => (s.name === this.schemaName || s.schema_url === this.schemaUrl));
      if(this.schema && !this.schemaName) this.schemaName = this.schema.name
      if(this.schema) this.schema.version = this.schema.versions[this.schema.versions.length - 1]['version_name']
      if(!this.schema) {
        fetch(this.schemaUrl).then((r) => r.json()).then((data2) => {
          console.log(data2);
          if (data2.$schema && (data2.$schema == "https://specs.frictionlessdata.io/schemas/table-schema.json" || data2.$schema == "https://frictionlessdata.io/schemas/table-schema.json")) {
            console.log(this.schemaUrl);
            var obj = {}
            obj['contact'] = '';
            obj['description'] = '';
            obj['examples'] = [];
            obj['name'] = data2.name;
            obj['schema_type'] = "tableschema";
            obj['schema_url'] = this.schemaUrl;
            obj['title'] = data2.title;
            obj['versions'] = [];
            this.schema = obj;
            this.schemaMeta = this.schema;
          }
        });
      }
      if(this.schema) this.schemaMeta = this.schema;
    }).finally(() => {
      loader.hide();
    });

    EventBus.$on('field-value-changed', (field, value) => {
      this.values[field] = value;
      this.computeHasValues();
    });

    if (!this.user.loggedIn) {
      this.showModal();
    }
  },
  computed: {
    user() {
      return this.$store.state.auth.user;
    },
    userLoggedIn() {
      return this.user && this.user.loggedIn;
    },
    userLoggedInWithSomeOrganizations() {
      return this.userLoggedIn && this.user.data.organizations.length > 0;
    },
    fields() {
      return [...this.fieldNames.map((f) => ({
        key: f,
        label: f,
      })),
      { key: 'actions', label: '' }];
    },
    publishButtonTitle() {
      if (!this.userLoggedIn) {
        return 'Connectez-vous pour publier une ressource';
      }
      if (this.user.data.organizations.length === 0) {
        return 'Inscrivez-vous à une organisation pour publier une ressource';
      }
      return 'Publier le jeu de données';
    },
    userOrganizations() {
      return this.userLoggedIn
        ? this.user.data.organizations
          .slice(0)
          .sort((a, b) => a.name > b.name)
          .map((org) => ({
            value: org.id,
            text: org.name,
          }))
        : [];
    },
  },
  methods: {
    testMixin(){
        console.log('hello world')
    },
    // in a method because of {} binding not allowed
    computeHasValues() {
      this.hasValues = Object.keys(this.values).length > 0
        && Object.values(this.values).some((v) => v !== '');
    },
    buildHeaderLine() {
      return this.fieldNames.map((v) => `"${v}"`).join(',');
    },
    getCurrentLine() {
      return this.fieldNames.map((f) => this.values[f] || '');
    },
    buildFullCsvContent() {
      const lines = this.lines.map((l) => this.buildLine(l));
      return [this.buildHeaderLine(), ...lines].join('\r\n');
    },
    buildFormData() {
      const formData = new FormData();
      const blob = new Blob([`${this.buildCurrentCsvContent()}`], { type: 'text/csv' });
      formData.append('file', blob, 'data.csv');
      formData.append('schema', this.schemaMeta.schema_url);
      return formData;
    },
    isAddressField(field) {
      const patterns = ['ad_', 'addr_', 'address', 'adr_', 'adresse'];
      const lowerFieldName = field.name.toLowerCase();
      return patterns.some((elt) => lowerFieldName.includes(elt));
    },
    togglePublishButtonState(formState) {
      this.publishButtonDisabled = !formState;
    },
    updateDatasetUpdateResource(publishContent, dataBlob, ext="csv") {
      $api
        .put(
          `datasets/${publishContent.existingDataset}`,
          {
            title: publishContent.dataset.title,
            description: publishContent.dataset.description,
          },
          (err) => {
            // eslint-disable-next-line no-alert
            alert(`Erreur lors de la publication du jeu de données : ${err}`);
          },
        )
        .then((response) => {
          // new dataset identifier
          const datasetId = response.data.id;
          // Prepare resource file to upload
          const formData = new FormData();
          formData.append('file', dataBlob, 'data.'+ext);
          // Resource upload
          $api
            .post(
              `datasets/${datasetId}/resources/${publishContent.existingResource}/upload`,
              formData,
              (err) => {
                // eslint-disable-next-line
                console.log(
                  `Erreur lors du téléversement de la ressource : ${err}`,
                );
              },
              { 'Content-Type': 'multipart/form-data' },
            )
            // eslint-disable-next-line no-shadow
            .then((response) => {
              // New resource identifier
              const resourceId = response.data.id;

              var payload = {}
              if(this.publishWithSchema) {
                if(this.schemaName) {
                  payload = {
                    title: publishContent.resource.title,
                    schema: {
                      name: this.schemaName,
                      version: this.schema.version
                    },
                    extras: {
                      publish_source: "publier.etalab.studio"
                    }
                  };
                } else if(this.schemaUrl) {
                  payload = {
                    title: publishContent.resource.title,
                    extras: {
                      external_schema_url: this.schemaUrl,
                      external_schema_name: this.schema.name,
                      publish_source: "publier.etalab.studio"
                    }
                  }
                }
              } else {
                payload = {
                    title: publishContent.resource.title,
                    extras: {
                      publication_schema_failed: this.schemaName,
                      publish_source: "publier.etalab.studio"
                    }
                }
              }
              $api
                .put(
                  `datasets/${datasetId}/resources/${resourceId}/`,
                  payload,
                  (err) => {
                    // eslint-disable-next-line no-alert
                    alert(
                      `Erreur lors de la mise à jour de la ressource : ${err}`,
                    );
                  },
                )
                .then(() => {
                  this.publicationOK = true;
                  this.linkDgv = `${DGV_BASE_URL}/datasets/${publishContent.existingDataset}`;
                });
            });
        });
    },
    updateDatasetCreateResource(publishContent, dataBlob, ext="csv") {
      console.log(dataBlob);
      $api
        .put(
          `datasets/${publishContent.existingDataset}`,
          {
            title: publishContent.dataset.title,
            description: publishContent.dataset.description,
          },
          (err) => {
            // eslint-disable-next-line no-alert
            alert(`Erreur lors de la publication du jeu de données : ${err}`);
          },
        )
        .then((response) => {
          // new dataset identifier
          const datasetId = response.data.id;
          // Prepare resource file to upload
          const formData = new FormData();
          formData.append('file', dataBlob, 'data.'+ext);
          // Resource upload
          $api
            .post(
              `datasets/${datasetId}/upload`,
              formData,
              (err) => {
                // eslint-disable-next-line
                console.log(
                  `Erreur lors du téléversement de la ressource : ${err}`,
                );
              },
              { 'Content-Type': 'multipart/form-data' },
            )
            // eslint-disable-next-line no-shadow
            .then((response) => {
              // New resource identifier
              const resourceId = response.data.id;


              var payload = {}
              if(this.publishWithSchema) {
                if(this.schemaName) {
                  payload = {
                    title: publishContent.resource.title,
                    schema: {
                      name: this.schemaName,
                      version: this.schema.version
                    },
                    extras: {
                      publish_source: "publier.etalab.studio"
                    }
                  };
                } else if(this.schemaUrl) {
                  payload = {
                    title: publishContent.resource.title,
                    extras: {
                      external_schema_url: this.schemaUrl,
                      external_schema_name: this.schema.name,
                      publish_source: "publier.etalab.studio"
                    }
                  }
                }
              } else {
                payload = {
                    title: publishContent.resource.title,
                    extras: {
                      publication_schema_failed: this.schemaName,
                      publish_source: "publier.etalab.studio"
                    }
                }
              }

              $api
                .put(
                  `datasets/${datasetId}/resources/${resourceId}/`,
                  payload,
                  (err) => {
                    // eslint-disable-next-line no-alert
                    alert(
                      `Erreur lors de la mise à jour de la ressource : ${err}`,
                    );
                  },
                )
                .then(() => {
                  this.publicationOK = true;
                  this.linkDgv = `${DGV_BASE_URL}/datasets/${publishContent.existingDataset}`;
                });
            });
        });
    },
    createDatasetCreateResource(publishContent, dataBlob, ext="csv") {
      let body = {};
      if (publishContent.organizationId === 'me') {
        body = {
          title: publishContent.dataset.title,
          description: publishContent.dataset.description,
        };
      } else {
        body = {
          title: publishContent.dataset.title,
          description: publishContent.dataset.description,
          organization: publishContent.organizationId,
        };
      }
      $api
        .post(
          'datasets',
          body,
          (err) => {
            // eslint-disable-next-line no-alert
            alert(`Erreur lors de la publication du jeu de données : ${err}`);
          },
        )
        .then((response) => {
          // new dataset identifier
          const datasetId = response.data.id;
          // Prepare resource file to upload
          const formData = new FormData();
          formData.append('file', dataBlob, 'data.'+ext);
          // Resource upload
          $api
            .post(
              `datasets/${datasetId}/upload`,
              formData,
              (err) => {
                // eslint-disable-next-line
                console.log(
                  `Erreur lors du téléversement de la ressource : ${err}`,
                );
              },
              { 'Content-Type': 'multipart/form-data' },
            )
            // eslint-disable-next-line no-shadow
            .then((response) => {
              // New resource identifier
              const resourceId = response.data.id;

              var payload = {}
              if(this.publishWithSchema) {
                if(this.schemaName) {
                  payload = {
                    title: publishContent.resource.title,
                    schema: {
                      name: this.schemaName,
                      version: this.schema.version
                    },
                    extras: {
                      publish_source: "publier.etalab.studio"
                    }
                  };
                } else if(this.schemaUrl) {
                  payload = {
                    title: publishContent.resource.title,
                    extras: {
                      external_schema_url: this.schemaUrl,
                      external_schema_name: this.schema.name,
                      publish_source: "publier.etalab.studio"
                    }
                  }
                }
              } else {
                payload = {
                    title: publishContent.resource.title,
                    extras: {
                      publication_schema_failed: this.schemaName,
                      publish_source: "publier.etalab.studio"
                    }
                }
              }

              $api
                .put(
                  `datasets/${datasetId}/resources/${resourceId}/`,
                  payload,
                  (err) => {
                    // eslint-disable-next-line no-alert
                    alert(
                      `Erreur lors de la mise à jour de la ressource : ${err}`,
                    );
                  },
                )
                .then(() => {
                  this.publicationOK = true;
                  this.linkDgv = `${DGV_BASE_URL}/datasets/${datasetId}`;
                });
            });
        });
    },
    showPublishForm() {
      this.publicationReady = true;
    },
    btnClick() {
      window.open(this.linkDgv);
    },
    showModal() {
      this.$refs.modalConnectLaunch.show();
    },
    hideModal() {
      this.$refs.modalConnectLaunch.hide();
    },
    submitLogin(evt) {
      console.log(evt);
      if ((this.$route.name != 'login') & (this.$route.name != 'home')) {
        this.$store.dispatch('auth/fillLastPage',this.$route.name+'?schema='+this.$route.query.schema)
      } else {
        this.$store.dispatch('auth/fillLastPage','/')
      }
      evt.preventDefault();
      window.location = $auth.authUrl();
    },
    gotoHomePage() {
      this.$router.push('/');
    },
    gotoSelectPage() {
      if(this.schemaName){
        this.$router.push('/select?schema='+this.schemaName);
      } else if(this.schemaUrl) {
        this.$router.push('/select?schema_url='+this.schemaUrl);
      }
    },
  },
};
</script>

