import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import webpush from "npm:web-push";
import * as SunCalc from "npm:suncalc";
import tzlookup from "npm:tz-lookup";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY");

const VAPID_PUBLIC_KEY =
    "BA7QnZf9zuZEW3ao5NcnysZo9qLsTu-CqHILDkqgSE0MsVPLRr9K5C6UogMS7Fl7VVMkObqHCooeFqGAtZkV10I";

const corsHeaders = {
    "Access-Control-Allow-Origin": "https://avspot.net",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json"
};

const supabaseAdmin = createClient(
    SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY
);

function jsonResponse(body: unknown, status = 200) {
    return new Response(JSON.stringify(body), { status, headers: corsHeaders });
}

function getStarsStatus(stars: string) {
    if(stars === "★★★★★"){
        return { key: "excellent", label: "Excellent", emoji: "🟢", description: "Excellent lighting conditions for spotting." };
    }
    if(stars === "★★★★☆"){
        return { key: "favourable", label: "Favourable", emoji: "🟢", description: "Good lighting conditions for spotting." };
    }
    if(stars === "★★★☆☆"){
        return { key: "low_light", label: "Low light", emoji: "🟡", description: "Limited lighting conditions for spotting." };
    }
    if(stars === "★★☆☆☆"){
        return { key: "backlit", label: "Backlit", emoji: "🔴", description: "The spot is currently backlit." };
    }
    if(stars === "★☆☆☆☆"){
        return { key: "poor", label: "Poor", emoji: "🔴", description: "Poor lighting conditions for spotting." };
    }
    return { key: "night", label: "Night", emoji: "🔴", description: "It is currently too dark for spotting." };
}

function getLightingRating(
    sunBearing: number,
    cameraBearing: number,
    sunAltitude: number,
    lowCloud: number,
    midCloud: number,
    highCloud: number
) {
    if(sunAltitude < -6){
        return { stars: "☆☆☆☆☆", text: "Night", score: 0 };
    }
    if(sunAltitude >= -6 && sunAltitude <= 5){
        return { stars: "★★☆☆☆", text: "Low light", score: 30 };
    }
    lowCloud = Number(lowCloud) || 0;
    midCloud = Number(midCloud) || 0;
    highCloud = Number(highCloud) || 0;

    const heavyOvercast =
        lowCloud >= 80 ||
        (lowCloud >= 60 && midCloud >= 70);

    if(heavyOvercast){
        return { stars: "★★★☆☆", text: "Overcast", score: 50 };
    }

    let difference = Math.abs(sunBearing - cameraBearing);
    if(difference > 180){
        difference = 360 - difference;
    }

    let altitudeBonus = 0;
    if(sunAltitude > 5 && sunAltitude < 20){
        altitudeBonus = 20;
    }
    if(sunAltitude >= 20 && sunAltitude < 45){
        altitudeBonus = 10;
    }

    const partlyCloudy =
        lowCloud >= 40 ||
        midCloud >= 70;

    if(partlyCloudy){
        if(difference <= 45){
            return { stars: "★★★★☆", text: "Favourable light", score: 75 + altitudeBonus };
        }
        if(difference <= 110){
            return { stars: "★★★☆☆", text: "Diffused light", score: 55 + altitudeBonus };
        }
        return { stars: "★★☆☆☆", text: "Poor light", score: 35 + altitudeBonus };
    }

    if(highCloud >= 70){
        if(difference <= 45){
            return { stars: "★★★★☆", text: "Filtered sunlight", score: 80 + altitudeBonus };
        }
        if(difference <= 110){
            return { stars: "★★★☆☆", text: "Soft light", score: 60 + altitudeBonus };
        }
        return { stars: "★★☆☆☆", text: "Poor light", score: 35 + altitudeBonus };
    }

    if(difference <= 45){
        return { stars: "★★★★★", text: "Excellent", score: 100 + altitudeBonus };
    }
    if(difference <= 110){
        return { stars: "★★★☆☆", text: "Side lighting", score: 60 + altitudeBonus };
    }
    return { stars: "★★☆☆☆", text: "Backlit", score: 20 + altitudeBonus };
}

