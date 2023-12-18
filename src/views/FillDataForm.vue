<template>
  <div>
    <div class="fr-container">
      <p style="font-size: 14px; cursor: pointer;">
        <a @click="gotoHomePage()" style="cursor: pointer;" >Accueil</a>
        &nbsp;&nbsp;&nbsp;>&nbsp;&nbsp;&nbsp;
        <a @click="gotoSelectPage()" style="cursor: pointer;">{{ schema.title }}</a>
        &nbsp;&nbsp;&nbsp;>&nbsp;&nbsp;&nbsp;
        {{ $t("form.title") }}
      </p>
    </div>
  <div class="fr-container fr-pb-6w fr-pt-2w">

      <div v-if="!publicationReady">
        <h3>{{ $t("form.subtitle") }}</h3>
        <br />
        <div class="fr-callout fr-mb-3w">
          <p>
            {{ $t("form.description") }}
          </p>
          <ol class="mb-0">
            <li>
              {{ $t("form.guideline1") }}
            </li>
            <li>
              {{ $t("form.guideline2") }}
            </li>
            <li>
              {{ $t("form.guideline3") }}
            </li>
            <li>
              {{ $t("form.guideline4") }}
            </li>
            <li>
              {{ $t("form.guideline5") }}
            </li>
            <li v-if="schemaMeta && schemaMeta.name === 'etalab/schema-lieux-covoiturage'">
              Une fois votre fichier complété et téléchargé, vous pouvez l'envoyer à
              <a href="mailto:contact@transport.beta.gouv.fr">
                contact@transport.beta.gouv.fr
              </a>
              pour qu'il soit intégré à la base nationale.
            </li>
          </ol>

          <div v-if="schemaMeta && schemaMeta.name === 'etalab/schema-lieux-covoiturage'">
              <br/>
              <div>
                Pour toute question, n'hésitez pas à adresser un mail à
                <a href="mailto:contact@transport.beta.gouv.fr">
                  contact@transport.beta.gouv.fr
                </a>
              </div>
          </div>
        </div>
        <br/>
      </div>
    <div v-if="!publicationReady && lines.length > 0" class="my-4">
      <b-table striped hover :items="items" :fields="fields">
        <template slot="actions" slot-scope="row">
          <b-button
            size="sm"
            variant="danger"
            @click="deleteLine(row.index)"
            class="mr-1"
          >
          {{ $t("form.delete") }}
          </b-button>
        </template>
      </b-table>
      <b-button
        :href="csvLink"
        :download="filename"
        type="button"
        class="fr-btn"
        style="margin-right: 20px"
        >{{ $t("form.download_csv") }}</b-button
      >
      <b-button
        type="button"
        class="fr-btn"
        style="margin-right: 20px"
        :disabled="!userLoggedInWithSomeOrganizations"
        :title="publishButtonTitle"
        @click="showPublishForm()"
        >{{ $t("global.publish") }}</b-button
      >
      <b-button
        @click.prevent="addLine"
        :disabled="addingLine"
        type="button"
        class="fr-btn"
        style="margin-right: 20px"
        >{{ $t("form.add_row") }}</b-button
      >
    </div>
    <b-form
      @submit.prevent="submit"
      v-show="addingLine"
      novalidate
      class="my-4"
    >
      <div ref="container"></div>
      <b-button
        type="submit"
        class="fr-btn"
        style="margin-right: 20px"
        :disabled="!hasValues"
      >
      {{ $t("form.validate_row") }}
      </b-button>
    </b-form>

    <div>
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
              :title="$t('global.publish')"
              @click="publishDataset()"
            >
            {{ $t("global.publish_short") }}
            </button>
        </div>
        <div v-if="publishButtonDisabled">
            <button type="submit" class="fr-btn-light" title="Publier sur datagouv">{{ $t("global.publish_short") }}</button>
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
  </div>
</template>

<script>
import Vue from "vue";
import StringField from "../components/StringField.vue";
import SelectField from "../components/SelectField.vue";
import RadioField from "../components/RadioField.vue";
import AddressField from "../components/AddressField.vue";
import GeoPointField from "@/components/GeoPointField.vue";

import PublishFormUpload from "../components/PublishFormUpload.vue";

import { EventBus } from "../event-bus.js";

import PublishRessources from "../mixins/PublishResources.vue";

const VALIDATA_API_URL = process.env.VUE_APP_VALIDATA_API_URL;

