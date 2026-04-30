import { LuSearch } from 'react-icons/lu';
import { careerMap } from '../data/careerMapData';
import { useCareerMapPage } from '../hooks/useCareerMapPage';
import { MapViewport } from './MapViewport';
import { SearchPanel } from './SearchPanel';
import { DetailPanel } from './DetailPanel';
import { EditPanel } from './EditPanel';

export function CareerMapPage() {
  const {
    copyEditorJson,
    copyState,
    data,
    editMode,
    editedNodeCount,
    editorJson,
    imageCache,
    lastEditedNodeId,
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
    commitEditorJson,
    moveEditorNode,
  } = useCareerMapPage(careerMap);

  return (
    <main
      className={`career-map-page${editMode ? ' edit-mode' : ''}${
        selectedJob ? ' has-detail' : ''
      }${
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
        totalCount={data.jobs.length}
        onClose={() => setSearchOpen(false)}
        onQueryChange={setQuery}
        onSelectJob={openJob}
      />
      <MapViewport
        data={data}
        editMode={editMode}
        imageCache={imageCache}
        selectedJobId={selectedJobId}
        viewportRef={viewportRef}
        zoom={zoom}
        onCommitSceneEdit={commitEditorJson}
        onMoveNode={moveEditorNode}
        onSelectJob={openJob}
      />
      {editMode && (
        <EditPanel
          copyState={copyState}
          editedNodeCount={editedNodeCount}
          json={editorJson}
          lastEditedNodeId={lastEditedNodeId}
          onCopyJson={copyEditorJson}
        />
      )}
      <DetailPanel job={selectedJob} onClose={closeDetail} onConfirm={closeDetail} />
    </main>
  );
}
