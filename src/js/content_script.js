"use strict";

if (typeof plxDwnld === "undefined") {

    window.plxDwnld = (function() {

        const self = {};

        const apiResourceUrl = "https://plex.tv/api/v2/resources.json?includeHttps=1&includeRelay=1&X-Plex-Client-Identifier={machineid}&X-Plex-Token={token}";
        const apiLibraryUrl = "{baseuri}/library/metadata/{id}?X-Plex-Token={token}";


        const getMachineId = function() {

            const machineIdRegex = new RegExp("server\/([a-f0-9]{40})\/");
            const machineId = machineIdRegex.exec(window.location.href);
            if (machineId && machineId.length == 2) {
                return machineId[1];
            }
            return false;
        }

        const getMediaId = function() {

            const metadataIdRegex = new RegExp("key=%2Flibrary%2Fmetadata%2F(\\d+)");
            const metadataId = metadataIdRegex.exec(window.location.href);
            if (metadataId && metadataId.length == 2) {
                return metadataId[1];
            }
            return false;
        }

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


                if (Metadata.type === 'movie' || Metadata.type === 'episode') {




                    Metadata.Media.forEach(function(Media) {

                        let videoResolution = Media.videoResolution;
                        let bitrate = bitRate(Media.bitrate);

                        let title;
                        let filename;


                        if (videoResolution.match(/\D/) == null) {
                            videoResolution += "p";
                        } else {
                            videoResolution = videoResolution.toUpperCase();
                        }


                        if (Metadata.type === 'episode') {
                            title = [Metadata.grandparentTitle.replace('&', 'and'), "S" + ('0' + Metadata.parentIndex)
                                    .slice(-2) + "E" + ('0' + Metadata.index)
                                    .slice(-2), Metadata.title
                                ].join(" - ")
                                .replace('&', 'and')
                                .replace(/[&\/\\#,+()$~%.":*?<>{}]/g, ' ')
                                .replace(/\s+/g, ' ')
                                .trim();
                        } else {
                            title = Metadata.title.replace('&', 'and')
                                .replace(/[&\/\\#,+()$~%.":*?<>{}]/g, ' ')
                                .replace(/\s+/g, ' ')
                                .trim();
                        }


                        Media.Part.forEach(function(Part) {

                            let size = niceBytes(Part.size);


                            if (Metadata.type === 'episode') {
                                filename = Part.key.replace("file", [title, videoResolution, Media.videoCodec.toUpperCase()
                                    .replace("H264", "x264")
                                    .replace("HEVC", "x265")
                                ].join('.'));

                            } else {
                                filename = Part.key.replace("file", [title, Metadata.year, videoResolution, Media.videoCodec.toUpperCase()
                                    .replace("H264", "x264")
                                    .replace("HEVC", "x265")
                                ].join('.'));
                            }


                            let dwlUrl = [Dev.serverUrl, filename, "?X-Plex-Token=", Dev.accessToken].join("");

                            if (Dev.relay == true) {
                                document.querySelectorAll('[data-qa-url="' + Dev.serverUrl + '"] .dropdown-menu')[0].innerHTML += '<li><a style="padding: 4px 20px;font-size: 13px;" target="_blank" href="' + dwlUrl + '" download><span class="dropdown-truncated-label">' + [bitrate, ", ", videoResolution, ", ", size].join("") + '</span></a></li>';
                            } else {
                                document.querySelectorAll('[data-qa-url="' + Dev.serverUrl + '"] .dropdown-menu')[0].innerHTML += '<li><a style="padding: 4px 20px;font-size: 13px;" target="_blank" href="' + dwlUrl + '" download><span class="dropdown-truncated-label">' + [bitrate, ", ", videoResolution, ", ", size].join("") + '</span></a></li>';
                            }

                            /*
                            const session = "{baseuri}/video/:/transcode/universal/start.m3u8?protocol=hls&hasMDE=1&session={session}&X-Plex-Token={token}&path=%2Flibrary%2Fmetadata%2F{id}{extra}&addDebugOverlay=0&subtitles=burn&X-Plex-Client-Profile-Extra=add-limitation%28scope%3DvideoCodec%26scopeName%3D%2A%26type%3DupperBound%26name%3Dvideo.height%26value%3D1280%26replace%3Dtrue%29%2Badd-limitation%28scope%3DvideoCodec%26scopeName%3D%2A%26type%3DupperBound%26name%3Dvideo.bitrate%26value%3D4000%26replace%3Dtrue%29%2Bappend-transcode-target-codec%28type%3DvideoProfile%26context%3Dstreaming%26audioCodec%3Daac%26protocol%3Dhls%29&X-Plex-Incomplete-Segments=1&X-Plex-Product=Plex%20Web&X-Plex-Version=4.65.0&X-Plex-Client-Identifier=s4cr93pq4ml4w6li6gsc6984&X-Plex-Platform=Chrome&X-Plex-Platform-Version=92.0&X-Plex-Sync-Version=2&X-Plex-Features=external-media%2Cindirect-media&X-Plex-Model=hosted&X-Plex-Device=Windows&X-Plex-Device-Name=Chrome&X-Plex-Device-Screen-Resolution=1920x259%2C1920x1080&X-Plex-Language=en";
                            console.error(
                            	session.replace('{baseuri}', Dev.serverUrl)
                            	.replace('{extra}', '&partIndex=0&maxVideoBitrate=2000&mediaIndex=0&videoResolution=1280x720&autoAdjustQuality=0&directStreamAudio=1&mediaBufferSize=102400&Accept-Language=en')
                            	.replace('{id}', Dev.metadataId).replace('{token}', Dev.accessToken)
                            	.replace('{session}','by2jo9rzolb75e39xmgifvp0')
                            );
                            */



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


                        let menuElement = document.querySelectorAll('[data-testid="preplay-more"]')[0];
                        let elClone = document.createElement("span"); // menuElement.cloneNode(true);
                        elClone.setAttribute('class', menuElement.getAttribute('class'));
                        elClone.setAttribute('data-qa-url', Dev.serverUrl);
                        elClone.classList.add("dropdown");
                        elClone.id = 'downloader-button';

                        elClone.onmouseover = function() {
                            this.classList.toggle("open");
                        }
                        elClone.onmouseout = function() {
                            this.classList.toggle("open");
                        }

                        let style = 'text-transform: none;margin-right: 10px;padding-left: 8px; padding-right: 8px;padding-top: 4px;overflow: inherit !important;';

                        if (Dev.relay == true) {
                            style += 'background-color: rgb(249 190 3 / 20%);';
                        }

                        elClone.style = style;

                        elClone.innerHTML = '<svg fill="hsla(0,0%,100%,.7)" style="margin-top: 2px;" version="1.1" viewBox="0 0 1024 1024" xml:space="preserve" xmlns="http://www.w3.org/2000/svg">' + '<polygon points="751.3 425.5 512 670.9 272.7 425.5 430 425.5 430 123.6 594 123.6 594 425.5"/><path d="m740.7 414.9c-7.9 8.1-15.9 16.3-23.8 24.4-19 19.5-38.1 39.1-57.1 58.6-23 23.6-46.1 47.3-69.1 70.9-19.9 20.4-39.9 40.9-59.8 61.3-9.6 9.9-20.1 19.4-29.1 29.8l-0.4 0.4h21.2c-7.9-8.1-15.9-16.3-23.8-24.4-19-19.5-38.1-39.1-57.1-58.6-23-23.6-46.1-47.3-69.1-70.9-19.9-20.4-39.8-40.9-59.8-61.3-9.6-9.9-18.9-20.5-29.1-29.8l-0.4-0.4c-3.5 8.5-7.1 17.1-10.6 25.6h137.7 19.5c8.1 0 15-6.9 15-15v-102.2-162.7-36.9l-15 15h144 20.1l-15-15v102.2 162.7 36.9c0 8.1 6.9 15 15 15h137.7 19.5c7.8 0 15.4-6.9 15-15s-6.6-15-15-15h-137.7-19.5l15 15v-102.2-162.7-36.9c0-8.1-6.9-15-15-15h-144-20.1c-8.1 0-15 6.9-15 15v102.2 162.7 36.9l15-15h-137.7-19.5c-13.1 0-19.6 16.3-10.6 25.6 7.9 8.1 15.9 16.3 23.8 24.4 19 19.5 38.1 39.1 57.1 58.6 23 23.6 46.1 47.3 69.1 70.9 19.9 20.4 39.8 40.9 59.8 61.3 9.7 9.9 19.1 20.3 29.1 29.8l0.4 0.4c5.6 5.7 15.6 5.8 21.2 0 7.9-8.1 15.9-16.3 23.8-24.4 19-19.5 38.1-39.1 57.1-58.6 23-23.6 46.1-47.3 69.1-70.9 19.9-20.4 39.9-40.9 59.8-61.3 9.7-9.9 19.7-19.6 29.1-29.8l0.4-0.4c5.7-5.8 5.8-15.4 0-21.2-5.7-5.7-15.5-5.9-21.2 0z"/></svg>' +
                            '<ul style="text-align: left;margin-top: 4px;padding-top: 8px;padding-bottom: 8px;border-radius: 4px;" class="dropdown-menu"></ul>';

                        menuElement.parentNode.insertBefore(elClone, menuElement);

                        getMediaInfo(JSON.parse(request.responseText), Dev);


                        if (Dev.relay == false) {
                            window.Remote = true;
                        }
                    }

                }
            };
            var mediaUrl = apiLibraryUrl.replace('{baseuri}', Dev.serverUrl)
                .replace('{id}', Dev.mediaId)
                .replace('{token}', Dev.accessToken);

            request.open("GET", mediaUrl, true);
            request.setRequestHeader("Accept", "application/json");
            request.send();

        }


        const getServers = function() {

            if (getMachineId() !== false) {
                const request = new XMLHttpRequest();
                request.onreadystatechange = function() {
                    if (request.readyState == 4 && request.status == 200) {
                        const data = JSON.parse(request.responseText);

                        data.forEach(function(Device) {
                            if (Device.clientIdentifier === getMachineId()) {

                                if (getMediaId() !== false) {

                                    Device.connections.forEach(function(Connection) {

                                        if (Connection.local == false) {
                                            setServer({
                                                accessToken: Device.accessToken,
                                                mediaId: getMediaId(),
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


                request.open("GET", apiResourceUrl.replace('{token}', localStorage.myPlexAccessToken)
                    .replace('{machineid}', getMachineId()), true);
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




function getMenu() {
    return document.querySelectorAll('[data-testid="preplay-togglePlayedState"]')[0];
}

function inject() {

    if (document.URL.includes('/details')) {

        window.Remote = false;
        let checkExist = setInterval(function() {
            if (getMenu()) {
                clearInterval(checkExist);
                plxDwnld.init();

            }
        }, 100);

    }
}


window.addEventListener("hashchange", inject, false);

window.onload = (event) => {
    inject();
};
