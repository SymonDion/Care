/* =========================================================
   HEALTHWISE HUB – GLOBAL HEALTH EDITION
   Modern frontend JavaScript
   Version 2.0
========================================================= */

"use strict";

/* =========================================================
   1. CONFIGURATION
========================================================= */

const CONFIG = {
    topicsFile: "topics.json",
    storagePrefix: "healthwise_hub_",
    animationDuration: 4200
};

let topics = [];
let activeFilter = "all";

/* =========================================================
   2. DOM ELEMENTS
========================================================= */

const elements = {
    grid: document.querySelector("#topicGrid"),
    search: document.querySelector("#searchInput"),
    empty: document.querySelector("#empty"),

    menu: document.querySelector(".hamb"),
    nav: document.querySelector("#nav"),

    themeToggle: document.querySelector("#themeToggle"),

    newsletterForm: document.querySelector("#newsletterForm"),
    email: document.querySelector("#email"),
    newsletterMsg: document.querySelector("#newsletterMsg"),

    contactForm: document.querySelector("#contactForm"),
    contactMsg: document.querySelector("#contactMsg"),

    toast: document.querySelector("#toast"),

    year: document.querySelector("#year"),
    topBtn: document.querySelector("#topBtn")
};

/* =========================================================
   3. GENERAL UTILITIES
========================================================= */

function getStorage(key, fallback = []) {
    try {
        const value = localStorage.getItem(
            CONFIG.storagePrefix + key
        );

        return value ? JSON.parse(value) : fallback;

    } catch (error) {
        console.warn("Storage unavailable:", error);
        return fallback;
    }
}

function setStorage(key, value) {
    try {
        localStorage.setItem(
            CONFIG.storagePrefix + key,
            JSON.stringify(value)
        );

        return true;

    } catch (error) {
        console.warn("Could not save information:", error);
        return false;
    }
}

function showToast(message) {
    if (!elements.toast) {
        alert(message);
        return;
    }

    elements.toast.textContent = message;
    elements.toast.classList.add("show");

    clearTimeout(showToast.timer);

    showToast.timer = setTimeout(() => {
        elements.toast.classList.remove("show");
    }, CONFIG.animationDuration);
}

function createElement(tag, className, text) {
    const element = document.createElement(tag);

    if (className) {
        element.className = className;
    }

    if (text !== undefined) {
        element.textContent = text;
    }

    return element;
}

/* =========================================================
   4. HEALTH TOPIC DATABASE
========================================================= */

async function loadTopics() {

    if (!elements.grid) return;

    elements.grid.innerHTML =
        "<p>Loading global health information... 🌍</p>";

    try {

        const response = await fetch(CONFIG.topicsFile);

        if (!response.ok) {
            throw new Error("Health database could not be loaded.");
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
            throw new Error("Invalid health database format.");
        }

        topics = data.filter(topic =>
            Array.isArray(topic) &&
            topic.length >= 4
        );

        renderTopics();

    } catch (error) {

        console.error("Health database error:", error);

        elements.grid.innerHTML = "";

        const message = createElement(
            "p",
            "error-message",
            "Unable to load health information. Please check that topics.json exists and that you are using VS Code Live Server."
        );

        elements.grid.appendChild(message);
    }
}

/* =========================================================
   5. HEALTH TOPIC SEARCH AND FILTER
========================================================= */

