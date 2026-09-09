self.addEventListener(
    "install",
    function(){

        self.skipWaiting();

    }
);


self.addEventListener(
    "activate",
    function(event){

        event.waitUntil(
            self.clients.claim()
        );

    }
);


self.addEventListener(
    "push",
    function(event){

        if(!event.data){

            return;

        }

        let data;

        try{

            data =
                event.data.json();

        }
        catch(error){

            data = {

                title:
                    "Avspot",

                body:
                    event.data.text()

            };

        }

        const title =
            data.title ||
            "Avspot";

        const options = {

            body:
                data.body ||
                "",

            icon:
                data.icon ||
                "/icon-192.png",

            badge:
                data.badge ||
                "/icon-192.png",

            data:
                data.data ||
                {}

        };

        event.waitUntil(

            self.registration
                .showNotification(
                    title,
                    options
                )

        );

    }
);


self.addEventListener(
    "notificationclick",
    function(event){

        event.notification.close();

        event.waitUntil(

            clients.matchAll({
                type: "window",
                includeUncontrolled: true
            }).then(function(clientList){

                for(
                    const client
                    of clientList
                ){

                    if(
                        "focus" in client
                    ){

                        return client.focus();

                    }

                }

                if(
                    clients.openWindow
                ){

                    return clients.openWindow(
                        "/"
                    );

                }

            })

        );

    }
);