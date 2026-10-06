/* =========================================
   FLYGO
   GESTION DES RÉSULTATS DE VOLS
========================================= */

let displayedFlights = [...flights];

let searchData = null;


document.addEventListener("DOMContentLoaded", () => {

    loadSearchData();

    renderRouteSummary();

    createAirlineFilters();

    setupFilters();

    setupSorting();

    setupReset();

    renderFlights();

});


/* =========================================
   RÉCUPÉRATION DE LA RECHERCHE
========================================= */

function loadSearchData() {

    const savedSearch =
        localStorage.getItem("flygoSearch");


    if (!savedSearch) {

        searchData = {
            departure: "Kinshasa",
            destination: "Paris",
            departureDate: "",
            returnDate: "",
            passengers: "1",
            travelClass: "economy",
            tripType: "roundtrip"
        };

        return;
    }


    try {

        searchData =
            JSON.parse(savedSearch);

    } catch (error) {

        console.error(
            "Impossible de récupérer la recherche.",
            error
        );

        searchData = {
            departure: "Kinshasa",
            destination: "Paris",
            departureDate: "",
            returnDate: "",
            passengers: "1",
            travelClass: "economy",
            tripType: "roundtrip"
        };
    }

}


/* =========================================
   RÉSUMÉ DE L'ITINÉRAIRE
========================================= */

function renderRouteSummary() {

    const container =
        document.getElementById("routeSummary");


    if (!container) {
        return;
    }


    const departure =
        searchData?.departure || "Kinshasa";


    const destination =
        searchData?.destination || "Paris";


    const passengers =
        searchData?.passengers || "1";


    container.innerHTML = `
        <div>
            <h1>${escapeHtml(departure)}
                → ${escapeHtml(destination)}
            </h1>

            <p>
                ${passengers}
                voyageur${Number(passengers) > 1 ? "s" : ""}
                · ${searchData?.tripType === "oneway"
                    ? "Aller simple"
                    : "Aller-retour"}
            </p>
        </div>
    `;
}


/* =========================================
   FILTRES COMPAGNIES
========================================= */

function createAirlineFilters() {

    const container =
        document.getElementById("airlineFilters");


    if (!container) {
        return;
    }


    const airlines = [
        ...new Set(
            flights.map(
                (flight) => flight.airline
            )
        )
    ];


    container.innerHTML =
        airlines
            .map((airline, index) => {

                const id =
                    `airline-${index}`;


                return `
                    <div class="airline-filter">

                        <input
                            type="checkbox"
                            id="${id}"
                            value="${escapeAttribute(airline)}"
                            class="airline-checkbox"
                        >

                        <label for="${id}">
                            ${escapeHtml(airline)}
                        </label>

                    </div>
                `;

            })
            .join("");
}


/* =========================================
   FILTRES
========================================= */

function setupFilters() {

    document
        .querySelectorAll(".stop-filter")
        .forEach((checkbox) => {

            checkbox.addEventListener(
                "change",
                applyFilters
            );

        });


    document
        .querySelectorAll(".airline-checkbox")
        .forEach((checkbox) => {

            checkbox.addEventListener(
                "change",
                applyFilters
            );

        });


    const priceFilter =
        document.getElementById("priceFilter");


    if (priceFilter) {

        priceFilter.addEventListener(
            "input",
            () => {

                updatePriceLabel();

                applyFilters();

            }
        );

    }


    updatePriceLabel();
}


/* =========================================
   PRIX
========================================= */

function updatePriceLabel() {

    const slider =
        document.getElementById("priceFilter");

    const value =
        document.getElementById("priceValue");


    if (!slider || !value) {
        return;
    }


    value.textContent =
        `${slider.value} USD`;
}


/* =========================================
   APPLICATION DES FILTRES
========================================= */

function applyFilters() {

    const selectedStops =
        [
            ...document.querySelectorAll(
                ".stop-filter:checked"
            )
        ].map(
            (checkbox) =>
                Number(checkbox.value)
        );


    const selectedAirlines =
        [
            ...document.querySelectorAll(
                ".airline-checkbox:checked"
            )
        ].map(
            (checkbox) =>
                checkbox.value
        );


    const maxPrice =
        Number(
            document.getElementById(
                "priceFilter"
            ).value
        );


    displayedFlights =
        flights.filter((flight) => {

            const stopMatch =
                selectedStops.length === 0 ||
                selectedStops.includes(flight.stops);


            const airlineMatch =
                selectedAirlines.length === 0 ||
                selectedAirlines.includes(
                    flight.airline
                );


            const priceMatch =
                flight.price <= maxPrice;


            return (
                stopMatch &&
                airlineMatch &&
                priceMatch
            );

        });


    sortFlights();

}


/* =========================================
   TRI
========================================= */

function setupSorting() {

    const select =
        document.getElementById("sortFlights");


    if (!select) {
        return;
    }


    select.addEventListener(
        "change",
        sortFlights
    );

}


