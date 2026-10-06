// =========================================
// FLYGO
// APPLICATION PRINCIPALE
// =========================================


document.addEventListener("DOMContentLoaded", () => {

    initMobileMenu();

    initTripTypes();

    initFlightSearch();

    setMinimumDates();

});


// =========================================
// MENU MOBILE
// =========================================

function initMobileMenu() {

    const menuToggle =
        document.getElementById("menuToggle");

    const mainNav =
        document.getElementById("mainNav");


    if (!menuToggle || !mainNav) {
        return;
    }


    menuToggle.addEventListener("click", () => {

        const isOpen =
            mainNav.classList.toggle("open");


        menuToggle.setAttribute(
            "aria-expanded",
            String(isOpen)
        );

    });

}


// =========================================
// TYPE DE VOYAGE
// =========================================

function initTripTypes() {

    const buttons =
        document.querySelectorAll(".trip-type");

    const returnField =
        document.getElementById("returnField");


    buttons.forEach((button) => {

        button.addEventListener("click", () => {

            buttons.forEach((item) => {
                item.classList.remove("active");
            });


            button.classList.add("active");


            const tripType =
                button.dataset.trip;


            if (tripType === "oneway") {

                returnField.style.display = "none";

            } else {

                returnField.style.display = "";

            }

        });

    });

}


// =========================================
// DATES MINIMUM
// =========================================

function setMinimumDates() {

    const today =
        new Date().toISOString().split("T")[0];


    const departureDate =
        document.getElementById("departureDate");

    const returnDate =
        document.getElementById("returnDate");


    if (departureDate) {
        departureDate.min = today;
    }


    if (returnDate) {
        returnDate.min = today;
    }


    if (departureDate && returnDate) {

        departureDate.addEventListener(
            "change",
            () => {

                returnDate.min =
                    departureDate.value;

            }
        );

    }

}


// =========================================
// RECHERCHE DE VOL
// =========================================

function initFlightSearch() {

    const form =
        document.getElementById("flightSearchForm");


    if (!form) {
        return;
    }


    form.addEventListener("submit", (event) => {

        event.preventDefault();


        const departure =
            document.getElementById("departure")
                .value.trim();


        const destination =
            document.getElementById("destination")
                .value.trim();


        const departureDate =
            document.getElementById("departureDate")
                .value;


        const returnDate =
            document.getElementById("returnDate")
                .value;


        const passengers =
            document.getElementById("passengers")
                .value;


        const travelClass =
            document.getElementById("travelClass")
                .value;


        const activeTrip =
            document.querySelector(
                ".trip-type.active"
            );


        const tripType =
            activeTrip?.dataset.trip || "roundtrip";


        const searchData = {

            departure,

            destination,

            departureDate,

            returnDate:
                tripType === "oneway"
                    ? null
                    : returnDate,

            passengers,

            travelClass,

            tripType

        };


        console.log(
            "Recherche FlyGo :",
            searchData
        );


        localStorage.setItem(
            "flygoSearch",
            JSON.stringify(searchData)
        );


        window.location.href =
            "pages/flights.html";

    });

}