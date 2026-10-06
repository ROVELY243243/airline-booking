/* =========================================
   FLYGO
   INFORMATIONS DES PASSAGERS
========================================= */

let selectedFlight = null;
let selectedFare = null;
let selectedSeat = null;
let passengerCount = 1;


document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadReservationData();

        if (!selectedFlight) {
            showMissingReservation();
            return;
        }

        renderRoute();

        renderPassengerForms();

        renderSummary();

        loadSavedPassengers();

        setupContinueButton();

    }
);


/* =========================================
   CHARGEMENT DES DONNÉES
========================================= */

function loadReservationData() {

    try {

        const flightData =
            localStorage.getItem(
                "selectedFlight"
            );

        const fareData =
            localStorage.getItem(
                "selectedFare"
            );

        const seatData =
            localStorage.getItem(
                "selectedSeat"
            );

        const searchData =
            localStorage.getItem(
                "flygoSearch"
            );


        selectedFlight =
            flightData
                ? JSON.parse(flightData)
                : null;


        selectedFare =
            fareData
                ? JSON.parse(fareData)
                : null;


        selectedSeat =
            seatData || null;


        const search =
            searchData
                ? JSON.parse(searchData)
                : null;


        passengerCount =
            Math.max(
                1,
                Number(search?.passengers || 1)
            );

    } catch (error) {

        console.error(
            "Erreur de chargement des données.",
            error
        );

        selectedFlight = null;

    }

}


/* =========================================
   ITINÉRAIRE
========================================= */

function renderRoute() {

    const container =
        document.getElementById(
            "passengerRoute"
        );


    if (!container) {
        return;
    }


    container.innerHTML = `

        <h1>
            ${escapeHtml(
                selectedFlight.departure.city
            )}
            →
            ${escapeHtml(
                selectedFlight.arrival.city
            )}
        </h1>

        <p>
            ${escapeHtml(
                selectedFlight.airline
            )}
            ·
            ${escapeHtml(
                selectedFlight.id
            )}
            ·
            ${passengerCount}
            voyageur${passengerCount > 1 ? "s" : ""}
        </p>

    `;

}


/* =========================================
   FORMULAIRES
========================================= */

function renderPassengerForms() {

    const container =
        document.getElementById(
            "passengersForm"
        );


    if (!container) {
        return;
    }


    let html = "";


    for (
        let index = 1;
        index <= passengerCount;
        index++
    ) {

        html += `

            <section
                class="passenger-form"
                data-passenger="${index}"
            >

                <div class="passenger-form-header">

                    <h3>
                        Passager ${index}
                    </h3>

                    <span class="passenger-number">
                        VOYAGEUR ${index}
                    </span>

                </div>


                <div class="form-grid">


                    <div class="form-field">

                        <label for="title-${index}">
                            Civilité
                        </label>

                        <select id="title-${index}">

                            <option value="">
                                Sélectionner
                            </option>

                            <option value="mr">
                                M.
                            </option>

                            <option value="mrs">
                                Mme
                            </option>

                            <option value="ms">
                                Mlle
                            </option>

                        </select>

                    </div>


                    <div class="form-field">

                        <label for="type-${index}">
                            Type de passager
                        </label>

                        <select id="type-${index}">

                            <option value="adult">
                                Adulte
                            </option>

                            <option value="child">
                                Enfant
                            </option>

                        </select>

                    </div>


                    <div class="form-field">

                        <label for="firstName-${index}">
                            Prénom
                        </label>

                        <input
                            type="text"
                            id="firstName-${index}"
                            autocomplete="given-name"
                            placeholder="Prénom"
                        >

                    </div>


                    <div class="form-field">

                        <label for="lastName-${index}">
                            Nom
                        </label>

                        <input
                            type="text"
                            id="lastName-${index}"
                            autocomplete="family-name"
                            placeholder="Nom"
                        >

                    </div>


                    <div class="form-field">

                        <label for="birthDate-${index}">
                            Date de naissance
                        </label>

                        <input
                            type="date"
                            id="birthDate-${index}"
                        >

                    </div>


                    <div class="form-field">

                        <label for="nationality-${index}">
                            Nationalité
                        </label>

                        <input
                            type="text"
                            id="nationality-${index}"
                            placeholder="Nationalité"
                            autocomplete="country-name"
                        >

                    </div>


                    <div class="form-field">

                        <label for="documentType-${index}">
                            Document
                        </label>

                        <select id="documentType-${index}">

                            <option value="passport">
                                Passeport
                            </option>

                            <option value="idcard">
                                Carte d'identité
                            </option>

                        </select>

                    </div>


                    <div class="form-field">

                        <label for="documentNumber-${index}">
                            Numéro du document
                        </label>

                        <input
                            type="text"
                            id="documentNumber-${index}"
                            placeholder="Numéro du document"
                        >

                    </div>

                </div>


                <label class="document-confirmation">

                    <input
                        type="checkbox"
                        id="documentConfirmation-${index}"
                    >

                    <span>
                        Je confirme que les informations
                        saisies correspondent au document
                        de voyage du passager.
                    </span>

                </label>

            </section>

        `;

    }


    container.innerHTML = html;

}


