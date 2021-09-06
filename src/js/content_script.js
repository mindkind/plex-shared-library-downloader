"use strict";

if (typeof plxDwnld === "undefined") {

	window.plxDwnld = (function() {

        const self = {};
        const clientIdRegex = new RegExp("server\/([a-f0-9]{40})\/");
        const metadataIdRegex = new RegExp("key=%2Flibrary%2Fmetadata%2F(\\d+)");
        const apiResourceUrl = "https://plex.tv/api/resources?includeHttps=1&X-Plex-Token={token}";
        const apiLibraryUrl = "{baseuri}/library/metadata/{id}?X-Plex-Token={token}";
        const downloadUrl = "{baseuri}{partkey}?X-Plex-Token={token}";
        const accessTokenXpath = "//Device[@clientIdentifier='{clientid}']/@accessToken";
        const baseUriXpath = "//Device[@clientIdentifier='{clientid}']/Connection[@local='0']/@uri"; // 
        const partKeyXpath = "//Media/Part[1]/@key";
        let accessToken = null;
        let baseUri = null;
		
        const getXml = function(url, callback, base = null) {
            const request = new XMLHttpRequest();
            request.onreadystatechange = function() {
                if (request.readyState == 4 && request.status == 200) {
					// console.error(request.responseXML);
					
					if (base) {
						callback(request.responseXML, base);
					}
					else {
						callback(request.responseXML);
					}
                }
            };
            request.open("GET", url);
            request.send();
        };

        const getMetadata = function(xml) {
            const clientId = clientIdRegex.exec(window.location.href);
            if (clientId && clientId.length == 2) {
				
				
				
                const accessTokenNode = xml.evaluate(accessTokenXpath.replace('{clientid}', clientId[1]), xml, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
				// const baseUriNode = xml.evaluate(baseUriXpath.replace('{clientid}', clientId[1]), xml, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);


				 
                if (accessTokenNode.singleNodeValue) {
                    accessToken = accessTokenNode.singleNodeValue.textContent;
					
					
					var headings = xml.evaluate(baseUriXpath.replace('{clientid}', clientId[1]), xml, null, XPathResult.ANY_TYPE, null);
					/* Search the document for all h2 elements.
					 * The result will likely be an unordered node iterator. */
					var thisHeading = headings.iterateNext();
					// var alertText = "Level 2 headings in this document are:\n";
					while (thisHeading) {
						
						
						baseUri = thisHeading.textContent;
						const metadataId = metadataIdRegex.exec(window.location.href);

						// alert(apiLibraryUrl.replace('{baseuri}', baseUri).replace('{id}', metadataId[1]).replace('{token}', accessToken));
						
						if (metadataId && metadataId.length == 2) {
							getXml(apiLibraryUrl.replace('{baseuri}', baseUri).replace('{id}', metadataId[1]).replace('{token}', accessToken), getDownloadUrl, baseUri);
						} else {
							alert("You are currently not viewing a media item.");
						}
					
					   // alert(thisHeading.textContent);
					   thisHeading = headings.iterateNext();
					   
					}		

					

					
					
                } else {
                    alert("Cannot find a valid accessToken.");
                }
				
				
				
			
			/*
				
                if (accessTokenNode.singleNodeValue && baseUriNode.singleNodeValue) {
                    accessToken = accessTokenNode.singleNodeValue.textContent;
                    baseUri = baseUriNode.singleNodeValue.textContent;
                    const metadataId = metadataIdRegex.exec(window.location.href);

					alert(apiLibraryUrl.replace('{baseuri}', baseUri).replace('{id}', metadataId[1]).replace('{token}', accessToken));
					
                    if (metadataId && metadataId.length == 2) {
                        getXml(apiLibraryUrl.replace('{baseuri}', baseUri).replace('{id}', metadataId[1]).replace('{token}', accessToken), getDownloadUrl);
                    } else {
                        alert("You are currently not viewing a media item.");
                    }
                } else {
                    alert("Cannot find a valid accessToken.");
                }
			*/
				
				
            } else {
                alert("You are currently not viewing a media item.");
            }
        };

        const getDownloadUrl = function(xml, base) {
            const partKeyNode = xml.evaluate(partKeyXpath, xml, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);

/*
			const typeNode = xml.evaluate("//Video/@typeTitle", xml, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
			const titleNode = xml.evaluate("//Video/@title", xml, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
			const yearNode = xml.evaluate("//Video/@year", xml, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
			const grandparentTitleNode = xml.evaluate("//Video/@grandparentTitle", xml, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
			const seasonNode = xml.evaluate("//Video/@parentIndex", xml, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
			const episodeNode = xml.evaluate("//Video/@index", xml, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
			const videoResolutionNode = xml.evaluate("//Media/@videoResolution", xml, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
			const containerNode = xml.evaluate("//Media/@container", xml, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
			
			
			if (typeNode.singleNodeValue) {
				alert(typeNode.singleNodeValue.textContent);
			}
			if (yearNode.singleNodeValue) {
				alert(yearNode.singleNodeValue.textContent);
			}
			if (titleNode.singleNodeValue) {
				alert(titleNode.singleNodeValue.textContent);
			}			
			if (grandparentTitleNode.singleNodeValue) {
				alert(grandparentTitleNode.singleNodeValue.textContent);
			}			
			if (seasonNode.singleNodeValue) {
				alert(seasonNode.singleNodeValue.textContent);
			}
			if (episodeNode.singleNodeValue) {
				alert(episodeNode.singleNodeValue.textContent);
			}
			if (videoResolutionNode.singleNodeValue) {
				alert(videoResolutionNode.singleNodeValue.textContent);
			}
			if (containerNode.singleNodeValue) {
				alert(containerNode.singleNodeValue.textContent);
			}
*/			
            if (partKeyNode.singleNodeValue) {

				injectButton(downloadUrl.replace('{baseuri}', base).replace('{partkey}', partKeyNode.singleNodeValue.textContent).replace('{token}', accessToken));

                // window.location.href = downloadUrl.replace('{baseuri}', baseUri).replace('{partkey}', partKeyNode.singleNodeValue.textContent).replace('{token}', accessToken);			
				
				
            } else {
                alert("You are currently not viewing a media item.");
            }
        };
		const injectButton = function(url) {
			
			let menuElement = document.querySelectorAll('[data-testid="preplay-togglePlayedState"]')[0];
			let elClone = document.createElement("a");  // menuElement.cloneNode(true); 
			let elClass = menuElement.getAttribute('class');
			
			elClone.setAttribute('data-qa-id', 'preplay-download');
			elClone.setAttribute('class', elClass);	
			elClone.setAttribute('style', 'margin-right: 10px;');	
			elClone.setAttribute('download', 'test.mkv');
			elClone.setAttribute('target', '_blank');
			
			elClone.id = 'downloader-button';				
			elClone.href = url;
			
			
			// download icon
			elClone.innerHTML = '<svg fill="hsla(0,0%,100%,.7)" style="margin-top: 5px;width:18px;height:18px;" version="1.1" viewBox="0 0 1024 1024" xml:space="preserve" xmlns="http://www.w3.org/2000/svg"><polygon points="921.3 655.7 921.3 900.4 102.7 900.4 102.7 655.7 215.2 655.7 215.2 787.9 808.8 787.9 808.8 655.7"/><path d="m906.3 655.7v83.1 131.3 30.3l15-15h-21.9-59.7-87.8-107.6-117.8-118.5-110.9-93.8-67.4c-10.6 0-21.3-0.4-31.9 0h-1.3l15 15v-83.1-131.3-30.3l-15 15h98.7 13.8l-15-15v115.7 16.5c0 8.1 6.9 15 15 15h59.1 141.8 171.6 148.2c23.9 0 47.9 0.6 71.9 0h1c8.1 0 15-6.9 15-15v-115.7-16.5l-15 15h98.7 13.8c7.8 0 15.4-6.9 15-15s-6.6-15-15-15h-98.7-13.8c-8.1 0-15 6.9-15 15v115.7 16.5l15-15h-59.1-141.8-171.6-148.2-48.8c-7.7 0-15.4-0.4-23.1 0h-1l15 15v-115.7-16.5c0-8.1-6.9-15-15-15h-98.7-13.8c-8.1 0-15 6.9-15 15v83.1 131.3 30.3c0 8.1 6.9 15 15 15h21.9 59.7 87.8 107.6 117.8 118.5 110.9 93.8 67.4c10.6 0 21.3 0.2 31.9 0h1.3c8.1 0 15-6.9 15-15v-83.1-131.3-30.3c0-7.8-6.9-15.4-15-15-8.1 0.3-15 6.6-15 15z"/><polygon points="751.3 425.5 512 670.9 272.7 425.5 430 425.5 430 123.6 594 123.6 594 425.5"/><path d="m740.7 414.9c-7.9 8.1-15.9 16.3-23.8 24.4-19 19.5-38.1 39.1-57.1 58.6-23 23.6-46.1 47.3-69.1 70.9-19.9 20.4-39.9 40.9-59.8 61.3-9.6 9.9-20.1 19.4-29.1 29.8l-0.4 0.4h21.2c-7.9-8.1-15.9-16.3-23.8-24.4-19-19.5-38.1-39.1-57.1-58.6-23-23.6-46.1-47.3-69.1-70.9-19.9-20.4-39.8-40.9-59.8-61.3-9.6-9.9-18.9-20.5-29.1-29.8l-0.4-0.4c-3.5 8.5-7.1 17.1-10.6 25.6h137.7 19.5c8.1 0 15-6.9 15-15v-102.2-162.7-36.9l-15 15h144 20.1l-15-15v102.2 162.7 36.9c0 8.1 6.9 15 15 15h137.7 19.5c7.8 0 15.4-6.9 15-15s-6.6-15-15-15h-137.7-19.5l15 15v-102.2-162.7-36.9c0-8.1-6.9-15-15-15h-144-20.1c-8.1 0-15 6.9-15 15v102.2 162.7 36.9l15-15h-137.7-19.5c-13.1 0-19.6 16.3-10.6 25.6 7.9 8.1 15.9 16.3 23.8 24.4 19 19.5 38.1 39.1 57.1 58.6 23 23.6 46.1 47.3 69.1 70.9 19.9 20.4 39.8 40.9 59.8 61.3 9.7 9.9 19.1 20.3 29.1 29.8l0.4 0.4c5.6 5.7 15.6 5.8 21.2 0 7.9-8.1 15.9-16.3 23.8-24.4 19-19.5 38.1-39.1 57.1-58.6 23-23.6 46.1-47.3 69.1-70.9 19.9-20.4 39.9-40.9 59.8-61.3 9.7-9.9 19.7-19.6 29.1-29.8l0.4-0.4c5.7-5.8 5.8-15.4 0-21.2-5.7-5.7-15.5-5.9-21.2 0z"/></svg>';

			menuElement.parentNode.insertBefore(elClone, menuElement);			
		}

        self.init = function() {
            if (typeof localStorage.myPlexAccessToken != "undefined") {
				// alert(apiResourceUrl.replace('{token}', localStorage.myPlexAccessToken));
                getXml(apiResourceUrl.replace('{token}', localStorage.myPlexAccessToken), getMetadata);
            } else {
                alert("You are currently not browsing or logged into a Plex web environment.");
            }
        };

        return self;
    })();
}


function getMenuElement() {
    return document.querySelectorAll('[data-testid="preplay-togglePlayedState"]')[0];
}

function injectionWrapper() {
    // we only want to inject on the media details page
    if (document.URL.includes('/details')) {
        // set an interval to check if the menu elemenet has rendered
        let checkExist = setInterval(function() {
          if (getMenuElement()) {
              clearInterval(checkExist);
			  plxDwnld.init();
              // injectDownloadButton();
			  
          }
        }, 100);
    }
}

window.addEventListener("hashchange", injectionWrapper, false);
injectionWrapper();

