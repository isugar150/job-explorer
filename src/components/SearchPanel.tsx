import type { ChangeEvent } from 'react';
import type { CareerJob } from '../types/careerMap';

interface SearchPanelProps {
  query: string;
  results: CareerJob[];
  totalCount: number;
  onQueryChange: (query: string) => void;
  onSelectJob: (job: CareerJob) => void;
}

export function SearchPanel({
  query,
  results,
  totalCount,
  onQueryChange,
  onSelectJob,
}: SearchPanelProps) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onQueryChange(event.target.value);
  };

  return (
    <aside className="search-panel" aria-label="직업 검색">
      <div className="app-title">
        <strong>직업 탐색기</strong>
        <span>사이드뷰 월드</span>
      </div>
      <label className="search-label" htmlFor="career-search">
        검색
      </label>
      <input
        id="career-search"
        className="search-input"
        type="search"
        value={query}
        onChange={handleChange}
        placeholder="직업, 현장, 층, 태그 검색"
        autoComplete="off"
      />
      <div className="result-count" aria-live="polite">
        {query ? `${results.length}개 결과` : `${Math.min(results.length, totalCount)}개 추천`}
      </div>
      <div className="result-list" role="list">
        {results.map((job) => (
          <button
            key={job.id}
            className="result-item"
            type="button"
            onClick={() => onSelectJob(job)}
          >
            <span className="result-title">{job.title}</span>
            <span className="result-meta">
              {job.site} · {job.level}
            </span>
            <span className="result-tags">{job.tags.slice(0, 3).join(' · ')}</span>
          </button>
        ))}
        {results.length === 0 && <p className="empty-results">검색 결과가 없습니다.</p>}
      </div>
    </aside>
  );
}
