# Publier.etalab.studio

Cet outil vous permet de saisir, valider et publier des données structurées sur la plateforme ouverte des données publiques françaises data.gouv.fr.

![](./screenshot.png)


Les types de données aujourd'hui proposés sont référencés sur la plateforme schema.data.gouv.fr.

## Déploiement

publier.etalab.studio est une application développé en vue.js

Vous pouvez configurer l'application avec les variables contenues dans le fichier.env.example à modifier en .env.production

```
npm run build
# les sources se trouvent alors dans le répertoire dist
```

publier.etalab.studio est uniquement un frontend mais se sert de plusieurs sources externes pour fonctionner :

### Catalogue des schémas schema.data.gouv.fr

publier.etalab.studio permet d'afficher des informations et de saisir des données auprès de schémas déjà référencés sur [schema.data.gouv.fr](https://github.com/etalab/schema.data.gouv.fr). 

Le catalogue des schémas référencés est disponible ici : https://schema.data.gouv.fr/schemas/schemas.json

### Validata

publier.etalab.studio exploite le rapport de validation de l'outil [Validata](https://git.opendatafrance.net/validata), initiative d'Opendatafrance développé par Jailbreak, pour les schémas tableschema.

### Json-schema-validator

publier.etalab.studio exploite le rapport de validation de l'outil [json-schema-validator](https://github.com/geoffreyaldebert/json-schema-validator) pour les schémas jsonschema

### Datagouv

publier.etalab.studio offre la possibilité de se connecter sur la plateforme data.gouv.fr via SSO. 


### CSV-GG

publier.etalab.studio est une évolution de l'outil [CSV-GG](https://github.com/etalab/csv-gg) développé par Etalab en 2019.