function renderTopics() {

    if (!elements.grid) return;

    const query = elements.search
        ? elements.search.value.trim().toLowerCase()
        : "";

    const results = topics.filter(topic => {

        const categoryMatches =
            activeFilter === "all" ||
            topic[2] === activeFilter;

        const searchMatches =
            topic.join(" ")
                .toLowerCase()
                .includes(query);

        return categoryMatches && searchMatches;
    });

    elements.grid.innerHTML = "";

    results.forEach(topic => {

        const card = createElement("article", "topic");

        card.tabIndex = 0;
        card.setAttribute("role", "button");
        card.setAttribute(
            "aria-label",
            `Read about ${topic[1]}`
        );

        const emoji = createElement(
            "span",
            "emoji",
            topic[0]
        );

        const categoryNames = {
            body: "PHYSICAL HEALTH",
            mind: "MENTAL WELLBEING",
            family: "FAMILY & LIFE STAGES",
            public: "GLOBAL & PUBLIC HEALTH"
        };

        const category = createElement(
            "small",
            "",
            categoryNames[topic[2]] || "HEALTH INFORMATION"
        );

        const title = createElement(
            "h3",
            "",
            topic[1]
        );

        const description = createElement(
            "p",
            "",
            topic[3]
        );

        const more = createElement(
            "span",
            "more",
            "Read overview + ↗"
        );

        card.append(
            emoji,
            category,
            title,
            description,
            more
        );

        card.addEventListener("click", () => {
            showTopic(topic);
        });

        card.addEventListener("keydown", event => {

            if (
                event.key === "Enter" ||
                event.key === " "
            ) {
                event.preventDefault();
                showTopic(topic);
            }
        });

        elements.grid.appendChild(card);
    });

    if (elements.empty) {
        elements.empty.hidden = results.length > 0;
    }
}

/* =========================================================
   6. HEALTH INFORMATION MODAL
========================================================= */

function showTopic(topic) {

    const overlay = createElement(
        "div",
        "modal-backdrop"
    );

    overlay.setAttribute("role", "presentation");

    const modal = createElement(
        "section",
        "topic-modal"
    );

    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute(
        "aria-label",
        `${topic[1]} information`
    );

    const closeButton = createElement(
        "button",
        "modal-close",
        "×"
    );

    closeButton.type = "button";
    closeButton.setAttribute("aria-label", "Close");

    const emoji = createElement(
        "div",
        "modal-emoji",
        topic[0]
    );

    const eyebrow = createElement(
        "div",
        "eyebrow",
        "HEALTHWISE LEARNING GUIDE"
    );

    const title = createElement(
        "h2",
        "",
        topic[1]
    );

    const description = createElement(
        "p",
        "",
        topic[3]
    );

    const nextTitle = createElement(
        "h3",
        "",
        "Helpful next steps 🌱"
    );

    const list = createElement("ul");

    const steps = [
        "Use trusted public-health sources for detailed and up-to-date information.",
        "Write down questions and discuss personal concerns with a qualified healthcare professional.",
        "Follow local health guidance because recommendations can vary between countries and individuals."
    ];

    steps.forEach(step => {
        list.appendChild(
            createElement("li", "", step)
        );
    });

    const warning = createElement(
        "div",
        "modal-warning",
        "⚠️ This information is for educational purposes only. It does not diagnose conditions or replace professional medical advice."
    );

    const doneButton = createElement(
        "button",
        "btn primary modal-done",
        "I understand ✓"
    );

    doneButton.type = "button";

    modal.append(
        closeButton,
        emoji,
        eyebrow,
        title,
        description,
        nextTitle,
        list,
        warning,
        doneButton
    );

    overlay.appendChild(modal);

    document.body.appendChild(overlay);

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    closeButton.focus();

    function closeModal() {

        if (!overlay.isConnected) return;

        overlay.remove();

        document.body.style.overflow = previousOverflow;

        document.removeEventListener(
            "keydown",
            handleKeyboard
        );
    }

    function handleKeyboard(event) {

        if (event.key === "Escape") {
            closeModal();
        }

        if (event.key === "Tab") {

            const buttons = modal.querySelectorAll(
                "button"
            );

            const first = buttons[0];
            const last = buttons[buttons.length - 1];

            if (
                event.shiftKey &&
                document.activeElement === first
            ) {
                event.preventDefault();
                last.focus();

            } else if (
                !event.shiftKey &&
                document.activeElement === last
            ) {
                event.preventDefault();
                first.focus();
            }
        }
    }

    closeButton.addEventListener("click", closeModal);

    doneButton.addEventListener("click", closeModal);

    overlay.addEventListener("click", event => {
        if (event.target === overlay) {
            closeModal();
        }
    });

    document.addEventListener(
        "keydown",
        handleKeyboard
    );
}

