/**
 * Service d'import de favoris robuste et sécurisé
 * Supporte tous les formats de navigateurs avec validation stricte
 */

// Configurations de validation stricte par format
const IMPORT_CONFIGS = {
  html: {
    maxSize: 50 * 1024 * 1024, // 50MB max
    maxBookmarks: 10000,
    requiredPatterns: [
      /<dt>/i,  // Balise dt typique des favoris
      /href\s*=/i // Attribut href obligatoire
    ],
    dangerousPatterns: [
      /<script/i,
      /javascript:/i,
      /data:text\/html/i,
      /vbscript:/i,
      /onload/i,
      /onerror/i
    ]
  },
  json: {
    maxSize: 20 * 1024 * 1024, // 20MB max
    maxBookmarks: 10000,
    requiredFields: ['url'],
    optionalFields: ['title', 'description', 'tags', 'folder', 'dateAdded'],
    dangerousPatterns: [
      /javascript:/i,
      /data:text\/html/i,
      /vbscript:/i
    ]
  },
  netscape: {
    maxSize: 30 * 1024 * 1024, // 30MB max
    maxBookmarks: 8000,
    requiredPatterns: [
      /<!DOCTYPE NETSCAPE-Bookmark-file-1>/i,
      /<A HREF=/i
    ]
  }
};

// Détection du format de fichier
export const detectBookmarkFormat = (content, filename) => {
  const ext = filename.toLowerCase().split('.').pop();

  // Détection par extension
  if (ext === 'json') {
    try {
      JSON.parse(content);
      return 'json';
    } catch {
      throw new Error('Fichier JSON invalide');
    }
  }

  if (ext === 'html' || ext === 'htm') {
    if (content.includes('<!DOCTYPE NETSCAPE-Bookmark-file-1>')) {
      return 'netscape';
    }
    return 'html';
  }

  // Détection par contenu
  if (content.includes('<!DOCTYPE NETSCAPE-Bookmark-file-1>')) {
    return 'netscape';
  }

  if (content.includes('<dt>') || content.includes('<DT>')) {
    return 'html';
  }

  try {
    JSON.parse(content);
    return 'json';
  } catch {
    // Continue
  }

  throw new Error('Format de fichier non reconnu. Formats supportés: HTML, JSON, Netscape Bookmark');
};

// Validation de sécurité avant parsing
export const validateFileContent = (content, format, filename) => {
  const config = IMPORT_CONFIGS[format];

  if (!config) {
    throw new Error(`Format ${format} non supporté`);
  }

  // Vérification de la taille
  if (content.length > config.maxSize) {
    throw new Error(`Fichier trop volumineux (max: ${config.maxSize / 1024 / 1024}MB)`);
  }

  // Vérification des patterns dangereux
  if (config.dangerousPatterns) {
    for (const pattern of config.dangerousPatterns) {
      if (pattern.test(content)) {
        throw new Error('Contenu potentiellement malveillant détecté');
      }
    }
  }

  // Vérification des patterns requis
  if (config.requiredPatterns) {
    for (const pattern of config.requiredPatterns) {
      if (!pattern.test(content)) {
        throw new Error('Le fichier ne semble pas contenir de favoris valides');
      }
    }
  }

  return true;
};

// Parser pour format HTML de navigateur
export const parseHtmlBookmarks = (content) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(content, 'text/html');

  const bookmarks = [];
  const folders = [];

  // Fonction récursive pour parcourir la structure
  const parseFolder = (element, currentFolder = null) => {
    const children = Array.from(element.children);

    for (const child of children) {
      if (child.tagName === 'DT') {
        const link = child.querySelector('a[href]');
        const folderHeader = child.querySelector('h3');

        if (link) {
          // C'est un favori
          const url = link.getAttribute('href');
          const title = link.textContent.trim();
          const addDate = link.getAttribute('add_date');
          const icon = link.getAttribute('icon');

          if (url && !url.startsWith('javascript:') && !url.startsWith('data:')) {
            bookmarks.push({
              title: title || 'Sans titre',
              url: url,
              description: '',
              tags: currentFolder ? [currentFolder] : [],
              folder: currentFolder,
              dateAdded: addDate ? new Date(parseInt(addDate) * 1000) : new Date(),
              favicon: icon || null,
              is_favorite: false,
              is_read: false
            });
          }
        } else if (folderHeader) {
          // C'est un dossier
          const folderName = folderHeader.textContent.trim();
          if (folderName && !folders.includes(folderName)) {
            folders.push(folderName);
          }

          // Chercher la DL suivante pour les enfants
          const nextSibling = child.nextElementSibling;
          if (nextSibling && nextSibling.tagName === 'DL') {
            parseFolder(nextSibling, folderName);
          }
        }
      } else if (child.tagName === 'DL') {
        parseFolder(child, currentFolder);
      }
    }
  };

  parseFolder(doc.body);

  return { bookmarks, folders };
};

