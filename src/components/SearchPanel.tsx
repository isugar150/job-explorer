import type { ChangeEvent } from 'react';
import { LuMapPin, LuSearch, LuTags, LuX } from 'react-icons/lu';
import type { CareerJob } from '../types/careerMap';

interface SearchPanelProps {
  open: boolean;
  query: string;
  results: CareerJob[];
  totalCount: number;
  onClose: () => void;
  onQueryChange: (query: string) => void;
  onSelectJob: (job: CareerJob) => void;
}

export function SearchPanel({
  open,
  query,
  results,
  totalCount,
  onClose,
  onQueryChange,
  onSelectJob,
}: SearchPanelProps) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onQueryChange(event.target.value);
  };

  if (!open) {
    return null;
  }

  return (
    <aside id="career-search-panel" className="search-panel" aria-label="직업 검색">
      <div className="app-title">
        <strong>직업 탐색기</strong>
        <span>사이드뷰 월드</span>
      </div>
      <button
        className="search-close"
        type="button"
        aria-label="검색 패널 닫기"
        onClick={onClose}
      >
        <LuX aria-hidden="true" focusable="false" />
      </button>
      <label className="search-label" htmlFor="career-search">
        <LuSearch aria-hidden="true" focusable="false" />
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
              <LuMapPin aria-hidden="true" focusable="false" />
              {job.site} · {job.level}
            </span>
            <span className="result-tags">
              <LuTags aria-hidden="true" focusable="false" />
              {job.tags.slice(0, 3).join(' · ')}
            </span>
          </button>
        ))}
        {results.length === 0 && <p className="empty-results">검색 결과가 없습니다.</p>}
      </div>
    </aside>
  );
}