/* =========================================
   SAUVEGARDE
========================================= */

function collectPassengers() {

    const passengers = [];


    for (
        let index = 1;
        index <= passengerCount;
        index++
    ) {

        const passenger = {

            title:
                getValue(
                    `title-${index}`
                ),

            type:
                getValue(
                    `type-${index}`
                ),

            firstName:
                getValue(
                    `firstName-${index}`
                ),

            lastName:
                getValue(
                    `lastName-${index}`
                ),

            birthDate:
                getValue(
                    `birthDate-${index}`
                ),

            nationality:
                getValue(
                    `nationality-${index}`
                ),

            documentType:
                getValue(
                    `documentType-${index}`
                ),

            documentNumber:
                getValue(
                    `documentNumber-${index}`
                ),

            documentConfirmed:
                document.getElementById(
                    `documentConfirmation-${index}`
                )?.checked || false

        };


        passengers.push(passenger);

    }


    return passengers;

}


/* =========================================
   VALIDATION
========================================= */

function validatePassengers() {

    const passengers =
        collectPassengers();


    const errors = [];


    passengers.forEach(
        (passenger, index) => {

            const number =
                index + 1;


            if (!passenger.title) {

                errors.push(
                    `Passager ${number} : sélectionnez une civilité.`
                );

            }


            if (
                !passenger.firstName ||
                passenger.firstName.length < 2
            ) {

                errors.push(
                    `Passager ${number} : vérifiez le prénom.`
                );

            }


            if (
                !passenger.lastName ||
                passenger.lastName.length < 2
            ) {

                errors.push(
                    `Passager ${number} : vérifiez le nom.`
                );

            }


            if (!passenger.birthDate) {

                errors.push(
                    `Passager ${number} : indiquez la date de naissance.`
                );

            }


            if (!passenger.nationality) {

                errors.push(
                    `Passager ${number} : indiquez la nationalité.`
                );

            }


            if (!passenger.documentNumber) {

                errors.push(
                    `Passager ${number} : indiquez le numéro du document.`
                );

            }


            if (!passenger.documentConfirmed) {

                errors.push(
                    `Passager ${number} : confirmez les informations du document.`
                );

            }

        }
    );


    const email =
        document.getElementById(
            "contactEmail"
        )?.value.trim();


    const phone =
        document.getElementById(
            "contactPhone"
        )?.value.trim();


    if (
        !email ||
        !isValidEmail(email)
    ) {

        errors.push(
            "Indiquez une adresse e-mail valide."
        );

    }


    if (!phone || phone.length < 8) {

        errors.push(
            "Indiquez un numéro de téléphone valide."
        );

    }


    return {
        valid: errors.length === 0,
        errors,
        passengers,
        email,
        phone
    };

}


/* =========================================
   RÉSUMÉ
========================================= */

