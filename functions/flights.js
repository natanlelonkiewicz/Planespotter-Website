export async function onRequest(context) {

    try {

        const url = new URL(context.request.url);

        const lat = url.searchParams.get("lat");
        const lng = url.searchParams.get("lng");
        const radius = url.searchParams.get("radius") || 50;

        const apiUrl =
            `https://api.airplanes.live/v2/point/${lat}/${lng}/${radius}`;

        const response = await fetch(apiUrl);

        const data = await response.json();

        return Response.json(data);

    }

    catch (error) {

        return Response.json(
            {
                error: error.message
            },
            {
                status: 500
            }
        );

    }

}