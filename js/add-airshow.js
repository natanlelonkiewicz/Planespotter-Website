const aircraftContainer =
    document.getElementById(
        "aircraftContainer"
    );


const addAircraftButton =
    document.getElementById(
        "addAircraftButton"
    );


function addAircraft(){

    const aircraftCard =
        document.createElement("div");


    aircraftCard.className =
        "aircraft-card";


    aircraftCard.innerHTML = `

        <button
            type="button"
            class="remove-item-button"
        >
            Remove
        </button>


        <label>
            Aircraft
        </label>


        <input
            type="text"
            class="aircraft-name"
            placeholder="e.g. RAF Typhoon"
            required
        >

    `;


    aircraftCard
        .querySelector(
            ".remove-item-button"
        )
        .addEventListener(
            "click",
            function(){

                aircraftCard.remove();

            }
        );


    aircraftContainer.appendChild(
        aircraftCard
    );

}


addAircraftButton.addEventListener(
    "click",
    addAircraft
);

const spotsContainer =
    document.getElementById(
        "spotsContainer"
    );


const addSpotButton =
    document.getElementById(
        "addSpotButton"
    );


let spotNumber = 0;


function addSpot(){

    spotNumber++;


    const spotCard =
        document.createElement("div");


    spotCard.className =
        "spot-form-card";


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


        <label>
            Spot Name
        </label>

        <input
            type="text"
            class="spot-name"
            placeholder="e.g. South End"
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
    placeholder="e.g. 51°28'17.2&quot;N"
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
    placeholder="e.g. 0°27'21.7&quot;W"
    required
>

            </div>

        </div>


        <label>
            Camera Direction
        </label>

        <input
            type="number"
            class="spot-direction"
            min="0"
            max="360"
            placeholder="e.g. 180"
            required
        >


        <p class="upload-help">

            Enter the direction you will be facing when
            photographing aircraft.

            0° = North, 90° = East,
            180° = South, 270° = West.

        </p>


        <label>
            Recommended Focal Length
        </label>

        <input
            type="text"
            class="spot-focal-length"
            placeholder="e.g. 70-200mm"
        >


        <label>
            Parking
        </label>

        <input
            type="text"
            class="spot-parking"
            placeholder="e.g. Free roadside parking"
        >


        <label>
            Best Time To Visit
        </label>

        <input
            type="text"
            class="spot-best-time"
            placeholder="e.g. Morning"
        >


        <label>
            Notes
        </label>

        <textarea
            class="spot-notes"
            rows="4"
            placeholder="Add useful information about this spotting location..."
        ></textarea>

                <div class="photo-upload-area">

            <label>
                Spot Photos
            </label>

            <input
                type="file"
                class="spot-photos"
                accept="image/*"
                multiple
            >


            <p class="upload-help">

                You can select multiple photos.
                Images larger than 1400px will be resized
                before upload.

            </p>


            <label>
                Photo Credit
            </label>

            <input
                type="text"
                class="spot-photo-credit"
                placeholder="Photographer name"
            >

        </div>

    `;


    spotCard
        .querySelector(
            ".remove-item-button"
        )
        .addEventListener(
            "click",
            function(){

                spotCard.remove();

                updateSpotNumbers();

            }
        );


    spotsContainer.appendChild(
        spotCard
    );

    setupSpotPhotoUpload(
    spotCard
);

}


addSpotButton.addEventListener(
    "click",
    addSpot
);


function updateSpotNumbers(){

    const spotCards =
        document.querySelectorAll(
            ".spot-form-card"
        );


    spotCards.forEach(
        function(card, index){

            const heading =
                card.querySelector("h3");


            heading.textContent =
                `Spotting Location ${index + 1}`;

        }
    );


    spotNumber =
        spotCards.length;

}

function resizeImage(file){

    return new Promise((resolve, reject) => {

        if(!file.type.startsWith("image/")){

            reject(
                "Selected file is not an image."
            );

            return;

        }


        const reader =
            new FileReader();


        reader.onload =
            function(event){

                const image =
                    new Image();


                image.onload =
                    function(){

                        let width =
                            image.width;

                        let height =
                            image.height;


                        const MAX_SIZE =
                            1400;


                        if(
                            width > MAX_SIZE ||
                            height > MAX_SIZE
                        ){

                            const ratio =
                                Math.min(
                                    MAX_SIZE / width,
                                    MAX_SIZE / height
                                );


                            width =
                                Math.round(
                                    width * ratio
                                );


                            height =
                                Math.round(
                                    height * ratio
                                );

                        }


                        const canvas =
                            document.createElement(
                                "canvas"
                            );


                        canvas.width =
                            width;

                        canvas.height =
                            height;


                        const context =
                            canvas.getContext(
                                "2d"
                            );


                        context.drawImage(
                            image,
                            0,
                            0,
                            width,
                            height
                        );


                        canvas.toBlob(

                            function(blob){

                                if(!blob){

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
                                            type:
                                                "image/jpeg"
                                        }

                                    );


                                resolve(
                                    processedFile
                                );

                            },

                            "image/jpeg",

                            0.88

                        );

                    };


                image.onerror =
                    function(){

                        reject(
                            "Unable to load image."
                        );

                    };


                image.src =
                    event.target.result;

            };


        reader.onerror =
            function(){

                reject(
                    "Unable to read image."
                );

            };


        reader.readAsDataURL(
            file
        );

    });

}


function createImagePreview(
    file,
    container,
    imageArray
){

    const preview =
        document.createElement(
            "div"
        );


    preview.className =
        "image-preview";


    const image =
        document.createElement(
            "img"
        );


    image.src =
        URL.createObjectURL(
            file
        );


    const removeButton =
        document.createElement(
            "button"
        );


    removeButton.type =
        "button";


    removeButton.className =
        "remove-image-button";


    removeButton.textContent =
        "×";


    removeButton.addEventListener(
        "click",
        function(){

            const index =
                imageArray.indexOf(
                    file
                );


            if(index !== -1){

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


    preview.appendChild(
        image
    );


    preview.appendChild(
        removeButton
    );


    container.appendChild(
        preview
    );

}

function setupSpotPhotoUpload(spotCard){

    const photoInput =
        spotCard.querySelector(
            ".spot-photos"
        );

    const photoArea =
        spotCard.querySelector(
            ".photo-upload-area"
        );

    const previewContainer =
        document.createElement(
            "div"
        );

    previewContainer.className =
        "image-preview-container";

    photoArea.appendChild(
        previewContainer
    );

    spotCard.processedImages = [];

    photoInput.addEventListener(
        "change",
        async function(){

            const files =
                Array.from(
                    photoInput.files
                );

            for(
                const file of files
            ){

                try{

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
                catch(error){

                    console.error(
                        error
                    );

                    alert(
                        "There was a problem processing one of the images."
                    );

                }

            }

            photoInput.value = "";

        }
    );

}

addSpot();

let processedAirshowImage = null;


const airshowImageInput =
    document.getElementById(
        "airshowImage"
    );


const airshowPreviewContainer =
    document.createElement(
        "div"
    );


airshowPreviewContainer.className =
    "image-preview-container";


airshowImageInput.parentNode.insertBefore(
    airshowPreviewContainer,
    airshowImageInput.nextSibling
);


airshowImageInput.addEventListener(
    "change",
    async function(){

        const file =
            airshowImageInput.files[0];


        if(!file){
            return;
        }


        airshowPreviewContainer.innerHTML =
            "";


        try{

            processedAirshowImage =
                await resizeImage(
                    file
                );


            const preview =
                document.createElement(
                    "div"
                );


            preview.className =
                "image-preview";


            const image =
                document.createElement(
                    "img"
                );


            image.src =
                URL.createObjectURL(
                    processedAirshowImage
                );


            const removeButton =
                document.createElement(
                    "button"
                );


            removeButton.type =
                "button";


            removeButton.className =
                "remove-image-button";


            removeButton.textContent =
                "×";


            removeButton.addEventListener(
                "click",
                function(){

                    URL.revokeObjectURL(
                        image.src
                    );


                    processedAirshowImage =
                        null;


                    airshowImageInput.value =
                        "";


                    preview.remove();

                }
            );


            preview.appendChild(
                image
            );


            preview.appendChild(
                removeButton
            );


            airshowPreviewContainer.appendChild(
                preview
            );

        }

        catch(error){

            console.error(
                "Airshow image error:",
                error
            );


            alert(
                "There was a problem processing this image."
            );

        }

    }
);

const airshowForm = document.getElementById("airshowSubmissionForm");

airshowForm.addEventListener("submit", async function(event){

    event.preventDefault();

    const submitButton =
        airshowForm.querySelector(
            ".submit-airport-button"
        );

    submitButton.disabled = true;
    submitButton.textContent = "Submitting...";

    try {

        // Check that the user is logged in
        const {
            data: { user },
            error: userError
        } = await supabaseClient.auth.getUser();

        if(userError || !user){

            alert(
                "You must be logged in to submit an airshow."
            );

            submitButton.disabled = false;
            submitButton.textContent = "Submit Airshow";

            return;
        }


        // ---------------------------------
        // AIRSHOW INFORMATION
        // ---------------------------------

        const name =
            document.getElementById(
                "airshowName"
            ).value.trim();

        const location =
            document.getElementById(
                "airshowLocation"
            ).value.trim();

        const lat =
    parseFloat(
        document.querySelector(
            ".spot-lat"
        ).value
    );

const lng =
    parseFloat(
        document.querySelector(
            ".spot-lng"
        ).value
    );

        const startDate =
            document.getElementById(
                "airshowStartDate"
            ).value;

        const endDate =
            document.getElementById(
                "airshowEndDate"
            ).value || null;

        const description =
            document.getElementById(
                "airshowDescription"
            ).value.trim();

        const photoCredit =
            document.getElementById(
                "airshowPhotoCredit"
            ).value.trim();


        // ---------------------------------
        // CONFIRMED AIRCRAFT
        // ---------------------------------

        const aircraftInputs =
            document.querySelectorAll(
                ".aircraft-name"
            );

        const confirmedAircraft =
            Array.from(aircraftInputs)
                .map(function(input){
                    return input.value.trim();
                })
                .filter(function(name){
                    return name !== "";
                });


        // ---------------------------------
        // SPOTTING LOCATIONS
        // ---------------------------------

        const spotCards =
            document.querySelectorAll(
                ".spot-form-card"
            );

        const spots = [];


        for(
            const card of spotCards
        ){

            console.log(
    "Airshow spot card:",
    card,
    "direction field:",
    card.querySelector(".spot-direction")
);

            const spot = {

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

                direction:
    parseFloat(
        card.querySelector(
            ".spot-direction"
        )?.value
    ),

                focalLength:
                    card.querySelector(
                        ".spot-focal-length"
                    ).value.trim(),

                parking:
                    card.querySelector(
                        ".spot-parking"
                    ).value.trim(),

                bestTime:
                    card.querySelector(
                        ".spot-best-time"
                    ).value.trim(),

                notes:
                    card.querySelector(
                        ".spot-notes"
                    ).value.trim(),

                photoCredit:
                    card.querySelector(
                        ".spot-photo-credit"
                    ).value.trim(),

                images: []

            };

            if(
                card.processedImages &&
                card.processedImages.length > 0
            ){

                for(
                    const imageFile of
                    card.processedImages
                ){

                    const fileName =
                        user.id +
                        "/" +
                        crypto.randomUUID() +
                        ".jpg";


                    const {
                        error: uploadError
                    } = await supabaseClient.storage
                        .from("airshow-images")
                        .upload(
                            fileName,
                            imageFile,
                            {
                                contentType:
                                    "image/jpeg"
                            }
                        );


                    if(uploadError){

                        throw uploadError;

                    }


                    const {
                        data: publicUrlData
                    } =
                        supabaseClient.storage
                            .from("airshow-images")
                            .getPublicUrl(
                                fileName
                            );


                    spot.images.push(
                        publicUrlData.publicUrl
                    );

                }

            }


            spots.push(spot);

        }


        // ---------------------------------
        // UPLOAD MAIN AIRSHOW IMAGE
        // ---------------------------------

        let airshowImageUrl = null;


        if(
            processedAirshowImage
        ){

            const fileName =
                user.id +
                "/" +
                crypto.randomUUID() +
                ".jpg";


            const {
                error: uploadError
            } = await supabaseClient.storage
                .from("airshow-images")
                .upload(
                    fileName,
                    processedAirshowImage,
                    {
                        contentType:
                            "image/jpeg"
                    }
                );


            if(uploadError){

                throw uploadError;

            }


            const {
                data: publicUrlData
            } =
                supabaseClient.storage
                    .from("airshow-images")
                    .getPublicUrl(
                        fileName
                    );


            airshowImageUrl =
                publicUrlData.publicUrl;

        }


        const {
            error: insertError
        } = await supabaseClient
            .from("airshow_submissions")
            .insert({

                user_id:
                    user.id,

                status:
                    "pending",

                name:
                    name,

                location:
                    location,

                lat:
                    lat,

                lng:
                    lng,

                start_date:
                    startDate,

                end_date:
                    endDate,

                description:
                    description,

                image:
                    airshowImageUrl,

                photo_credit:
                    photoCredit,

                confirmed_aircraft:
                    confirmedAircraft,

                spots:
                    spots

            });


        if(insertError){

            throw insertError;

        }


        // ---------------------------------
        // SUCCESS
        // ---------------------------------

        alert(
            "Airshow submitted successfully! It will be reviewed before appearing on Avspot."
        );


        airshowForm.reset();

        processedAirshowImage = null;

        airshowPreviewContainer.innerHTML = "";


        // Remove aircraft cards
        aircraftContainer.innerHTML = "";


        // Remove spotting locations
        spotsContainer.innerHTML = "";

        spotNumber = 0;


        // Add one fresh spotting location
        addSpot();


    }
    catch(error){

        console.error(
            "Airshow submission error:",
            error
        );

        alert(
            "There was a problem submitting the airshow. Please try again."
        );

    }


    submitButton.disabled = false;
    submitButton.textContent = "Submit Airshow";

});