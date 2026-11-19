import { useUi } from "shared-lib-web";

export function useRoleAssignorTranslation() {
  const { t } = useUi();
  const label = (key: string, fallback: string) => {
    const translated = t(key);
    return translated === key ? fallback : translated;
  };
  return { t, label };
}
