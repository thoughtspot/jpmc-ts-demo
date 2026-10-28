/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly NEXT_PUBLIC_THOUGHTSPOT_HOST?: string;
  readonly NEXT_PUBLIC_TS_ANALYTICS_LIVEBOARD_ID?: string;
  readonly NEXT_PUBLIC_TS_INLINE_INSIGHTS_LIVEBOARD_ID?: string;
  readonly NEXT_PUBLIC_TS_CADENCE_WORKSHEET_ID?: string;
  readonly NEXT_PUBLIC_TS_CAPACITY_LIVEBOARD_ID?: string;
  readonly NEXT_PUBLIC_TS_CAPACITY_VIZ_ID?: string;
  readonly NEXT_PUBLIC_TS_WORKSHEET_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
