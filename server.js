const express = require("express");

const app = express();

app.use(express.static(__dirname));

app.get("/flights", async (req,res)=>{

    try{

        const lat = req.query.lat;
        const lng = req.query.lng;
        const radius = req.query.radius || 50;


        const url =
        `https://api.airplanes.live/v2/point/${lat}/${lng}/${radius}`;


        console.log("Requesting flights:", url);


        const response = await fetch(url);


        const data = await response.json();


        res.json(data);


    }

    catch(error){

        console.log(
            "FLIGHT ERROR:",
            error
        );


        res.status(500).json({
            error:error.message
        });

    }

});

app.listen(3000, () => {
    console.log("Server running on port 3000");
});