/* =========================================================
   7. CATEGORY FILTER BUTTONS
========================================================= */

function initializeFilters() {

    const buttons = document.querySelectorAll(
        "#filters button"
    );

    buttons.forEach(button => {

        button.addEventListener("click", () => {

            buttons.forEach(item => {
                item.classList.remove("selected");
                item.setAttribute("aria-pressed", "false");
            });

            button.classList.add("selected");

            button.setAttribute("aria-pressed", "true");

            activeFilter = button.dataset.filter || "all";

            renderTopics();
        });
    });
}

/* =========================================================
   8. LIVE SEARCH
========================================================= */

function initializeSearch() {

    if (!elements.search) return;

    elements.search.addEventListener(
        "input",
        renderTopics
    );
}

/* =========================================================
   9. MOBILE NAVIGATION
========================================================= */

function initializeNavigation() {

    if (!elements.menu || !elements.nav) return;

    elements.menu.setAttribute("aria-expanded", "false");

    elements.menu.addEventListener("click", () => {

        const isOpen = elements.nav.classList.toggle("open");

        elements.menu.setAttribute(
            "aria-expanded",
            String(isOpen)
        );

        elements.menu.textContent = isOpen ? "✕" : "☰";
    });

    elements.nav.querySelectorAll("a").forEach(link => {

        link.addEventListener("click", () => {

            elements.nav.classList.remove("open");

            elements.menu.textContent = "☰";

            elements.menu.setAttribute(
                "aria-expanded",
                "false"
            );
        });
    });

    document.addEventListener("click", event => {

        const clickedInside =
            elements.nav.contains(event.target) ||
            elements.menu.contains(event.target);

        if (!clickedInside) {

            elements.nav.classList.remove("open");

            elements.menu.textContent = "☰";

            elements.menu.setAttribute(
                "aria-expanded",
                "false"
            );
        }
    });
}

/* =========================================================
   10. DARK AND LIGHT THEME
========================================================= */

function initializeTheme() {

    if (!elements.themeToggle) return;

    const savedTheme = getStorage("theme", "light");

    document.body.classList.toggle(
        "dark",
        savedTheme === "dark"
    );

    updateThemeButton();

    elements.themeToggle.addEventListener("click", () => {

        const isDark = document.body.classList.toggle("dark");

        setStorage(
            "theme",
            isDark ? "dark" : "light"
        );

        updateThemeButton();

        showToast(
            isDark
                ? "Dark mode activated 🌙"
                : "Light mode activated ☀️"
        );
    });
}

function updateThemeButton() {

    if (!elements.themeToggle) return;

    const isDark = document.body.classList.contains("dark");

    elements.themeToggle.textContent =
        isDark ? "☀️" : "🌙";

    elements.themeToggle.setAttribute(
        "aria-label",
        isDark ? "Switch to light mode" : "Switch to dark mode"
    );
}

/* =========================================================
   11. NEWSLETTER SUBSCRIPTION
========================================================= */

function initializeNewsletter() {

    if (!elements.newsletterForm) return;

    elements.newsletterForm.addEventListener(
        "submit",
        event => {

            event.preventDefault();

            const email = elements.email
                ? elements.email.value.trim().toLowerCase()
                : "";

            if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {

                showToast("Please enter a valid email address.");

                return;
            }

            const subscribers = getStorage(
                "subscribers",
                []
            );

            const exists = subscribers.some(
                item => item.email === email
            );

            if (exists) {

                showToast(
                    "This email is already subscribed."
                );

                return;
            }

            subscribers.push({
                email,
                date: new Date().toISOString()
            });

            const saved = setStorage(
                "subscribers",
                subscribers
            );

            if (!saved) {

                showToast(
                    "Unable to save your subscription in this browser."
                );

                return;
            }

            if (elements.newsletterMsg) {

                elements.newsletterMsg.textContent =
                    "Thank you! Your subscription has been saved in this browser demo. 💚";
            }

            elements.newsletterForm.reset();
        }
    );
}

