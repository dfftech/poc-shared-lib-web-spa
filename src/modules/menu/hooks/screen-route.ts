import { useSignals } from "@preact/signals-react/runtime";
import {
  queryParamsSignal,
  setQueryParams,
  type QueryParamValues,
} from "shared-lib-web";

export function setScreenRoute(
  action?: string,
  id?: string,
  extraParams: QueryParamValues = {},
): void {
  setQueryParams({
    pathname: action,
    id,
    mode: extraParams.mode,
    parent: extraParams.parent,
  });
}

export function useScreenRouteSearchParams(): URLSearchParams {
  useSignals();
  return new URLSearchParams(queryParamsSignal.value);
}
