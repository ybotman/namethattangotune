// src/app/reports/volumetrics/singer-heatmap/page.js
import FullSingerYearHeatmap from "./FullSingerYearHeatmap";

export const metadata = {
  title: "Singer × Year Heatmap | NTTT",
  description: "Visualize tango singer recordings by year",
};

export default function SingerHeatmapPage() {
  return <FullSingerYearHeatmap />;
}
