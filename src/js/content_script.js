"use strict";

if (typeof plxDwnld === "undefined") {

    window.plxDwnld = (function() {

        const self = {};
        const clientIdRegex = new RegExp("server\/([a-f0-9]{40})\/");
        const metadataIdRegex = new RegExp("key=%2Flibrary%2Fmetadata%2F(\\d+)");
        const apiResourceUrl = "https://plex.tv/api/v2/resources?includeHttps=1&includeRelay=1&X-Plex-Client-Identifier={clientid}&X-Plex-Token={token}";
        const apiLibraryUrl = "{baseuri}/library/metadata/{id}?X-Plex-Token={token}";
        const downloadUrl = "{baseuri}{partkey}?X-Plex-Token={token}";
        const accessTokenXpath = "//Device[@clientIdentifier='{clientid}']/@accessToken";
        const baseUriXpath = "//Device[@clientIdentifier='{clientid}']/Connection[@local='0']/@uri"; // 
        const partKeyXpath = "//Media/Part[1]/@key";


        const accessToken = null;
        const baseUri = null;




        const bitRate = function(bitrate) {
            let conv = bitrate / 1000;
            return [conv.toFixed(1), " Mbps"].join("");
        }

        const niceBytes = function(x) {
            const units = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
            let l = 0,
                n = parseInt(x, 10) || 0;
            while (n >= 1024 && ++l) {
                n = n / 1024;
            }
            return (n.toFixed(n < 10 && l > 0 ? 1 : 0) + ' ' + units[l]);
        }


        const getMediaInfo = function(data, Dev) {


            data.MediaContainer.Metadata.forEach(function(Metadata) {

                if (Metadata.type === 'movie') {
                    if (typeof Metadata.originallyAvailableAt != "undefined") {
                        document.querySelectorAll('[data-testid="preplay-secondTitle"]')[0].innerHTML = Metadata.originallyAvailableAt;
                    }
                }


                if (Metadata.type === 'movie' || Metadata.type === 'episode') {

                    Metadata.Media.forEach(function(Media) {

                        let videoResolution = Media.videoResolution;
                        let bitrate = bitRate(Media.bitrate);



                        if (videoResolution.match(/\D/) == null) {
                            videoResolution += "p";
                        } else {
                            videoResolution = videoResolution.toUpperCase();
                        }

                        Media.Part.forEach(function(Part) {

                            let size = niceBytes(Part.size);

                            let menuElement = document.querySelectorAll('[data-testid="preplay-more"]')[0];
                            let elClone = document.createElement("a"); // menuElement.cloneNode(true);  
                            elClone.setAttribute('class', menuElement.getAttribute('class'));
                            elClone.id = 'downloader-button';
                            let style = 'text-transform: none;margin-right: 8px;padding-left: 8px; padding-right: 8px;padding-top: 4px;';

                            if (Dev.relay == true) {
                                style += 'background-color: rgb(249 190 3 / 20%);';
                            }

                            elClone.style = style;
                            elClone.setAttribute('target', '_blank');


                            if (Dev.relay == true) {
                                elClone.href = [Dev.serverUrl, Part.key, "?download=1&X-Plex-Token=", Dev.accessToken].join("");
                            } else {
                                elClone.href = [Dev.serverUrl, Part.key, "?X-Plex-Token=", Dev.accessToken].join("");
                            }

                            elClone.innerHTML = [bitrate, ", ", videoResolution, ", ", size].join("");


                            menuElement.parentNode.insertBefore(elClone, menuElement);


                        });
                    });

                }


            });


        }

        const setServer = function(Dev) {


            const request = new XMLHttpRequest();
            request.onreadystatechange = function() {
                if (request.readyState == 4 && request.status == 200) {

                    if (window.Remote == false) {
                        getMediaInfo(JSON.parse(request.responseText), Dev);

                        if (Dev.relay == false) {
                            window.Remote = true;
                        }
                    }

                }
            };
            var mediaUrl = apiLibraryUrl.replace('{baseuri}', Dev.serverUrl).replace('{id}', Dev.metadataId).replace('{token}', Dev.accessToken);

            request.open("GET", mediaUrl, true);
            request.setRequestHeader("Accept", "application/json");
            request.send();

        }


        const getServers = function() {
            const clientId = clientIdRegex.exec(window.location.href);
            if (clientId && clientId.length == 2) {



                const request = new XMLHttpRequest();
                request.onreadystatechange = function() {
                    if (request.readyState == 4 && request.status == 200) {
                        const data = JSON.parse(request.responseText);

                        data.forEach(function(Device) {
                            if (Device.clientIdentifier === clientId[1]) {

                                const metadataId = metadataIdRegex.exec(window.location.href);
                                if (metadataId && metadataId.length == 2) {

                                    Device.connections.forEach(function(Connection) {

                                        if (Connection.local == false) {



                                            setServer({
                                                accessToken: Device.accessToken,
                                                metadataId: metadataId[1],
                                                local: Connection.local,
                                                serverUrl: Connection.uri,
                                                relay: Connection.relay
                                            });




                                        }




                                    });
                                } else {
                                    // alert("You are currently not viewing a media item.");
                                }

                            }
                        });

                    }
                };
                var url = apiResourceUrl.replace('{token}', localStorage.myPlexAccessToken).replace('{clientid}', clientId[1]);
                request.open("GET", url, true);
                request.setRequestHeader("Accept", "application/json");
                request.send();




            } else {
                // alert("You are currently not viewing a media item.");
            }
        };


        self.init = function() {
            if (typeof localStorage.myPlexAccessToken != "undefined") {
                getServers();
            } else {
                // alert("You are currently not browsing or logged into a Plex web environment.");
            }
        };

        return self;
    })();
}




function getMenuElement() {
    return document.querySelectorAll('[data-testid="preplay-togglePlayedState"]')[0];
}

function injectionWrapper() {
    if (document.URL.includes('/details')) {

        window.Remote = false;

        let checkExist = setInterval(function() {
            if (getMenuElement()) {
                clearInterval(checkExist);
                plxDwnld.init();


            }
        }, 100);
    }
}



window.addEventListener("hashchange", injectionWrapper, false);

window.onload = (event) => {
    console.log('page is fully loaded');
    injectionWrapper();
};