function sortFlights() {

    const sortValue =
        document.getElementById(
            "sortFlights"
        )?.value || "price";


    if (sortValue === "price") {

        displayedFlights.sort(
            (a, b) => a.price - b.price
        );

    }


    if (sortValue === "duration") {

        displayedFlights.sort(
            (a, b) =>
                durationToMinutes(a.duration) -
                durationToMinutes(b.duration)
        );

    }


    if (sortValue === "departure") {

        displayedFlights.sort(
            (a, b) =>
                timeToMinutes(
                    a.departure.time
                ) -
                timeToMinutes(
                    b.departure.time
                )
        );

    }


    renderFlights();

}


/* =========================================
   AFFICHAGE DES VOLS
========================================= */

function renderFlights() {

    const container =
        document.getElementById(
            "flightsList"
        );


    const noResults =
        document.getElementById(
            "noResults"
        );


    const resultsCount =
        document.getElementById(
            "resultsCount"
        );


    if (!container) {
        return;
    }


    if (resultsCount) {

        resultsCount.textContent =
            `${displayedFlights.length} vol${
                displayedFlights.length > 1
                    ? "s"
                    : ""
            }`;

    }


    if (displayedFlights.length === 0) {

        container.innerHTML = "";

        noResults?.classList.remove(
            "hidden"
        );

        return;
    }


    noResults?.classList.add("hidden");


    container.innerHTML =
        displayedFlights
            .map(createFlightCard)
            .join("");


    attachFlightEvents();

}


/* =========================================
   CARTE D'UN VOL
========================================= */

function createFlightCard(flight) {

    return `
        <article
            class="flight-card"
            data-flight-id="${escapeAttribute(flight.id)}"
        >

            <div class="flight-card-main">

                <div>

                    <div class="airline-name">
                        ${escapeHtml(flight.airline)}
                    </div>

                    <div class="flight-code">
                        ${escapeHtml(flight.airlineCode)}
                        ${escapeHtml(flight.id)}
                    </div>

                </div>


                <div>

                    <div class="flight-times">

                        <div class="time-block">

                            <strong class="flight-time">
                                ${escapeHtml(
                                    flight.departure.time
                                )}
                            </strong>

                            <span class="airport-code">
                                ${escapeHtml(
                                    flight.departure.airport
                                )}
                            </span>

                        </div>


                        <div>

                            <div class="flight-line"></div>

                            <div class="flight-duration">
                                ${escapeHtml(
                                    flight.duration
                                )}
                            </div>

                        </div>


                        <div class="time-block">

                            <strong class="flight-time">
                                ${escapeHtml(
                                    flight.arrival.time
                                )}
                            </strong>

                            <span class="airport-code">
                                ${escapeHtml(
                                    flight.arrival.airport
                                )}
                            </span>

                        </div>

                    </div>

                </div>


                <div class="flight-price">

                    <span class="price-label">
                        À partir de
                    </span>

                    <div class="price-amount">
                        ${flight.price}
                        ${flight.currency}
                    </div>

                    <button
                        type="button"
                        class="select-flight"
                        data-flight-id="${escapeAttribute(
                            flight.id
                        )}"
                    >
                        Choisir
                    </button>

                </div>

            </div>


            <div class="flight-card-footer">

                <span>
                    ${escapeHtml(
                        flight.stopDetails
                    )}
                </span>

                <span>
                    ${escapeHtml(
                        flight.baggage
                    )}
                </span>

                <span>
                    ${escapeHtml(
                        flight.cabin
                    )}
                </span>

            </div>

        </article>
    `;
}


/* =========================================
   SÉLECTION D'UN VOL
========================================= */

function attachFlightEvents() {

    document
        .querySelectorAll(".select-flight")
        .forEach((button) => {

            button.addEventListener(
                "click",
                () => {

                    const flightId =
                        button.dataset.flightId;


                    const selectedFlight =
                        flights.find(
                            (flight) =>
                                flight.id ===
                                flightId
                        );


                    if (!selectedFlight) {
                        return;
                    }


                    localStorage.setItem(
                        "selectedFlight",
                        JSON.stringify(
                            selectedFlight
                        )
                    );


                    window.location.href =
                        "flight-details.html";

                }
            );

        });

}


/* =========================================
   RÉINITIALISATION
========================================= */

function setupReset() {

    const button =
        document.getElementById(
            "resetFilters"
        );


    if (!button) {
        return;
    }


    button.addEventListener(
        "click",
        () => {

            document
                .querySelectorAll(
                    ".stop-filter, .airline-checkbox"
                )
                .forEach(
                    (checkbox) => {
                        checkbox.checked = false;
                    }
                );


            const priceFilter =
                document.getElementById(
                    "priceFilter"
                );


            if (priceFilter) {
                priceFilter.value = 1500;
            }


            updatePriceLabel();

            displayedFlights =
                [...flights];

            sortFlights();

        }
    );

}


/* =========================================
   UTILITAIRES
========================================= */

function durationToMinutes(duration) {

    const hours =
        Number(
            duration.match(/(\d+)h/)?.[1] || 0
        );


    const minutes =
        Number(
            duration.match(/(\d+)m/)?.[1] || 0
        );


    return hours * 60 + minutes;
}


function timeToMinutes(time) {

    const [hours, minutes] =
        time.split(":").map(Number);


    return hours * 60 + minutes;
}


function escapeHtml(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


function escapeAttribute(value) {

    return escapeHtml(value);
}