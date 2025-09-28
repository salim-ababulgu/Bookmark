// Content Script - Détecte les informations de la page
console.log('📚 BookmarkApp Extension: Content script chargé');

class PageDetector {
  constructor() {
    this.pageInfo = null;
    this.init();
  }

  init() {
    // Attendre que la page soit complètement chargée
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.extractPageInfo());
    } else {
      this.extractPageInfo();
    }
  }

  extractPageInfo() {
    try {
      this.pageInfo = {
        title: this.getTitle(),
        url: window.location.href,
        description: this.getDescription(),
        keywords: this.getKeywords(),
        favicon: this.getFavicon(),
        siteName: this.getSiteName(),
        author: this.getAuthor(),
        publishedDate: this.getPublishedDate(),
        image: this.getMainImage(),
        suggestedTags: this.generateTags()
      };

      console.log('📚 Informations de la page détectées:', this.pageInfo);
    } catch (error) {
      console.error('❌ Erreur lors de l\'extraction:', error);
    }
  }

  getTitle() {
    // Ordre de priorité pour le titre
    const selectors = [
      'meta[property="og:title"]',
      'meta[name="twitter:title"]',
      'h1',
      'title'
    ];

    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element) {
        const title = selector.includes('meta')
          ? element.getAttribute('content')
          : element.textContent;

        if (title && title.trim()) {
          return this.cleanText(title);
        }
      }
    }

    return document.title || 'Page sans titre';
  }

  getDescription() {
    // Ordre de priorité pour la description
    const selectors = [
      'meta[property="og:description"]',
      'meta[name="twitter:description"]',
      'meta[name="description"]',
      'meta[name="Description"]'
    ];

    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element) {
        const description = element.getAttribute('content');
        if (description && description.trim()) {
          return this.cleanText(description);
        }
      }
    }

    // Fallback: premier paragraphe avec du contenu
    const paragraphs = document.querySelectorAll('p');
    for (const p of paragraphs) {
      const text = p.textContent.trim();
      if (text.length > 50 && text.length < 300) {
        return this.cleanText(text);
      }
    }

    return '';
  }

  getKeywords() {
    const keywordsElement = document.querySelector('meta[name="keywords"]');
    if (keywordsElement) {
      return keywordsElement.getAttribute('content')
        .split(',')
        .map(k => k.trim())
        .filter(k => k.length > 0);
    }
    return [];
  }

  getFavicon() {
    const selectors = [
      'link[rel*="icon"][sizes="32x32"]',
      'link[rel*="icon"][sizes="16x16"]',
      'link[rel*="icon"]',
      'link[rel="shortcut icon"]'
    ];

    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element) {
        const href = element.getAttribute('href');
        if (href) {
          return new URL(href, window.location.href).href;
        }
      }
    }

    return `${window.location.origin}/favicon.ico`;
  }

  getSiteName() {
    const siteName = document.querySelector('meta[property="og:site_name"]');
    if (siteName) {
      return siteName.getAttribute('content');
    }

    // Fallback: extraire du nom de domaine
    const hostname = window.location.hostname;
    return hostname.replace('www.', '').split('.')[0];
  }

  getAuthor() {
    const selectors = [
      'meta[name="author"]',
      'meta[property="article:author"]',
      '[rel="author"]'
    ];

    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element) {
        const author = selector.includes('meta')
          ? element.getAttribute('content')
          : element.textContent;

        if (author && author.trim()) {
          return this.cleanText(author);
        }
      }
    }

    return '';
  }

  getPublishedDate() {
    const selectors = [
      'meta[property="article:published_time"]',
      'meta[name="publishdate"]',
      'time[datetime]',
      '[property="datePublished"]'
    ];

    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element) {
        const date = element.getAttribute('content') ||
                    element.getAttribute('datetime') ||
                    element.textContent;

        if (date) {
          const parsedDate = new Date(date);
          if (!isNaN(parsedDate)) {
            return parsedDate.toISOString();
          }
        }
      }
    }

    return null;
  }

  getMainImage() {
    const selectors = [
      'meta[property="og:image"]',
      'meta[name="twitter:image"]',
      'img[alt*="hero"]',
      'img[class*="hero"]',
      'img[class*="featured"]'
    ];

    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element) {
        const src = selector.includes('meta')
          ? element.getAttribute('content')
          : element.getAttribute('src');

        if (src) {
          return new URL(src, window.location.href).href;
        }
      }
    }

    return null;
  }

  generateTags() {
    const tags = new Set();
    const hostname = window.location.hostname;

    // Tags basés sur le domaine
    if (hostname.includes('github')) tags.add('développement');
    if (hostname.includes('stackoverflow')) tags.add('programmation');
    if (hostname.includes('medium')) tags.add('article');
    if (hostname.includes('youtube')) tags.add('vidéo');
    if (hostname.includes('twitter')) tags.add('social');
    if (hostname.includes('linkedin')) tags.add('professionnel');
    if (hostname.includes('wikipedia')) tags.add('référence');
    if (hostname.includes('docs.')) tags.add('documentation');

    // Tags basés sur l'URL
    const pathParts = window.location.pathname.split('/').filter(p => p);
    for (const part of pathParts) {
      if (part.length > 2 && part.length < 15) {
        const cleanPart = part.replace(/[-_]/g, ' ').toLowerCase();
        if (!cleanPart.match(/^\d+$/)) {
          tags.add(cleanPart);
        }
      }
    }

    // Tags basés sur les mots-clés META
    this.getKeywords().forEach(keyword => {
      if (keyword.length > 2 && keyword.length < 20) {
        tags.add(keyword.toLowerCase());
      }
    });

    // Tags basés sur le titre
    const titleWords = this.pageInfo?.title?.toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 3 && !['avec', 'pour', 'dans', 'cette', 'cette'].includes(word));

    titleWords?.slice(0, 3).forEach(word => tags.add(word));

    return Array.from(tags).slice(0, 8);
  }

  cleanText(text) {
    return text
      .replace(/\s+/g, ' ')
      .replace(/[\r\n\t]/g, ' ')
      .trim()
      .substring(0, 500);
  }

  getPageInfo() {
    return this.pageInfo;
  }
}

