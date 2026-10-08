import type { SVGProps } from "react";

/** Official Microsoft Windows vector logo in signature perspective */
export function WindowsLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 88 88" fill="none" aria-hidden="true" {...props}>
      <path
        fill="#00ADEF"
        d="M0 12.402l35.689-4.86.016 34.423-35.67.203zm35.67 33.529l.026 34.453-35.67-4.877-.014-29.774zm4.326-39.043L87.314 0v41.527l-47.318.376zm47.329 46.549L87.314 88l-47.318-6.479-.011-34.415z"
      />
    </svg>
  );
}

/** Official Apple App Store badge vector icon */
export function AppStoreLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <rect width="24" height="24" rx="5.5" fill="#0A84FF" />
      {/* Precision Apple App Store official vector */}
      <path
        fill="#FFFFFF"
        d="M8.809 14.919l6.11-11.036c.084-.152.168-.302.244-.459.069-.142.127-.285.165-.44.08-.326.059-.666-.066-.977a1.44 1.44 0 00-.62-.736 1.418 1.418 0 00-.921-.192c-.32.043-.614.193-.844.429a2.3 2.3 0 00-.284.369c-.092.146-.175.298-.259.449l-.386.698-.387-.698a3.16 3.16 0 00-.258-.45c-.084-.132-.174-.256-.284-.368a1.39 1.39 0 00-.844-.43 1.418 1.418 0 00-.92.193c-.279.168-.497.426-.621.736a1.72 1.72 0 00-.066.976c.038.155.096.298.165.44.075.157.16.308.244.46l1.248 2.254-4.863 8.782H2.03a1.86 1.86 0 00-.503.01c-.152.008-.3.028-.448.07a1.47 1.47 0 00-.778.549A1.54 1.54 0 000 16.452c0 .335.106.661.3.928.197.268.468.457.78.548.147.043.295.062.447.071.168.01.335.01.503.01h13.097c.017-.035.06-.13.1-.27.415-1.415-.615-2.843-2.035-2.843zM3.113 18.542l-.792 1.5c-.082.156-.165.311-.239.471-.067.146-.124.293-.161.452a1.71 1.71 0 00.064 1.003c.122.318.335.583.608.755.272.172.589.242.901.198.314-.044.6-.199.826-.44.108-.115.196-.243.278-.38.09-.15.171-.305.253-.46l1.15-2.176c-.09-.15-.948-1.47-2.888-.922zm20.586-3.006a1.47 1.47 0 00-.779-.54 1.83 1.83 0 00-.448-.072c-.168-.01-.336-.01-.503-.01h-3.321l-4.39-7.817c-.665.7-0.963 1.485-1.077 2.198a4.15 4.15 0 00.546 3l5.274 9.394c.084.15.167.3.26.444.083.13.173.253.283.364.231.232.524.38.845.423.32.042.643-.025.922-.19.278-.165.497-.42.621-.726.124-.307.146-.642.066-.964-.038-.153-.096-.294-.165-.435a3.16 3.16 0 00-.244-.452l-1.216-2.166h1.596c.168 0 .335 0 .503-.01.152-.008.3-.027.448-.07a1.47 1.47 0 00.78-.54 1.54 1.54 0 00.3-1.458z"
      />
    </svg>
  );
}

/** Official Apple bitten silhouette vector logo */
export function AppleLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
    </svg>
  );
}

/** Official Google Play multi-colored triangle vector logo */
export function GooglePlayLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      {/* Yellow right triangle */}
      <path
        d="M22.018 13.298l-3.919 2.218-3.515-3.493 3.543-3.521 3.891 2.202a1.49 1.49 0 0 1 0 2.594z"
        fill="#FFC800"
      />
      {/* Blue left triangle */}
      <path
        d="M1.337.924a1.486 1.486 0 0 0-.112.568v21.017c0 .217.045.419.124.6l11.155-11.087L1.337.924z"
        fill="#00D2FF"
      />
      {/* Green top triangle */}
      <path
        d="M13.544 10.989l3.258-3.238L3.45.195a1.466 1.466 0 0 0-.946-.179l11.04 10.973z"
        fill="#00E676"
      />
      {/* Red bottom triangle */}
      <path
        d="M13.544 13.056l-11 10.933c.298.036.612-.016.906-.183l13.324-7.54-3.23-3.21z"
        fill="#FF3A44"
      />
    </svg>
  );
}

/** Official Gmail 4-color vector logo */
export function GmailLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path fill="#4285F4" d="M2 6.5v11C2 18.6 2.9 19.5 4 19.5h3.5v-9L2 6.5z" />
      <path fill="#34A853" d="M22 6.5l-5.5 4v9H20c1.1 0 2-.9 2-2v-11z" />
      <path fill="#EA4335" d="M12 13.5L2 6.5V5c0-1.1.9-2 2-2h1.5l6.5 4.5L18.5 3H20c1.1 0 2 .9 2 2v1.5l-10 7z" />
      <path fill="#FBBC04" d="M7.5 10.5v9h9v-9L12 7.2l-4.5 3.3z" />
    </svg>
  );
}

