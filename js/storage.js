 /* =========================================
    FLYGO
    GESTION CENTRALISÉE DU STOCKAGE
 ========================================= */

const FlyGoStorage = {

    /* =====================================
       RECHERCHE
    ===================================== */

    getSearch() {

        return this.get(
            "flygoSearch",
            null
        );

    },


    saveSearch(search) {

        return this.set(
            "flygoSearch",
            search
        );

    },


    /* =====================================
       VOL SÉLECTIONNÉ
    ===================================== */

    getSelectedFlight() {

        return this.get(
            "selectedFlight",
            null
        );

    },


    saveSelectedFlight(flight) {

        return this.set(
            "selectedFlight",
            flight
        );

    },


    /* =====================================
       TARIF
    ===================================== */

    getSelectedFare() {

        return this.get(
            "selectedFare",
            null
        );

    },


    saveSelectedFare(fare) {

        return this.set(
            "selectedFare",
            fare
        );

    },


    /* =====================================
       SIÈGE
    ===================================== */

    getSelectedSeat() {

        return localStorage.getItem(
            "selectedSeat"
        );

    },


    saveSelectedSeat(seat) {

        try {

            localStorage.setItem(
                "selectedSeat",
                seat
            );

            return true;

        } catch (error) {

            console.error(
                "Impossible d'enregistrer le siège.",
                error
            );

            return false;

        }

    },


    clearSelectedSeat() {

        localStorage.removeItem(
            "selectedSeat"
        );

    },


    /* =====================================
       PASSAGERS
    ===================================== */

    getPassengers() {

        return this.get(
            "flygoPassengers",
            null
        );

    },


    savePassengers(passengers) {

        return this.set(
            "flygoPassengers",
            passengers
        );

    },


    /* =====================================
       OPTIONS
    ===================================== */

    getExtras() {

        return this.get(
            "flygoExtras",
            []
        );

    },


    saveExtras(extras) {

        return this.set(
            "flygoExtras",
            extras
        );

    },


    /* =====================================
       RÉSERVATION ACTUELLE
    ===================================== */

    getReservation() {

        return this.get(
            "flygoReservation",
            null
        );

    },


    saveReservation(reservation) {

        return this.set(
            "flygoReservation",
            reservation
        );

    },


    /* =====================================
       PAIEMENT
    ===================================== */

    getPayment() {

        return this.get(
            "flygoPayment",
            null
        );

    },


    savePayment(payment) {

        return this.set(
            "flygoPayment",
            payment
        );

    },


    /* =====================================
       RÉSERVATIONS
    ===================================== */

    getBookings() {

        const bookings =
            this.get(
                "flygoBookings",
                []
            );


        return Array.isArray(
            bookings
        )
            ? bookings
            : [];

    },


    saveBookings(bookings) {

        return this.set(
            "flygoBookings",
            Array.isArray(bookings)
                ? bookings
                : []
        );

    },


    addBooking(booking) {

        const bookings =
            this.getBookings();


        const filtered =
            bookings.filter(
                (item) =>
                    item.bookingReference !==
                    booking.bookingReference
            );


        filtered.unshift(
            booking
        );


        return this.saveBookings(
            filtered
        );

    },


    removeBooking(reference) {

        const bookings =
            this.getBookings();


        const updated =
            bookings.filter(
                (booking) =>
                    booking.bookingReference !==
                    reference
            );


        return this.saveBookings(
            updated
        );

    },


    /* =====================================
       UTILITAIRES GÉNÉRIQUES
    ===================================== */

    get(key, fallback = null) {

        try {

            const value =
                localStorage.getItem(
                    key
                );


            if (value === null) {

                return fallback;

            }


            return JSON.parse(
                value
            );

        } catch (error) {

            console.error(
                `Erreur de lecture : ${key}`,
                error
            );


            return fallback;

        }

    },


    set(key, value) {

        try {

            localStorage.setItem(
                key,
                JSON.stringify(value)
            );


            return true;

        } catch (error) {

            console.error(
                `Erreur d'enregistrement : ${key}`,
                error
            );


            return false;

        }

    },


    remove(key) {

        try {

            localStorage.removeItem(
                key
            );


            return true;

        } catch (error) {

            console.error(
                `Erreur de suppression : ${key}`,
                error
            );


            return false;

        }

    },


    clearBookingProcess() {

        this.remove(
            "selectedFlight"
        );

        this.remove(
            "selectedFare"
        );

        this.remove(
            "selectedSeat"
        );

        this.remove(
            "flygoPassengers"
        );

        this.remove(
            "flygoExtras"
        );

        this.remove(
            "flygoReservation"
        );

        this.remove(
            "flygoPayment"
        );

    }

};