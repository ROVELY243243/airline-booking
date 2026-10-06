/* =========================================
   FLYGO
   MES RÉSERVATIONS
========================================= */

let bookings = [];


document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadBookings();

        renderBookings();

    }
);


/* =========================================
   CHARGER LES RÉSERVATIONS
========================================= */

function loadBookings() {

    const saved =
        localStorage.getItem(
            "flygoBookings"
        );


    if (!saved) {

        bookings = [];

        return;

    }


    try {

        const data =
            JSON.parse(saved);


        bookings =
            Array.isArray(data)
                ? data
                : [];

    } catch (error) {

        console.error(
            "Impossible de charger les réservations.",
            error
        );

        bookings = [];

    }

}


/* =========================================
   AFFICHER
========================================= */

function renderBookings() {

    const container =
        document.getElementById(
            "bookingsList"
        );


    const emptyState =
        document.getElementById(
            "emptyBookings"
        );


    if (!container) {
        return;
    }


    if (bookings.length === 0) {

        container.innerHTML = "";

        emptyState?.classList.remove(
            "hidden"
        );

        return;

    }


    emptyState?.classList.add(
        "hidden"
    );


    container.innerHTML =
        bookings
            .map(
                (
                    booking,
                    index
                ) =>
                    createBookingCard(
                        booking,
                        index
                    )
            )
            .join("");


    setupBookingButtons();

}


/* =========================================
   CARTE
========================================= */

function createBookingCard(
    booking,
    index
) {

    const flight =
        booking.flight || {};


    const departure =
        flight.departure || {};


    const arrival =
        flight.arrival || {};


    const reference =
        booking.bookingReference ||
        booking.payment?.bookingReference ||
        `FLY-${String(
            index + 1
        ).padStart(4, "0")}`;


    const status =
        getBookingStatus(
            booking
        );


    const total =
        Number(
            booking.payment?.amount || 0
        );


    const passengerCount =
        Math.max(
            Number(
                booking.passengerCount || 1
            ),
            1
        );


    return `

        <article
            class="booking-card"
            data-booking-index="${index}"
        >

            <div class="booking-card-header">

                <div>

                    <span
                        class="booking-reference"
                    >
                        ${escapeHtml(
                            reference
                        )}
                    </span>

                    <span class="booking-airline">

                        ${escapeHtml(
                            flight.airline ||
                            "Compagnie aérienne"
                        )}

                    </span>

                </div>


                <span class="booking-status">

                    ${escapeHtml(
                        status
                    )}

                </span>

            </div>


            <div class="booking-card-body">


                <div class="booking-location">

                    <strong
                        class="booking-time"
                    >
                        ${escapeHtml(
                            departure.time ||
                            "--:--"
                        )}
                    </strong>

                    <span
                        class="booking-airport"
                    >
                        ${escapeHtml(
                            departure.airport ||
                            "---"
                        )}
                    </span>

                    <span
                        class="booking-city"
                    >
                        ${escapeHtml(
                            departure.city ||
                            "Départ"
                        )}
                    </span>

                </div>


                <div
                    class="booking-route-middle"
                >

                    <div
                        class="booking-route-line"
                    ></div>

                    <span>
                        ${escapeHtml(
                            flight.duration ||
                            "Durée inconnue"
                        )}
                    </span>

                </div>


                <div class="booking-location">

                    <strong
                        class="booking-time"
                    >
                        ${escapeHtml(
                            arrival.time ||
                            "--:--"
                        )}
                    </strong>

                    <span
                        class="booking-airport"
                    >
                        ${escapeHtml(
                            arrival.airport ||
                            "---"
                        )}
                    </span>

                    <span
                        class="booking-city"
                    >
                        ${escapeHtml(
                            arrival.city ||
                            "Arrivée"
                        )}
                    </span>

                </div>

            </div>


            <div class="booking-details">


                <div class="booking-detail">

                    <span>
                        Tarif
                    </span>

                    <strong>
                        ${escapeHtml(
                            booking.fare?.name ||
                            "Basic"
                        )}
                    </strong>

                </div>


                <div class="booking-detail">

                    <span>
                        Siège
                    </span>

                    <strong>
                        ${escapeHtml(
                            booking.seat ||
                            "Non attribué"
                        )}
                    </strong>

                </div>


                <div class="booking-detail">

                    <span>
                        Voyageurs
                    </span>

                    <strong>
                        ${passengerCount}
                    </strong>

                </div>


                <div class="booking-detail">

                    <span>
                        Paiement
                    </span>

                    <strong>
                        ${escapeHtml(
                            getPaymentMethod(
                                booking.payment?.method
                            )
                        )}
                    </strong>

                </div>

            </div>


            <div class="booking-card-footer">

                <strong class="booking-total">

                    ${formatMoney(
                        total
                    )}
                    USD

                </strong>


                <div class="booking-actions">

                    <button
                        type="button"
                        class="booking-action primary"
                        data-action="view"
                        data-index="${index}"
                    >
                        Voir le billet
                    </button>


                    <button
                        type="button"
                        class="booking-action secondary"
                        data-action="delete"
                        data-index="${index}"
                    >
                        Supprimer
                    </button>

                </div>

            </div>

        </article>

    `;

}


