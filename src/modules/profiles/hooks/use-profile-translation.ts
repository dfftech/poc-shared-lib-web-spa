import { useCallback } from "react";
import { useUi, type TranslateParams } from "shared-lib-web";

export function useProfileTranslation() {
  const { t: translate } = useUi();
  const t = useCallback(
    (key: string, fallbackOrParams?: string | TranslateParams) => {
      const translated = translate(
        key,
        typeof fallbackOrParams === "object" ? fallbackOrParams : undefined,
      );
      return translated === key && typeof fallbackOrParams === "string"
        ? fallbackOrParams
        : translated;
    },
    [translate],
  );
  return { t };
}
