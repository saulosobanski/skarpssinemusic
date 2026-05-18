/**
 * script.js — Link Page
 *
 * Fetches config.json and dynamically renders:
 *   1. Profile section (avatar, username, bio)
 *   2. Link buttons (icon, title, custom colors)
 *   3. Video embeds (YouTube latest upload + Twitch live player)
 *
 * To customise your page, edit config.json only — no code changes needed.
 */

(async function () {
  /* ─────────────────────────────────────────────
   * 1. Load configuration
   * ───────────────────────────────────────────── */
  let config;
  try {
    const res = await fetch('./config.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    config = await res.json();
  } catch (err) {
    console.error('[LinkPage] Failed to load config.json:', err);
    showError('Could not load config.json. Make sure the file exists next to index.html.');
    return;
  }

  /* ─────────────────────────────────────────────
   * 2. Apply global styles (background, text colour)
   * ───────────────────────────────────────────── */
  const styles = config.styles || {};
  const pageBg = document.getElementById('page-bg');

  if (styles.background) {
    pageBg.style.background = styles.background;
  }
  if (styles.textColor) {
    pageBg.style.color = styles.textColor;
  }

  /* ─────────────────────────────────────────────
   * 3. Render profile section
   * ───────────────────────────────────────────── */
  const profile = config.profile || {};

  // Avatar
  const avatarImg = document.getElementById('avatar-img');
  const avatarPlaceholder = document.getElementById('avatar-placeholder');
  if (profile.avatar) {
    avatarImg.src = profile.avatar;
    avatarImg.alt = profile.username ? `${profile.username} avatar` : 'Profile avatar';
    avatarImg.onload = () => {
      avatarImg.classList.remove('skeleton');
      avatarImg.style.display = 'block';
      avatarPlaceholder.style.display = 'none';
      avatarImg.classList.add('fade-in');
    };
    avatarImg.onerror = () => {
      // Keep placeholder if image fails
    };
  } else {
    avatarPlaceholder.style.display = 'none';
  }

  // Username
  const usernameEl = document.getElementById('username');
  if (profile.username) {
    usernameEl.textContent = profile.username;
    usernameEl.className = 'text-2xl font-bold mb-1 fade-in';
    if (styles.textColor) usernameEl.style.color = styles.textColor;
    // Update page title
    document.title = profile.username;
  } else {
    usernameEl.style.display = 'none';
  }

  // Bio
  const bioEl = document.getElementById('bio');
  if (profile.bio) {
    bioEl.textContent = profile.bio;
    bioEl.className = 'text-sm opacity-80 fade-in-delay-1';
    if (styles.textColor) bioEl.style.color = styles.textColor;
  } else {
    bioEl.style.display = 'none';
  }

  /* ─────────────────────────────────────────────
   * 4. Render link buttons
   * ───────────────────────────────────────────── */
  const linksSection = document.getElementById('links-section');
  const links = config.links || [];

  const borderRadius = styles.buttonRadius !== undefined ? styles.buttonRadius : '9999px';
  const useShadow    = styles.buttonShadow !== false;

  links.forEach((link, index) => {
    if (!link.url || !link.title) return;

    const a = document.createElement('a');
    a.href   = link.url;
    a.target = '_blank';
    a.rel    = 'noopener noreferrer';

    // Staggered fade-in (cap delay at ~600 ms)
    const delay = Math.min(index * 0.06, 0.6);
    a.style.opacity   = '0';
    a.style.animation = `fadeInUp 0.4s ease ${delay}s forwards`;

    // Base classes
    a.className = 'link-btn flex items-center gap-3 w-full px-5 py-3.5 font-semibold text-sm no-underline';
    a.style.backgroundColor = link.bgColor  || '#ffffff';
    a.style.color           = link.textColor || '#000000';
    a.style.borderRadius    = borderRadius;
    if (useShadow) {
      a.style.boxShadow = '0 2px 12px rgba(0,0,0,0.2)';
    }

    // Icon
    if (link.icon) {
      const icon = document.createElement('i');
      icon.className = `${link.icon} text-lg w-6 text-center shrink-0`;
      a.appendChild(icon);
    } else {
      // Spacer so text stays centred even without an icon
      const spacer = document.createElement('span');
      spacer.className = 'w-6 shrink-0';
      a.appendChild(spacer);
    }

    // Title (centred across remaining space)
    const titleSpan = document.createElement('span');
    titleSpan.className = 'flex-1 text-center';
    titleSpan.textContent = link.title;
    a.appendChild(titleSpan);

    // Right chevron (subtle affordance)
    const chevron = document.createElement('i');
    chevron.className = 'fa-solid fa-chevron-right text-xs opacity-40 shrink-0';
    a.appendChild(chevron);

    linksSection.appendChild(a);
  });

  /* ─────────────────────────────────────────────
   * 5. Render video embeds
   * ───────────────────────────────────────────── */
  const streaming = config.streaming || {};

  if (streaming.show === true || streaming.show === 'true') {
    const videoSection   = document.getElementById('video-section');
    const videoHeading   = document.getElementById('video-heading');

    let hasEmbed = false;

    // ── YouTube: latest upload via uploads playlist ──────────────────
    const ytConfig = streaming.youtube;
    if (ytConfig && ytConfig.channelId) {
      const rawId = ytConfig.channelId.trim();

      // Convert UC prefix → UU to target the uploads playlist
      // e.g. UCxxxxxxxx → UUxxxxxxxx
      const uploadsPlaylistId = rawId.startsWith('UC')
        ? 'UU' + rawId.slice(2)
        : rawId;

      const ytIframe    = document.getElementById('youtube-iframe');
      const ytContainer = document.getElementById('youtube-container');

      const ytSrc =
        `https://www.youtube.com/embed/videoseries` +
        `?list=${uploadsPlaylistId}` +
        `&rel=0&modestbranding=1`;

      ytIframe.src           = ytSrc;
      ytContainer.style.display = 'block';
      hasEmbed = true;

      if (ytConfig.label) {
        ytContainer.querySelector('p').innerHTML =
          `<i class="fa-brands fa-youtube text-base"></i> ${escapeHtml(ytConfig.label)}`;
      }
    }

    // ── Twitch: live player (shows offline banner when not live) ─────
    const twConfig = streaming.twitch;
    if (twConfig && twConfig.channel) {
      const twitchIframe    = document.getElementById('twitch-iframe');
      const twitchContainer = document.getElementById('twitch-container');

      // Build parent list — always include current hostname for Replit preview
      const parents = buildTwitchParents(twConfig.parent);

      const twitchSrc =
        `https://player.twitch.tv/` +
        `?channel=${encodeURIComponent(twConfig.channel)}` +
        `&parent=${parents.join('&parent=')}` +
        `&autoplay=false` +
        `&muted=false`;

      twitchIframe.src            = twitchSrc;
      twitchContainer.style.display = 'block';
      hasEmbed = true;

      if (twConfig.label) {
        twitchContainer.querySelector('p').innerHTML =
          `<i class="fa-brands fa-twitch text-base"></i> ${escapeHtml(twConfig.label)}`;
      }
    }

    if (hasEmbed) {
      videoSection.style.display    = 'flex';
      videoSection.style.flexDirection = 'column';
    }
  }

  /* ─────────────────────────────────────────────
   * Helpers
   * ───────────────────────────────────────────── */

  /**
   * Build the Twitch parent domain list.
   * Always includes the current page's hostname so the embed works
   * in both the Replit preview and on GitHub Pages.
   *
   * @param {string|string[]|undefined} configParent
   * @returns {string[]}
   */
  function buildTwitchParents(configParent) {
    const set = new Set();

    // Add current hostname (handles Replit preview + any custom domain)
    if (typeof window !== 'undefined' && window.location.hostname) {
      set.add(window.location.hostname);
    }

    // Add whatever the user configured (string or array)
    if (typeof configParent === 'string' && configParent) {
      configParent.split(',').forEach(p => p.trim() && set.add(p.trim()));
    } else if (Array.isArray(configParent)) {
      configParent.forEach(p => typeof p === 'string' && p.trim() && set.add(p.trim()));
    }

    // Fallback so the iframe always has at least one parent
    if (set.size === 0) set.add('localhost');

    return [...set];
  }

  /**
   * Escape a string for safe insertion into innerHTML.
   * @param {string} str
   * @returns {string}
   */
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /**
   * Display a visible error banner if config fails to load.
   * @param {string} message
   */
  function showError(message) {
    const banner = document.createElement('div');
    banner.style.cssText =
      'position:fixed;top:0;left:0;right:0;padding:12px 16px;background:#ef4444;' +
      'color:#fff;font-family:sans-serif;font-size:14px;text-align:center;z-index:9999';
    banner.textContent = '⚠️ ' + message;
    document.body.prepend(banner);
  }
})();
