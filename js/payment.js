/* =========================================
   FLYGO
   PAIEMENT
========================================= */

let reservation = null;

let activePaymentMethod = "card";


document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadReservation();

        if (!reservation) {
            showMissingReservation();
            return;
        }

        renderRoute();

        renderPaymentFields();

        renderSummary();

        setupPaymentMethods();

        setupPaymentForm();

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
   ITINÉRAIRE
========================================= */

function renderRoute() {

    const container =
        document.getElementById(
            "paymentRoute"
        );


    if (!container) {
        return;
    }


    if (
        !reservation.flight ||
        !reservation.flight.departure ||
        !reservation.flight.arrival
    ) {
        return;
    }


    container.innerHTML = `

        <h1>
            ${escapeHtml(
                reservation.flight.departure.city
            )}
            →
            ${escapeHtml(
                reservation.flight.arrival.city
            )}
        </h1>

        <p>
            ${escapeHtml(
                reservation.flight.airline
            )}
            ·
            ${escapeHtml(
                reservation.flight.id
            )}
        </p>

    `;

}


/* =========================================
   CALCUL TOTAL
========================================= */

function calculateTotal() {

    const farePrice =
        Number(
            reservation.fare?.price ??
            reservation.flight?.price ??
            0
        );


    const passengers =
        Math.max(
            Number(
                reservation.passengerCount || 1
            ),
            1
        );


    const flightTotal =
        farePrice * passengers;


    /*
        Sièges premium
    */

    const premiumSeats = [
        "1A",
        "1F",
        "2A",
        "2F",
        "3A",
        "3F"
    ];


    const seatTotal =
        premiumSeats.includes(
            reservation.seat
        )
            ? 35
            : 0;


    /*
        Options supplémentaires
    */

    const extrasTotal =
        Array.isArray(
            reservation.extras
        )
            ? reservation.extras.reduce(
                (
                    total,
                    extra
                ) => {

                    let quantity = 1;


                    /*
                        Ces services sont facturés
                        par passager.
                    */

                    if (
                        extra.id ===
                            "travel-insurance" ||

                        extra.id ===
                            "priority" ||

                        extra.id ===
                            "meal"
                    ) {

                        quantity =
                            passengers;

                    }


                    return (
                        total +
                        (
                            Number(
                                extra.price || 0
                            ) *
                            quantity
                        )
                    );

                },
                0
            )
            : 0;


    return {

        flightTotal,

        seatTotal,

        extrasTotal,

        total:
            flightTotal +
            seatTotal +
            extrasTotal

    };

}


/* =========================================
   RÉSUMÉ
========================================= */

function renderSummary() {

    const container =
        document.getElementById(
            "paymentSummary"
        );


    if (!container) {
        return;
    }


    const totals =
        calculateTotal();


    const passengers =
        Math.max(
            Number(
                reservation.passengerCount || 1
            ),
            1
        );


    container.innerHTML = `

        <div class="summary-row">

            <span>
                ${escapeHtml(
                    reservation.flight.departure.city
                )}
                →
                ${escapeHtml(
                    reservation.flight.arrival.city
                )}
            </span>

            <strong>
                ${formatMoney(
                    totals.flightTotal
                )}
                USD
            </strong>

        </div>


        <div class="summary-row">

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


        <div class="summary-row">

            <span>
                Siège
            </span>

            <strong>
                ${escapeHtml(
                    reservation.seat ||
                    "Non sélectionné"
                )}
            </strong>

        </div>


        <div class="summary-row">

            <span>
                Voyageurs
            </span>

            <strong>
                ${passengers}
            </strong>

        </div>


        <div class="summary-row">

            <span>
                Options
            </span>

            <strong>
                ${formatMoney(
                    totals.extrasTotal
                )}
                USD
            </strong>

        </div>


        <div class="summary-total">

            <strong>
                Total à payer
            </strong>

            <strong>
                ${formatMoney(
                    totals.total
                )}
                USD
            </strong>

        </div>

    `;

}


/* =========================================
   MÉTHODES DE PAIEMENT
========================================= */