function getSunBearing(date: Date, lat: number, lng: number) {
    const sun = SunCalc.getPosition(date, lat, lng);
    let bearing = sun.azimuth * 180 / Math.PI;
    bearing += 180;
    if(bearing >= 360){
        bearing -= 360;
    }
    return bearing;
}

function getLocationTime(lat: number, lng: number){
    return {
        timeZone: tzlookup(lat, lng)
    };
}

function getDateForLocationTime(
    timeZone: string,
    year: number,
    month: number,
    day: number,
    hour: number,
    minute: number
){
    const utcGuess =
        new Date(
            Date.UTC(
                year,
                month - 1,
                day,
                hour,
                minute
            )
        );

    const parts =
        new Intl.DateTimeFormat(
            "en-US",
            {
                timeZone: timeZone,
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
                hourCycle: "h23"
            }
        )
        .formatToParts(utcGuess);

    const values: Record<string, string> = {};

    parts.forEach(function(part){
        if(part.type !== "literal"){
            values[part.type] = part.value;
        }
    });

    const displayedTime =
        Date.UTC(
            parseInt(values.year),
            parseInt(values.month) - 1,
            parseInt(values.day),
            parseInt(values.hour),
            parseInt(values.minute)
        );

    const wantedTime =
        Date.UTC(
            year,
            month - 1,
            day,
            hour,
            minute
        );

    const difference =
        wantedTime - displayedTime;

    return new Date(
        utcGuess.getTime() + difference
    );
}

function getCurrentLocationHourDate(lat: number, lng: number, now: Date){
    const locationTime =
        getLocationTime(lat, lng);

    const localTime =
        new Intl.DateTimeFormat(
            "en-GB",
            {
                timeZone: locationTime.timeZone,
                hour: "2-digit",
                hourCycle: "h23"
            }
        )
        .formatToParts(now);

    const hour = parseInt(
        localTime.find(function(part){
            return part.type === "hour";
        })?.value || "0"
    );

    const localDate =
        new Intl.DateTimeFormat(
            "en-CA",
            {
                timeZone: locationTime.timeZone,
                year: "numeric",
                month: "2-digit",
                day: "2-digit"
            }
        )
        .formatToParts(now);

    const year = parseInt(
        localDate.find(function(part){
            return part.type === "year";
        })?.value || "0"
    );

    const month = parseInt(
        localDate.find(function(part){
            return part.type === "month";
        })?.value || "0"
    );

    const day = parseInt(
        localDate.find(function(part){
            return part.type === "day";
        })?.value || "0"
    );

    return getDateForLocationTime(
        locationTime.timeZone,
        year,
        month,
        day,
        hour,
        0
    );
}

async function loadAirport(airportKey: string, communityAirports: any[]) {
    const key = String(airportKey || "");

    const community = communityAirports.find(function(item){
        return (
            String(item.id) === key ||
            String(item.icao || "") === key ||
            String(item.airport_name || "") === key
        );
    });

    if(community){
        return {
            id: community.id,
            name: community.airport_name,
            icao: community.icao,
            lat: Number(community.airport_lat),
            lng: Number(community.airport_lng),
            spots: community.spots || []
        };
    }

    const icao = key.toUpperCase();
    if(!/^[A-Z0-9]{3,5}$/.test(icao)){
        return null;
    }

    const response = await fetch(
        "https://avspot.net/data/airports/" + encodeURIComponent(icao) + ".json"
    );

    if(!response.ok){
        return null;
    }

    const data = await response.json();
    return {
        id: data.id || null,
        name: data.name || icao,
        icao: data.icao || icao,
        lat: Number(data.lat),
        lng: Number(data.lng),
        spots: data.spots || []
    };
}

async function getWeather(lat: number, lng: number) {
    const url =
        "https://api.open-meteo.com/v1/forecast" +
        "?latitude=" + encodeURIComponent(String(lat)) +
        "&longitude=" + encodeURIComponent(String(lng)) +
        "&current=cloud_cover,cloud_cover_low,cloud_cover_mid,cloud_cover_high";

    const response = await fetch(url);
    if(!response.ok){
        throw new Error("Weather API failed");
    }

    const data = await response.json();
    return {
        lowCloud: Number(data.current.cloud_cover_low) || 0,
        midCloud: Number(data.current.cloud_cover_mid) || 0,
        highCloud: Number(data.current.cloud_cover_high) || 0
    };
}

