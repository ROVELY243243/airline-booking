/* =========================================
   FLYGO
   SÉLECTION DES SIÈGES
========================================= */

let selectedFlight = null;

let selectedFare = null;

let selectedSeat = null;


const occupiedSeats = [
    "1B",
    "2C",
    "3E",
    "4A",
    "5F",
    "7B",
    "8D",
    "10A",
    "11E",
    "13C",
    "15F",
    "17B",
    "19D"
];


const premiumSeats = [
    "1A",
    "1F",
    "2A",
    "2F",
    "3A",
    "3F"
];


document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadReservationData();

        if (!selectedFlight) {
            showMissingReservation();
            return;
        }

        renderSeatRoute();

        generateSeatMap();

        loadSavedSeat();

        renderSeatSummary();

        setupContinueButton();

    }
);


/* =========================================
   CHARGEMENT
========================================= */

function loadReservationData() {

    const flightData =
        localStorage.getItem(
            "selectedFlight"
        );


    const fareData =
        localStorage.getItem(
            "selectedFare"
        );


    try {

        selectedFlight =
            flightData
                ? JSON.parse(flightData)
                : null;


        selectedFare =
            fareData
                ? JSON.parse(fareData)
                : null;

    } catch (error) {

        console.error(
            "Erreur lors du chargement de la réservation.",
            error
        );

        selectedFlight = null;
        selectedFare = null;

    }

}


/* =========================================
   ITINÉRAIRE
========================================= */

function renderSeatRoute() {

    const container =
        document.getElementById(
            "seatRoute"
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
   GÉNÉRATION CABINE
========================================= */

function generateSeatMap() {

    const container =
        document.getElementById(
            "seatMap"
        );


    if (!container) {
        return;
    }


    container.innerHTML = "";


    const rows = 20;

    const columns = [
        "A",
        "B",
        "C",
        "",
        "D",
        "E",
        "F"
    ];


    for (
        let row = 1;
        row <= rows;
        row++
    ) {

        columns.forEach(
            (column) => {

                if (column === "") {

                    const aisle =
                        document.createElement(
                            "div"
                        );


                    aisle.className =
                        "aisle";


                    container.appendChild(
                        aisle
                    );


                    return;
                }


                const seatNumber =
                    `${row}${column}`;


                const seat =
                    document.createElement(
                        "button"
                    );


                seat.type = "button";

                seat.className = "seat";

                seat.textContent =
                    seatNumber;

                seat.dataset.seat =
                    seatNumber;


                if (
                    occupiedSeats.includes(
                        seatNumber
                    )
                ) {

                    seat.classList.add(
                        "occupied"
                    );

                    seat.disabled = true;

                }


                if (
                    premiumSeats.includes(
                        seatNumber
                    )
                ) {

                    seat.classList.add(
                        "premium"
                    );

                }


                seat.addEventListener(
                    "click",
                    () => selectSeat(
                        seatNumber
                    )
                );


                container.appendChild(
                    seat
                );

            }
        );

    }

}


/* =========================================
   SÉLECTION
========================================= */

function selectSeat(seatNumber) {

    if (
        occupiedSeats.includes(
            seatNumber
        )
    ) {
        return;
    }


    document
        .querySelectorAll(
            ".seat.selected"
        )
        .forEach(
            (seat) =>
                seat.classList.remove(
                    "selected"
                )
        );


    const seatElement =
        document.querySelector(
            `[data-seat="${seatNumber}"]`
        );


    if (!seatElement) {
        return;
    }


    seatElement.classList.add(
        "selected"
    );


    selectedSeat =
        seatNumber;


    localStorage.setItem(
        "selectedSeat",
        selectedSeat
    );


    renderSeatSummary();

}


/* =========================================
   SIÈGE SAUVEGARDÉ
========================================= */

function loadSavedSeat() {

    const savedSeat =
        localStorage.getItem(
            "selectedSeat"
        );


    if (!savedSeat) {
        return;
    }


    if (
        occupiedSeats.includes(
            savedSeat
        )
    ) {
        return;
    }


    const seatElement =
        document.querySelector(
            `[data-seat="${savedSeat}"]`
        );


    if (!seatElement) {
        return;
    }


    seatElement.classList.add(
        "selected"
    );


    selectedSeat =
        savedSeat;

}


/* =========================================
   RÉSUMÉ
========================================= */

function renderSeatSummary() {

    const container =
        document.getElementById(
            "seatSummary"
        );


    if (!container) {
        return;
    }


    const basePrice =
        selectedFare?.price ||
        selectedFlight.price;


    const seatSupplement =
        selectedSeat &&
        premiumSeats.includes(
            selectedSeat
        )
            ? 35
            : 0;


    const total =
        basePrice +
        seatSupplement;


    container.innerHTML = `

        <div class="summary-row">

            <span>Compagnie</span>

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
                ${
                    selectedSeat ||
                    "Non sélectionné"
                }
            </strong>

        </div>


        <div class="summary-row">

            <span>Tarif</span>

            <strong>
                ${basePrice} USD
            </strong>

        </div>


        <div class="summary-row">

            <span>Supplément siège</span>

            <strong>
                ${seatSupplement} USD
            </strong>

        </div>


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
            "continueSeats"
        );


    if (!button) {
        return;
    }


    button.addEventListener(
        "click",
        () => {

            if (!selectedSeat) {

                alert(
                    "Veuillez sélectionner un siège avant de continuer."
                );

                return;
            }


            localStorage.setItem(
                "selectedSeat",
                selectedSeat
            );


            window.location.href =
                "passengers.html";

        }
    );

}


/* =========================================
   RÉSERVATION ABSENTE
========================================= */

function showMissingReservation() {

    const content =
        document.querySelector(
            ".seats-content"
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


/* =========================================
   SÉCURISATION
========================================= */

function escapeHtml(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}