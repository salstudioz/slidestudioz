import React from 'react';
import { ShieldCheck, Mail, ArrowUpRight, CheckCircle } from 'lucide-react';

export default function SlideCanvas({ slide, currentSlideNum, totalSlides, companyName = "Enterprise Solutions" }) {
  if (!slide) return null;

  const layout = slide.layout_type || 'content';
  const title = slide.title || 'Untitled Slide';
  const subtitle = slide.subtitle || '';
  const companyUpper = (companyName || "ENTERPRISE SOLUTIONS").toUpperCase();
  
  let contentPoints = [];
  if (Array.isArray(slide.content)) {
    contentPoints = slide.content;
  } else if (typeof slide.content === 'string') {
    try {
      contentPoints = JSON.parse(slide.content);
      if (!Array.isArray(contentPoints)) contentPoints = [slide.content];
    } catch (e) {
      contentPoints = slide.content.split('\n').filter(Boolean);
    }
  }

  return (
    <div className="slide-canvas-aspect shadow-2xl rounded-xl border border-gray-300 relative overflow-hidden select-none bg-white">
      
      {/* 1. COVER LAYOUT */}
      {layout === 'cover' && (
        <div className="w-full h-full bg-[#F5F7FA] p-6 lg:p-8 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-4 rounded-xl border border-gray-200 bg-white shadow-sm -z-0 pointer-events-none" />
          
          <div className="relative z-10 flex items-center justify-between shrink-0">
            <span className="text-[11px] font-extrabold tracking-widest text-[#1E5FDB] uppercase truncate pr-2">
              {companyUpper}  •  PRESENTATION
            </span>
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#0B2A6B] shrink-0">
              <div className="w-5 h-5 rounded bg-[#1E5FDB] flex items-center justify-center text-white text-[10px]">G</div>
              {companyName}
            </div>
          </div>

          <div className="relative z-10 my-auto px-4 lg:px-6 overflow-hidden">
            <h1 className="text-2xl lg:text-3xl font-extrabold text-[#0B2A6B] tracking-tight leading-tight mb-2 max-w-2xl line-clamp-3 break-words">
              {title}
            </h1>
            <p className="text-sm lg:text-base font-medium text-[#1E5FDB] max-w-xl line-clamp-2 break-words">
              {subtitle}
            </p>
          </div>

          <div className="relative z-10 flex items-center justify-between border-t border-gray-100 pt-3 text-xs text-[#5B6472] shrink-0">
            <span className="font-semibold truncate max-w-[70%]">
              {companyName} | {contentPoints.join(' • ') || 'Executive Deck'}
            </span>
            <span className="font-mono text-[11px] shrink-0">GetSlideZ AI Engine</span>
          </div>
        </div>
      )}

      {/* 2. DIVIDER LAYOUT */}
      {layout === 'divider' && (
        <div className="w-full h-full bg-[#F5F7FA] p-6 lg:p-8 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-4 rounded-xl border border-gray-200 bg-white shadow-sm -z-0 pointer-events-none" />

          <div className="relative z-10 flex items-center justify-between shrink-0">
            <span className="text-[11px] font-extrabold tracking-widest text-[#1E5FDB] uppercase truncate pr-2">
              {companyUpper}  •  SECTION OVERVIEW
            </span>
            <span className="text-xs font-bold text-[#5B6472] shrink-0">
              {currentSlideNum} / {totalSlides}
            </span>
          </div>

          <div className="relative z-10 my-auto px-6 lg:px-8 overflow-hidden">
            <div className="text-xs font-bold tracking-widest text-[#1E5FDB] mb-2 uppercase truncate">
              0{currentSlideNum} — SECTION OVERVIEW
            </div>
            <h2 className="text-2xl lg:text-3xl font-extrabold text-[#0B2A6B] tracking-tight leading-tight mb-2 line-clamp-2 break-words">
              {title}
            </h2>
            <p className="text-sm lg:text-base text-[#0B0F19] max-w-2xl leading-relaxed line-clamp-3 break-words">
              {subtitle}
            </p>
          </div>

          <div className="relative z-10 flex items-center justify-between text-xs text-[#5B6472] border-t border-gray-100 pt-3 shrink-0">
            <span className="truncate max-w-[75%]">{companyName} | {title}</span>
            <span className="font-bold shrink-0">{currentSlideNum} / {totalSlides}</span>
          </div>
        </div>
      )}

      {/* 3. CONTENT LAYOUT */}
      {layout === 'content' && (
        <div className="w-full h-full bg-white p-6 lg:p-8 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-gray-100 pb-2 shrink-0">
            <div className="min-w-0 pr-4">
              <span className="text-[10px] font-extrabold tracking-widest text-[#1E5FDB] uppercase block mb-0.5">
                {companyUpper}  •  SOLUTION OUTLINE
              </span>
              <h2 className="text-xl lg:text-2xl font-extrabold text-[#0B2A6B] tracking-tight truncate">
                {title}
              </h2>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#0B2A6B] shrink-0">
              <div className="w-5 h-5 rounded bg-[#1E5FDB] flex items-center justify-center text-white text-[10px]">G</div>
              {companyName}
            </div>
          </div>

          {subtitle && (
            <p className="text-xs font-medium text-[#5B6472] mt-1 mb-1 line-clamp-1 truncate shrink-0">
              {subtitle}
            </p>
          )}

          <div className="my-auto py-1 overflow-hidden">
            <ul className="space-y-2">
              {contentPoints.slice(0, 5).map((pt, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs lg:text-sm text-[#0B0F19] font-medium leading-snug">
                  <span className="w-2 h-2 rounded-full bg-[#1E5FDB] mt-1 flex-shrink-0" />
                  <span className="line-clamp-2 break-words">{pt}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex items-center justify-between text-xs text-[#5B6472] border-t border-gray-100 pt-2 shrink-0">
            <span className="truncate max-w-[75%]">{companyName} | {title}</span>
            <span className="font-bold text-[#5B6472] shrink-0">{currentSlideNum} / {totalSlides}</span>
          </div>
        </div>
      )}

      {/* 4. TWO COLUMN LAYOUT */}
      {layout === 'two_column' && (
        <div className="w-full h-full bg-white p-6 lg:p-8 flex flex-col justify-between overflow-hidden">
          <div className="flex items-center justify-between border-b border-gray-100 pb-2 shrink-0">
            <h2 className="text-xl lg:text-2xl font-extrabold text-[#0B2A6B] truncate pr-4">{title}</h2>
            <span className="text-xs font-bold text-[#1E5FDB] shrink-0">{companyUpper}</span>
          </div>

          {subtitle && <p className="text-xs text-[#5B6472] truncate shrink-0 mt-0.5">{subtitle}</p>}

          <div className="grid grid-cols-2 gap-3 my-auto overflow-hidden">
            <div className="p-3 rounded-xl bg-[#F5F7FA] border border-gray-200 overflow-hidden">
              <h4 className="text-[11px] font-extrabold text-[#1E5FDB] uppercase mb-1.5 truncate">Kapabilitas Utama</h4>
              <ul className="space-y-1.5 text-xs text-[#0B0F19]">
                {contentPoints.slice(0, 3).map((pt, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-[#1E5FDB] shrink-0 mt-0.5" />
                    <span className="line-clamp-2 break-words">{pt}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-3 rounded-xl bg-[#F5F7FA] border border-gray-200 overflow-hidden">
              <h4 className="text-[11px] font-extrabold text-[#1E5FDB] uppercase mb-1.5 truncate">Nilai Tambah Enterprise</h4>
              <ul className="space-y-1.5 text-xs text-[#0B0F19]">
                {contentPoints.slice(3, 6).concat(["Keamanan Enterprise & RBAC", "Integrasi Sistem Operasional"]).slice(0, 3).map((pt, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#38BDF8] shrink-0 mt-0.5" />
                    <span className="line-clamp-2 break-words">{pt}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-[#5B6472] border-t border-gray-100 pt-2 shrink-0">
            <span className="truncate max-w-[75%]">{companyName} | {title}</span>
            <span className="font-bold shrink-0">{currentSlideNum} / {totalSlides}</span>
          </div>
        </div>
      )}

      {/* 5. STATS LAYOUT */}
      {layout === 'stats' && (
        <div className="w-full h-full bg-white p-6 lg:p-8 flex flex-col justify-between overflow-hidden">
          <div className="border-b border-gray-100 pb-2 shrink-0">
            <h2 className="text-xl lg:text-2xl font-extrabold text-[#0B2A6B] truncate">{title}</h2>
            {subtitle && <p className="text-xs text-[#5B6472] mt-0.5 truncate">{subtitle}</p>}
          </div>

          <div className="grid grid-cols-3 gap-3 my-auto overflow-hidden">
            {contentPoints.slice(0, 3).map((item, idx) => {
              const parts = item.split(' ');
              const bigNum = parts[0] || '10x';
              const label = parts.slice(1).join(' ') || item;
              return (
                <div key={idx} className="p-3 rounded-xl bg-[#F5F7FA] border border-gray-200 text-center flex flex-col justify-center overflow-hidden">
                  <div className="text-2xl lg:text-3xl font-extrabold text-[#1E5FDB] mb-1 truncate px-1">{bigNum}</div>
                  <div className="text-xs font-bold text-[#0B0F19] leading-snug line-clamp-3 break-words px-1">{label}</div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-xs text-[#5B6472] border-t border-gray-100 pt-2 shrink-0">
            <span className="truncate max-w-[75%]">{companyName} | Impact Metrics</span>
            <span className="font-bold shrink-0">{currentSlideNum} / {totalSlides}</span>
          </div>
        </div>
      )}

      {/* 6. CARDS LAYOUT */}
      {layout === 'cards' && (
        <div className="w-full h-full bg-white p-6 lg:p-8 flex flex-col justify-between overflow-hidden">
          <div className="border-b border-gray-100 pb-2 shrink-0">
            <h2 className="text-xl lg:text-2xl font-extrabold text-[#0B2A6B] truncate">{title}</h2>
            {subtitle && <p className="text-xs text-[#5B6472] mt-0.5 truncate">{subtitle}</p>}
          </div>

          <div className="grid grid-cols-3 gap-3 my-auto overflow-hidden">
            {contentPoints.slice(0, 3).map((item, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-[#F5F7FA] border border-gray-200 flex flex-col justify-between overflow-hidden">
                <div className="overflow-hidden">
                  <span className="text-[10px] font-extrabold text-[#1E5FDB] uppercase block mb-1 truncate">
                    Pilar 0{idx + 1}
                  </span>
                  <p className="text-xs font-semibold text-[#0B0F19] leading-snug line-clamp-4 break-words">{item}</p>
                </div>
                <div className="mt-2 text-[10px] font-bold text-[#5B6472] flex items-center gap-1 shrink-0">
                  {companyName} <ArrowUpRight className="w-3 h-3 text-[#1E5FDB] shrink-0" />
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between text-xs text-[#5B6472] border-t border-gray-100 pt-2 shrink-0">
            <span className="truncate max-w-[75%]">{companyName} | Capabilities</span>
            <span className="font-bold shrink-0">{currentSlideNum} / {totalSlides}</span>
          </div>
        </div>
      )}

      {/* 7. CLOSING LAYOUT */}
      {layout === 'closing' && (
        <div className="w-full h-full bg-[#F5F7FA] p-6 lg:p-8 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-4 rounded-xl border border-gray-200 bg-white shadow-sm -z-0 pointer-events-none" />

          <div className="relative z-10 flex items-center justify-between shrink-0">
            <span className="text-[11px] font-extrabold tracking-widest text-[#1E5FDB] uppercase truncate pr-2">
              {companyUpper}
            </span>
            <span className="text-xs font-bold text-[#5B6472] shrink-0">{currentSlideNum} / {totalSlides}</span>
          </div>

          <div className="relative z-10 my-auto px-6 lg:px-8 overflow-hidden">
            <h2 className="text-2xl lg:text-3xl font-extrabold text-[#0B2A6B] mb-2 leading-tight line-clamp-2 break-words">
              {title}
            </h2>
            <p className="text-sm lg:text-base text-[#1E5FDB] font-medium mb-4 line-clamp-2 break-words">
              {subtitle}
            </p>

            <div className="flex items-center gap-3 flex-wrap">
              <div className="px-4 py-2 rounded-lg bg-[#1E5FDB] text-white font-bold text-xs shadow-md shrink-0">
                Hubungi Tim Presenter
              </div>
            </div>
          </div>

          <div className="relative z-10 flex items-center justify-between text-xs text-[#5B6472] border-t border-gray-100 pt-3 shrink-0">
            <span className="truncate max-w-[70%]">{companyName} Executive Presentation</span>
            <span className="font-mono text-[11px] shrink-0">GetSlideZ</span>
          </div>
        </div>
      )}

    </div>
  );
}
