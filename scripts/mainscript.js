"use strict";
let root = document.querySelector(":root");
let spansCounter = 1;
let loadButton = document.querySelector("button");
let importantActionsCounter = 5;
let galleryContainer = document.querySelector("section");
let loader = document.querySelector(".section__loader");
let loaderIntervalId;
function showLoader() {
    loader.style.display = "block";
    loaderIntervalId = setInterval(() => {
        if(spansCounter === 9) {
            spansCounter = 1;
        }
        if(spansCounter === 8) {
            root.style.setProperty(`--span${spansCounter}-backcolor`, "#FFFFFF");
            root.style.setProperty("--span1-backcolor", "lightblue");
        }
        else {
            root.style.setProperty(`--span${spansCounter}-backcolor`, "#FFFFFF");
            root.style.setProperty(`--span${spansCounter + 1}-backcolor`, "lightblue");
        }
        spansCounter++;
    }, 125);
}
async function loadImages() {
    let response = await fetch("https://api.thecatapi.com/v1/images/search?limit=10");
    if(!response.ok) {
        throw new Error(`При загрузке произошла ошибка. Код статуса ответа сервера – ${response.status}`);
    }
    else {
        let data = await response.json();
        if(data) {
            let urlsArray = [];
            data.forEach((catObject) => {
                urlsArray.push(catObject.url);
            });
            return urlsArray;
        }
    }
}
let buttonClickCounter = 0;
let firstSuccessfulLoad = false;
loadButton.addEventListener("click", function () {
    buttonClickCounter += 1;
    if(document.querySelector(".section__error-container1") !== null) {
        document.querySelector(".section__error-container1").remove();
    }
    if(document.querySelector(".section__error-container2") !== null) {
        document.querySelector(".section__error-container2").remove();
    }
    if(document.querySelectorAll("div:not(.section__loader)").length !== 0) {
        document.querySelectorAll("div:not(.section__loader)").forEach((div) => {
            div.style.display = "none";
        });
    }
    showLoader();
    let promisesArray = [];
    for(let i = 1; i <= importantActionsCounter; i++) {
        let returnedPromise = loadImages();
        promisesArray.push(returnedPromise);
    }
    Promise.all(promisesArray).then((result) => {
        firstSuccessfulLoad = true;
        let jointImagesArray = [];
        result.forEach((currentArray) => {
            currentArray.forEach((url) => {
                jointImagesArray.push(url);
            });
        });
        for(let i = 1; i <= importantActionsCounter * 10; i++) {
            let newImageContainer = document.createElement("div");
            newImageContainer.classList.add("section__image-container");
            newImageContainer.style.backgroundImage = `url("${jointImagesArray[i - 1]}")`;
            newImageContainer.style.backgroundRepeat = "no-repeat";
            newImageContainer.style.backgroundSize = "100% 100%";
            if(buttonClickCounter === 1) {
                galleryContainer.insertAdjacentElement("afterbegin", newImageContainer);
            }
            else {
                galleryContainer.insertAdjacentElement("beforeend", newImageContainer);
            }
        }
        if(buttonClickCounter > 1) {
            galleryContainer.scrollTop = galleryContainer.scrollHeight;
        }
    }).catch((error) => {
        let errorContainer = document.createElement("div");
        errorContainer.innerText = error.message;
        if(buttonClickCounter > 1 && firstSuccessfulLoad) {
            errorContainer.classList.add("section__error-container2");
            let galleryHeight = galleryContainer.scrollHeight;
            errorContainer.style.top = `${galleryHeight + 20}px`;
            galleryContainer.insertAdjacentElement("beforeend", errorContainer);
        }
        else {
            errorContainer.classList.add("section__error-container1");
            galleryContainer.style.display = "flex";
            galleryContainer.insertAdjacentElement("afterbegin", errorContainer);
        }
    }).finally(() => {
        loader.style.display = "none";
        clearInterval(loaderIntervalId);
        document.querySelectorAll("div:not(.section__loader)").forEach((div) => {
            div.style.display = "block";
        });
    });
});