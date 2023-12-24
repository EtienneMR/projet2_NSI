/**
 * Retourne le lien de l'image en fonction du nom de cette image
 * @param {string} nom Nom de l'image a afficher
 * @returns {string} Lien de l'image
 */
function lien_image(nom) {
    return `images/${nom}.png`
}
/**
 * Retourne un nombre entier aléatoire compris entre le minimum et le maximum assignée
 * @param {number} minimum 
 * @param {number} maximum
 * @returns {number} minimium <= nombre <= maximum
 */
function randint(minimum, maximum) {
    return Math.floor(Math.random() * (maximum - (minimum - 1)) + minimum)
}

/**
 * Génère les lignes d'une énigme
 * @returns {[[string | number]]} Lignes générées
 */
function generer_lignes() {
    const lignes = []
    const inconnus_utilises = {}
    const valeur_difficulte_min = Math.floor(valeur_difficulte / 2)
    const nb_lignes = Math.min(randint(MIN_NB_LIGNES + valeur_difficulte_min, MAX_NB_LIGNES + valeur_difficulte), INCONNUS.length + 1)
    let inconnus_disponibles = INCONNUS

    for (let i_ligne = 0; i_ligne < nb_lignes; i_ligne++) {
        const ligne = []
        let valeur_ligne = 0
        let nouvelle_inconnu
        let valeur
        const liste_inconnus = Object.keys(inconnus_utilises)

        if (i_ligne + 1 < nb_lignes) {
            let inconnus_disponibles2 = []
            valeur = randint(MIN_VALEUR, MAX_VALEUR + valeur_difficulte * 2)
            nouvelle_inconnu = inconnus_disponibles[Math.floor(Math.random() * inconnus_disponibles.length)]
            liste_inconnus[liste_inconnus.length] = nouvelle_inconnu

            for (let inconnu of inconnus_disponibles) {
                if (inconnu != nouvelle_inconnu) {
                    inconnus_disponibles2.push(inconnu)
                }
            }
            inconnus_disponibles = inconnus_disponibles2

            inconnus_utilises[nouvelle_inconnu] = valeur
        }
        else {
            nouvelle_inconnu = liste_inconnus[Math.floor(Math.random() * liste_inconnus.length)]
            valeur = inconnus_utilises[nouvelle_inconnu]
        }

        const nb_inconnus = randint(MIN_NB_INCONNU + valeur_difficulte_min, MAX_NB_INCONNU + valeur_difficulte)

        for (let i = 0; i < nb_inconnus; i++) {
            const i_inconnu = i * 2
            const i_signe = i_inconnu - 1

            if (i == nb_inconnus - 1) {
                ligne[i_inconnu] = nouvelle_inconnu
                valeur_ligne += valeur
            }
            else {
                let inconnu_random = ligne[i_inconnu] = liste_inconnus[randint(0, liste_inconnus.length - 1)]
                valeur_ligne += inconnus_utilises[inconnu_random]
            }

            if (i != 0) {
                ligne[i_signe] = SIGNES.plus
            }
        }

        ligne[ligne.length] = SIGNES.egal

        if (i_ligne + 1 < nb_lignes) {
            ligne[ligne.length] = valeur_ligne
        }
        else {
            ligne[ligne.length] = SIGNES.interrogation
            valeur_interrogation = valeur_ligne
        }

        lignes[i_ligne] = ligne
    }

    valeur_inconnus_utilises = inconnus_utilises
    input.min = (MIN_NB_INCONNU + valeur_difficulte_min) * MIN_VALEUR
    input.max = (MAX_NB_INCONNU + valeur_difficulte) * (MAX_VALEUR + valeur_difficulte * 2)

    return lignes
}

/**
 * Affiche les lignes en les insérant dans le DOM
 * @param {[[string | number]]} lignes Lignes a afficher
 * @returns {void}
 */
function afficher_lignes(lignes) {
    for (let i_ligne = 0; i_ligne < lignes.length; i_ligne++) {
        const ligne = lignes[i_ligne]

        const ligne_html = document.createElement("div")
        ligne_html.className = "row"

        for (let i = 0; i < ligne.length; i++) {
            const image_ou_numero = ligne[i]

            if (typeof image_ou_numero == "string") {
                const img_html = document.createElement("img")
                img_html.alt = image_ou_numero

                if (Object.values(SIGNES).includes(image_ou_numero)) {
                    img_html.className = "sign"
                }
                else {
                    img_html.className = "img"
                }

                img_html.src = lien_image(image_ou_numero)
                ligne_html.appendChild(img_html)
            }
            else {
                const numero_html = document.createElement("span")
                numero_html.className = "number"
                numero_html.textContent = image_ou_numero
                ligne_html.appendChild(numero_html)
            }
        }

        game_area.appendChild(ligne_html)
    }
}

