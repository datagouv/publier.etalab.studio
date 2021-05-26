<script>

const lkInvalide = require('../static/images/badge-invalide.svg');
const lkPartiellementValide = require('../static/images/badge-partiellement-valide.svg');
const lkValide = require('../static/images/badge-valide.svg');

export default {
  data() {
    return {
      report: null,
      reportValidStatus: '',
      badgeUrl: null,
      reportStructureErrors: [],
      reportContentErrors: [],
      reportRecos: [],
      reportErrorInfo: null,
      reportJson: [],
      ext: '',
      publication: false,
      publicationMessage: null,
    };
  },
  mounted() {
  },
  computed: {
  },
  methods: {
      getValidataReport(data) {
        this.report = data;
        if (data.report.errors.length > 0) {
        this.reportValidStatus = 'Malheureusement, le fichier soumis est invalide.';
        this.badgeUrl = lkInvalide;
        this.reportErrorInfo = data.report.errors[0].note;
        } else if (data.report.tables[0].errors) {
        if (data.report.tables[0].errors.length > 0) {
            this.reportValidStatus = 'Malheureusement, le fichier soumis est invalide.';
            this.badgeUrl = lkInvalide;
            this.reportErrors = data.report.tables[0].errors;

            data.report.tables[0].errors.forEach((error) => {
            if (error.tags.includes('#content')) {
                this.reportContentErrors.push(error);
            }
            if (error.tags.includes('#structure')) {
                this.reportStructureErrors.push(error);
            }
            });

            if (data.report.tables[0].structure_warnings.length > 0) {
            this.reportRecos = data.report.tables[0].structure_warnings;
            }
        } else if (data.report.tables[0].structure_warnings.length > 0) {
            this.reportValidStatus = 'Votre fichier est partiellement valide.';
            this.badgeUrl = lkPartiellementValide;
            this.reportRecos = data.report.tables[0].structure_warnings;
            this.publication = true;
            this.publicationMessage = 'Malgré les recommandations, publier sur datagouv';
            this.ext = "csv"
        } else {
            this.reportValidStatus = 'Félicitations, votre fichier est conforme au schéma !';
            this.badgeUrl = lkValide;
            this.publication = true;
            this.publicationMessage = 'Publier sur datagouv';
            this.ext = "csv"
        }
        }
    },
    getJsonSchemaReport(data) {
        this.report = data;
        this.reportJson = data.errors
        if(data.errors.length > 0) {
            this.reportValidStatus = 'Malheureusement, le fichier soumis est invalide.';
            this.badgeUrl = lkInvalide;
        } else {
            this.reportValidStatus = 'Félicitations, votre fichier est conforme au schéma !';
            this.badgeUrl = lkValide;
            this.publication = true;
            this.publicationMessage = 'Publier sur datagouv';
            this.ext = "json"
        }
    },
  },
};
</script>
