const runwaysContainer = document.getElementById("runwaysContainer");
const spotsContainer = document.getElementById("spotsContainer");

const addRunwayButton = document.getElementById("addRunwayButton");
const addSpotButton = document.getElementById("addSpotButton");



function addRunway() {

    const runwayCard = document.createElement("div");

    runwayCard.className = "runway-card";

    runwayCard.innerHTML = `

        <button
            type="button"
            class="remove-item-button"
        >
            Remove
        </button>


        <label>Runway Name</label>

        <input
            type="text"
            class="runway-name"
            placeholder="e.g. 05/23"
            required
        >


        <div class="coordinate-row">

            <div>

                <label>Heading 1</label>

                <input
                    type="number"
                    class="runway-heading1"
                    placeholder="50"
                    min="0"
                    max="360"
                    required
                >

            </div>


            <div>

                <label>Heading 2</label>

                <input
                    type="number"
                    class="runway-heading2"
                    placeholder="230"
                    min="0"
                    max="360"
                    required
                >

            </div>

        </div>

    `;


    runwayCard
        .querySelector(".remove-item-button")
        .addEventListener("click", () => {

            runwayCard.remove();

        });


    runwaysContainer.appendChild(runwayCard);

}


addRunwayButton.addEventListener("click", addRunway);



let spotNumber = 0;


function addSpot() {

    spotNumber++;

    const spotCard = document.createElement("div");

    spotCard.className = "spot-form-card";


    spotCard.innerHTML = `

        <button
            type="button"
            class="remove-item-button"
        >
            Remove
        </button>


        <h3>
            Spotting Location ${spotNumber}
        </h3>


        <label>Spot Name</label>

        <input
            type="text"
            class="spot-name"
            placeholder="e.g. Wood Lane"
            required
        >


        <div class="coordinate-row">

            <div>

                <label>Latitude</label>

                <input
                    type="number"
                    class="spot-lat"
                    step="any"
                    placeholder="53.338772"
                    required
                >

            </div>


            <div>

                <label>Longitude</label>

                <input
                    type="number"
                    class="spot-lng"
                    step="any"
                    placeholder="-2.301383"
                    required
                >

            </div>

        </div>


        <label>Best For Runway</label>

        <input
            type="text"
            class="spot-runway"
            placeholder="e.g. 05R/23L"
        >


        <label>Recommended Focal Length</label>

        <input
            type="text"
            class="spot-focal-length"
            placeholder="e.g. 70-200mm"
        >


        <label>Parking</label>

        <input
            type="text"
            class="spot-parking"
            placeholder="e.g. Free roadside parking"
        >


        <label>Best Time To Visit</label>

        <input
            type="text"
            class="spot-best-time"
            placeholder="e.g. Late afternoon and evening"
        >


        <label>Notes</label>

        <textarea
            class="spot-notes"
            rows="4"
            placeholder="Add useful information about this spotting location..."
        ></textarea>


        <div class="photo-upload-area">

            <label>Spot Photos</label>

            <input
                type="file"
                class="spot-photos"
                accept="image/*"
                multiple
            >


            <p class="upload-help">

                You can select multiple photos.
                Images larger than 1400px will be resized before upload.

            </p>

            <label>Photo Credit</label>

            <input
            type="text"
            class="spot-photo-credit"
            placeholder="Photographer name"
            >

        </div>

    `;


    spotCard
        .querySelector(".remove-item-button")
        .addEventListener("click", () => {

            spotCard.remove();

            updateSpotNumbers();

        });


    spotsContainer.appendChild(spotCard);

    setupSpotPhotoUpload(spotCard);

}


addSpotButton.addEventListener("click", addSpot);



function updateSpotNumbers() {

    const spotCards = document.querySelectorAll(".spot-form-card");

    spotCards.forEach((card, index) => {

        const heading = card.querySelector("h3");

        heading.textContent =
            `Spotting Location ${index + 1}`;

    });


    spotNumber = spotCards.length;

}



const airportICAO =
    document.getElementById("airportICAO");


airportICAO.addEventListener("input", () => {

    airportICAO.value =
        airportICAO.value.toUpperCase();

});


addRunway();

addSpot();


let processedAirportImage = null;


