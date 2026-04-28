import { LuSearch } from 'react-icons/lu';
import { careerMap } from '../data/careerMapData';
import { useCareerMapPage } from '../hooks/useCareerMapPage';
import { MapViewport } from './MapViewport';
import { SearchPanel } from './SearchPanel';
import { DetailPanel } from './DetailPanel';

export function CareerMapPage() {
  const {
    imageCache,
    openJob,
    closeDetail,
    query,
    results,
    searchOpen,
    selectedJob,
    selectedJobId,
    setQuery,
    setSearchOpen,
    viewportRef,
    zoom,
  } = useCareerMapPage(careerMap);

  return (
    <main
      className={`career-map-page${selectedJob ? ' has-detail' : ''}${
        searchOpen ? ' search-open' : ''
      }`}
    >
      <button
        className="search-toggle"
        type="button"
        aria-controls="career-search-panel"
        aria-expanded={searchOpen}
        onClick={() => setSearchOpen((open) => !open)}
      >
        <LuSearch aria-hidden="true" focusable="false" />
        검색
      </button>
      <SearchPanel
        open={searchOpen}
        query={query}
        results={results}
        totalCount={careerMap.jobs.length}
        onClose={() => setSearchOpen(false)}
        onQueryChange={setQuery}
        onSelectJob={openJob}
      />
      <MapViewport
        data={careerMap}
        imageCache={imageCache}
        selectedJobId={selectedJobId}
        viewportRef={viewportRef}
        zoom={zoom}
        onSelectJob={openJob}
      />
      <DetailPanel job={selectedJob} onClose={closeDetail} onConfirm={closeDetail} />
    </main>
  );
}
