import type { CareerJob } from '../types/careerMap';

const normalize = (value: string): string => value.trim().toLocaleLowerCase('ko-KR');

export function searchJobs(jobs: CareerJob[], query: string): CareerJob[] {
  const keyword = normalize(query);

  if (!keyword) {
    return jobs.slice(0, 10);
  }

  return jobs.filter((job) => {
    const haystack = [
      job.title,
      job.site,
      job.level,
      job.description,
      ...job.tags,
    ]
      .map(normalize)
      .join(' ');

    return haystack.includes(keyword);
  });
}
