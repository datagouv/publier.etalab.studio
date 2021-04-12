<template>
        <header class="rf-header">
            <div style="width: 100%; height: 50px; background-color: #FFCB00; color: #0054B3; text-align: center; line-height: 50px;">
                <img src="../static/images/chemistry-lab-instrument.png" height="30" />&nbsp;&nbsp;&nbsp;Ce site est un <b>nouveau service</b>, toujours en expérimentation. N'hésitez pas à <a href="mailto:schema@data.gouv.fr">nous contacter</a> pour toute question.
            </div>
            <div class="rf-container">
                <div class="rf-header__body">
                    <div class="rf-header__brand">
                        <a class="rf-logo"
                            href="/"
                            title="République française">
                            <span class="rf-logo__title">
                            République
                            <br>française
                            </span>
                        </a>
                    </div>
                    <div class="rf-header__navbar">
                        <div class="rf-service">
                            <a class="rf-service__title" href="/" title="<%= appName %>">
                            publier.etalab.studio
                            </a>
                            <p class="rf-service__tagline">
                            <i>Pour la publication de données de qualité</i>
                            </p>
                        </div>
                        <client-only>
                            <nav-user />
                        </client-only>
                    </div>
                </div>
            </div>
        </header>
</template>

<script>
import ClientOnly from 'vue-client-only';
import NavUser from '../components/NavUser.vue';

export default {
  components: {
    ClientOnly,
    NavUser,
  },
};
</script>
