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
      reportIntegrityErrors: [],
      reportGeneralErrors: [],
      reportContentErrors: [],
      reportRecos: [],
      reportErrorInfo: null,
      reportJson: [],
      ext: '',
      publication: false,
      publicationMessage: null,
      validBox: true,
      infoboxType: 1,
      infoboxContent: '',
      editButtonTitle: 'Prévisualiser le fichier',
      tooMuchLines: false,
    };
  },
  mounted() {
  },
  computed: {
  },
  methods: {
      getValidataReport(data) {
        console.log(data)
        this.report = data;

        if (!data.report) {
            this.reportValidStatus = 'Nous avons rencontré une erreur dans la validation de votre fichier'
            this.infoboxContent = 'Nous vous conseillons de vous référer à la documentation du schéma de données ou de télécharger un modèle de fichier.'
            this.validBox = false;
            this.infoboxType = 4;
            this.badgeUrl = lkInvalide;
        } else {
            data.report.errors.forEach((error) => {
                if ((error.tags.length > 0) && ((error.tags.includes('#cell')) || (error.tags.includes('#row')))) {
                    this.reportContentErrors.push(error);
                }
                else if (error.tags.length == 0 || ((error.tags.length > 0) && ((error.tags.includes('#table')) ||(error.tags.includes('#label')) || (error.tags.includes('#header'))))) {
                    this.reportStructureErrors.push(error);
                }
                else if (error.tags.includes('#file')) {
                    this.reportIntegrityErrors.push(error);
                }
            });

            if ((this.reportIntegrityErrors.length > 0) || (this.reportStructureErrors.length > 0)) {
                this.reportValidStatus = 'Votre fichier contient des erreurs bloquantes.'
                this.infoboxContent = 'Nous vous conseillons de vous référer à la documentation du schéma de données ou de télécharger un modèle de fichier.'
                this.editButtonTitle = 'Corriger le fichier';
                this.validBox = false;
                this.infoboxType = 4;
                this.badgeUrl = lkInvalide;
                this.reportErrorInfo = data.report.errors[0].note;
            }
            else if (this.reportContentErrors.length > 0) {
                this.reportValidStatus = this.$t('error.few_errors');
                this.infoboxContent = this.$t('error.list_errors1')+data.report.errors.length+this.$t('error.list_errors2')
                this.editButtonTitle = this.$t('error.correct_file');
                this.validBox = false;
                this.infoboxType = 3;
                this.ext = "csv"
                if (data.report.errors.length+data.report.warnings.length > 20) {
                    this.reportValidStatus = this.$t('error.many_errors')
                    this.infoboxContent = this.$t('error.see_documentation')
                    this.infoboxType = 4;
                }
                this.badgeUrl = lkInvalide;
                this.reportErrors = data.report.errors;
            }
            else if (data.report.warnings.length > 0) {
                this.reportRecos = data.report.warnings;
                this.reportValidStatus = this.$t('error.file_ok');
                this.infoboxContent = this.$t('error.file_warning')
                this.infoboxType = 2;
                this.validBox = true;
                this.badgeUrl = lkPartiellementValide;
                this.reportRecos = data.report.warnings;
                this.publication = true;
                this.publicationMessage = this.$t('error.publish_anyway');
                this.ext = "csv"
            }
            else {
                this.reportValidStatus = this.$t('error.file_perfect');
                this.infoboxType = 1;
                this.validBox = true;
                this.badgeUrl = lkValide;
                this.publication = true;
                this.publicationMessage = this.$t('global.publish');
                this.ext = "csv"
            }
        }
    },
    getJsonSchemaReport(data) {
        this.report = data;
        this.reportJson = data.errors
        if(data.errors.length > 0) {
            this.reportValidStatus = 'Votre fichier contient des erreurs.';            
            this.infoboxContent = 'Nous avons trouvé '+data.errors.length+' erreur(s). Vous pouvez voir la liste des erreurs et corriger le fichier.'
            this.infoboxType = 3;
            this.badgeUrl = lkInvalide;
            this.validBox = false;
            this.ext = "json"
        } else {
            this.reportValidStatus = 'Votre fichier est conforme.';
            this.infoboxType = 1;
            this.badgeUrl = lkValide;
            this.publication = true;
            this.publicationMessage = 'Publier sur datagouv';
            this.validBox = true;
            this.ext = "json"
        }
    },
  },
};
</script>