function setupPaymentMethods() {

    const methods =
        document.querySelectorAll(
            ".payment-method"
        );


    methods.forEach(
        (method) => {

            method.addEventListener(
                "click",
                () => {

                    methods.forEach(
                        (item) => {

                            item.classList.remove(
                                "active"
                            );

                        }
                    );


                    method.classList.add(
                        "active"
                    );


                    activePaymentMethod =
                        method.dataset.method ||
                        "card";


                    renderPaymentFields();

                }
            );

        }
    );

}


/* =========================================
   CHAMPS DE PAIEMENT
========================================= */

function renderPaymentFields() {

    const container =
        document.getElementById(
            "paymentFields"
        );


    if (!container) {
        return;
    }


    /* -------------------------------------
       CARTE
    ------------------------------------- */

    if (
        activePaymentMethod ===
        "card"
    ) {

        container.innerHTML = `

            <div class="payment-field-grid">

                <div class="payment-field full-width">

                    <label for="cardName">
                        Nom sur la carte
                    </label>

                    <input
                        type="text"
                        id="cardName"
                        autocomplete="cc-name"
                        placeholder="Nom complet"
                    >

                </div>


                <div class="payment-field full-width">

                    <label for="cardNumber">
                        Numéro de carte
                    </label>

                    <input
                        type="text"
                        id="cardNumber"
                        inputmode="numeric"
                        autocomplete="cc-number"
                        placeholder="0000 0000 0000 0000"
                        maxlength="19"
                    >

                </div>


                <div class="payment-field">

                    <label for="cardExpiry">
                        Date d'expiration
                    </label>

                    <input
                        type="text"
                        id="cardExpiry"
                        autocomplete="cc-exp"
                        placeholder="MM/AA"
                        maxlength="5"
                    >

                </div>


                <div class="payment-field">

                    <label for="cardCvv">
                        Code de sécurité
                    </label>

                    <input
                        type="password"
                        id="cardCvv"
                        inputmode="numeric"
                        autocomplete="cc-csc"
                        placeholder="CVV"
                        maxlength="4"
                    >

                </div>

            </div>

        `;


        setupCardFormatting();

        return;

    }


    /* -------------------------------------
       MOBILE MONEY
    ------------------------------------- */

    if (
        activePaymentMethod ===
        "mobile"
    ) {

        container.innerHTML = `

            <div class="payment-field-grid">

                <div class="payment-field">

                    <label for="mobileProvider">
                        Opérateur
                    </label>

                    <select id="mobileProvider">

                        <option value="">
                            Sélectionner
                        </option>

                        <option value="orange">
                            Orange Money
                        </option>

                        <option value="airtel">
                            Airtel Money
                        </option>

                        <option value="mpesa">
                            M-Pesa
                        </option>

                    </select>

                </div>


                <div class="payment-field">

                    <label for="mobileNumber">
                        Numéro de téléphone
                    </label>

                    <input
                        type="tel"
                        id="mobileNumber"
                        inputmode="tel"
                        autocomplete="tel"
                        placeholder="+243..."
                    >

                </div>

            </div>

        `;

        return;

    }


    /* -------------------------------------
       VIREMENT BANCAIRE
    ------------------------------------- */

    container.innerHTML = `

        <div class="payment-field-grid">

            <div class="payment-field full-width">

                <label for="bankName">
                    Banque
                </label>

                <select id="bankName">

                    <option value="">
                        Sélectionner une banque
                    </option>

                    <option value="bank-a">
                        Banque de démonstration A
                    </option>

                    <option value="bank-b">
                        Banque de démonstration B
                    </option>

                </select>

            </div>


            <div class="payment-field">

                <label for="accountName">
                    Titulaire du compte
                </label>

                <input
                    type="text"
                    id="accountName"
                    placeholder="Nom complet"
                >

            </div>


            <div class="payment-field">

                <label for="transferReference">
                    Référence
                </label>

                <input
                    type="text"
                    id="transferReference"
                    placeholder="Référence de virement"
                >

            </div>

        </div>

    `;

}


/* =========================================
   FORMATAGE CARTE
========================================= */

