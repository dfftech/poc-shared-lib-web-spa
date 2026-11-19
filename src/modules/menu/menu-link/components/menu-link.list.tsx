"use client";

import {
  ContentLayout,
  HeadLayout,
  SkeletonMenu,
  TypeIcon,
  resolveLucideIcon,
} from "shared-lib-web";
import { useSignals } from "@preact/signals-react/runtime";
import { useTranslation } from "../../hooks/use-menu-translation.ts";
import { MenuLinkForm } from "./menu-link.form.tsx";
import {
  useMenuLinkList,
  type MenuItem,
  type SubMenuItem,
} from "./menu-link.list.ts";

export type { MenuItem, SubMenuItem };

export function MenuLinkList() {
  useSignals();
  const { t } = useTranslation();
  const {
    menus,
    selectedMenu,
    filteredSubMenus,
    subMenuStatusFilter,
    // subMenuStatusFilterProps,
    setSelectedMenu,
    isDrawerOpen,
    drawerMode,
    drawerData,
    drawerParentId,
    addMenuButtonProps,
    // addSubMenuButtonProps,
    handleEditGroup,
    handleEditLink,
    handleCloseDrawer,
    canCreate,
    canUpdate,
    isLoading,
  } = useMenuLinkList();

  return (
    <>
      <HeadLayout title={t("settings.menu")} className="mb-4" />

      <ContentLayout>
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Panel - Menus */}
          <div className="w-full lg:w-1/2 bg-base-100 rounded-xl shadow-sm border border-base-300 flex flex-col transition-colors">
            <div className="flex items-center justify-between p-4 border-b border-base-300">
              <h2 className="text-lg font-bold text-base-content">
                {t("settings.menu")}
              </h2>
              {canCreate && (
                <TypeIcon
                  {...addMenuButtonProps}
                  title={t("createMenuGroup")}
                />
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {isLoading ? (
                <SkeletonMenu />
              ) : (
                menus.map((menu) => (
                  <div
                    key={menu.id}
                    onClick={() => setSelectedMenu(menu)}
                    className={`flex items-center justify-between p-3 mb-2 rounded-xl cursor-pointer transition-colors ${
                      selectedMenu?.id === menu.id
                        ? "bg-primary/10 border border-primary/30 text-primary"
                        : "hover:bg-base-200 border border-transparent text-base-content/90"
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <TypeIcon name={resolveLucideIcon(menu.icon)} size={20} />
                      <div className="flex-1">
                        <div className="font-semibold text-base-content">
                          {menu.name}
                          {menu.subMenuCount > 0 && (
                            <span className="text-xs text-base-content/60 ml-1.5 font-normal">
                              ({menu.subMenuCount})
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {canUpdate && menu.id !== "ROOT_GROUP" && (
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditGroup(menu.id);
                        }}
                        className="p-1 hover:bg-base-300 rounded-lg transition-colors cursor-pointer text-base-content/60 hover:text-base-content"
                      >
                        <TypeIcon name="Pencil" size={16} />
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right Panel - Sub Menus */}
          <div className="w-full lg:w-1/2 bg-base-100 rounded-xl shadow-sm border border-base-300 flex flex-col transition-colors">
            <div className="flex items-center justify-between p-4 border-b border-base-300 gap-2">
              <div>
                <h2 className="text-lg font-bold text-base-content">
                  {selectedMenu
                    ? `${selectedMenu.name} - ${t("subMenus")}`
                    : t("subMenus")}
                </h2>
                {selectedMenu && (
                  <p className="text-xs text-base-content/60 mt-0.5">
                    {subMenuStatusFilter === "all"
                      ? t("menuItemsCount", {
                          count: selectedMenu.subMenuCount,
                        })
                      : t("menuFilteredItemsCount", {
                          filtered: filteredSubMenus.length,
                          total: selectedMenu.subMenuCount,
                        })}
                  </p>
                )}
              </div>

              {/* <div className="flex items-center gap-2">
                {selectedMenu && <TypeSelect {...subMenuStatusFilterProps} />}
                {/* Add sub-menu hidden: sub-menu creation disabled */}
              {/* {canCreate && selectedMenu && <TypeIcon {...addSubMenuButtonProps} />} */}
              {/* </div>  */}
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {isLoading ? (
                <SkeletonMenu />
              ) : !selectedMenu || filteredSubMenus.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-base-content/40">
                  <TypeIcon
                    name="FolderOpen"
                    size={36}
                    className="mb-2 opacity-50"
                  />
                  <p className="text-sm font-medium">
                    {selectedMenu && selectedMenu.subMenus.length > 0
                      ? t("noFilteredSubMenus", {
                          filter: t(subMenuStatusFilter),
                        })
                      : t("noSubMenusAvailable")}
                  </p>
                </div>
              ) : (
                filteredSubMenus.map((subMenu) => (
                  <div
                    key={subMenu.id}
                    className="flex items-center justify-between p-3 mb-2 rounded-xl bg-base-200/50 hover:bg-base-200 transition-colors border border-base-300"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      {subMenu.icon && (
                        <TypeIcon
                          name={resolveLucideIcon(subMenu.icon)}
                          size={18}
                          className="text-base-content/60"
                        />
                      )}
                      <div>
                        <div className="font-semibold text-sm text-base-content">
                          {subMenu.name}
                        </div>
                        <div className="text-xs text-base-content/60 font-mono mt-0.5">
                          {subMenu.path}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                          subMenu.active !== false
                            ? "bg-success/15 text-success border border-success/30"
                            : "bg-base-300 text-base-content/80 border border-base-300"
                        }`}
                      >
                        {subMenu.active !== false ? t("active") : t("inactive")}
                      </span>

                      {canUpdate && (
                        <div
                          onClick={() =>
                            handleEditLink(subMenu.id, selectedMenu)
                          }
                          className="p-1 hover:bg-base-300 rounded-lg transition-colors cursor-pointer text-base-content/60 hover:text-base-content"
                        >
                          <TypeIcon name="Pencil" size={16} />
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <MenuLinkForm
          isOpen={isDrawerOpen}
          mode={drawerMode}
          data={drawerData}
          parentId={drawerParentId}
          onClose={handleCloseDrawer}
        />
      </ContentLayout>
    </>
  );
}

export default MenuLinkList;
