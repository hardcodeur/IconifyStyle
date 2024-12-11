const gridElt = document.querySelector("div[data-icons-grid]");
const nbFake = 40;


export function initIconsGrid() {
    createFakeGridItem(nbFake);
    loadGridIcons().then(iconsList => {
        removeChildElts(gridElt);
        createGridItem(iconsList);

        initsearchIcons(iconsList)
        initChangeIconsStyle();
        initSelectIcon();
        initStickyIconsTools();
        initLinkDownloadCollection();

        cptCollection();
        displayIconsInSessionStorage();
    })
}



/////////////////////////GRID///////////////////////////////////////////////////////


async function loadGridIcons() {
    try {
        const response = await fetch("/icons/get/all");
        if (!response.ok) {
            throw new Error("Network response was not ok.");
        }
        const iconsList = await response.json();
        return iconsList;
    } catch (error) {
        console.error("Error occurred while loading grid icons:", error);
        return [];
    }
}

function removeChildElts(elts) {
    while (elts.firstChild) {
        elts.removeChild(elts.firstChild);
    }
}


function createFakeGridItem(nbFake = 1) {
    const domFragment = document.createDocumentFragment();

    const itemIcon = document.createElement("div");
    itemIcon.classList.add("grid-item");
    itemIcon.innerHTML = `
      <button class="item">
          <svg class="icon-style-fake fake-effect" xmlns="http://www.w3.org/2000/svg" viewbox="0 0 512 512" aria-hidden="true">
              <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512z"/>
          </svg>
      </button>
      <p class="icon-text-fake fake-effect"></p>`;

    for (let index = 0; index < nbFake; index++) {
        domFragment.appendChild(itemIcon.cloneNode(true));
    }

    gridElt.appendChild(domFragment);
}


function createGridItem(iconsList) {
    const domFragment = document.createDocumentFragment();

    iconsList.forEach(icon => {
        const gridItem = document.createElement("div");
        gridItem.classList.add("grid-item");
        gridItem.innerHTML = `
        <button data-icon-id="${icon.id}" class="item">
            <svg data-icons-style-solid class="icon-style-solid fill-primary" xmlns="http://www.w3.org/2000/svg" viewbox="0 0 24 24" aria-hidden="true">
                ${icon.svgPath.solid.map(path => `${path}`)}
            </svg>
            <svg data-icons-style-outline class="icon-style-outline fill-primary svgHidde" xmlns="http://www.w3.org/2000/svg" viewbox="0 0 24 24" aria-hidden="true">
                ${icon.svgPath.outline.map(path => `${path}`)}
            </svg>
        </button>
        <p class="icon-text">${icon.name}</p>`;

        domFragment.appendChild(gridItem);
    });

    gridElt.appendChild(domFragment);
}

/////////////////////////STICKY-ICONS-TOOLS//////////////////////////////////////////////////////

const iconsTools = document.querySelector("#iconsTools");
let sticky = iconsTools.offsetTop;
let isSticky = false;

function initStickyIconsTools() {
    window.addEventListener("scroll", () => {
        const shouldAddStickyClass = window.pageYOffset > sticky;
        if (shouldAddStickyClass && !isSticky) {
            iconsTools.classList.add("sticky", "container");
            isSticky = true;
        } else if (!shouldAddStickyClass && isSticky) {
            iconsTools.classList.remove("sticky", "container");
            isSticky = false;
        }
    }, { passive: true });
}

/////////////////////////SELECT-ICON//////////////////////////////////////////////////////

const sessionStorageKey = "iconsList";


function initSelectIcon() {
    gridElt.addEventListener("click", event => {
        const target = event.target.closest("button.item");
        if (target) {
            const iconId = target.dataset.iconId;
            registerSessionStorageIconsList(iconId);
            cptCollection();
            target.classList.toggle("item-select", !target.classList.contains("item-select"));
            // Remove console.log if not necessary for debugging
            console.log(sessionStorage.getItem(sessionStorageKey));
        }
    });
}


