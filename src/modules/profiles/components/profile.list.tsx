import { HeadLayout, TypeButton, TypeSearch } from "shared-lib-web";
import { useProfileTranslation } from "../hooks/use-profile-translation";
import { ProfileGrid } from "./profile.grid.tsx";
import { useProfileList } from "./profile.list.ts";

export function ProfileList() {
  const { t } = useProfileTranslation();
  const { searchProps, addNewProps, debouncedSearchTerm, canCreate } =
    useProfileList();

  return (
    <div className="w-full flex-1 min-h-0 flex flex-col">
      <HeadLayout
        title={t("nav.profiles")}
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <div className="w-64 max-w-full">
              <TypeSearch
                {...searchProps}
                name="profile-search"
                label={searchProps.placeholder}
                className="w-full rounded-xl bg-base-100 border-base-300"
              />
            </div>
            {canCreate && <TypeButton {...addNewProps} />}
          </div>
        }
        className="mb-4"
      />

      <ProfileGrid searchTerm={debouncedSearchTerm} />
    </div>
  );
}

export default ProfileList;
