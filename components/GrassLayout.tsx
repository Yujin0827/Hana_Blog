'use client';

import { useMemo, useState } from 'react';
import type { ActivityByYear } from '@/lib/activity';

const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const SHOW_WEEK_DAYS = ['Mon', 'Wed', 'Fri'];

function toYmd(d: Date) {
  return d.toISOString().slice(0, 10);
}

function getYearDays(year: number) {
  const start = new Date(year, 0, 1);
  const end = new Date(year, 11, 31);

  const days: Date[] = [];
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    days.push(new Date(d));
  }
  return days;
}

function getLevel(count: number) {
  if (count >= 4) return 4;
  if (count === 3) return 3;
  if (count === 2) return 2;
  if (count === 1) return 1;
  return 0;
}

const LEVEL_CLASS = [
  'bg-muted/50',
  'bg-green-200',
  'bg-green-400',
  'bg-green-600',
  'bg-green-800',
];

export function GrassLayout({
  activityByYear,
}: {
  activityByYear: ActivityByYear;
}) {
  const years = Object.keys(activityByYear)
    .map(Number)
    .sort((a, b) => b - a);

  const [year, setYear] = useState(years[0]);

  const days = useMemo(() => getYearDays(year), [year]);
  const weeks = useMemo(() => {
    const w: Date[][] = [];
    for (let i = 0; i < days.length; i += 7) {
      w.push(days.slice(i, i + 7));
    }
    return w;
  }, [days]);

  const total = Object.values(activityByYear[year]).reduce((a, b) => a + b, 0);

  // 잔디 hover 시
  const [hovered, setHovered] = useState<{
    x: number;
    y: number;
    date: string;
    count: number;
  } | null>(null);

  // 클릭 시 modal
  const [selected, setSelected] = useState<{
    date: string;
    count: number;
  } | null>(null);

  return (
    <section className="relative rounded-lg border p-5">
      {/* 상단 */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-medium text-sm">
          {total} contributions in {year}
        </h2>

        <div className="flex gap-2">
          {years.map((y) => (
            <button
              key={y}
              type="button"
              onClick={() => setYear(y)}
              className={`rounded px-3 py-1 text-sm ${
                y === year
                  ? 'bg-blue-600 text-white'
                  : 'border text-muted-foreground'
              }`}
            >
              {y}
            </button>
          ))}
        </div>
      </div>

      {/* 잔디 hover 시 */}
      {hovered && (
        <div
          className="-translate-x-1/2 -translate-y-full fixed z-50 rounded bg-black px-2 py-1 text-white text-xs shadow"
          style={{
            left: hovered.x,
            top: hovered.y - 3,
          }}
        >
          {hovered.date} · {hovered.count}회
        </div>
      )}

      {/* 잔디 */}
      <div className="flex">
        <div className="mr-2 flex flex-col gap-1 text-muted-foreground text-xs">
          {WEEK_DAYS.map((d) => (
            <div key={d} className="h-3">
              {SHOW_WEEK_DAYS.includes(d) ? d : ''}
            </div>
          ))}
        </div>

        <div className="overflow-x-auto">
          <div className="flex gap-1">
            {weeks.map((week, wi) => {
              const firstOfMonth = week.find((d) => d.getDate() === 1);

              return (
                <div key={wi} className="flex flex-col items-center">
                  {/* 월 라벨 (같이 스크롤됨) */}
                  <div className="mb-1 h-4 w-4 text-center text-muted-foreground text-xs">
                    {firstOfMonth
                      ? firstOfMonth.toLocaleString('en', { month: 'short' })
                      : ''}
                  </div>

                  {/* 잔디 */}
                  <div className="flex flex-col gap-1">
                    {week.map((d) => {
                      const key = toYmd(d);
                      const count = activityByYear[year][key] ?? 0;

                      return (
                        <button
                          key={key}
                          type="button"
                          aria-label={`${key} · ${count}회`}
                          onMouseEnter={(e) => {
                            const rect =
                              e.currentTarget.getBoundingClientRect();
                            setHovered({
                              x: rect.left + rect.width / 2,
                              y: rect.top - 3,
                              date: key,
                              count,
                            });
                          }}
                          onMouseLeave={() => setHovered(null)}
                          onClick={() => setSelected({ date: key, count })}
                          className={`h-3 w-3 rounded-sm ${LEVEL_CLASS[getLevel(count)]}`}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 범례 */}
      <div className="mt-3 flex items-center gap-2 text-muted-foreground text-xs">
        <span>Less</span>
        <div className="flex gap-1">
          {LEVEL_CLASS.map((c, i) => (
            <div key={i} className={`h-3 w-3 rounded-sm ${c}`} />
          ))}
        </div>
        <span>More</span>
      </div>

      {/* 클릭 시 모달 */}
      {selected && (
        <div
          aria-label="닫기"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => setSelected(null)}
        >
          <div
            className="w-80 rounded-lg bg-white p-5 text-left shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold text-sm">활동 상세</h3>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="text-muted-foreground text-sm hover:text-black"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-sm">
              <p>
                <span className="font-medium">날짜:</span> {selected.date}
              </p>
              <p>
                <span className="font-medium">업로드 수:</span> {selected.count}
                회
              </p>
            </div>

            <div className="mt-4 text-right">
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
