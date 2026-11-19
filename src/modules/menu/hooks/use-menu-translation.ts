import { useUi } from "shared-lib-web";

export function useTranslation() {
  const { t } = useUi();
  return { t };
}