// Instance globale du détecteur
const pageDetector = new PageDetector();

// Écouter les messages du popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('📚 Message reçu dans content script:', request);

  switch (request.action) {
    case 'getPageInfo':
      sendResponse(pageDetector.getPageInfo());
      break;

    case 'refreshPageInfo':
      pageDetector.extractPageInfo();
      sendResponse(pageDetector.getPageInfo());
      break;

    case 'highlightSaved':
      // Effet visuel pour confirmer la sauvegarde
      showSaveConfirmation();
      sendResponse({ success: true });
      break;

    default:
      sendResponse({ error: 'Action non reconnue' });
  }

  return true; // Garder le canal ouvert pour les réponses asynchrones
});

// Fonction pour afficher une confirmation visuelle
function showSaveConfirmation() {
  // Créer une notification discrète
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    z-index: 999999;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    font-weight: 500;
    animation: slideInRight 0.3s ease-out;
  `;

  notification.innerHTML = `
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="font-size: 16px;">✅</span>
      <span>Favori ajouté à BookmarkApp!</span>
    </div>
  `;

  // Ajouter l'animation CSS
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideInRight {
      from {
        opacity: 0;
        transform: translateX(100px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
    @keyframes slideOutRight {
      from {
        opacity: 1;
        transform: translateX(0);
      }
      to {
        opacity: 0;
        transform: translateX(100px);
      }
    }
  `;

  document.head.appendChild(style);
  document.body.appendChild(notification);

  // Supprimer après 3 secondes avec animation
  setTimeout(() => {
    notification.style.animation = 'slideOutRight 0.3s ease-in forwards';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
      if (style.parentNode) {
        style.parentNode.removeChild(style);
      }
    }, 300);
  }, 3000);
}

console.log('📚 BookmarkApp Extension: Content script initialisé');