/** Vector Fireflies meeting icon on white badge */
export function FirefliesMeetingLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden="true" {...props}>
      <rect width="32" height="32" rx="7" fill="#FFFFFF" />
      {/* Top Left purple block */}
      <rect x="7" y="7" width="7" height="7" rx="1.5" fill="#8B5CF6" />
      {/* Top Right gradient magenta block */}
      <path d="M16 7h4.5a4.5 4.5 0 0 1 4.5 4.5v2.5H16V7z" fill="#D946EF" />
      {/* Bottom Left pink vertical block */}
      <rect x="7" y="16" width="7" height="9" rx="1.5" fill="#EC4899" />
      {/* Bottom Right pink square */}
      <rect x="16" y="16" width="7" height="7" rx="1.5" fill="#F43F5E" />
    </svg>
  );
}

/** Official Slack 4-color vector logo */
export function SlackLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52-2.523 2.52 2.52 0 0 1 2.52-2.52h2.52v2.52c0 1.394-1.126 2.523-2.52 2.523z" fill="#E01E5A" />
      <path d="M6.313 15.165a2.52 2.52 0 0 1 2.52-2.523 2.52 2.52 0 0 1 2.52 2.523v6.313A2.52 2.52 0 0 1 8.833 24a2.52 2.52 0 0 1-2.52-2.522v-6.313z" fill="#E01E5A" />
      <path d="M8.833 5.042a2.52 2.52 0 0 1-2.52-2.52A2.52 2.52 0 0 1 8.833 0a2.52 2.52 0 0 1 2.52 2.522v2.52h-2.52z" fill="#36C5F0" />
      <path d="M8.833 6.313a2.52 2.52 0 0 1 2.52 2.52 2.52 2.52 0 0 1-2.52 2.52H2.52A2.52 2.52 0 0 1 0 8.833a2.52 2.52 0 0 1 2.52-2.52h6.313z" fill="#36C5F0" />
      <path d="M18.958 8.833a2.528 2.528 0 0 1 2.52 2.52 2.52 2.52 0 0 1-2.52 2.523h-2.52v-2.523c0-1.393 1.126-2.52 2.52-2.52z" fill="#2EB67D" />
      <path d="M17.687 8.833a2.52 2.52 0 0 1-2.52 2.52 2.52 2.52 0 0 1-2.52-2.52V2.52A2.52 2.52 0 0 1 15.167 0a2.52 2.52 0 0 1 2.52 2.52v6.313z" fill="#2EB67D" />
      <path d="M15.167 18.958a2.52 2.52 0 0 1 2.52 2.522 2.52 2.52 0 0 1-2.52 2.52 2.52 2.52 0 0 1-2.52-2.52v-2.522h2.52z" fill="#ECB22E" />
      <path d="M15.167 17.687a2.52 2.52 0 0 1-2.52-2.522 2.52 2.52 0 0 1 2.52-2.523h6.313A2.52 2.52 0 0 1 24 15.165a2.52 2.52 0 0 1-2.52 2.522h-6.313z" fill="#ECB22E" />
    </svg>
  );
}

/** Official Asana 3-dots vector logo */
export function AsanaLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <circle cx="12" cy="7.2" r="4.2" fill="#FC636B" />
      <circle cx="6.5" cy="16.8" r="4.2" fill="#FC636B" />
      <circle cx="17.5" cy="16.8" r="4.2" fill="#FC636B" />
    </svg>
  );
}

/** Official Monday.com 3-strokes vector logo */
export function MondayLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="M3.5 17.5c-1.1 0-2-.9-2-2v-4c0-1.1.9-2 2-2s2 .9 2 2v4c0 1.1-.9 2-2 2z" fill="#FF3D57" />
      <path d="M11 17.5c-1.1 0-2-.9-2-2V7.5c0-1.1.9-2 2-2s2 .9 2 2v8c0 1.1-.9 2-2 2z" fill="#FFCB00" />
      <path d="M18.5 17.5c-1.1 0-2-.9-2-2V4.5c0-1.1.9-2 2-2s2 .9 2 2v11c0 1.1-.9 2-2 2z" fill="#00CA72" />
      <circle cx="18.5" cy="19.5" r="2" fill="#0085FF" />
    </svg>
  );
}

/** Official Trello vector logo */
export function TrelloLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <rect width="24" height="24" rx="4.5" fill="#0079BF" />
      <rect x="4.5" y="4.5" width="6" height="13" rx="1.5" fill="#FFFFFF" />
      <rect x="13.5" y="4.5" width="6" height="8.5" rx="1.5" fill="#FFFFFF" />
    </svg>
  );
}

/** Official ClickUp vector logo */
export function ClickUpLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="M4 17.5l8-6 8 6" stroke="#7B68EE" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 11.5l5-4 5 4" stroke="#FF00DF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Official Google Chrome 4-color circular vector logo */
export function ChromeLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <circle cx="12" cy="12" r="10" fill="#EA4335" />
      <path d="M12 2a10 10 0 0 1 8.66 5l-5 8.66A5 5 0 0 0 12 7V2z" fill="#EA4335" />
      <path d="M20.66 7a10 10 0 0 1-1.32 11.5l-5-8.66A5 5 0 0 0 17 12h5z" fill="#FBBC04" />
      <path d="M19.34 18.5A10 10 0 0 1 3.34 15.5l5-8.66A5 5 0 0 0 12 17l7.34 1.5z" fill="#34A853" />
      <circle cx="12" cy="12" r="4.5" fill="#FFFFFF" />
      <circle cx="12" cy="12" r="3.5" fill="#4285F4" />
    </svg>
  );
}



