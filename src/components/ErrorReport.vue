<template>
    <div v-if="report">
        <vsa-list>
        <!-- Here you can use v-for to loop through items  -->
        <vsa-item v-if="reportGeneralErrors.length != 0">
            <vsa-heading class="section-report">
                Erreurs de type général ({{ reportGeneralErrors.length }})
            </vsa-heading>
            <vsa-content>
                <ul v-bind:key="error.name" v-for="error in reportGeneralErrors">
                    <li><b>{{ error.name }}</b> : {{ error.note }}</li>
                </ul>
            </vsa-content>
        </vsa-item>
        <vsa-item v-if="reportStructureErrors.length != 0">
            <vsa-heading class="section-report">
                Erreurs de structure ({{ reportStructureErrors.length }})
            </vsa-heading>
            <vsa-content>
                <ul v-bind:key="error.name" v-for="error in reportStructureErrors">
                    <li><b>{{ error.name }}</b> : {{ error.note }}</li>
                </ul>
            </vsa-content>
        </vsa-item>
        <vsa-item v-if="reportContentErrors.length != 0" >
            <vsa-heading class="section-report">
                Erreurs de contenu ({{ reportContentErrors.length }})
            </vsa-heading>
            <vsa-content>
                <ul v-bind:key="error.name" v-for="error in reportContentErrors">
                    <li>
                        <b>{{ error.name }}</b> :
                        <span v-if="error.fieldName">
                        colonne <i>{{ error.fieldName }}</i>,
                        </span> rang {{ error.rowPosition }}
                    </li>
                </ul>
            </vsa-content>
        </vsa-item>
        <vsa-item v-if="reportRecos.length != 0">
            <vsa-heading class="section-report">
                Recommandations ({{ reportRecos.length }})
            </vsa-heading>
            <vsa-content>
                <ul v-bind:key="error.name" v-for="error in reportRecos">
                    <li><b>{{ error.name }}</b> : {{ error.message }}</li>
                </ul>
            </vsa-content>
        </vsa-item>
        <vsa-item v-if="reportJson.length != 0">
            <vsa-heading class="section-report">
                Erreurs ({{ reportJson.length }})
            </vsa-heading>
            <vsa-content>
                <ul v-bind:key="error" v-for="error in this.reportJson">
                    <li><b>{{ error }}</b></li>
                </ul>
            </vsa-content>
        </vsa-item>
        </vsa-list>
    </div>
</template>


<script>
import {
  VsaList,
  VsaItem,
  VsaHeading,
  VsaContent,
} from 'vue-simple-accordion';

export default {
  props: {
    report: Object,
    reportValidStatus: String,
    badgeUrl: String,
    reportErrorInfo: Object,
    reportStructureErrors: Array,
    reportGeneralErrors: Array,
    reportContentErrors: Array,
    reportRecos: Array,
    reportJson: Array,
  },
  name: 'ErrorReport',
  components: {
    VsaList,
    VsaItem,
    VsaHeading,
    VsaContent,
  },
  data() {
    return {

    };
  },
  methods: {
   
  },
  computed: {
 
  },
  mounted() {
   
  },
};
</script>

