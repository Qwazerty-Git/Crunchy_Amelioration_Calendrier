// ==UserScript==
// @name         CR - Show only JPstFR et FR DUBs
// @namespace    https://greasyfork.org/users/1060113 (original)
// @version      1.0
// @description  Show only JPstFR et FR dubs in CR calendar
// @author       Hato4PL
// @match        https://www.crunchyroll.com/simulcastcalendar*
// @match        https://www.crunchyroll.com/*/simulcastcalendar*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=crunchyroll.com
// @grant        none
// @run-at       document-body
// @downloadURL https://update.greasyfork.org/scripts/585399/CR%20-%20Show%20only%20ENG%20DUBs.user.js
// @updateURL
// ==/UserScript==

/* global $ */

(function() {
    'use strict';

    /* =========================
   Configuration utilisateur
   ========================= */

    //On cible les version à conserver (textes présents dans le titre (Français) ou dans les liens JAJP/
    const allowedDubs = {
        title: [
            '(Français)'
        ],
        link: [
            'JAJP/',
            'ZHCN/',
            'QM/'
        ]
    };

    const defaultFilters = {
        followed: true,
        french: true,
        avant_prem: true
    };

    const style = document.createElement("style");

    style.textContent = `
    .tm-resume-button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        border-radius: 50%;
    }

    .tm-resume-button svg {
        width: 20px;
        height: 20px;
    }
    `;
//     //désactivation hover
//     GM_addStyle(`
//         [class="release js-release "]:hover {
//             background-color: unset !important;
//             color: unset !important;
//             transform: none !important;
//             opacity: 1 !important;
//             transition: none !important;
//         }
//     `);


    $('.availability').attr('style', 'display: flex !important; justify-content: space-between !important; align-items: center !important;');
    $('.available-episode-link.js-episode-link-available').attr('style', 'max-width: 60% !important; flex-basis: 60% !important;');



    document.head.append(style);

    /* =========================
    Code du script
    ========================= */
    let filters;
    //On ajoute le bouton de filtration Episodes suivis
    let filtersInitialized = false;
    let filterTimeout;
    let firstFilterDone = false;

    const observer = new MutationObserver(() => {
        if (!filtersInitialized) {
            //disableHover();
            initFilters();
        } else {
            clearTimeout(filterTimeout);

            filterTimeout = setTimeout(() => {
                applyFilters();
            }, 200);
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    function initFilters() {
        const form = document.getElementById("filter_toggle_form");

        if (!form) {
            return;
        }

        filtersInitialized = true;

        const releases = document.querySelector(".releases");

        if (releases) {
            releases.style.visibility = "hidden";
        }
        const parent = form.firstElementChild;

        parent.querySelectorAll("label").forEach(label => {
            label.style.display = "none";
        });

        filters = {
            followed: createCheckbox("tm-followed-only", "Séries Suivies", defaultFilters.followed),
            french: createCheckbox("tm-french-only", "FR / VOSTFR", defaultFilters.french),
            avant_prem: createCheckbox("tm-avant-premiere", "Avant Première", defaultFilters.avant_prem),
        };

        parent.append(...Object.values(filters).map(filter => filter.label));

        applyFilters();
    }



    function applyFilters() {

        if (!filters) {
            return;
        }

        const isFollowedOnly = filters.followed.checked;
        const isFrenchFilterActive = filters.french.checked;
        const isAvantPremiere = filters.avant_prem.checked;

        document.querySelectorAll('.releases li').forEach(li => {
            //On vérifie si les bubs sont les bons
            const titleElement = li.querySelector('.season-name');
            const linkElement = li.querySelector('.available-episode-link');


            if (!titleElement || !linkElement) {
                return;
            }

            const title = titleElement.textContent;
            const link = linkElement.href;


            const goodDubs = allowedDubs.title.some(x => title.includes(x)) || allowedDubs.link.some(x => link.includes(x));

            //On vérifie si la série est suivie
            const isFollowed = li.querySelector(".queue-flag.queued") !== null;
            const isAVP = li.querySelector(".premiere-flag") !== null;

            const showByLanguage = !isFrenchFilterActive || goodDubs;
            const showByFollow = !isFollowedOnly || isFollowed;
            const showAVP = !isAvantPremiere || isAVP

            if ((showByLanguage && showByFollow) || (showByLanguage && showAVP)) {
                li.style.display = '';
                createBtnResume(li);
            } else {
                li.style.display = 'none';
            }

        })

        if (!firstFilterDone) {
            const releases = document.querySelector(".releases");

            if (releases) {
                releases.style.visibility = "visible";
            }

            firstFilterDone = true;
        }
    }

    function createCheckbox(id, text, checked = false) {
        const label = document.createElement("label");
        label.className = "filter-toggle";

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.id = id;
        checkbox.checked = checked;

        //On surveille
        checkbox.addEventListener("change", () => {
            applyFilters();
        });

        label.append(checkbox, ` ${text}`);

        return {
            label,
            checkbox,
            get checked() {
                return checkbox.checked;
            }
        };
    }

    function createBtnResume(liSource) {

        // On cherche le popup correspondant
        const article = liSource.firstElementChild;

        if (!article) {
            return;
        }

        // On cherche où placer notre bouton
        const cible = article.querySelector(".availability");

        if (!cible) {
            return;
        }

        //cible.style ="display:flex"

        if (cible.querySelector(".tm-resume-button")) {
            return;
        }

        // Création de notre propre lien
        const ancre = document.createElement("a");
        ancre.style.display = "none";

        ancre.className = "tm-resume-button";
        ancre.id = cible.getAttribute("group_id") + "-Btn";
        ancre.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round">
            <path d="M7 4v16l13-8z"/>
        </svg>`;
        //cible.parentElement.append(ancre);
        cible.append(ancre);

        //On regarde si le dernier épisode est vu
        const feature = liSource.querySelector('.episode-info.js-episode-info');

        let percent = 0;

        if (feature) {
            const proBar = feature.querySelector('.progress-bar')
            if (proBar) {
                percent = proBar.parentElement.getAttribute('value')
            }
        }
        // URL de la requête Crunchyroll (exepté si le dernier épisode à été vu)
        const popoverUrl = article.dataset.popoverUrl;

        if (!popoverUrl || (percent > 70)) {
            return;
        }

        fetch(popoverUrl)
            .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            return response.json();
        })
            .then(data => {

            // Pas de vidéo à reprendre
            if (!data.watchUrl) {
                return;
            }

            ancre.href = data.watchUrl;
            ancre.style.display = "inline-flex";
        })
            .catch(error => {
            console.error("TM Resume :", error);
        });
    }


})();