export default {
  name: "fillDataForm",
  mixins: [PublishRessources],
  components: {
    PublishFormUpload,
  },
  data() {
    return {
      errors: {},
      faultyFields: [],
      lines: [],
      formValidated: false,
      addingLine: true,
      fieldNodes: [],
      publicationOK: false,
      publicationReady: false,
      dataToPublish: {},
      filename: "Monfichier",
    };
  },
  watch: {
    schemaMeta() {
      // executed every time a new schema is choosen, except the first time
      // reset everything (what a mess!)
      this.removeFieldNodes();
      this.lines = [];
      this.addingLine = true;
      this.fieldNames = [];
      this.formValidated = false;
      this.hasValues = false;
      this.values = {};
      this.errors = {};
      this.faultyFields = [];
      // launch a new form build
      this.buildForm();
    },
  },
  mounted() {
    this.buildForm();
  },
  computed: {
    csvBlob() {
      // Build CSV content
      const lines = this.lines.map((l) => this.buildLine(l));
      const csv = [this.buildHeaderLine(), ...lines].join("\r\n");
      // Forcing UTF-8 encoding. See https://stackoverflow.com/questions/17879198
      return new Blob([`${csv}`], { type: "text/csv" });
    },
    csvLink() {
      return window.URL.createObjectURL(this.csvBlob);
    },
    items() {
      return this.lines.map((line) => {
        const obj = {};
        this.fieldNames.forEach((field, idx) => {
          obj[field] = line[idx];
        });
        return obj;
      });
    },
  },
  methods: {
    buildForm() {
      const loader = this.$loading.show();
      fetch(this.schemaMeta.schema_url)
        .then((r) => r.json())
        .then((data) => {
          this.schema = data;
          this.schema.fields.forEach((field) => {
            this.fieldNames.push(field.name);
            this.fieldNodes.push(this.addField(field));
          });
        })
        .finally(() => {
          loader.hide();
        });
    },
    buildLine(line) {
      return line.map((v) => `"${v}"`).join(",");
    },
    buildCurrentCsvContent() {
      return [
        this.buildHeaderLine(),
        this.buildLine(this.getCurrentLine()),
      ].join("\r\n");
    },
    addField(field) {
      const hasEnum = field.constraints && field.constraints.enum;
      const isBoolean = field.type === "boolean";
      const isGeoPoint = field.type === "geopoint";
      // eslint-disable-next-line no-shadow
      const factory = (klass, field) => {
        const className = Vue.extend(klass);
        // eslint-disable-next-line new-cap
        const instance = new className({ propsData: { field } });
        instance.$mount();
        return this.$refs.container.appendChild(instance.$el);
      };
      if (hasEnum) {
        return factory(SelectField, field);
      }
      if (isBoolean) {
        return factory(RadioField, field);
      }
      if (isGeoPoint) {
        return factory(GeoPointField, field);
      }
      if (this.isAddressField(field)) {
        return factory(AddressField, field);
      }
      return factory(StringField, field);
    },
    removeFieldNodes() {
      this.fieldNodes.forEach((child) => {
        this.$refs.container.removeChild(child);
      });
      this.fieldNodes = [];
    },
    dispatchError(error) {
      const index = error.fieldNumber
        ? error.fieldNumber // new validation report
        : error["column-number"]; // legacy validation report
      this.faultyFields.push(this.fieldNames[index - 1]);
      EventBus.$emit("field-error", this.fieldNames[index - 1], error);
    },
    dispatchNoError() {
      this.fieldNames.forEach((field) => {
        if (this.faultyFields.indexOf(field) === -1) {
          EventBus.$emit("field-no-error", field);
        }
      });
    },
    dispatchFormValidated() {
      EventBus.$emit("form-validated");
    },
    dispatchReset() {
      EventBus.$emit("form-reset");
    },
    submit() {
      const loader = this.$loading.show();
      fetch(`${VALIDATA_API_URL}/validate`, {
        method: "POST",
        body: this.buildFormData(),
      })
        .then((r) => r.json())
        .then((data) => {
          this.formValidated = true;
          this.faultyFields = [];
          const errors = data.report.tasks
            ? data.report.tasks[0].errors // new validation report
            : data.report.tables[0].errors; // legacy validation report
          if (errors && errors.length > 0) {
            errors.forEach((error) => {
              this.dispatchError(error);
            });
          } else {
            this.addingLine = false;
            this.lines.push(this.getCurrentLine());
            this.values = {};
          }
          this.dispatchNoError();
          this.dispatchFormValidated();
        })
        .finally(() => {
          loader.hide();
        });
    },
    addLine() {
      this.addingLine = true;
      this.formValidated = false;
      this.dispatchReset();
    },
    deleteLine(idx) {
      this.lines.splice(idx, 1);
      if (this.lines.length === 0) {
        this.addLine();
      }
    },
    publishDataset() {
      // Get structured publish form content
      const publishContent = this.dataToPublish;
      // Dataset creation
      // Si resource id : on modifie resource
      // Si pas de ressource id mais dataset id, on ajoute une ressource
      // Si pas de dataset id on créé un dataset avec ou sans orga avec la ressource
      if (publishContent.existingResource !== "") {
        this.updateDatasetUpdateResource(publishContent, this.csvBlob, 'form');
      } else if (publishContent.existingDataset !== "") {
        this.updateDatasetCreateResource(publishContent, this.csvBlob, 'form');
      } else {
        this.createDatasetCreateResource(publishContent, this.csvBlob, 'form');
      }
    },
  },
};
</script>

<style scoped>
.fr-callout {
  background-color: #d5dbef;
}
</style>