const status = document.querySelector("[data-webmcp-status]");
const supportsWebMcp = typeof document.modelContext?.registerTool === "function";

if (status) {
  status.classList.add(supportsWebMcp ? "is-supported" : "is-fallback");
  status.textContent = supportsWebMcp
    ? "Site tools are available. Open the tote demo to discover CoDesign's six tools."
    : "Site tools are not exposed in this browser. The tote keeps its complete normal human interface.";
}

const safeHttpsUrl = (value) => {
  if (typeof value !== "string" || value.length === 0) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.href : null;
  } catch {
    return null;
  }
};

const setOptionalLink = (name, value, fallbackLabel) => {
  const links = document.querySelectorAll(`[data-link="${name}"]`);
  const href = safeHttpsUrl(value);
  for (const link of links) {
    if (!(link instanceof HTMLAnchorElement)) continue;
    if (!href) {
      link.removeAttribute("href");
      link.setAttribute("aria-disabled", "true");
      link.textContent = fallbackLabel;
      continue;
    }
    link.href = href;
    link.target = "_blank";
    link.rel = "noreferrer";
    link.removeAttribute("aria-disabled");
  }
};

const setText = (selector, value) => {
  const node = document.querySelector(selector);
  if (node && typeof value === "string") node.textContent = value;
};

try {
  const response = await fetch("./site-metadata.json", { cache: "no-store" });
  if (!response.ok) throw new Error("metadata unavailable");
  const metadata = await response.json();
  const repositoryUrl = safeHttpsUrl(metadata.repositoryUrl);
  const verifiedFlagshipUrl =
    metadata.releaseBuild === true && metadata.flagshipVerified === true
      ? safeHttpsUrl(metadata.flagshipUrl)
      : null;
  const commit = typeof metadata.commitSha === "string" ? metadata.commitSha : "local build";

  setText("[data-version]", metadata.packageVersion);
  setText("[data-commit]", commit.slice(0, 12));
  setText("[data-bundle]", typeof metadata.browserBundleSha256 === "string" ? metadata.browserBundleSha256.slice(0, 16) : "unavailable");
  setOptionalLink("flagship", verifiedFlagshipUrl, "KORRHAUS live verification pending");
  setOptionalLink("repository", repositoryUrl, "Public repository pending release");
  setOptionalLink(
    "judge-guide",
    repositoryUrl ? `${repositoryUrl.replace(/\/$/, "")}/blob/${encodeURIComponent(commit)}/docs/JUDGE_GUIDE.md` : null,
    "Judge guide pending release",
  );
} catch {
  setOptionalLink("flagship", null, "KORRHAUS live verification pending");
  setOptionalLink("repository", null, "Public repository pending release");
  setOptionalLink("judge-guide", null, "Judge guide pending release");
}

const revealNodes = [...document.querySelectorAll("[data-reveal]")];
if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    },
    { rootMargin: "0px 0px -10%", threshold: 0.1 },
  );
  revealNodes.forEach((node) => observer.observe(node));
} else {
  revealNodes.forEach((node) => node.classList.add("is-visible"));
}
