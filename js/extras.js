/* =========================================
   FLYGO
   OPTIONS SUPPLÉMENTAIRES
========================================= */

let selectedFlight = null;
let selectedFare = null;
let selectedSeat = null;
let passengerData = null;
let passengerCount = 1;

let selectedExtras = [];


const availableExtras = [
    {
        id: "extra-baggage",
        name: "Bagage supplémentaire",
        description:
            "Ajoutez un bagage enregistré supplémentaire.",
        price: 55,
        unit: "par bagage"
    },

    {
        id: "travel-insurance",
        name: "Assurance voyage",
        description:
            "Une couverture supplémentaire pendant votre voyage.",
        price: 35,
        unit: "par voyageur"
    },

    {
        id: "priority",
        name: "Embarquement prioritaire",
        description:
            "Accédez prioritairement à la file d'embarquement.",
        price: 25,
        unit: "par voyageur"
    },

    {
        id: "meal",
        name: "Repas spécial",
        description:
            "Ajoutez un repas spécial à votre réservation.",
        price: 18,
        unit: "par voyageur"
    }
];


document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadReservationData();

        if (!selectedFlight || !passengerData) {
            showMissingReservation();
            return;
        }

        renderRoute();

        renderExtras();

        loadSavedExtras();

        renderSummary();

        setupContinueButton();

    }
);


/* =========================================
   CHARGER RÉSERVATION
========================================= */

function loadReservationData() {

    try {

        const flight =
            localStorage.getItem(
                "selectedFlight"
            );

        const fare =
            localStorage.getItem(
                "selectedFare"
            );

        const seat =
            localStorage.getItem(
                "selectedSeat"
            );

        const passengers =
            localStorage.getItem(
                "flygoPassengers"
            );

        const search =
            localStorage.getItem(
                "flygoSearch"
            );


        selectedFlight =
            flight
                ? JSON.parse(flight)
                : null;


        selectedFare =
            fare
                ? JSON.parse(fare)
                : null;


        selectedSeat =
            seat || null;


        passengerData =
            passengers
                ? JSON.parse(passengers)
                : null;


        const searchData =
            search
                ? JSON.parse(search)
                : null;


        passengerCount =
            Math.max(
                1,
                Number(
                    searchData?.passengers || 1
                )
            );

    } catch (error) {

        console.error(
            "Erreur lors du chargement de la réservation.",
            error
        );

        selectedFlight = null;
        passengerData = null;

    }

}


/* =========================================
   ITINÉRAIRE
========================================= */

