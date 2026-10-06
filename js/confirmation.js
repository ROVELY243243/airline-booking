/* =========================================
   FLYGO
   CONFIRMATION ET BILLET
========================================= */

let reservation = null;


document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadReservation();

        if (!reservation) {
            showMissingReservation();
            return;
        }

        renderBookingReference();

        renderTicket();

        setupPrint();

        setupDownload();

    }
);


/* =========================================
   CHARGER LA RÉSERVATION
========================================= */

function loadReservation() {

    const saved =
        localStorage.getItem(
            "flygoReservation"
        );


    if (!saved) {
        return;
    }


    try {

        reservation =
            JSON.parse(saved);

    } catch (error) {

        console.error(
            "Impossible de charger la réservation.",
            error
        );

        reservation = null;

    }

}


/* =========================================
   RÉFÉRENCE DE RÉSERVATION
========================================= */

function renderBookingReference() {

    const element =
        document.getElementById(
            "bookingReference"
        );


    if (!element) {
        return;
    }


    const reference =
        reservation.bookingReference ||
        reservation.payment?.bookingReference ||
        generateFallbackReference();


    element.textContent =
        reference;

}


/* =========================================
   BILLET
========================================= */

function renderTicket() {

    renderTicketTitle();

    renderRoute();

    renderInformation();

    renderPassengers();

    renderServices();

    renderPayment();

}


/* =========================================
   TITRE
========================================= */

function renderTicketTitle() {

    const element =
        document.getElementById(
            "ticketTitle"
        );


    if (!element) {
        return;
    }


    const airline =
        reservation.flight?.airline ||
        "FlyGo";


    const flightCode =
        reservation.flight?.airlineCode ||
        "";


    const flightId =
        reservation.flight?.id ||
        "";


    element.textContent =
        `${airline} · ${flightCode} ${flightId}`;

}


/* =========================================
   ITINÉRAIRE
========================================= */

function renderRoute() {

    const container =
        document.getElementById(
            "ticketRoute"
        );


    if (!container || !reservation.flight) {
        return;
    }


    const flight =
        reservation.flight;


    container.innerHTML = `

        <div class="ticket-location">

            <span class="time">
                ${escapeHtml(
                    flight.departure.time
                )}
            </span>

            <span class="airport">
                ${escapeHtml(
                    flight.departure.airport
                )}
            </span>

            <span class="city">
                ${escapeHtml(
                    flight.departure.city
                )}
            </span>

        </div>


        <div class="ticket-route-middle">

            <div class="ticket-route-line"></div>

            <span>
                ${escapeHtml(
                    flight.duration
                )}
            </span>

        </div>


        <div class="ticket-location">

            <span class="time">
                ${escapeHtml(
                    flight.arrival.time
                )}
            </span>

            <span class="airport">
                ${escapeHtml(
                    flight.arrival.airport
                )}
            </span>

            <span class="city">
                ${escapeHtml(
                    flight.arrival.city
                )}
            </span>

        </div>

    `;

}


/* =========================================
   INFORMATIONS DU VOL
========================================= */

function renderInformation() {

    const container =
        document.getElementById(
            "ticketInformation"
        );


    if (!container || !reservation.flight) {
        return;
    }


    const flight =
        reservation.flight;


    container.innerHTML = `

        <div class="ticket-info-item">

            <span>
                Compagnie
            </span>

            <strong>
                ${escapeHtml(
                    flight.airline
                )}
            </strong>

        </div>


        <div class="ticket-info-item">

            <span>
                Numéro de vol
            </span>

            <strong>
                ${escapeHtml(
                    flight.airlineCode
                )}
                ${escapeHtml(
                    flight.id
                )}
            </strong>

        </div>


        <div class="ticket-info-item">

            <span>
                Tarif
            </span>

            <strong>
                ${escapeHtml(
                    reservation.fare?.name ||
                    "Basic"
                )}
            </strong>

        </div>


        <div class="ticket-info-item">

            <span>
                Siège
            </span>

            <strong>
                ${escapeHtml(
                    reservation.seat ||
                    "Non attribué"
                )}
            </strong>

        </div>

    `;

}


