// ==UserScript==
// @name         Meny Price Sort
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Sorts products by price on https://meny.no/
// @author       implicitlycorrect
// @match        https://meny.no/sok/*?query=*&expanded=products
// @match        https://meny.no/varer/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    let priceSortObserver;
    let sortSelectionDropdown;

    function getProductPrice(productElement) {
        const productPrice = productElement.querySelector(".ws-product-vertical__price");
        const parsePriceAsFloat = (price) => parseFloat(price.replaceAll(/[^0-9,.-]/g, "").replace(",", "."));
        return parsePriceAsFloat(productPrice.innerText);
    }

    function sortAndUpdate() {
        const productList = document.querySelector(".ws-product-list-vertical");
        if (!productList) return;

        const products = Array.from(productList.querySelectorAll(".ws-product-list-vertical__item"));
        products.sort((a, b) => getProductPrice(a) - getProductPrice(b));
        products.forEach((product) => productList.appendChild(product));
    }

    function initializeSortButton() {
        if (!sortSelectionDropdown) {
            if (priceSortObserver) {
                priceSortObserver.disconnect();
            }
            const existingButtons = document.querySelectorAll('.ngr-dropdown__item');
            if (existingButtons.length > 2) {
                existingButtons[2].remove();
            }
            return;
        }

        const sortByPriceButton = document.createElement("button");
        sortByPriceButton.className = "ngr-dropdown__item";
        sortByPriceButton.setAttribute("role", "option");
        sortByPriceButton.setAttribute("aria-selected", "false");
        sortByPriceButton.textContent = "Pris lav-høy";
        sortByPriceButton.onclick = () => {
            if (priceSortObserver) {
                priceSortObserver.disconnect();
            }
            priceSortObserver = new MutationObserver(sortAndUpdate);
            const observerConfig = { childList: true };
            priceSortObserver.observe(sortSelectionDropdown, observerConfig);
            sortAndUpdate();
        };

        const existingButtons = document.querySelectorAll('.ngr-dropdown__item');
        if (existingButtons.length < 3) {
            sortSelectionDropdown.appendChild(sortByPriceButton);
        }
    }
    const bodyObserver = new MutationObserver(() => {
        setTimeout(() => {
            sortSelectionDropdown = document.querySelector('.ngr-dropdown__menu');
            initializeSortButton();
        }, 1000);
    });

    bodyObserver.observe(document.body, { subtree: true, childList: true });
})();
