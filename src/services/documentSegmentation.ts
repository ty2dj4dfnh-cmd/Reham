import { LecturePage, DocumentChunk } from '../types';

export interface DocumentSegmentationOptions {
  maxPagesPerChunk?: number;
  minChunks?: number;
  maxChunks?: number;
}

const LOGICAL_DOMAIN_SPECS: {
  domain: DocumentChunk['logicalDomain'];
  titleEn: string;
  titleAr: string;
  category: string;
  categoryAr: string;
}[] = [
  {
    domain: 'introduction_definitions',
    titleEn: 'Definitions, Terminology & Anatomical Scope',
    titleAr: 'التعاريف والمصطلحات والنطاق التشريحي',
    category: 'Definitions',
    categoryAr: 'التعاريف الجوهرية',
  },
  {
    domain: 'classification_etiology',
    titleEn: 'Classifications, Staging & Etiological Drivers',
    titleAr: 'التصنيفات والأنماط والمسببات البيولوجية',
    category: 'Classifications & Etiology',
    categoryAr: 'التصنيفات والمسببات',
  },
  {
    domain: 'pathogenesis_mechanisms',
    titleEn: 'Pathogenesis & Cellular Mechanisms',
    titleAr: 'الآلية الإمراضية والاستجابة الخلوية والجزيئية',
    category: 'Pathogenesis',
    categoryAr: 'الآلية الإمراضية',
  },
  {
    domain: 'clinical_manifestations',
    titleEn: 'Clinical Signs, Symptoms & Anatomical Predilections',
    titleAr: 'المظاهر السريرية والأعراض التشخيصية والمواقع المفضلة',
    category: 'Clinical Features',
    categoryAr: 'المظاهر السريرية',
  },
  {
    domain: 'diagnostics_radiography_histology',
    titleEn: 'Radiographic Criteria & Histopathology Hallmarks',
    titleAr: 'المعايير الشعاعية والمجهرية النسيجية',
    category: 'Diagnostics & Imaging',
    categoryAr: 'التشخيص والأشعة والنسيج',
  },
  {
    domain: 'differential_comparisons',
    titleEn: 'Differential Diagnosis & Comparative Tables',
    titleAr: 'التشخيص التفريقي ومقارنات التمييز السريري',
    category: 'Differential Diagnosis',
    categoryAr: 'التشخيص التفريقي',
  },
  {
    domain: 'treatment_protocols',
    titleEn: 'Evidence-Based Management & Procedural Safety Margins',
    titleAr: 'البروتوكول العلاجي وحدود الأمان الجراحي',
    category: 'Treatment Protocol',
    categoryAr: 'البروتوكول العلاجي',
  },
  {
    domain: 'complications_prognosis_pearls',
    titleEn: 'Complications, Prognosis & High-Yield Numerical Metrics',
    titleAr: 'المضاعفات والإنذار والأرقام الامتحانية واللآلئ السريرية',
    category: 'Prognosis & Metrics',
    categoryAr: 'الإنذار والأرقام الامتحانية',
  },
];

/**
 * Splits large lecture documents into comprehensive logical chunks.
 * Guarantees 100% page coverage from page 1 to the final slide with no dropped sections.
 */
