import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  PieChart,
  TrendingUp,
  Calendar,
  Globe,
  Tag,
  Folder,
  Clock,
  Eye,
  Star,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

const Analytics = ({ bookmarks, collections }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [expandedSections, setExpandedSections] = useState({
    overview: true,
    collections: true,
    domains: true,
    tags: true,
    timeline: true
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Filtrer les bookmarks par période
  const filteredBookmarks = useMemo(() => {
    if (selectedPeriod === 'all') return bookmarks;

    const now = new Date();
    const filterDate = new Date();

    switch (selectedPeriod) {
      case 'week':
        filterDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        filterDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        filterDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        return bookmarks;
    }

    return bookmarks.filter(bookmark => {
      const bookmarkDate = bookmark.createdAt?.toDate ? bookmark.createdAt.toDate() : new Date(bookmark.createdAt);
      return bookmarkDate >= filterDate;
    });
  }, [bookmarks, selectedPeriod]);

  // Statistiques générales
  const stats = useMemo(() => {
    const totalBookmarks = filteredBookmarks.length;
    const totalCollections = collections.length;
    const totalTags = [...new Set(filteredBookmarks.flatMap(b => b.tags || []))].length;
    const totalDomains = [...new Set(filteredBookmarks.map(b => {
      try {
        return new URL(b.url).hostname;
      } catch {
        return 'invalide';
      }
    }))].length;

    return { totalBookmarks, totalCollections, totalTags, totalDomains };
  }, [filteredBookmarks, collections]);

  // Analyse par domaine
  const domainStats = useMemo(() => {
    const domains = {};
    filteredBookmarks.forEach(bookmark => {
      try {
        const domain = new URL(bookmark.url).hostname.replace('www.', '');
        domains[domain] = (domains[domain] || 0) + 1;
      } catch {
        domains['URL invalide'] = (domains['URL invalide'] || 0) + 1;
      }
    });

    return Object.entries(domains)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([domain, count]) => ({ domain, count }));
  }, [filteredBookmarks]);

  // Analyse par tags
  const tagStats = useMemo(() => {
    const tags = {};
    filteredBookmarks.forEach(bookmark => {
      if (bookmark.tags) {
        bookmark.tags.forEach(tag => {
          tags[tag] = (tags[tag] || 0) + 1;
        });
      }
    });

    return Object.entries(tags)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([tag, count]) => ({ tag, count }));
  }, [filteredBookmarks]);

  // Analyse par collections
  const collectionStats = useMemo(() => {
    const collectionCounts = {};
    let unassigned = 0;

    filteredBookmarks.forEach(bookmark => {
      if (bookmark.collectionId) {
        const collection = collections.find(c => c.id === bookmark.collectionId);
        const name = collection?.name || 'Collection supprimée';
        collectionCounts[name] = (collectionCounts[name] || 0) + 1;
      } else {
        unassigned++;
      }
    });

    const result = Object.entries(collectionCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    if (unassigned > 0) {
      result.push({ name: 'Sans collection', count: unassigned });
    }

    return result;
  }, [filteredBookmarks, collections]);

  // Timeline des ajouts (par mois des 12 derniers mois)
  const timelineStats = useMemo(() => {
    const timeline = {};
    const now = new Date();

    // Initialiser les 12 derniers mois
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'short' });
      timeline[key] = 0;
    }

    // Compter les bookmarks par mois
    bookmarks.forEach(bookmark => {
      const bookmarkDate = bookmark.createdAt?.toDate ? bookmark.createdAt.toDate() : new Date(bookmark.createdAt);
      const key = bookmarkDate.toLocaleDateString('fr-FR', { year: 'numeric', month: 'short' });
      if (timeline.hasOwnProperty(key)) {
        timeline[key]++;
      }
    });

    return Object.entries(timeline).map(([month, count]) => ({ month, count }));
  }, [bookmarks]);

  const StatCard = ({ icon: Icon, title, value, color = "primary" }) => (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
        </div>
        <div className={`p-3 rounded-full bg-${color}/10`}>
          <Icon className={`h-6 w-6 text-${color}`} />
        </div>
      </div>
    </div>
  );

  const SectionHeader = ({ title, icon: Icon, section, children }) => (
    <div className="bg-card border border-border rounded-lg">
      <button
        onClick={() => toggleSection(section)}
        className="w-full p-4 flex items-center justify-between hover:bg-accent/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Icon className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        </div>
        {expandedSections[section] ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        )}
      </button>
      {expandedSections[section] && (
        <div className="p-4 border-t border-border">
          {children}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header avec filtre de période */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            Statistiques
          </h2>
          <p className="text-muted-foreground">Analyse de vos favoris et habitudes</p>
        </div>

        <select
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
          className="px-3 py-2 border border-input rounded-md bg-background text-foreground focus:ring-2 focus:ring-ring"
        >
          <option value="all">Toute la période</option>
          <option value="week">Cette semaine</option>
          <option value="month">Ce mois</option>
          <option value="year">Cette année</option>
        </select>
      </div>

      {/* Vue d'ensemble */}
      <SectionHeader title="Vue d'ensemble" icon={Eye} section="overview">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            icon={Folder}
            title="Favoris"
            value={stats.totalBookmarks}
            color="primary"
          />
          <StatCard
            icon={Folder}
            title="Collections"
            value={stats.totalCollections}
            color="blue"
          />
          <StatCard
            icon={Tag}
            title="Tags"
            value={stats.totalTags}
            color="green"
          />
          <StatCard
            icon={Globe}
            title="Domaines"
            value={stats.totalDomains}
            color="purple"
          />
        </div>
      </SectionHeader>

      {/* Collections populaires */}
      <SectionHeader title="Collections populaires" icon={Folder} section="collections">
        <div className="space-y-3">
          {collectionStats.length > 0 ? (
            collectionStats.slice(0, 5).map((collection, index) => (
              <div key={collection.name} className="flex items-center justify-between p-3 bg-accent/30 rounded-md">
                <div className="flex items-center gap-3">
                  <div className="text-sm font-medium text-muted-foreground">#{index + 1}</div>
                  <div>
                    <div className="font-medium text-foreground">{collection.name}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-sm text-muted-foreground">{collection.count} favoris</div>
                  <div className="w-20 bg-border rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{
                        width: `${(collection.count / stats.totalBookmarks) * 100}%`
                      }}
                    />
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground text-center py-4">Aucune collection trouvée</p>
          )}
        </div>
      </SectionHeader>

      {/* Domaines populaires */}
      <SectionHeader title="Sites les plus sauvegardés" icon={Globe} section="domains">
        <div className="space-y-3">
          {domainStats.map((domain, index) => (
            <div key={domain.domain} className="flex items-center justify-between p-3 bg-accent/30 rounded-md">
              <div className="flex items-center gap-3">
                <div className="text-sm font-medium text-muted-foreground">#{index + 1}</div>
                <div>
                  <div className="font-medium text-foreground">{domain.domain}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-sm text-muted-foreground">{domain.count} favoris</div>
                <div className="w-20 bg-border rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{
                      width: `${(domain.count / Math.max(...domainStats.map(d => d.count))) * 100}%`
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </SectionHeader>

      {/* Tags populaires */}
      {tagStats.length > 0 && (
        <SectionHeader title="Tags populaires" icon={Tag} section="tags">
          <div className="space-y-3">
            {tagStats.map((tag, index) => (
              <div key={tag.tag} className="flex items-center justify-between p-3 bg-accent/30 rounded-md">
                <div className="flex items-center gap-3">
                  <div className="text-sm font-medium text-muted-foreground">#{index + 1}</div>
                  <div>
                    <div className="font-medium text-foreground">#{tag.tag}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-sm text-muted-foreground">{tag.count} favoris</div>
                  <div className="w-20 bg-border rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{
                        width: `${(tag.count / Math.max(...tagStats.map(t => t.count))) * 100}%`
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SectionHeader>
      )}

      {/* Timeline des ajouts */}
      <SectionHeader title="Activité des 12 derniers mois" icon={TrendingUp} section="timeline">
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {timelineStats.map((item, index) => (
              <div key={index} className="bg-accent/30 p-3 rounded-md text-center">
                <div className="text-xs text-muted-foreground mb-1">{item.month}</div>
                <div className="text-lg font-bold text-foreground">{item.count}</div>
                <div className="w-full bg-border rounded-full h-1 mt-2">
                  <div
                    className="bg-primary h-1 rounded-full"
                    style={{
                      width: `${item.count > 0 ? Math.max((item.count / Math.max(...timelineStats.map(t => t.count))) * 100, 5) : 0}%`
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="text-xs text-muted-foreground text-center">
            Total des favoris ajoutés: {timelineStats.reduce((sum, item) => sum + item.count, 0)}
          </div>
        </div>
      </SectionHeader>
    </div>
  );
};

export default Analytics;