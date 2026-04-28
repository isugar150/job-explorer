import type { CareerJob } from '../types/careerMap';

interface DetailPanelProps {
  job: CareerJob | null;
  onClose: () => void;
}

export function DetailPanel({ job, onClose }: DetailPanelProps) {
  if (!job) {
    return null;
  }

  return (
    <aside className="detail-panel" aria-label={`${job.title} 상세 정보`}>
      <button
        className="detail-close"
        type="button"
        aria-label="상세 패널 닫기"
        onClick={onClose}
      >
        ×
      </button>
      <p className="detail-kicker">
        {job.site} · {job.level}
      </p>
      <h2>{job.title}</h2>
      <p className="detail-description">{job.description}</p>
      <div className="tag-list" aria-label="직업 태그">
        {job.tags.map((tag) => (
          <span key={tag}>{tag}</span>
        ))}
      </div>
    </aside>
  );
}
