const lowFlyingSubmissionForm =
    document.getElementById("lowFlyingSubmissionForm");

const areaPhotosInput =
    document.getElementById("areaPhotos");

const photoPreviewContainer =
    document.getElementById("photoPreviewContainer");

const spotsContainer =
    document.getElementById("spotsContainer");

const addSpotButton =
    document.getElementById("addSpotButton");


let processedAreaImages = [];

let spotCounter = 0;


/* =========================================================
   IMAGE RESIZING
========================================================= */

function resizeImage(file) {

    return new Promise((resolve, reject) => {

        if (!file.type.startsWith("image/")) {
            reject("Selected file is not an image.");
            return;
        }

        const reader = new FileReader();

        reader.onload = function(event) {

            const image = new Image();

            image.onload = function() {

                let width = image.width;
                let height = image.height;

                const MAX_SIZE = 1200;

                if (
                    width > MAX_SIZE ||
                    height > MAX_SIZE
                ) {

                    const ratio = Math.min(
                        MAX_SIZE / width,
                        MAX_SIZE / height
                    );

                    width = Math.round(width * ratio);
                    height = Math.round(height * ratio);

                }

                const canvas =
                    document.createElement("canvas");

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
                    function(blob) {

                        if (!blob) {
                            reject("Unable to process image.");
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

            image.onerror = function() {
                reject("Unable to load image.");
            };

            image.src = event.target.result;

        };

        reader.onerror = function() {
            reject("Unable to read image.");
        };

        reader.readAsDataURL(file);

    });

}


/* =========================================================
   AREA PHOTO PREVIEW
========================================================= */

function createAreaImagePreview(file) {

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

    removeButton.textContent =
        "×";


    removeButton.addEventListener(
        "click",
        function() {

            const index =
                processedAreaImages.indexOf(file);

            if(index !== -1) {

                processedAreaImages.splice(
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

    photoPreviewContainer.appendChild(
        preview
    );

}


/* =========================================================
   AREA PHOTO SELECTION
========================================================= */

areaPhotosInput.addEventListener(
    "change",
    async function() {

        const files =
            Array.from(
                areaPhotosInput.files
            );

        for(const file of files) {

            try {

                const processedFile =
                    await resizeImage(file);

                processedAreaImages.push(
                    processedFile
                );

                createAreaImagePreview(
                    processedFile
                );

            }

            catch(error) {

                console.error(
                    "Area image processing error:",
                    error
                );

                alert(
                    "There was a problem processing one of the images."
                );

            }

        }

        areaPhotosInput.value = "";

    }
);


/* =========================================================
   CREATE SPOTTING LOCATION
========================================================= */

function createSpot() {

    spotCounter++;

    const spotNumber =
        spotCounter;


    const spotSection =
        document.createElement("div");

    spotSection.className =
        "submission-section low-flying-spot";

    spotSection.dataset.spotId =
        spotNumber;


    spotSection.innerHTML = `

    <div class="spot-header">

        <h3>
            Spotting Location ${spotNumber}
        </h3>

        <button
            type="button"
            class="remove-spot-button"
        >
            Remove
        </button>

    </div>


    <label>
        Spot Name
    </label>

    <input
        type="text"
        class="spot-name"
        placeholder="e.g. Valley Viewpoint"
        required
    >


    <div class="coordinate-row">

        <div>

            <label>
                Latitude
            </label>

            <input
                type="text"
                class="spot-lat"
                placeholder="Latitude"
                required
            >

        </div>


        <div>

            <label>
                Longitude
            </label>

            <input
                type="text"
                class="spot-lng"
                placeholder="Longitude"
                required
            >

        </div>

    </div>


    <label>
        Climbing Time
    </label>

    <input
        type="text"
        class="spot-climbing-time"
        placeholder="e.g. 10 minutes"
    >


    <label>
        Recommended Focal Length
    </label>

    <input
        type="text"
        class="spot-focal-length"
        placeholder="e.g. 150-400mm"
    >


    <label>
        Parking
    </label>

    <textarea
        class="spot-parking"
        placeholder="Describe the available parking..."
        rows="3"
    ></textarea>


    <label>
        Best Time To Visit
    </label>

    <input
        type="text"
        class="spot-best-time"
        placeholder="e.g. Afternoon"
    >


    <label>
        Notes
    </label>

    <textarea
        class="spot-notes"
        placeholder="Any additional information..."
        rows="4"
    ></textarea>


    <hr>


    <h4>
        Spot Photos
    </h4>


    <label>
        Upload Photos
    </label>

    <input
        type="file"
        class="spot-photos"
        accept="image/*"
        multiple
    >


    <p class="upload-help">
        You can select multiple photos. Images larger than 1400px
        will be resized before upload.
    </p>


    <div class="spot-photo-preview"></div>


    <label>
        Photo Credit
    </label>

    <input
        type="text"
        class="spot-photo-credit"
        placeholder="Photographer name"
    >

`;


    spotsContainer.appendChild(
        spotSection
    );


    /* ---------------------------------------------------------
       REMOVE SPOT
    --------------------------------------------------------- */

    const removeButton =
        spotSection.querySelector(
            ".remove-spot-button"
        );


    removeButton.addEventListener(
        "click",
        function() {

            spotSection.remove();

        }
    );


    /* ---------------------------------------------------------
       SPOT PHOTOS
    --------------------------------------------------------- */

    const photosInput =
        spotSection.querySelector(
            ".spot-photos"
        );


    const previewContainer =
        spotSection.querySelector(
            ".spot-photo-preview"
        );


    const processedFiles = [];


    spotSection._processedFiles =
        processedFiles;


    photosInput.addEventListener(
        "change",
        async function() {

            const files =
                Array.from(
                    photosInput.files
                );


            for(const file of files) {

                try {

                    const processedFile =
                        await resizeImage(file);


                    processedFiles.push(
                        processedFile
                    );


                    createSpotImagePreview(
                        processedFile,
                        previewContainer,
                        processedFiles
                    );

                }

                catch(error) {

                    console.error(
                        "Spot image processing error:",
                        error
                    );

                    alert(
                        "There was a problem processing one of the spot images."
                    );

                }

            }

            photosInput.value = "";

        }
    );

}


/* =========================================================
   SPOT PHOTO PREVIEW
========================================================= */

function createSpotImagePreview(
    file,
    container,
    processedFiles
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

    removeButton.type =
        "button";

    removeButton.className =
        "remove-image-button";

    removeButton.textContent =
        "×";


    removeButton.addEventListener(
        "click",
        function() {

            const index =
                processedFiles.indexOf(file);


            if(index !== -1) {

                processedFiles.splice(
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


/* =========================================================
   ADD SPOT BUTTON
========================================================= */

addSpotButton.addEventListener(
    "click",
    function() {

        createSpot();

    }
);


/* =========================================================
   FIRST SPOT
========================================================= */

createSpot();


/* =========================================================
   UPLOAD IMAGE
========================================================= */

async function uploadImage(
    file,
    userId,
    folder
) {

    const fileName =
        `${userId}/low-flying/${folder}/${crypto.randomUUID()}.jpg`;


    const {
        error: uploadError
    } =
        await window.supabaseClient
            .storage
            .from("airport-images")
            .upload(
                fileName,
                file,
                {
                    cacheControl: "3600",
                    upsert: false
                }
            );


    if(uploadError) {

        throw uploadError;

    }


    const {
        data
    } =
        window.supabaseClient
            .storage
            .from("airport-images")
            .getPublicUrl(
                fileName
            );


    return data.publicUrl;

}


/* =========================================================
   COLLECT SPOTS
========================================================= */

function collectSpots() {

    const spotSections =
        Array.from(
            spotsContainer.querySelectorAll(
                ".low-flying-spot"
            )
        );


    return spotSections.map(
        function(section) {

            const getValue =
                function(selector) {

                    const element =
                        section.querySelector(
                            selector
                        );

                    return element
                        ? element.value.trim()
                        : "";

                };


            const latValue =
                getValue(".spot-lat");


            const lngValue =
                getValue(".spot-lng");


            return {

                name:
                    getValue(".spot-name"),

                lat:
                    parseFloat(latValue),

                lng:
                    parseFloat(lngValue),

                // Direction is added manually later.
                direction:
                    null,

                photos:
                    [],

                photoCredits:
                    getValue(
                        ".spot-photo-credit"
                    ),

                climbingTime:
                    getValue(
                        ".spot-climbing-time"
                    ),

                recommendedFocalLength:
                    getValue(
                        ".spot-focal-length"
                    ),

                parkingInformation:
                    getValue(
                        ".spot-parking"
                    ),

                bestTime:
                    getValue(
                        ".spot-best-time"
                    ),

                notes:
                    getValue(
                        ".spot-notes"
                    )

            };

        }
    );

}


/* =========================================================
   FORM SUBMISSION
========================================================= */

lowFlyingSubmissionForm.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();


        const submitButton =
            lowFlyingSubmissionForm.querySelector(
                ".submit-airport-button"
            );


        submitButton.disabled =
            true;

        submitButton.textContent =
            "Submitting...";


        try {

            /* -------------------------------------------------
               LOGIN
            ------------------------------------------------- */

            const {
                data: {
                    user
                },
                error: userError
            } =
                await window.supabaseClient
                    .auth
                    .getUser();


            if(userError || !user) {

                alert(
                    "You must be logged in to submit a low flying area."
                );


                submitButton.disabled =
                    false;

                submitButton.textContent =
                    "Submit Low Flying Area";

                return;

            }


            /* -------------------------------------------------
               AREA VALUES
            ------------------------------------------------- */

            const value =
                function(id) {

                    return document
                        .getElementById(id)
                        .value
                        .trim();

                };


            const name =
                value("areaName");

            const location =
                value("areaLocation");

            const lat =
                parseFloat(
                    value("areaLat")
                );

            const lng =
                parseFloat(
                    value("areaLng")
                );

            const description =
                value("description");

            const commonAircraft =
                value("commonAircraft");

            const aircraftTypes =
                value("aircraftTypes");

            const photoCredit =
                value("photoCredit");


            /* -------------------------------------------------
               VALIDATE AREA
            ------------------------------------------------- */

            if(
                Number.isNaN(lat) ||
                Number.isNaN(lng)
            ) {

                alert(
                    "Please enter valid area latitude and longitude coordinates."
                );


                submitButton.disabled =
                    false;

                submitButton.textContent =
                    "Submit Low Flying Area";

                return;

            }


            /* -------------------------------------------------
               COLLECT SPOTS
            ------------------------------------------------- */

            const spots =
                collectSpots();


            if(spots.length === 0) {

                alert(
                    "Please add at least one spotting location."
                );


                submitButton.disabled =
                    false;

                submitButton.textContent =
                    "Submit Low Flying Area";

                return;

            }


            /* -------------------------------------------------
               VALIDATE SPOTS
            ------------------------------------------------- */

            for(
                const spot
                of spots
            ) {

                if(
                    !spot.name
                ) {

                    alert(
                        "Please enter a name for every spotting location."
                    );


                    submitButton.disabled =
                        false;

                    submitButton.textContent =
                        "Submit Low Flying Area";

                    return;

                }


                if(
                    Number.isNaN(spot.lat) ||
                    Number.isNaN(spot.lng)
                ) {

                    alert(
                        `Please enter valid coordinates for "${spot.name}".`
                    );


                    submitButton.disabled =
                        false;

                    submitButton.textContent =
                        "Submit Low Flying Area";

                    return;

                }

            }


            /* -------------------------------------------------
               UPLOAD AREA PHOTOS
            ------------------------------------------------- */

            const areaPhotoUrls = [];


            for(
                const file
                of processedAreaImages
            ) {

                const url =
                    await uploadImage(
                        file,
                        user.id,
                        "area"
                    );


                areaPhotoUrls.push(
                    url
                );

            }


            /* -------------------------------------------------
               UPLOAD SPOT PHOTOS
            ------------------------------------------------- */

            const spotSections =
                Array.from(
                    spotsContainer.querySelectorAll(
                        ".low-flying-spot"
                    )
                );


            for(
                let i = 0;
                i < spotSections.length;
                i++
            ) {

                const section =
                    spotSections[i];


                const spot =
                    spots[i];


                const processedFiles =
                    section._processedFiles || [];


                for(
                    const file
                    of processedFiles
                ) {

                    const url =
                        await uploadImage(
                            file,
                            user.id,
                            `spot-${i + 1}`
                        );


                    spot.photos.push(
                        url
                    );

                }

            }


            /* -------------------------------------------------
               INSERT
            ------------------------------------------------- */

            const {
                data,
                error
            } =
                await window.supabaseClient
                    .from(
                        "low_flying_submissions"
                    )
                    .insert({

                        user_id:
                            user.id,

                        name:
                            name,

                        location:
                            location,

                        lat:
                            lat,

                        lng:
                            lng,

                        description:
                            description,

                        photos:
                            areaPhotoUrls,

                        photo_credit:
                            photoCredit,

                        common_aircraft:
                            commonAircraft,

                        aircraft_types:
                            aircraftTypes,

                        spots:
                            spots,

                        status:
                            "pending"

                    })
                    .select()
                    .single();


            /* -------------------------------------------------
               DATABASE ERROR
            ------------------------------------------------- */

            if(error) {

                console.error(
                    "Low flying submission error:",
                    error
                );


                alert(
                    "There was a problem submitting the low flying area.\n\n" +
                    error.message
                );


                submitButton.disabled =
                    false;

                submitButton.textContent =
                    "Submit Low Flying Area";

                return;

            }


            /* -------------------------------------------------
               SUCCESS
            ------------------------------------------------- */

            console.log(
                "Low flying submission created:",
                data
            );


            alert(
                "Low flying area submitted successfully!\n\n" +
                "Your submission will be reviewed before it is added to Avspot."
            );


            lowFlyingSubmissionForm.reset();


            processedAreaImages =
                [];


            photoPreviewContainer.innerHTML =
                "";


            spotsContainer.innerHTML =
                "";


            spotCounter =
                0;


            createSpot();

        }

        catch(error) {

            console.error(
                "Low flying submission error:",
                error
            );


            alert(
                "Something went wrong while submitting the low flying area.\n\n" +
                (error.message || error)
            );

        }


        submitButton.disabled =
            false;

        submitButton.textContent =
            "Submit Low Flying Area";

    }
);