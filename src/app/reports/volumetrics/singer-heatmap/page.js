"use client";

import { useEffect } from "react";
import { trackReportView } from "@/utils/analytics";
import FullSingerYearHeatmap from "./FullSingerYearHeatmap";

export default function SingerHeatmapPage() {
  useEffect(() => {
    trackReportView("singer-heatmap");
  }, []);

  return <FullSingerYearHeatmap />;
}