/* =========================================================
   12. CONTACT FORM
========================================================= */

function initializeContactForm() {

    if (!elements.contactForm) return;

    elements.contactForm.addEventListener(
        "submit",
        event => {

            event.preventDefault();

            if (!elements.contactForm.checkValidity()) {

                elements.contactForm.reportValidity();

                return;
            }

            const formData = new FormData(
                elements.contactForm
            );

            const data = Object.fromEntries(
                formData.entries()
            );

            const messages = getStorage(
                "messages",
                []
            );

            messages.push({
                ...data,
                date: new Date().toISOString()
            });

            const saved = setStorage(
                "messages",
                messages
            );

            if (!saved) {

                showToast(
                    "Unable to save your message in this browser."
                );

                return;
            }

            if (elements.contactMsg) {

                elements.contactMsg.textContent =
                    "Thank you! Your message has been saved in this browser demo. 💌";
            }

            elements.contactForm.reset();
        }
    );
}

/* =========================================================
   13. SCROLL ANIMATIONS
========================================================= */

function initializeScrollAnimations() {

    const revealElements = document.querySelectorAll(
        ".reveal"
    );

    if (!("IntersectionObserver" in window)) {

        revealElements.forEach(element => {
            element.classList.add("visible");
        });

        return;
    }

    const observer = new IntersectionObserver(
        entries => {

            entries.forEach(entry => {

                if (entry.isIntersecting) {

                    entry.target.classList.add("visible");

                    observer.unobserve(entry.target);
                }
            });

        },
        {
            threshold: 0.12
        }
    );

    revealElements.forEach(element => {
        observer.observe(element);
    });
}

/* =========================================================
   14. ANIMATED STATISTICS
========================================================= */

function initializeCounters() {

    const counters = document.querySelectorAll(
        "[data-count]"
    );

    if (!("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
        entries => {

            entries.forEach(entry => {

                if (!entry.isIntersecting) return;

                const element = entry.target;

                const target = Number(
                    element.dataset.count
                );

                if (!Number.isFinite(target)) return;

                let current = 0;

                const step = Math.max(
                    1,
                    Math.ceil(target / 35)
                );

                const timer = setInterval(() => {

                    current = Math.min(
                        target,
                        current + step
                    );

                    element.textContent = current + "+";

                    if (current >= target) {
                        clearInterval(timer);
                    }

                }, 35);

                observer.unobserve(element);
            });
        },
        {
            threshold: 0.5
        }
    );

    counters.forEach(counter => {
        observer.observe(counter);
    });
}

/* =========================================================
   15. BACK TO TOP BUTTON
========================================================= */

function initializeBackToTop() {

    if (!elements.topBtn) return;

    window.addEventListener(
        "scroll",
        () => {

            elements.topBtn.classList.toggle(
                "show",
                window.scrollY > 450
            );
        },
        { passive: true }
    );

    elements.topBtn.addEventListener("click", () => {

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });
}

/* =========================================================
   16. FOOTER YEAR
========================================================= */

function initializeYear() {

    if (elements.year) {

        elements.year.textContent =
            new Date().getFullYear();
    }
}

/* =========================================================
   17. APPLICATION INITIALIZATION
========================================================= */

function initializeHealthWiseHub() {

    console.log(
        "🌍 HealthWise Hub Global Edition initialized."
    );

    initializeFilters();

    initializeSearch();

    initializeNavigation();

    initializeTheme();

    initializeNewsletter();

    initializeContactForm();

    initializeScrollAnimations();

    initializeCounters();

    initializeBackToTop();

    initializeYear();

    loadTopics();
}

/* =========================================================
   18. START APPLICATION
========================================================= */

if (document.readyState === "loading") {

    document.addEventListener(
        "DOMContentLoaded",
        initializeHealthWiseHub
    );

} else {

    initializeHealthWiseHub();
}