function setupCardFormatting() {

    const number =
        document.getElementById(
            "cardNumber"
        );


    const expiry =
        document.getElementById(
            "cardExpiry"
        );


    if (number) {

        number.addEventListener(
            "input",
            () => {

                const digits =
                    number.value
                        .replace(/\D/g, "")
                        .slice(0, 16);


                number.value =
                    digits.replace(
                        /(\d{4})(?=\d)/g,
                        "$1 "
                    );

            }
        );

    }


    if (expiry) {

        expiry.addEventListener(
            "input",
            () => {

                const digits =
                    expiry.value
                        .replace(/\D/g, "")
                        .slice(0, 4);


                if (
                    digits.length > 2
                ) {

                    expiry.value =
                        `${digits.slice(
                            0,
                            2
                        )}/${digits.slice(2)}`;

                } else {

                    expiry.value =
                        digits;

                }

            }
        );

    }

}


/* =========================================
   VALIDATION DU FORMULAIRE
========================================= */

function setupPaymentForm() {

    const form =
        document.getElementById(
            "paymentForm"
        );


    if (!form) {
        return;
    }


    form.addEventListener(
        "submit",
        (event) => {

            event.preventDefault();


            const errors =
                validatePayment();


            const errorBox =
                document.getElementById(
                    "paymentError"
                );


            if (errors.length > 0) {

                if (errorBox) {

                    errorBox.classList.remove(
                        "hidden"
                    );


                    errorBox.innerHTML =
                        errors
                            .map(
                                (error) =>
                                    `<div>${escapeHtml(
                                        error
                                    )}</div>`
                            )
                            .join("");

                }

                return;

            }


            if (errorBox) {

                errorBox.classList.add(
                    "hidden"
                );

                errorBox.innerHTML = "";

            }


            processPayment();

        }
    );

}


/* =========================================
   VALIDATION
========================================= */

function validatePayment() {

    const errors = [];


    const agreement =
        document.getElementById(
            "paymentAgreement"
        );


    if (
        !agreement ||
        !agreement.checked
    ) {

        errors.push(
            "Vous devez accepter les conditions de réservation."
        );

    }


    /* -------------------------------------
       CARTE
    ------------------------------------- */

    if (
        activePaymentMethod ===
        "card"
    ) {

        const name =
            getValue(
                "cardName"
            );


        const number =
            getValue(
                "cardNumber"
            )
                .replace(/\s/g, "");


        const expiry =
            getValue(
                "cardExpiry"
            );


        const cvv =
            getValue(
                "cardCvv"
            );


        if (
            name.length < 2
        ) {

            errors.push(
                "Indiquez le nom figurant sur la carte."
            );

        }


        if (
            !/^\d{16}$/.test(
                number
            )
        ) {

            errors.push(
                "Le numéro de carte de démonstration doit contenir 16 chiffres."
            );

        }


        if (
            !/^\d{2}\/\d{2}$/.test(
                expiry
            )
        ) {

            errors.push(
                "Indiquez une date d'expiration au format MM/AA."
            );

        } else {

            if (
                !isValidExpiry(
                    expiry
                )
            ) {

                errors.push(
                    "La date d'expiration de la carte est invalide."
                );

            }

        }


        if (
            !/^\d{3,4}$/.test(
                cvv
            )
        ) {

            errors.push(
                "Indiquez un code de sécurité valide."
            );

        }

    }


    /* -------------------------------------
       MOBILE MONEY
    ------------------------------------- */

    if (
        activePaymentMethod ===
        "mobile"
    ) {

        const provider =
            getValue(
                "mobileProvider"
            );


        const phone =
            getValue(
                "mobileNumber"
            );


        if (!provider) {

            errors.push(
                "Sélectionnez un opérateur Mobile Money."
            );

        }


        const phoneDigits =
            phone.replace(
                /\D/g,
                ""
            );


        if (
            phoneDigits.length < 9
        ) {

            errors.push(
                "Indiquez un numéro de téléphone valide."
            );

        }

    }


    /* -------------------------------------
       BANQUE
    ------------------------------------- */

    if (
        activePaymentMethod ===
        "bank"
    ) {

        const bank =
            getValue(
                "bankName"
            );


        const accountName =
            getValue(
                "accountName"
            );


        const reference =
            getValue(
                "transferReference"
            );


        if (!bank) {

            errors.push(
                "Sélectionnez une banque."
            );

        }


        if (
            accountName.length < 2
        ) {

            errors.push(
                "Indiquez le titulaire du compte."
            );

        }


        if (
            reference.length < 3
        ) {

            errors.push(
                "Indiquez la référence du virement."
            );

        }

    }


    return errors;

}