// Parser pour format Netscape Bookmark
export const parseNetscapeBookmarks = (content) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(content, 'text/html');

  const bookmarks = [];
  const folders = [];

  const links = doc.querySelectorAll('a[href]');

  links.forEach(link => {
    const url = link.getAttribute('href');
    const title = link.textContent.trim();
    const addDate = link.getAttribute('add_date');
    const lastVisit = link.getAttribute('last_visit');
    const icon = link.getAttribute('icon');

    // Trouver le dossier parent
    let folder = null;
    let parent = link.parentElement;
    while (parent && !folder) {
      const h3 = parent.querySelector('h3');
      if (h3) {
        folder = h3.textContent.trim();
        if (folder && !folders.includes(folder)) {
          folders.push(folder);
        }
      }
      parent = parent.parentElement;
    }

    if (url && !url.startsWith('javascript:') && !url.startsWith('data:')) {
      bookmarks.push({
        title: title || 'Sans titre',
        url: url,
        description: '',
        tags: folder ? [folder] : [],
        folder: folder,
        dateAdded: addDate ? new Date(parseInt(addDate) * 1000) : new Date(),
        lastVisit: lastVisit ? new Date(parseInt(lastVisit) * 1000) : null,
        favicon: icon || null,
        is_favorite: false,
        is_read: false
      });
    }
  });

  return { bookmarks, folders };
};

// Parser pour format JSON
export const parseJsonBookmarks = (content) => {
  let data;
  try {
    data = JSON.parse(content);
  } catch (error) {
    throw new Error('Format JSON invalide');
  }

  const bookmarks = [];
  const folders = [];

  // Support de différents formats JSON
  const extractBookmarks = (obj, currentFolder = null) => {
    if (Array.isArray(obj)) {
      obj.forEach(item => extractBookmarks(item, currentFolder));
    } else if (obj && typeof obj === 'object') {
      // Format Chrome/Edge
      if (obj.type === 'url' && obj.url) {
        bookmarks.push({
          title: obj.name || obj.title || 'Sans titre',
          url: obj.url,
          description: '',
          tags: currentFolder ? [currentFolder] : [],
          folder: currentFolder,
          dateAdded: obj.date_added ? new Date(parseInt(obj.date_added) / 1000) : new Date(),
          favicon: null,
          is_favorite: false,
          is_read: false
        });
      }
      // Format dossier
      else if (obj.type === 'folder' && obj.children) {
        const folderName = obj.name || obj.title;
        if (folderName && !folders.includes(folderName)) {
          folders.push(folderName);
        }
        extractBookmarks(obj.children, folderName);
      }
      // Format Firefox
      else if (obj.children) {
        extractBookmarks(obj.children, currentFolder);
      }
      // Format simple
      else if (obj.url) {
        bookmarks.push({
          title: obj.title || obj.name || 'Sans titre',
          url: obj.url,
          description: obj.description || '',
          tags: obj.tags || (currentFolder ? [currentFolder] : []),
          folder: obj.folder || currentFolder,
          dateAdded: obj.dateAdded ? new Date(obj.dateAdded) : new Date(),
          favicon: obj.favicon || null,
          is_favorite: obj.is_favorite || false,
          is_read: obj.is_read || false
        });
      }
      // Parcourir les propriétés
      else {
        Object.values(obj).forEach(value => {
          if (typeof value === 'object') {
            extractBookmarks(value, currentFolder);
          }
        });
      }
    }
  };

  extractBookmarks(data);

  return { bookmarks, folders };
};

// Fonction principale d'import
export const importBookmarks = async (file, options = {}) => {
  const {
    maxBookmarks = 5000,
    validateUrls = true,
    includeFolders = true,
    onProgress = () => {},
    filterDuplicates = true
  } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (event) => {
      try {
        const content = event.target.result;

        onProgress({ step: 'validation', progress: 10 });

        // Détection du format
        const format = detectBookmarkFormat(content, file.name);

        // Validation de sécurité
        validateFileContent(content, format, file.name);

        onProgress({ step: 'parsing', progress: 30 });

        let result;

        // Parsing selon le format
        switch (format) {
          case 'html':
            result = parseHtmlBookmarks(content);
            break;
          case 'netscape':
            result = parseNetscapeBookmarks(content);
            break;
          case 'json':
            result = parseJsonBookmarks(content);
            break;
          default:
            throw new Error(`Format ${format} non supporté`);
        }

        onProgress({ step: 'processing', progress: 60 });

        let { bookmarks, folders } = result;

        // Limitation du nombre de favoris
        if (bookmarks.length > maxBookmarks) {
          bookmarks = bookmarks.slice(0, maxBookmarks);
        }

        // Validation des URLs si demandée
        if (validateUrls) {
          bookmarks = bookmarks.filter(bookmark => {
            try {
              new URL(bookmark.url);
              return true;
            } catch {
              return false;
            }
          });
        }

        onProgress({ step: 'filtering', progress: 80 });

        // Filtrage des doublons
        if (filterDuplicates) {
          const seenUrls = new Set();
          bookmarks = bookmarks.filter(bookmark => {
            if (seenUrls.has(bookmark.url)) {
              return false;
            }
            seenUrls.add(bookmark.url);
            return true;
          });
        }

        onProgress({ step: 'completed', progress: 100 });

        resolve({
          bookmarks,
          folders: includeFolders ? folders : [],
          stats: {
            total: bookmarks.length,
            folders: folders.length,
            format,
            fileSize: file.size
          }
        });

      } catch (error) {
        reject(new Error(`Erreur d'import: ${error.message}`));
      }
    };

    reader.onerror = () => {
      reject(new Error('Erreur de lecture du fichier'));
    };

    reader.readAsText(file, 'utf-8');
  });
};

// Fonction pour obtenir des favoris de démonstration - Désactivée
export const getDemoBookmarks = () => {
  return {
    bookmarks: [],
    folders: [],
    stats: {
      total: 0,
      folders: 0,
      format: "demo",
      fileSize: 0
    }
  };
};

export default {
  importBookmarks,
  getDemoBookmarks,
  detectBookmarkFormat,
  validateFileContent
};