/* =========================================
   PASSAGERS
========================================= */

function renderPassengers() {

    const container =
        document.getElementById(
            "ticketPassengers"
        );


    if (!container) {
        return;
    }


    const passengers =
        reservation.passengers?.passengers || [];


    if (!Array.isArray(passengers) ||
        passengers.length === 0) {

        container.innerHTML = `

            <div class="ticket-empty">
                Aucun passager enregistré.
            </div>

        `;

        return;
    }


    container.innerHTML =
        passengers
            .map(
                (passenger, index) => {

                    const fullName =
                        [
                            passenger.firstName,
                            passenger.lastName
                        ]
                            .filter(Boolean)
                            .join(" ");


                    return `

                        <div
                            class="ticket-passenger-row"
                        >

                            <span>
                                Passager ${index + 1}
                            </span>

                            <strong>
                                ${escapeHtml(
                                    fullName ||
                                    "Nom non renseigné"
                                )}
                            </strong>

                        </div>

                    `;

                }
            )
            .join("");

}


/* =========================================
   SERVICES
========================================= */

function renderServices() {

    const container =
        document.getElementById(
            "ticketServices"
        );


    if (!container) {
        return;
    }


    const extras =
        Array.isArray(
            reservation.extras
        )
            ? reservation.extras
            : [];


    if (extras.length === 0) {

        container.innerHTML = `

            <div class="ticket-empty">
                Aucun service supplémentaire.
            </div>

        `;

        return;
    }


    const passengerCount =
        Math.max(
            Number(
                reservation.passengerCount || 1
            ),
            1
        );


    container.innerHTML =
        extras
            .map(
                (extra) => {

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


                    const total =
                        Number(extra.price || 0) *
                        quantity;


                    return `

                        <div
                            class="ticket-service-row"
                        >

                            <span>
                                ${escapeHtml(
                                    extra.name
                                )}
                                ${
                                    quantity > 1
                                        ? ` × ${quantity}`
                                        : ""
                                }
                            </span>

                            <strong>
                                ${formatMoney(
                                    total
                                )} USD
                            </strong>

                        </div>

                    `;

                }
            )
            .join("");

}


/* =========================================
   PAIEMENT
========================================= */

function renderPayment() {

    const paymentReference =
        document.getElementById(
            "paymentReference"
        );


    const total =
        document.getElementById(
            "ticketTotal"
        );


    const status =
        document.getElementById(
            "ticketStatus"
        );


    if (paymentReference) {

        paymentReference.textContent =
            reservation.payment?.id ||
            "-";

    }


    if (total) {

        const amount =
            reservation.payment?.amount;


        total.textContent =
            amount !== undefined
                ? `${formatMoney(amount)} USD`
                : "-";

    }


    if (status) {

        const paymentStatus =
            reservation.payment?.status;


        status.textContent =
            paymentStatus === "paid"
                ? "PAYÉ"
                : "EN ATTENTE";

    }

}


/* =========================================
   IMPRESSION
========================================= */

function setupPrint() {

    const button =
        document.getElementById(
            "printTicket"
        );


    if (!button) {
        return;
    }


    button.addEventListener(
        "click",
        () => {

            window.print();

        }
    );

}


/* =========================================
   ENREGISTREMENT
========================================= */

function setupDownload() {

    const button =
        document.getElementById(
            "downloadTicket"
        );


    if (!button) {
        return;
    }


    button.addEventListener(
        "click",
        () => {

            const content =
                createTicketText();


            const blob =
                new Blob(
                    [content],
                    {
                        type:
                            "text/plain;charset=utf-8"
                    }
                );


            const url =
                URL.createObjectURL(
                    blob
                );


            const link =
                document.createElement(
                    "a"
                );


            link.href =
                url;


            link.download =
                `${reservation.bookingReference || "flygo-billet"}.txt`;


            document.body.appendChild(
                link
            );


            link.click();

            link.remove();


            URL.revokeObjectURL(
                url
            );

        }
    );

}