function registerSessionStorageIconsList(iconsId) {
    const listIconsStorage = getSessionStorageIconsList(sessionStorageKey) || {};
    const jsonStorage = { ...listIconsStorage };

    if (jsonStorage[iconsId] !== undefined) {
        delete jsonStorage[iconsId];
    } else {
        jsonStorage[iconsId] = { id: iconsId };
    }

    const listStorage = JSON.stringify(jsonStorage);
    sessionStorage.setItem(sessionStorageKey, listStorage);
}


function displayIconsInSessionStorage() {
    const iconsList = getSessionStorageIconsList(sessionStorageKey);
    for (const listKey in iconsList) {
        const iconsItem = document.querySelector("button[data-icon-id='" + listKey + "']");
        iconsItem.classList.toggle("item-select");
    }
}


function getSessionStorageIconsList() {
    const listIconsStorage = sessionStorage.getItem(sessionStorageKey);
    return JSON.parse(listIconsStorage);
}



/////////////////////////SEARCH-ICONS//////////////////////////////////////////////////////

const searchInput = document.querySelector("input[data-search-icons]");

function initsearchIcons(iconsList) {
    searchInput.addEventListener("input", (e) => {
        gridElt.innerHTML = ""
        const searchedString = e.target.value.toLowerCase().replace(/\s/g, "");
        const filteredArr = iconsList.filter(el =>
            el.name.toLowerCase().includes(searchedString)
        )
        createGridItem(filteredArr)
    });
}

/////////////////////////CHANGE-ICONS-STYLE////////////////////////////////////////////////

const classNameToggle = "svgHidde";
const btnRadioIconsStyle = document.querySelectorAll('input[type=radio][data-icons-style]');

function initChangeIconsStyle() {
    btnRadioIconsStyle.forEach(
        btnIconsStyle => btnIconsStyle.addEventListener('change', switchIconsStyle)
    );
}

function switchIconsStyle() {
    const style = this.dataset.iconsStyle;
    const eltsSolid = document.querySelectorAll('svg[data-icons-style-solid]');
    const eltsOutline = document.querySelectorAll('svg[data-icons-style-outline]');

    if (style === "solid" || style === "outline") {
        switch (style) {
            case "solid":
                toggleSwitchIcons(eltsOutline, eltsSolid)
                break;

            case "outline":
                toggleSwitchIcons(eltsSolid, eltsOutline)
                break;
        }

    }
}

function toggleSwitchIcons(eltsHidde, eltsDisplay) {
    eltsHidde.forEach(elt => {
        elt.classList.add(classNameToggle);
    });
    eltsDisplay.forEach(elt => {
        elt.classList.remove(classNameToggle);
    });
}

/////////////////////////DROPDOWN-COLLECTION///////////////////////////////////////////////////////

const dropdownCollection = document.querySelector("button[data-dropdown-download-collection]");
const btnsDownloadCollectionStyle = document.querySelectorAll("button[data-download-collection-style]");
const btnResetCollection = document.querySelector("button[data-reset-collection]");
const urlDownloadIcons = "/download/collection"

function initLinkDownloadCollection() {
    btnsDownloadCollectionStyle.forEach(
        btnDownloadCollectionStyle => btnDownloadCollectionStyle.addEventListener('click', downloadCollection)
    );
    btnResetCollection.addEventListener('click', resetCollection)
}

function downloadCollection() {
    const style = this.dataset.downloadCollectionStyle
    const collection = getSessionStorageIconsList(sessionStorageKey);
    const collectionFormatUrl = JSON.stringify(collection);
    const url = `${urlDownloadIcons}/${style}/${collectionFormatUrl}`;
    const nbIcon = Object.keys(collection).length;
    if (nbIcon > 0) {
        document.location.assign(url);
    }
    //Faire un else avec l'affichage d'une notification
}

function cptCollection() {
    const collection = getSessionStorageIconsList(sessionStorageKey);
    if (collection) {
        const nbIcon = Object.keys(collection).length;
        if (nbIcon > 0) {
            dropdownCollection.innerHTML = `Download <span class="badge bg-primary">${nbIcon} ${nbIcon > 1 ? "icons" : "icon"}</span>`
        } else {
            dropdownCollection.innerHTML = "Download";
        }
    }
}

function resetCollection() {
    sessionStorage.removeItem(sessionStorageKey);
    location.reload();
}


