import {
  useContext,
  useMemo,
} from "react";

import {
  ConfiguratorContext,
} from "../context/ConfiguratorContext";

import {
  buildReportData,
} from "./buildReportData";


export function useReportData() {
  const {
    workingModel,
    compositionConfig,
    computedComposition,
  } = useContext(
    ConfiguratorContext
  );

  const reportData =
    useMemo(() => {
      return buildReportData({
        workingModel,
        compositionConfig,
        computedComposition,
      });
    }, [
      workingModel,
      compositionConfig,
      computedComposition,
    ]);

  return reportData;
}