function resizeImage(file) {

    return new Promise((resolve, reject) => {

        if (!file.type.startsWith("image/")) {
            reject("Selected file is not an image.");
            return;
        }


        const reader = new FileReader();


        reader.onload = function (event) {

            const image = new Image();


            image.onload = function () {

                let width = image.width;
                let height = image.height;

                const MAX_SIZE = 1400;


                if (width > MAX_SIZE || height > MAX_SIZE) {

                    const ratio =
                        Math.min(
                            MAX_SIZE / width,
                            MAX_SIZE / height
                        );

                    width = Math.round(width * ratio);
                    height = Math.round(height * ratio);

                }


                const canvas = document.createElement("canvas");

                canvas.width = width;
                canvas.height = height;


                const context =
                    canvas.getContext("2d");


                context.drawImage(
                    image,
                    0,
                    0,
                    width,
                    height
                );


                canvas.toBlob(

                    function (blob) {

                        if (!blob) {
                            reject(
                                "Unable to process image."
                            );
                            return;
                        }


                        const processedFile =
                            new File(
                                [blob],
                                file.name.replace(
                                    /\.[^/.]+$/,
                                    ""
                                ) + ".jpg",
                                {
                                    type: "image/jpeg"
                                }
                            );


                        resolve(processedFile);

                    },

                    "image/jpeg",

                    0.88

                );

            };


            image.onerror = function () {

                reject(
                    "Unable to load image."
                );

            };


            image.src =
                event.target.result;

        };


        reader.onerror = function () {

            reject(
                "Unable to read image."
            );

        };


        reader.readAsDataURL(file);

    });

}



function createImagePreview(
    file,
    container,
    imageArray
) {

    const preview =
        document.createElement("div");


    preview.className =
        "image-preview";


    const image =
        document.createElement("img");


    image.src =
        URL.createObjectURL(file);


    const removeButton =
        document.createElement("button");


    removeButton.type = "button";

    removeButton.className =
        "remove-image-button";


    removeButton.textContent = "×";


    removeButton.addEventListener(
        "click",
        () => {

            const index =
                imageArray.indexOf(file);


            if (index !== -1) {

                imageArray.splice(
                    index,
                    1
                );

            }


            URL.revokeObjectURL(
                image.src
            );


            preview.remove();

        }
    );


    preview.appendChild(image);

    preview.appendChild(
        removeButton
    );


    container.appendChild(
        preview
    );

}



const airportImageInput =
    document.getElementById(
        "airportImage"
    );


const airportPreviewContainer =
    document.createElement("div");


airportPreviewContainer.className =
    "image-preview-container";


airportImageInput.parentNode.insertBefore(

    airportPreviewContainer,

    airportImageInput.nextSibling

);


airportImageInput.addEventListener(
    "change",
    async () => {

        const file =
            airportImageInput.files[0];


        if (!file) return;


        airportPreviewContainer.innerHTML =
            "";


        try {

            processedAirportImage =
                await resizeImage(file);


            createImagePreview(

                processedAirportImage,

                airportPreviewContainer,

                [processedAirportImage]

            );

        }

        catch (error) {

            console.error(error);

            alert(
                "There was a problem processing this image."
            );

        }

    }
);


function setupSpotPhotoUpload(spotCard) {

    const photoInput =
        spotCard.querySelector(
            ".spot-photos"
        );


    const photoArea =
        spotCard.querySelector(
            ".photo-upload-area"
        );


    const previewContainer =
        document.createElement("div");


    previewContainer.className =
        "image-preview-container";


    photoArea.appendChild(
        previewContainer
    );

    spotCard.processedImages = [];


    photoInput.addEventListener(
        "change",
        async () => {

            const files =
                Array.from(
                    photoInput.files
                );


            for (
                const file of files
            ) {

                try {

                    const processedFile =
                        await resizeImage(
                            file
                        );


                    spotCard.processedImages.push(
                        processedFile
                    );


                    createImagePreview(

                        processedFile,

                        previewContainer,

                        spotCard.processedImages

                    );

                }

                catch (error) {

                    console.error(error);

                    alert(
                        "There was a problem processing one of the images."
                    );

                }

            }


            photoInput.value = "";

        }
    );

}

const airportSubmissionForm =
    document.getElementById("airportSubmissionForm");


airportSubmissionForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    const submitButton =
        document.querySelector(".submit-airport-button");

    submitButton.disabled = true;
    submitButton.textContent = "Submitting...";


    try {

        const {
            data: { user },
            error: userError
        } = await window.supabaseClient.auth.getUser();


        if (userError || !user) {

            alert("You must be logged in to submit an airport.");

            submitButton.disabled = false;
            submitButton.textContent = "Submit Airport";

            return;
        }


        const airportName =
            document.getElementById("airportName").value.trim();

        const icao =
            document.getElementById("airportICAO").value.trim().toUpperCase();

        const location =
            document.getElementById("airportLocation").value.trim();

        const airportLat =
            parseFloat(document.getElementById("airportLat").value);

        const airportLng =
            parseFloat(document.getElementById("airportLng").value);

        const airportCredit =
            document.getElementById("airportPhotoCredit").value.trim();


        const runways = [];

        document
            .querySelectorAll(".runway-card")
            .forEach(card => {

                runways.push({

                    name:
                        card.querySelector(".runway-name").value.trim(),

                    heading1:
                        Number(
                            card.querySelector(".runway-heading1").value
                        ),

                    heading2:
                        Number(
                            card.querySelector(".runway-heading2").value
                        )

                });

            });


        const spots = [];

const spotCards =
    document.querySelectorAll(".spot-form-card");


for (const card of spotCards) {

    const notesText =
        card.querySelector(".spot-notes").value.trim();


    const photoUrls = [];

    const processedImages =
        card.processedImages || [];


    for (const file of processedImages) {

        try {

            const fileExtension =
                file.name.split(".").pop();


            const fileName =
                `${user.id}/spots/${crypto.randomUUID()}.${fileExtension}`;


            const {
                data: uploadData,
                error: uploadError
            } =
                await window.supabaseClient.storage
                    .from("airport-images")
                    .upload(
                        fileName,
                        file,
                        {
                            cacheControl: "3600",
                            upsert: false
                        }
                    );


            if (uploadError) {

                console.error(
                    "Spot photo upload error:",
                    uploadError
                );


                alert(
                    "One of the spotting location photos could not be uploaded.\n\n" +
                    uploadError.message
                );


                submitButton.disabled = false;
                submitButton.textContent =
                    "Submit Airport";


                return;

            }


            const {
                data: publicUrlData
            } =
                window.supabaseClient.storage
                    .from("airport-images")
                    .getPublicUrl(
                        fileName
                    );


            photoUrls.push(
                publicUrlData.publicUrl
            );


        }

        catch (error) {

            console.error(
                "Spot photo upload error:",
                error
            );


            alert(
                "There was a problem uploading a spotting location photo."
            );


            submitButton.disabled = false;
            submitButton.textContent =
                "Submit Airport";


            return;

        }

    }


    spots.push({

        name:
            card.querySelector(
                ".spot-name"
            ).value.trim(),


        lat:
            parseFloat(
                card.querySelector(
                    ".spot-lat"
                ).value
            ),


        lng:
            parseFloat(
                card.querySelector(
                    ".spot-lng"
                ).value
            ),


        direction: null,


        bestForRunway:
            card.querySelector(
                ".spot-runway"
            ).value.trim(),


        recommendedFocalLength:
            card.querySelector(
                ".spot-focal-length"
            ).value.trim(),


        parking:
            card.querySelector(
                ".spot-parking"
            ).value.trim(),


        bestTimeToVisit:
            card.querySelector(
                ".spot-best-time"
            ).value.trim(),


        notes:
            notesText
                ? [notesText]
                : ["None"],


        photos: photoUrls,

        photoCredits: photoUrls.map(() =>
            card.querySelector(".spot-photo-credit").value.trim()
    )

    });

}


        let airportImageUrl = null;

const airportImageFile =
    document.getElementById("airportImage").files[0];

if (airportImageFile) {

    const fileExtension =
        airportImageFile.name.split(".").pop();

    const fileName =
        `${user.id}/${crypto.randomUUID()}.${fileExtension}`;

    const { data: uploadData, error: uploadError } =
        await window.supabaseClient.storage
            .from("airport-images")
            .upload(fileName, airportImageFile, {
                cacheControl: "3600",
                upsert: false
            });

    if (uploadError) {

        console.error(
            "Airport image upload error:",
            uploadError
        );

        alert(
            "The airport photo could not be uploaded.\n\n" +
            uploadError.message
        );

        submitButton.disabled = false;
        submitButton.textContent = "Submit Airport";

        return;
    }

    const { data: publicUrlData } =
        window.supabaseClient.storage
            .from("airport-images")
            .getPublicUrl(fileName);

    airportImageUrl =
        publicUrlData.publicUrl;

}


        const { data, error } = await window.supabaseClient
            .from("airport_submissions")
            .insert({

                user_id: user.id,

                status: "pending",

                airport_name: airportName,

                icao: icao,

                location: location,

                airport_lat: airportLat,

                airport_lng: airportLng,
                
                airport_image: airportImageUrl,

                airport_credits: airportCredit,

                runways: runways,

                spots: spots

            })
            .select()
            .single();


        if (error) {

            console.error("Submission error:", error);

            alert(
                "There was a problem submitting the airport.\n\n" +
                error.message
            );

            submitButton.disabled = false;
            submitButton.textContent = "Submit Airport";

            return;
        }


        console.log("Airport submission created:", data);

        alert(
            "Airport submitted successfully!\n\n" +
            "Your submission will be reviewed before it is added to Avspot."
        );

        airportSubmissionForm.reset();

        runwaysContainer.innerHTML = "";
        spotsContainer.innerHTML = "";

        spotNumber = 0;

        addRunway();
        addSpot();


    } catch (error) {

        console.error(error);

        alert(
            "Something went wrong while submitting the airport."
        );

    }


    submitButton.disabled = false;
    submitButton.textContent = "Submit Airport";

});