/* =========================================
   VALIDATION EXPIRATION
========================================= */

function isValidExpiry(
    value
) {

    const parts =
        value.split("/");


    const month =
        Number(
            parts[0]
        );


    const year =
        Number(
            parts[1]
        );


    if (
        month < 1 ||
        month > 12
    ) {

        return false;

    }


    const currentDate =
        new Date();


    const currentYear =
        currentDate
            .getFullYear()
            .toString()
            .slice(-2);


    const currentMonth =
        currentDate.getMonth() + 1;


    const numericCurrentYear =
        Number(
            currentYear
        );


    if (
        year <
        numericCurrentYear
    ) {

        return false;

    }


    if (
        year ===
        numericCurrentYear &&
        month < currentMonth
    ) {

        return false;

    }


    return true;

}


/* =========================================
   TRAITEMENT DU PAIEMENT
   MODE DÉMONSTRATION
========================================= */

function processPayment() {

    const totals =
        calculateTotal();


    /*
        Référence de paiement
    */

    const paymentId =
        generatePaymentReference();


    /*
        Référence de réservation
    */

    const bookingReference =
        generateBookingReference();


    /*
        Données du paiement
    */

    const paymentData = {

        id:
            paymentId,

        bookingReference:
            bookingReference,

        method:
            activePaymentMethod,

        amount:
            totals.total,

        currency:
            "USD",

        status:
            "paid",

        date:
            new Date().toISOString()

    };


    /*
        Réservation complète
    */

    const completeReservation = {

        ...reservation,

        bookingReference:
            bookingReference,

        payment:
            paymentData,

        status:
            "confirmed",

        confirmedAt:
            new Date().toISOString()

    };


    /*
        Sauvegarder la réservation actuelle
    */

    localStorage.setItem(
        "flygoReservation",
        JSON.stringify(
            completeReservation
        )
    );


    /*
        Sauvegarder le paiement
    */

    localStorage.setItem(
        "flygoPayment",
        JSON.stringify(
            paymentData
        )
    );


    /*
        Sauvegarder dans
        les réservations du compte
    */

    saveBooking(
        completeReservation
    );


    /*
        Redirection vers
        le billet électronique
    */

    window.location.href =
        "confirmation.html";

}


/* =========================================
   SAUVEGARDE RÉSERVATION
========================================= */

function saveBooking(
    booking
) {

    const saved =
        localStorage.getItem(
            "flygoBookings"
        );


    let bookings = [];


    try {

        bookings =
            saved
                ? JSON.parse(saved)
                : [];


        if (
            !Array.isArray(
                bookings
            )
        ) {

            bookings = [];

        }

    } catch (error) {

        console.error(
            "Impossible de charger les réservations.",
            error
        );

        bookings = [];

    }


    /*
        Évite de sauvegarder
        deux fois exactement
        la même réservation.
    */

    bookings =
        bookings.filter(
            (item) =>
                item.bookingReference !==
                booking.bookingReference
        );


    bookings.unshift(
        booking
    );


    localStorage.setItem(
        "flygoBookings",
        JSON.stringify(
            bookings
        )
    );

}


/* =========================================
   RÉFÉRENCE PAIEMENT
========================================= */

function generatePaymentReference() {

    const random =
        Math.random()
            .toString(36)
            .substring(2, 8)
            .toUpperCase();


    return `PAY-${Date.now()}-${random}`;

}


/* =========================================
   RÉFÉRENCE RÉSERVATION
========================================= */

function generateBookingReference() {

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
   FORMATAGE MONNAIE
========================================= */

function formatMoney(
    value
) {

    const amount =
        Number(value || 0);


    return amount.toFixed(2);

}


/* =========================================
   RÉCUPÉRER UNE VALEUR
========================================= */

function getValue(
    id
) {

    return (
        document
            .getElementById(id)
            ?.value
            .trim() || ""
    );

}


/* =========================================
   RÉSERVATION MANQUANTE
========================================= */

function showMissingReservation() {

    const content =
        document.querySelector(
            ".payment-content"
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
                    de réservation.
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