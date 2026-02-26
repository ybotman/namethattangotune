"use client";

import { useEffect } from "react";
import { trackReportView } from "@/utils/analytics";
import FullOrchestraYearHeatmap from "./FullOrchestraYearHeatmap";

export default function OrchestraHeatmapPage() {
  useEffect(() => {
    trackReportView("orchestra-heatmap");
  }, []);

  return <FullOrchestraYearHeatmap />;
}