/* =========================================
   ACTIONS
========================================= */

function setupBookingButtons() {

    document
        .querySelectorAll(
            ".booking-action"
        )
        .forEach(
            (button) => {

                button.addEventListener(
                    "click",
                    () => {

                        const action =
                            button.dataset.action;


                        const index =
                            Number(
                                button.dataset.index
                            );


                        if (
                            action ===
                            "view"
                        ) {

                            openBooking(
                                index
                            );

                        }


                        if (
                            action ===
                            "delete"
                        ) {

                            deleteBooking(
                                index
                            );

                        }

                    }
                );

            }
        );

}


/* =========================================
   OUVRIR UN BILLET
========================================= */

function openBooking(
    index
) {

    const booking =
        bookings[index];


    if (!booking) {
        return;
    }


    localStorage.setItem(
        "flygoReservation",
        JSON.stringify(
            booking
        )
    );


    window.location.href =
        "confirmation.html";

}


/* =========================================
   SUPPRIMER
========================================= */

function deleteBooking(
    index
) {

    const booking =
        bookings[index];


    if (!booking) {
        return;
    }


    const reference =
        booking.bookingReference ||
        booking.payment?.bookingReference ||
        "cette réservation";


    const confirmed =
        window.confirm(
            `Supprimer ${reference} de vos réservations ?`
        );


    if (!confirmed) {
        return;
    }


    bookings.splice(
        index,
        1
    );


    localStorage.setItem(
        "flygoBookings",
        JSON.stringify(
            bookings
        )
    );


    renderBookings();

}


/* =========================================
   STATUT
========================================= */

function getBookingStatus(
    booking
) {

    if (
        booking.status ===
        "confirmed"
    ) {

        return "Confirmée";

    }


    if (
        booking.payment?.status ===
        "paid"
    ) {

        return "Confirmée";

    }


    return "En attente";

}


/* =========================================
   PAIEMENT
========================================= */

function getPaymentMethod(
    method
) {

    const names = {

        card:
            "Carte bancaire",

        mobile:
            "Mobile Money",

        bank:
            "Virement bancaire"

    };


    return (
        names[method] ||
        "Non renseigné"
    );

}


/* =========================================
   MONNAIE
========================================= */

function formatMoney(
    value
) {

    return Number(
        value || 0
    ).toFixed(2);

}


/* =========================================
   SÉCURISATION
========================================= */

function escapeHtml(
    value
) {

    return String(
        value ?? ""
    )
        .replaceAll(
            "&",
            "&amp;"
        )
        .replaceAll(
            "<",
            "&lt;"
        )
        .replaceAll(
            ">",
            "&gt;"
        )
        .replaceAll(
            '"',
            "&quot;"
        )
        .replaceAll(
            "'",
            "&#039;"
        );

}