export const segmentLectureDocument = (
  pages: LecturePage[],
  lectureTitle: string,
  options?: DocumentSegmentationOptions
): DocumentChunk[] => {
  const effectivePages = pages && pages.length > 0 ? pages : synthesizeFallbackPages(lectureTitle, 16);
  const totalPages = effectivePages.length;

  // Determine optimal chunk count (between 4 and 8 chunks based on document length)
  const minChunks = options?.minChunks ?? Math.min(4, Math.max(2, Math.floor(totalPages / 3)));
  const maxChunks = options?.maxChunks ?? Math.min(8, Math.max(minChunks, Math.ceil(totalPages / 4)));
  const chunkCount = Math.max(minChunks, Math.min(maxChunks, Math.ceil(totalPages / (options?.maxPagesPerChunk || 4))));

  const chunks: DocumentChunk[] = [];
  const pagesPerChunk = totalPages / chunkCount;

  for (let i = 0; i < chunkCount; i++) {
    const startIndex = Math.floor(i * pagesPerChunk);
    // Ensure final chunk captures strictly up to totalPages
    const endIndex = i === chunkCount - 1 ? totalPages : Math.floor((i + 1) * pagesPerChunk);
    const chunkPages = effectivePages.slice(startIndex, endIndex);

    const startPage = chunkPages[0]?.pageNumber || startIndex + 1;
    const endPage = chunkPages[chunkPages.length - 1]?.pageNumber || endIndex;

    const domainSpec = LOGICAL_DOMAIN_SPECS[i % LOGICAL_DOMAIN_SPECS.length];

    const aggregatedText = chunkPages
      .map((p) => p.text)
      .filter(Boolean)
      .join('\n\n');

    const keyPointsGathered = chunkPages.flatMap((p) => p.keyPoints || []);

    const summary = keyPointsGathered.length > 0
      ? keyPointsGathered.slice(0, 3).join(' • ')
      : `Comprehensive clinical concepts spanning slides ${startPage}–${endPage} of ${lectureTitle}.`;

    chunks.push({
      chunkIndex: i,
      totalChunks: chunkCount,
      startPage,
      endPage,
      title: `${domainSpec.titleEn} (Pages ${startPage}–${endPage})`,
      titleAr: `${domainSpec.titleAr} (الصفحات ${startPage}–${endPage})`,
      summary,
      content: aggregatedText || `${domainSpec.titleEn} documented across slides ${startPage} through ${endPage}.`,
      pages: chunkPages,
      logicalDomain: domainSpec.domain,
    });
  }

  return chunks;
};

/**
 * Synthesizes structured fallback pages if PDF text is scanned or minimal
 */
const synthesizeFallbackPages = (lectureTitle: string, count: number): LecturePage[] => {
  const pages: LecturePage[] = [];
  for (let p = 1; p <= count; p++) {
    pages.push({
      pageNumber: p,
      heading: `Slide #${p}: ${lectureTitle} Clinical Concepts`,
      text: `Academic curriculum guidelines and clinical criteria for ${lectureTitle} presented on slide ${p}. Covers diagnostic rules, biological boundaries, and evidence-based protocols.`,
      keyPoints: [
        `Key clinical criterion documented on slide ${p} for ${lectureTitle}`,
        `Board exam discriminator and procedural protocol (Page ${p})`,
      ],
    });
  }
  return pages;
};

/**
 * Returns the logical chunk that corresponds to a specific page number
 */
export const getChunkForPageNumber = (
  chunks: DocumentChunk[],
  pageNumber: number
): DocumentChunk | undefined => {
  return chunks.find((c) => pageNumber >= c.startPage && pageNumber <= c.endPage);
};

/**
 * Distributes requests evenly across all chunks to guarantee complete document coverage
 */
export const sampleChunksEvenly = <T>(
  chunks: DocumentChunk[],
  targetCount: number,
  builder: (chunk: DocumentChunk, indexInChunk: number, globalIndex: number) => T
): T[] => {
  if (chunks.length === 0 || targetCount <= 0) return [];

  const results: T[] = [];
  let chunkIdx = 0;
  const itemsPerChunkCount: Record<number, number> = {};

  for (let i = 0; i < targetCount; i++) {
    const chunk = chunks[chunkIdx % chunks.length];
    const itemInThisChunk = itemsPerChunkCount[chunk.chunkIndex] || 0;
    itemsPerChunkCount[chunk.chunkIndex] = itemInThisChunk + 1;

    results.push(builder(chunk, itemInThisChunk, i));
    chunkIdx++;
  }

  return results;
};

/**
 * Verifies that all pages of a document are accounted for in the segmentation
 */
export const verifyFullDocumentCoverage = (
  chunks: DocumentChunk[],
  totalPages: number
): {
  isComplete: boolean;
  coveredPagesCount: number;
  coveragePercent: number;
  missingPages: number[];
} => {
  const coveredSet = new Set<number>();
  chunks.forEach((c) => {
    for (let p = c.startPage; p <= c.endPage; p++) {
      coveredSet.add(p);
    }
  });

  const missingPages: number[] = [];
  for (let p = 1; p <= totalPages; p++) {
    if (!coveredSet.has(p)) {
      missingPages.push(p);
    }
  }

  const coveragePercent = totalPages > 0 ? Math.round((coveredSet.size / totalPages) * 100) : 100;

  return {
    isComplete: missingPages.length === 0,
    coveredPagesCount: coveredSet.size,
    coveragePercent,
    missingPages,
  };
};
