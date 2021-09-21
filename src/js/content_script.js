"use strict";

if (typeof plxDwnld === "undefined") {

    window.plxDwnld = (function() {

        const self = {};
        const machineIdRegex = new RegExp("server\/([a-f0-9]{40})\/");
        const metadataIdRegex = new RegExp("key=%2Flibrary%2Fmetadata%2F(\\d+)");
        const apiResourceUrl = "https://plex.tv/api/v2/resources.json?includeHttps=1&includeRelay=1&X-Plex-Client-Identifier={machineid}&X-Plex-Token={token}"; // 
        const apiLibraryUrl = "{baseuri}/library/metadata/{id}?X-Plex-Token={token}";
        const downloadUrl = "{baseuri}{partkey}?X-Plex-Token={token}";
        const accessTokenXpath = "//Device[@clientIdentifier='{machineid}']/@accessToken";
        const baseUriXpath = "//Device[@clientIdentifier='{machineid}']/Connection[@local='0']/@uri"; // 
        const partKeyXpath = "//Media/Part[1]/@key";

// search the token to get access to the value of X-Plex-Client-Identifier
// https://plex.tv/devices.xml?X-Plex-Token=GhVspy12w9xZ3FNAitod&X-Plex-Language=en 

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

/*
                if (Metadata.type === 'movie') {
                    if (typeof Metadata.originallyAvailableAt != "undefined") {
                        document.querySelectorAll('[data-testid="preplay-secondTitle"]')[0].innerHTML = Metadata.originallyAvailableAt;
                    }
                }
*/

                if (Metadata.type === 'movie' || Metadata.type === 'episode') {

                    Metadata.Media.forEach(function(Media) {

                        let videoResolution = Media.videoResolution;
                        let bitrate = bitRate(Media.bitrate);

						// console.error(Media);

						

                        if (videoResolution.match(/\D/) == null) {
                            videoResolution += "p";
                        } else {
                            videoResolution = videoResolution.toUpperCase();
                        }
						
						/*
						document.querySelectorAll('[data-testid="preplay-secondTitle"]')[0].innerHTML = [Metadata.title.split(' ').join('.'), Metadata.year, videoResolution, Media.videoCodec.toUpperCase().replace("H264","x264"), Media.container].join('.')
							+ "<br>" + document.querySelectorAll('[data-testid="preplay-secondTitle"]')[0].innerHTML;
						*/
						
                        Media.Part.forEach(function(Part) {

                            let size = niceBytes(Part.size);
							
							
							if (Dev.relay == true) {								
								document.querySelectorAll('[data-qa-url="' + Dev.serverUrl + '"] .dropdown-menu')[0].innerHTML += '<li><a style="padding: 4px 20px;font-size: 13px;" target="_blank" href="' + [Dev.serverUrl, Part.key.replace("file", [Metadata.title.split(' ').join('.'), Metadata.year, videoResolution, Media.videoCodec.toUpperCase().replace("H264","x264")].join('.')), "?download=1&X-Plex-Token=", Dev.accessToken].join("") + '" download="test.mkv"><span class="dropdown-truncated-label">' + [bitrate, ", ", videoResolution, ", ", size].join("") + '</span></a></li>';
							} else {
								document.querySelectorAll('[data-qa-url="' + Dev.serverUrl + '"] .dropdown-menu')[0].innerHTML += '<li><a style="padding: 4px 20px;font-size: 13px;" target="_blank" href="' + [Dev.serverUrl, Part.key.replace("file", [Metadata.title.split(' ').join('.'), Metadata.year, videoResolution, Media.videoCodec.toUpperCase().replace("H264","x264")].join('.')), "?X-Plex-Token=", Dev.accessToken].join("") + '" download="test.mkv"><span class="dropdown-truncated-label">' + [bitrate, ", ", videoResolution, ", ", size].join("") + '</span></a></li>';
							}							
/*						
							*/
							// Calculate filesize base on base on bitrate and duration
							// https://blog.frame.io/2017/03/06/calculate-video-bitrates/?__cf_chl_jschl_tk__=pmd_HxqdyHz8ycUjyiqoEZYp4PfDjDYtrMml_m5_rQdX79I-1631592480-0-gqNtZGzNAfujcnBszQiR
							

							// const session = "{baseuri}&X-Plex-Client-Identifier={machineid}&X-Plex-Token={token}";
							
							const session = "{baseuri}/video/:/transcode/universal/start.m3u8?protocol=hls&hasMDE=1&session={session}&X-Plex-Token={token}&path=%2Flibrary%2Fmetadata%2F{id}{extra}&addDebugOverlay=0&subtitles=burn&X-Plex-Client-Profile-Extra=add-limitation%28scope%3DvideoCodec%26scopeName%3D%2A%26type%3DupperBound%26name%3Dvideo.height%26value%3D1280%26replace%3Dtrue%29%2Badd-limitation%28scope%3DvideoCodec%26scopeName%3D%2A%26type%3DupperBound%26name%3Dvideo.bitrate%26value%3D4000%26replace%3Dtrue%29%2Bappend-transcode-target-codec%28type%3DvideoProfile%26context%3Dstreaming%26audioCodec%3Daac%26protocol%3Dhls%29&X-Plex-Incomplete-Segments=1&X-Plex-Product=Plex%20Web&X-Plex-Version=4.65.0&X-Plex-Client-Identifier=s4cr93pq4ml4w6li6gsc6984&X-Plex-Platform=Chrome&X-Plex-Platform-Version=92.0&X-Plex-Sync-Version=2&X-Plex-Features=external-media%2Cindirect-media&X-Plex-Model=hosted&X-Plex-Device=Windows&X-Plex-Device-Name=Chrome&X-Plex-Device-Screen-Resolution=1920x259%2C1920x1080&X-Plex-Language=en";
// &offset=0&copyts=1
							console.error(
								session.replace('{baseuri}', Dev.serverUrl)
								.replace('{extra}', '&partIndex=0&maxVideoBitrate=2000&mediaIndex=0&videoResolution=1280x720&autoAdjustQuality=0&directStreamAudio=1&mediaBufferSize=102400&Accept-Language=en')
								.replace('{id}', Dev.metadataId).replace('{token}', Dev.accessToken)
								.replace('{session}','by2jo9rzolb75e39xmgifvp0')
							);
							
							


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
						let elClone = document.createElement("span"); // menuElement.cloneNode(true); // document.createElement("a"); //  
						elClone.setAttribute('class', menuElement.getAttribute('class'));
						elClone.setAttribute('data-qa-url', Dev.serverUrl);
						elClone.classList.add("dropdown");
						elClone.id = 'downloader-button';
						
						elClone.onclick = function () {
							this.classList.toggle("open");
						}

						let style = 'text-transform: none;margin-right: 10px;padding-left: 8px; padding-right: 8px;padding-top: 4px;overflow: inherit !important;';

						if (Dev.relay == true) {
						    style += 'background-color: rgb(249 190 3 / 20%);';
						}

						elClone.style = style;

						elClone.innerHTML = 			
							'<svg fill="hsla(0,0%,100%,.7)" style="margin-top: 2px;" version="1.1" viewBox="0 0 1024 1024" xml:space="preserve" xmlns="http://www.w3.org/2000/svg">'
								//+ '<polygon points="921.3 655.7 921.3 900.4 102.7 900.4 102.7 655.7 215.2 655.7 215.2 787.9 808.8 787.9 808.8 655.7"/><path d="m906.3 655.7v83.1 131.3 30.3l15-15h-21.9-59.7-87.8-107.6-117.8-118.5-110.9-93.8-67.4c-10.6 0-21.3-0.4-31.9 0h-1.3l15 15v-83.1-131.3-30.3l-15 15h98.7 13.8l-15-15v115.7 16.5c0 8.1 6.9 15 15 15h59.1 141.8 171.6 148.2c23.9 0 47.9 0.6 71.9 0h1c8.1 0 15-6.9 15-15v-115.7-16.5l-15 15h98.7 13.8c7.8 0 15.4-6.9 15-15s-6.6-15-15-15h-98.7-13.8c-8.1 0-15 6.9-15 15v115.7 16.5l15-15h-59.1-141.8-171.6-148.2-48.8c-7.7 0-15.4-0.4-23.1 0h-1l15 15v-115.7-16.5c0-8.1-6.9-15-15-15h-98.7-13.8c-8.1 0-15 6.9-15 15v83.1 131.3 30.3c0 8.1 6.9 15 15 15h21.9 59.7 87.8 107.6 117.8 118.5 110.9 93.8 67.4c10.6 0 21.3 0.2 31.9 0h1.3c8.1 0 15-6.9 15-15v-83.1-131.3-30.3c0-7.8-6.9-15.4-15-15-8.1 0.3-15 6.6-15 15z"/>'
								 + '<polygon points="751.3 425.5 512 670.9 272.7 425.5 430 425.5 430 123.6 594 123.6 594 425.5"/><path d="m740.7 414.9c-7.9 8.1-15.9 16.3-23.8 24.4-19 19.5-38.1 39.1-57.1 58.6-23 23.6-46.1 47.3-69.1 70.9-19.9 20.4-39.9 40.9-59.8 61.3-9.6 9.9-20.1 19.4-29.1 29.8l-0.4 0.4h21.2c-7.9-8.1-15.9-16.3-23.8-24.4-19-19.5-38.1-39.1-57.1-58.6-23-23.6-46.1-47.3-69.1-70.9-19.9-20.4-39.8-40.9-59.8-61.3-9.6-9.9-18.9-20.5-29.1-29.8l-0.4-0.4c-3.5 8.5-7.1 17.1-10.6 25.6h137.7 19.5c8.1 0 15-6.9 15-15v-102.2-162.7-36.9l-15 15h144 20.1l-15-15v102.2 162.7 36.9c0 8.1 6.9 15 15 15h137.7 19.5c7.8 0 15.4-6.9 15-15s-6.6-15-15-15h-137.7-19.5l15 15v-102.2-162.7-36.9c0-8.1-6.9-15-15-15h-144-20.1c-8.1 0-15 6.9-15 15v102.2 162.7 36.9l15-15h-137.7-19.5c-13.1 0-19.6 16.3-10.6 25.6 7.9 8.1 15.9 16.3 23.8 24.4 19 19.5 38.1 39.1 57.1 58.6 23 23.6 46.1 47.3 69.1 70.9 19.9 20.4 39.8 40.9 59.8 61.3 9.7 9.9 19.1 20.3 29.1 29.8l0.4 0.4c5.6 5.7 15.6 5.8 21.2 0 7.9-8.1 15.9-16.3 23.8-24.4 19-19.5 38.1-39.1 57.1-58.6 23-23.6 46.1-47.3 69.1-70.9 19.9-20.4 39.9-40.9 59.8-61.3 9.7-9.9 19.7-19.6 29.1-29.8l0.4-0.4c5.7-5.8 5.8-15.4 0-21.2-5.7-5.7-15.5-5.9-21.2 0z"/>'
							+ '</svg>'
							+ '<ul style="text-align: left;margin-top: 4px;padding-top: 8px;padding-bottom: 8px;border-radius: 4px;" class="dropdown-menu">'
							+ '</ul>'



						menuElement.parentNode.insertBefore(elClone, menuElement);						
						
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
            const machineId = machineIdRegex.exec(window.location.href);
            if (machineId && machineId.length == 2) {



                const request = new XMLHttpRequest();
                request.onreadystatechange = function() {
                    if (request.readyState == 4 && request.status == 200) {
                        const data = JSON.parse(request.responseText);

                        data.forEach(function(Device) {
                            if (Device.clientIdentifier === machineId[1]) {

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

				
                var url = apiResourceUrl.replace('{token}', localStorage.myPlexAccessToken).replace('{machineid}', machineId[1]);
				
				
				
				

				
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