function formatIndividualNotification(spotName: string, status: ReturnType<typeof getStarsStatus>) {
    const currentWord =
        status.key === "excellent" || status.key === "favourable"
            ? "now"
            : "currently";

    return {
        title: "🔔 Avspot",
        body:
            status.emoji + " " + spotName + " is " + currentWord + " " + status.key.replace("_", " ") +
            "\n" + getStarLineForStatus(status.key) + " " + status.description
    };
}

function getStarLineForStatus(key: string) {
    if(key === "excellent") return "★★★★★";
    if(key === "favourable") return "★★★★☆";
    if(key === "low_light") return "★★★☆☆";
    if(key === "backlit") return "★★☆☆☆";
    if(key === "poor") return "★☆☆☆☆";
    return "☆☆☆☆☆";
}

async function sendToUser(userId: string, notification: { title: string; body: string }) {
    const { data: subscriptions, error } = await supabaseAdmin
        .from("push_subscriptions")
        .select("id, endpoint, p256dh, auth")
        .eq("user_id", userId);

    if(error){
        throw error;
    }
    if(!subscriptions || subscriptions.length === 0){
        return 0;
    }

    const payload = JSON.stringify({
        title: notification.title,
        body: notification.body,
        icon: "/icon-192.png",
        badge: "/icon-192.png",
        data: { url: "/" }
    });

    let sent = 0;

    for(const subscription of subscriptions){
        try{
            await webpush.sendNotification(
                {
                    endpoint: subscription.endpoint,
                    keys: { p256dh: subscription.p256dh, auth: subscription.auth }
                },
                payload
            );
            sent++;
        }
        catch(error){
            const statusCode =
                typeof error === "object" &&
                error !== null &&
                "statusCode" in error
                    ? Number(error.statusCode)
                    : null;

            console.error("Push notification error:", error);

            if(statusCode === 404 || statusCode === 410){
                await supabaseAdmin
                    .from("push_subscriptions")
                    .delete()
                    .eq("id", subscription.id);
            }
        }
    }

    return sent;
}