function renderSummary() {

    const container =
        document.getElementById(
            "passengerSummary"
        );


    if (!container) {
        return;
    }


    const price =
        selectedFare?.price ||
        selectedFlight.price;


    const passengers =
        passengerCount;


    const total =
        price * passengers;


    container.innerHTML = `

        <div class="summary-row">

            <span>Vol</span>

            <strong>
                ${escapeHtml(
                    selectedFlight.airline
                )}
            </strong>

        </div>


        <div class="summary-row">

            <span>Tarif</span>

            <strong>
                ${escapeHtml(
                    selectedFare?.name ||
                    "Basic"
                )}
            </strong>

        </div>


        <div class="summary-row">

            <span>Siège</span>

            <strong>
                ${escapeHtml(
                    selectedSeat ||
                    "Non sélectionné"
                )}
            </strong>

        </div>


        <div class="summary-row">

            <span>Voyageurs</span>

            <strong>
                ${passengers}
            </strong>

        </div>


        <div class="summary-total">

            <strong>
                Total vol
            </strong>

            <strong>
                ${total} USD
            </strong>

        </div>

    `;

}


/* =========================================
   DONNÉES SAUVEGARDÉES
========================================= */

function loadSavedPassengers() {

    const saved =
        localStorage.getItem(
            "flygoPassengers"
        );


    if (!saved) {
        return;
    }


    try {

        const data =
            JSON.parse(saved);


        if (
            Array.isArray(data.passengers)
        ) {

            data.passengers.forEach(
                (passenger, index) => {

                    const number =
                        index + 1;


                    setValue(
                        `title-${number}`,
                        passenger.title
                    );


                    setValue(
                        `type-${number}`,
                        passenger.type
                    );


                    setValue(
                        `firstName-${number}`,
                        passenger.firstName
                    );


                    setValue(
                        `lastName-${number}`,
                        passenger.lastName
                    );


                    setValue(
                        `birthDate-${number}`,
                        passenger.birthDate
                    );


                    setValue(
                        `nationality-${number}`,
                        passenger.nationality
                    );


                    setValue(
                        `documentType-${number}`,
                        passenger.documentType
                    );


                    setValue(
                        `documentNumber-${number}`,
                        passenger.documentNumber
                    );


                    const confirmation =
                        document.getElementById(
                            `documentConfirmation-${number}`
                        );


                    if (confirmation) {

                        confirmation.checked =
                            Boolean(
                                passenger.documentConfirmed
                            );

                    }

                }
            );

        }


        setValue(
            "contactEmail",
            data.email
        );


        setValue(
            "contactPhone",
            data.phone
        );

    } catch (error) {

        console.error(
            "Impossible de charger les passagers sauvegardés.",
            error
        );

    }

}


/* =========================================
   CONTINUER
========================================= */

function setupContinueButton() {

    const button =
        document.getElementById(
            "continuePassengers"
        );


    if (!button) {
        return;
    }


    button.addEventListener(
        "click",
        () => {

            const validation =
                validatePassengers();


            const errorBox =
                document.getElementById(
                    "formError"
                );


            if (!validation.valid) {

                errorBox.classList.remove(
                    "hidden"
                );


                errorBox.innerHTML =
                    validation.errors
                        .slice(0, 5)
                        .map(
                            (error) =>
                                `<div>${escapeHtml(error)}</div>`
                        )
                        .join("");


                window.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });


                return;

            }


            errorBox.classList.add(
                "hidden"
            );


            const passengerData = {

                passengers:
                    validation.passengers,

                email:
                    validation.email,

                phone:
                    validation.phone

            };


            localStorage.setItem(
                "flygoPassengers",
                JSON.stringify(
                    passengerData
                )
            );


            window.location.href =
                "extras.html";

        }
    );

}


/* =========================================
   OUTILS
========================================= */

function getValue(id) {

    return (
        document.getElementById(id)
            ?.value
            .trim() || ""
    );

}


function setValue(id, value) {

    const element =
        document.getElementById(id);


    if (
        element &&
        value !== undefined &&
        value !== null
    ) {

        element.value = value;

    }

}


function isValidEmail(email) {

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        .test(email);

}


function showMissingReservation() {

    const content =
        document.querySelector(
            ".passengers-content"
        );


    if (!content) {
        return;
    }


    content.innerHTML = `

        <div class="container">

            <section class="no-results">

                <h2>
                    Réservation introuvable
                </h2>

                <p>
                    Retournez aux résultats pour
                    recommencer votre réservation.
                </p>

                <br>

                <a
                    href="flights.html"
                    class="select-flight"
                >
                    Rechercher un vol
                </a>

            </section>

        </div>

    `;

}


function escapeHtml(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}