/* =========================================
   BILLET TEXTE
========================================= */

function createTicketText() {

    const flight =
        reservation.flight;


    const passengers =
        reservation.passengers?.passengers || [];


    const extras =
        reservation.extras || [];


    const bookingReference =
        reservation.bookingReference ||
        reservation.payment?.bookingReference ||
        "-";


    let text = "";


    text +=
        "FLYGO\n";

    text +=
        "BILLET ELECTRONIQUE\n";

    text +=
        "============================\n\n";


    text +=
        `Reference de reservation : ${
            bookingReference
        }\n`;


    text +=
        `Compagnie : ${
            flight?.airline || "-"
        }\n`;


    text +=
        `Vol : ${
            flight?.airlineCode || ""
        } ${
            flight?.id || ""
        }\n`;


    text +=
        `Depart : ${
            flight?.departure?.city || "-"
        } (${
            flight?.departure?.airport || "-"
        }) ${
            flight?.departure?.time || "-"
        }\n`;


    text +=
        `Arrivee : ${
            flight?.arrival?.city || "-"
        } (${
            flight?.arrival?.airport || "-"
        }) ${
            flight?.arrival?.time || "-"
        }\n`;


    text +=
        `Duree : ${
            flight?.duration || "-"
        }\n`;


    text +=
        `Tarif : ${
            reservation.fare?.name || "-"
        }\n`;


    text +=
        `Siege : ${
            reservation.seat || "-"
        }\n\n`;


    text +=
        "PASSAGERS\n";


    passengers.forEach(
        (passenger, index) => {

            text +=
                `${index + 1}. ${
                    passenger.firstName || ""
                } ${
                    passenger.lastName || ""
                }\n`;

        }
    );


    text +=
        "\nSERVICES\n";


    if (extras.length === 0) {

        text +=
            "Aucun service supplementaire.\n";

    } else {

        const passengerCount =
            Math.max(
                Number(
                    reservation.passengerCount || 1
                ),
                1
            );


        extras.forEach(
            (extra) => {

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


                const total =
                    Number(
                        extra.price || 0
                    ) *
                    quantity;


                text +=
                    `${extra.name} x${quantity} : ${
                        formatMoney(total)
                    } USD\n`;

            }
        );

    }


    text +=
        "\n";


    text +=
        `Total paye : ${
            formatMoney(
                reservation.payment?.amount || 0
            )
        } USD\n`;


    text +=
        `Methode : ${
            getPaymentMethodName(
                reservation.payment?.method
            )
        }\n`;


    text +=
        `Reference paiement : ${
            reservation.payment?.id || "-"
        }\n`;


    text +=
        `Statut : ${
            reservation.payment?.status || "-"
        }\n`;


    return text;

}


/* =========================================
   NOM DU MODE DE PAIEMENT
========================================= */

function getPaymentMethodName(
    method
) {

    const methods = {

        card:
            "Carte bancaire",

        mobile:
            "Mobile Money",

        bank:
            "Virement bancaire"

    };


    return methods[method] || "-";

}


/* =========================================
   RÉFÉRENCE DE SECOURS
========================================= */

function generateFallbackReference() {

    const characters =
        "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";


    let reference =
        "FLY-";


    for (
        let index = 0;
        index < 6;
        index++
    ) {

        const randomIndex =
            Math.floor(
                Math.random() *
                characters.length
            );


        reference +=
            characters[
                randomIndex
            ];

    }


    return reference;

}


/* =========================================
   MONNAIE
========================================= */

function formatMoney(
    value
) {

    const amount =
        Number(value || 0);


    return amount.toFixed(2);

}


/* =========================================
   RÉSERVATION ABSENTE
========================================= */

function showMissingReservation() {

    const content =
        document.querySelector(
            ".confirmation-content"
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
                    Aucune réservation confirmée
                    n'est disponible.
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
   SÉCURISATION HTML
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