Deno.serve(async (req) => {
    if(req.method === "OPTIONS"){
        return new Response("ok", { status: 200, headers: corsHeaders });
    }

    if(req.method !== "POST"){
        return jsonResponse({ error: "Method not allowed" }, 405);
    }

    if(!VAPID_PRIVATE_KEY){
        return jsonResponse({ error: "VAPID_PRIVATE_KEY is not configured" }, 500);
    }

    const authHeader = req.headers.get("Authorization");
    if(!authHeader){
        return jsonResponse({ error: "Missing Authorization header" }, 401);
    }

    const token = authHeader.replace(/^Bearer\s+/i, "").trim();
    if(token !== SUPABASE_SERVICE_ROLE_KEY){
        return jsonResponse({ error: "Unauthorized" }, 401);
    }

    const {
        data: preferences,
        error: preferenceError
    } = await supabaseAdmin
        .from("notification_preferences")
        .select("id, user_id, target_type, airport_key, spot_key, enabled, last_notified_status")
        .eq("enabled", true);

    if(preferenceError){
        console.error("Notification preference lookup error:", preferenceError);
        return jsonResponse({ error: "Failed to load notification preferences" }, 500);
    }

    if(!preferences || preferences.length === 0){
        return jsonResponse({ success: true, processed: 0, sent: 0, results: [] });
    }

    const {
        data: communityAirports,
        error: communityError
    } = await supabaseAdmin
        .from("airport_submissions")
        .select("id, airport_name, icao, airport_lat, airport_lng, spots")
        .eq("status", "approved");

    if(communityError){
        console.error("Community airport lookup error:", communityError);
        return jsonResponse({ error: "Failed to load community airports" }, 500);
    }

    webpush.setVapidDetails(
        "mailto:support@avspot.net",
        VAPID_PUBLIC_KEY,
        VAPID_PRIVATE_KEY
    );

    const uniqueAirportKeys =
        [...new Set(
            preferences.map(function(preference){
                return String(preference.airport_key || "");
            })
        )].filter(Boolean);

    const airportData = new Map<string, any>();

    for(const airportKey of uniqueAirportKeys){
        try{
            const airport = await loadAirport(airportKey, communityAirports || []);
            if(airport){
                airportData.set(airportKey, airport);
            }
        }
        catch(error){
            console.error("Airport load error for " + airportKey + ":", error);
        }
    }

    const now = new Date();
    const results = [];
    let sent = 0;

    for(const airportKey of uniqueAirportKeys){
        const airport = airportData.get(airportKey);
        if(!airport){
            continue;
        }
        if(!Number.isFinite(airport.lat) || !Number.isFinite(airport.lng)){
            continue;
        }
        if(!Array.isArray(airport.spots) || airport.spots.length === 0){
            continue;
        }

        let weather;
        try{
            weather = await getWeather(airport.lat, airport.lng);
        }
        catch(error){
            console.error("Weather error for " + airportKey + ":", error);
            continue;
        }

        const lightingDate =
            getCurrentLocationHourDate(
                airport.lat,
                airport.lng,
                now
            );

        const sun =
            SunCalc.getPosition(
                lightingDate,
                airport.lat,
                airport.lng
            );

        const sunBearing =
            getSunBearing(
                lightingDate,
                airport.lat,
                airport.lng
            );

        const sunAltitude =
            sun.altitude * 180 / Math.PI;

        const evaluatedSpots = airport.spots.map(function(spot: any){
            const rating = getLightingRating(
                sunBearing,
                Number(spot.direction),
                sunAltitude,
                weather.lowCloud,
                weather.midCloud,
                weather.highCloud
            );
            const status = getStarsStatus(rating.stars);
            return { spot, rating, status, spotKey: getSpotKey(spot) };
        });

        const airportPreferences = preferences.filter(function(preference){
            return (
                preference.target_type === "airport" &&
                String(preference.airport_key) === airportKey &&
                preference.spot_key === null
            );
        });

        for(const preference of airportPreferences){
            const summaryState =
                evaluatedSpots
                    .map(function(item: any){
                        return item.spotKey + ":" + item.status.key;
                    })
                    .sort()
                    .join("|");

            if(preference.last_notified_status === summaryState){
                continue;
            }

            const bodyLines = evaluatedSpots.map(function(item: any){
                return item.spot.name + " — " + getStarLineForStatus(item.status.key) + " " + item.status.label;
            });

            const notification = {
                title: "🔔 Avspot",
                body: airport.name + " spotting conditions\n" + bodyLines.join("\n")
            };

            const userSent = await sendToUser(preference.user_id, notification);
            sent += userSent;

            await supabaseAdmin
                .from("notification_preferences")
                .update({
                    last_notified_status: summaryState,
                    last_notified_at: now.toISOString(),
                    updated_at: now.toISOString()
                })
                .eq("id", preference.id);

            results.push({ type: "airport", airport: airport.name, user_id: preference.user_id, sent: userSent });
        }

        const spotPreferences = preferences.filter(function(preference){
            return (
                preference.target_type === "spot" &&
                String(preference.airport_key) === airportKey
            );
        });

        for(const preference of spotPreferences){
            const evaluated = evaluatedSpots.find(function(item: any){
                return item.spotKey === String(preference.spot_key || "");
            });

            if(!evaluated){
                continue;
            }

            const statusKey = evaluated.status.key;
            if(preference.last_notified_status === statusKey){
                continue;
            }

            const notification = formatIndividualNotification(
                evaluated.spot.name,
                evaluated.status
            );

            const userSent = await sendToUser(preference.user_id, notification);
            sent += userSent;

            await supabaseAdmin
                .from("notification_preferences")
                .update({
                    last_notified_status: statusKey,
                    last_notified_at: now.toISOString(),
                    updated_at: now.toISOString()
                })
                .eq("id", preference.id);

            results.push({
                type: "spot",
                airport: airport.name,
                spot: evaluated.spot.name,
                user_id: preference.user_id,
                status: statusKey,
                sent: userSent
            });
        }
    }

    return jsonResponse({
        success: true,
        processed: preferences.length,
        sent,
        results
    });
});

function getSpotKey(spot: any) {
    return String(spot.lat) + "|" + String(spot.lng);
}
