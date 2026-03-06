(function () {
	const root = document.documentElement;
	const NAV_CONDENSE_ENTER_Y = 56;
	const NAV_CONDENSE_EXIT_Y = 20;
	let isNavCondensed = root.hasAttribute("data-nav-condensed");
	let syncFrame = 0;
	let pendingForceSync = false;

	const theme = localStorage.getItem("theme");
	if (theme === "dark" || theme === "light") {
		root.setAttribute("data-theme", theme);
	}

	const normalizeScrollY = (scrollY) =>
		Number.isFinite(scrollY) ? Math.max(0, scrollY) : 0;

	const getInitialNavCondensedState = (scrollY) =>
		normalizeScrollY(scrollY) >= NAV_CONDENSE_ENTER_Y;

	const getNextNavCondensedState = (scrollY) => {
		const normalizedScrollY = normalizeScrollY(scrollY);

		if (isNavCondensed) {
			return normalizedScrollY > NAV_CONDENSE_EXIT_Y;
		}

		return normalizedScrollY >= NAV_CONDENSE_ENTER_Y;
	};

	const applyNavState = (nextCondensed) => {
		if (nextCondensed === isNavCondensed) {
			return;
		}

		isNavCondensed = nextCondensed;
		root.toggleAttribute("data-nav-condensed", nextCondensed);
	};

	const syncNavState = ({ force = false } = {}) => {
		const nextCondensed = force
			? getInitialNavCondensedState(window.scrollY)
			: getNextNavCondensedState(window.scrollY);

		applyNavState(nextCondensed);
	};

	const requestNavSync = (force = false) => {
		pendingForceSync ||= force;

		if (syncFrame) {
			return;
		}

		syncFrame = window.requestAnimationFrame(() => {
			syncFrame = 0;
			const shouldForceSync = pendingForceSync;
			pendingForceSync = false;
			syncNavState({ force: shouldForceSync });
		});
	};

	syncNavState({ force: true });
	window.addEventListener("scroll", () => requestNavSync(), { passive: true });
	window.addEventListener("resize", () => requestNavSync(true), {
		passive: true,
	});
	document.addEventListener("astro:page-load", () => requestNavSync(true));

	document.addEventListener("click", (event) => {
		if (!(event.target instanceof Element)) {
			return;
		}

		const toggle = event.target.closest(".theme-toggle");
		if (!toggle) {
			return;
		}

		const current = root.getAttribute("data-theme");
		const prefersDark = window.matchMedia(
			"(prefers-color-scheme: dark)",
		).matches;

		const next =
			current === "dark" || (!current && prefersDark) ? "light" : "dark";

		root.setAttribute("data-theme", next);
		localStorage.setItem("theme", next);
	});
})();
