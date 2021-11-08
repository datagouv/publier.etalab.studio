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
        }
        if (data.report.errors.length > 0) {
            
            this.reportValidStatus = 'Votre fichier contient des erreurs bloquantes.'
            this.infoboxContent = 'Nous vous conseillons de vous référer à la documentation du schéma de données ou de télécharger un modèle de fichier.'
            this.editButtonTitle = 'Corriger le fichier';
            this.validBox = false;
            this.infoboxType = 4;
            this.badgeUrl = lkInvalide;
            this.reportErrorInfo = data.report.errors[0].note;

            data.report.errors.forEach((error) => {
                if (error.tags.includes('#general')) {
                    this.reportGeneralErrors.push(error);
                }
            });


        } else if (data.report.tasks[0].errors) {
            if (data.report.tasks[0].errors.length > 0) {
                this.reportValidStatus = 'Votre fichier contient des erreurs.';
                this.infoboxContent = 'Nous avons trouvé '+data.report.tasks[0].errors.length+' erreur(s). Vous pouvez voir la liste des erreurs et corriger le fichier.'
                this.editButtonTitle = 'Corriger le fichier';
                this.validBox = false;
                this.infoboxType = 3;
                this.ext = "csv"
                if(data.report.tasks[0].errors.length+data.report.tasks[0].structure_warnings.length > 20){
                    this.reportValidStatus = 'Votre fichier contient de nombreuses erreurs.'
                    this.infoboxContent = 'Nous vous conseillons de vous référer à la documentation du schéma de données ou de télécharger un modèle de fichier.'
                    this.infoboxType = 4;
                }
                this.badgeUrl = lkInvalide;
                this.reportErrors = data.report.tasks[0].errors;

                data.report.tasks[0].errors.forEach((error) => {
                if ((error.tags.length > 0) && ((!error.tags.includes('#integrity')) && (!error.tags.includes('#structure')))) {
                    this.reportContentErrors.push(error);
                }
                if (error.tags.length == 0 || error.tags.includes('#structure')) {
                    this.reportStructureErrors.push(error);
                }
                if (error.tags.includes('#integrity')) {
                    this.reportIntegrityErrors.push(error);
                }
                });

                if (data.report.tasks[0].structure_warnings.length > 0) {
                this.reportRecos = data.report.tasks[0].structure_warnings;
                }
            } else if (data.report.tasks[0].structure_warnings.length > 0) {
                this.reportValidStatus = 'Votre fichier est conforme.';
                this.infoboxContent = 'Votre fichier est conforme bien qu\'il ne respecte pas totalement la spécification du schéma de données.'
                this.infoboxType = 2;
                this.validBox = true;
                this.badgeUrl = lkPartiellementValide;
                this.reportRecos = data.report.tasks[0].structure_warnings;
                this.publication = true;
                this.publicationMessage = 'Malgré les recommandations, publier sur datagouv';
                this.ext = "csv"
            } else {
                this.reportValidStatus = 'Bravo ! Votre fichier est parfaitement conforme.';
                this.infoboxType = 1;
                this.validBox = true;
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