/**
 * Affiche les valeurs des inconnus ainsi que la réponse correcte et un message indiquant si le joueur a gagné
 * @param {boolean} gagne Vrai si le joueur a gégné la partie
 * @returns {void}
 */
function finir_jeu(gagne) {
    const liste_inconnus = Object.keys(valeur_inconnus_utilises)
    liste_inconnus.push(SIGNES.interrogation)

    const ligne_html = document.createElement("div")
    ligne_html.className = "row petit"

    for (let inconnu of liste_inconnus) {
        const img = document.createElement("img")
        img.alt = inconnu
        img.className = "img"
        img.src = lien_image(inconnu)
        ligne_html.appendChild(img)

        const egal = document.createElement("img")
        egal.alt = "egal"
        egal.className = "sign"
        egal.src = lien_image(SIGNES.egal)
        ligne_html.appendChild(egal)

        const numero_html = document.createElement("span")
        numero_html.className = "number"
        numero_html.textContent = valeur_inconnus_utilises[inconnu] ?? valeur_interrogation
        ligne_html.append(numero_html)

        const vide = document.createElement("div")
        vide.className = "img"
        ligne_html.append(vide)
    }

    game_area.appendChild(ligne_html)
    if (gagne) {
        essais.textContent = `Bravo ! Tu as gagné en ${NOMBRE_ESSAI - essais_restants + 1} essais !`
    }
    else {
        essais.textContent = 'DOMmage, tu auras plus de chance la prochaine fois.'
    }
    input.disabled = true
    button.textContent = 'Rejouer'
}

/**
 * Commence le jeu
 * @returns {void}
 */
function commencer_jeu() {
    game_area.innerHTML = ''
    const lignes = generer_lignes()

    afficher_lignes(lignes)
    input.disabled = false
    input.value = ''
    essais_restants = NOMBRE_ESSAI
    essais.textContent = `${essais_restants} essais restants`
    button.textContent = 'Valider'
}

/**
 * Valide la réponse du joueur
 * @param {SubmitEvent} event Evènement d'envoi du formulaire
 * @returns {void}
 */
function valider(event) {
    event.preventDefault()

    if (button.textContent == 'Rejouer') {
        commencer_jeu()
    }
    else {
        if (valeur_interrogation == input.value) {
            finir_jeu(true)
        }
        else {
            essais_restants = essais_restants - 1
            input.value = ''
            essais.textContent = `${essais_restants} essais restants`
            if (essais_restants == 0) {
                finir_jeu(false)
            }
        }
    }
}

/**
 * Met a jour la difficulté du jeu
 * @returns {void}
 */
function changer_difficulte() {
    valeur_difficulte = Number(niveau.value)
    difficulte.textContent = DIFFICULTES[valeur_difficulte]
    commencer_jeu()
}

const INCONNUS = ["apple", "banana", "pear", "pineapple", "tomato"]
const SIGNES = {
    egal: "equal",
    plus: "plus",
    interrogation: "interrogation",
}
const DIFFICULTES = ["très simple", "simple", "moyen", "compliqué", "très compliqué", "impossible"]

const MIN_NB_LIGNES = 3
const MAX_NB_LIGNES = 3

const MIN_VALEUR = 1
const MAX_VALEUR = 3

const MIN_NB_INCONNU = 2
const MAX_NB_INCONNU = 3

const NOMBRE_ESSAI = 3

const game_area = document.querySelector("#game-area")
const form = document.querySelector("#form")
const input = document.querySelector("#input")
const essais = document.querySelector("#essais")
const button = document.querySelector("#bouton")
const niveau = document.querySelector("#niveau")
const difficulte = document.querySelector("#difficulty")

let valeur_interrogation
let valeur_inconnus_utilises
let essais_restants = NOMBRE_ESSAI
let valeur_difficulte = 0

form.addEventListener("submit", valider)
niveau.addEventListener("change", changer_difficulte)

commencer_jeu()