/** Shared motion helpers. Everything animated on this site is driven by anime.js. */

/** sessionStorage key: the intro plays once per browser session. */
export const INTRO_KEY = "ieeecs-intro-seen";

export const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Runs in <head> before first paint. It decides whether the intro plays and flags <html>, so the
 * overlay covers the page from the very first frame.
 *
 * The intro plays on the home page, once per session, unless the visitor prefers reduced motion.
 * Open `/?intro` to force it (handy while tweaking it).
 */
export const introGateScript = `(function(){try{var d=document.documentElement,p=location.pathname;if(p!=="/"&&p!=="/index.html")return;var force=/[?&]intro(=|&|$)/.test(location.search);var seen=sessionStorage.getItem("${INTRO_KEY}");var reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;if((force||!seen)&&!reduce)d.classList.add("intro-active")}catch(e){}})()`;
