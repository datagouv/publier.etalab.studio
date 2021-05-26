<template>
    <div v-if="report">
        <h3>{{reportValidStatus}}</h3>
        <img v-bind:src="badgeUrl"/>
        <div v-if="reportErrorInfo">
            <br/>
            La tâche de validation a échouée. {{ reportErrorInfo }}.
        </div>
        <br/>
        <br/><br/>

        <vsa-list>
        <!-- Here you can use v-for to loop through items  -->
        <vsa-item v-if="reportStructureErrors.length != 0">
            <vsa-heading>
                Erreurs de structure ({{ reportStructureErrors.length }})
            </vsa-heading>
            <vsa-content>
                <ul v-bind:key="error.name" v-for="error in reportStructureErrors">
                    <li><b>{{ error.name }}</b> : {{ error.note }}</li>
                </ul>
            </vsa-content>
        </vsa-item>
        <vsa-item v-if="reportContentErrors.length != 0" >
            <vsa-heading>
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
            <vsa-heading>
                Recommandations ({{ reportRecos.length }})
            </vsa-heading>
            <vsa-content>
                <ul v-bind:key="error.name" v-for="error in reportRecos">
                    <li><b>{{ error.name }}</b> : {{ error.message }}</li>
                </ul>
            </vsa-content>
        </vsa-item>
        <vsa-item v-if="reportJson.length != 0">
            <vsa-heading>
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