function renderRoute() {

    const container =
        document.getElementById(
            "extrasRoute"
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
        </p>

    `;

}


/* =========================================
   AFFICHER LES OPTIONS
========================================= */

function renderExtras() {

    const container =
        document.getElementById(
            "extrasList"
        );


    if (!container) {
        return;
    }


    container.innerHTML =
        availableExtras
            .map(
                (extra) => `

                    <article
                        class="extra-card"
                        data-extra-id="${escapeHtml(
                            extra.id
                        )}"
                    >

                        <div class="extra-info">

                            <h3>
                                ${escapeHtml(
                                    extra.name
                                )}
                            </h3>

                            <p>
                                ${escapeHtml(
                                    extra.description
                                )}
                            </p>

                        </div>


                        <div class="extra-price">

                            <strong>
                                ${extra.price} USD
                                <small>
                                    ${escapeHtml(
                                        extra.unit
                                    )}
                                </small>
                            </strong>

                            <input
                                type="checkbox"
                                class="extra-checkbox"
                                data-extra-id="${escapeHtml(
                                    extra.id
                                )}"
                                aria-label="${escapeHtml(
                                    extra.name
                                )}"
                            >

                        </div>

                    </article>

                `
            )
            .join("");


    document
        .querySelectorAll(".extra-card")
        .forEach((card) => {

            card.addEventListener(
                "click",
                (event) => {

                    if (
                        event.target.classList.contains(
                            "extra-checkbox"
                        )
                    ) {
                        updateExtra(
                            card.dataset.extraId
                        );

                        return;
                    }


                    const checkbox =
                        card.querySelector(
                            ".extra-checkbox"
                        );


                    checkbox.checked =
                        !checkbox.checked;


                    updateExtra(
                        card.dataset.extraId
                    );

                }
            );

        });

}


/* =========================================
   MODIFIER OPTION
========================================= */

function updateExtra(extraId) {

    const checkbox =
        document.querySelector(
            `.extra-checkbox[data-extra-id="${extraId}"]`
        );


    const card =
        document.querySelector(
            `.extra-card[data-extra-id="${extraId}"]`
        );


    if (!checkbox || !card) {
        return;
    }


    const extra =
        availableExtras.find(
            (item) =>
                item.id === extraId
        );


    if (!extra) {
        return;
    }


    if (checkbox.checked) {

        if (
            !selectedExtras.some(
                (item) =>
                    item.id === extraId
            )
        ) {

            selectedExtras.push(extra);

        }


        card.classList.add("selected");

    } else {

        selectedExtras =
            selectedExtras.filter(
                (item) =>
                    item.id !== extraId
            );


        card.classList.remove(
            "selected"
        );

    }


    saveExtras();

    renderSummary();

}


/* =========================================
   SAUVEGARDE
========================================= */

function saveExtras() {

    localStorage.setItem(
        "flygoExtras",
        JSON.stringify(
            selectedExtras
        )
    );

}


/* =========================================
   RESTAURATION
========================================= */

function loadSavedExtras() {

    const saved =
        localStorage.getItem(
            "flygoExtras"
        );


    if (!saved) {
        return;
    }


    try {

        const extras =
            JSON.parse(saved);


        if (!Array.isArray(extras)) {
            return;
        }


        selectedExtras =
            extras
                .map(
                    (savedExtra) =>
                        availableExtras.find(
                            (extra) =>
                                extra.id ===
                                savedExtra.id
                        )
                )
                .filter(Boolean);


        selectedExtras.forEach(
            (extra) => {

                const checkbox =
                    document.querySelector(
                        `.extra-checkbox[data-extra-id="${extra.id}"]`
                    );


                const card =
                    document.querySelector(
                        `.extra-card[data-extra-id="${extra.id}"]`
                    );


                if (checkbox) {
                    checkbox.checked = true;
                }


                if (card) {
                    card.classList.add(
                        "selected"
                    );
                }

            }
        );

    } catch (error) {

        console.error(
            "Impossible de restaurer les options.",
            error
        );

    }

}


/* =========================================
   CALCUL
========================================= */

function calculateExtrasTotal() {

    return selectedExtras.reduce(
        (total, extra) => {

            let quantity = 1;


            if (
                extra.id ===
                    "travel-insurance" ||
                extra.id ===
                    "priority" ||
                extra.id ===
                    "meal"
            ) {

                quantity =
                    passengerCount;

            }


            return total +
                extra.price *
                quantity;

        },
        0
    );

}


function calculateBaseTotal() {

    const farePrice =
        selectedFare?.price ||
        selectedFlight.price;


    return farePrice * passengerCount;

}


function calculateSeatTotal() {

    if (!selectedSeat) {
        return 0;
    }


    const premiumSeats = [
        "1A",
        "1F",
        "2A",
        "2F",
        "3A",
        "3F"
    ];


    return premiumSeats.includes(
        selectedSeat
    )
        ? 35
        : 0;

}


/* =========================================
   RÉSUMÉ
========================================= */

function renderSummary() {

    const container =
        document.getElementById(
            "extrasSummary"
        );


    if (!container) {
        return;
    }


    const baseTotal =
        calculateBaseTotal();


    const seatTotal =
        calculateSeatTotal();


    const extrasTotal =
        calculateExtrasTotal();


    const total =
        baseTotal +
        seatTotal +
        extrasTotal;


    container.innerHTML = `

        <div class="summary-row">

            <span>Vol</span>

            <strong>
                ${baseTotal} USD
            </strong>

        </div>


        <div class="summary-row">

            <span>Siège</span>

            <strong>
                ${seatTotal} USD
            </strong>

        </div>


        <div class="summary-row">

            <span>Options</span>

            <strong>
                ${extrasTotal} USD
            </strong>

        </div>


        ${
            selectedExtras.length > 0
                ? `
                    <div class="summary-row">

                        <span>
                            Services sélectionnés
                        </span>

                        <strong>
                            ${selectedExtras.length}
                        </strong>

                    </div>
                `
                : ""
        }


        <div class="summary-total">

            <strong>
                Total
            </strong>

            <strong>
                ${total} USD
            </strong>

        </div>

    `;

}


/* =========================================
   CONTINUER
========================================= */

function setupContinueButton() {

    const button =
        document.getElementById(
            "continueExtras"
        );


    if (!button) {
        return;
    }


    button.addEventListener(
        "click",
        () => {

            const reservationData = {

                flight:
                    selectedFlight,

                fare:
                    selectedFare,

                seat:
                    selectedSeat,

                passengers:
                    passengerData,

                extras:
                    selectedExtras,

                passengerCount:

                    passengerCount

            };


            localStorage.setItem(
                "flygoReservation",
                JSON.stringify(
                    reservationData
                )
            );


            window.location.href =
                "payment.html";

        }
    );

}


/* =========================================
   ERREUR
========================================= */

function showMissingReservation() {

    const content =
        document.querySelector(
            ".extras-content"
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
                    Retournez au début du processus
                    pour recommencer.
                </p>

                <br>

                <a
                    href="../index.html"
                    class="select-flight"
                >
                    Nouvelle recherche
                </a>

            </section>

        </div>

    `;

}


/* =========================================
   UTILITAIRES
========================================= */

function escapeHtml(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}