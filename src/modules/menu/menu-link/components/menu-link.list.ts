'use client';

import type { IconName } from 'shared-lib-web';
import { canAccessPath, useCurrentPage, localeSignal } from 'shared-lib-web';
import { personaSignal, pickMenuName, isAdminRootMenu } from '../../hooks/menu-context.ts';
import { useSignals } from '@preact/signals-react/runtime';
import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { setScreenRoute, useScreenRouteSearchParams } from '../../hooks/screen-route.ts';
import {
  fetchMenuGroupsWithLinks,
  menuGroupsWithLinksIsLoadingSignal,
  menuGroupsWithLinksSignal,
} from '../hooks/service-http';
import type { MenuDrawerMode, MenuItem, SubMenuItem } from '../hooks/types';

export type SubMenuStatusFilter = 'all' | 'active' | 'inactive';

const subscribeMounted = () => () => {};
const mountedClientSnapshot = () => true;
const mountedServerSnapshot = () => false;

export function useMenuLinkList() {
  useSignals();
  const pathname = useCurrentPage();
  const searchParams = useScreenRouteSearchParams();
  const routeAction = searchParams.get('pathname');
  const routeId = searchParams.get('id');

  const [selectedMenu, setSelectedMenu] = useState<MenuItem | null>(null);
  const [subMenuStatusFilter, setSubMenuStatusFilter] = useState<SubMenuStatusFilter>('all');
  // Gate client-only data until after hydration so SSR HTML and the first
  // client render match (both render skeletons). Without this, cached
  // signal values populate `menus` during hydration while the server
  // rendered an empty list -> React hydration mismatch at menus.map.
  const isMounted = useSyncExternalStore(
    subscribeMounted,
    mountedClientSnapshot,
    mountedServerSnapshot,
  );

  useEffect(() => {
    void fetchMenuGroupsWithLinks();
  }, []);

  // Pre-mount: use deterministic SSR-safe defaults (empty list, loading on,
  // default permissions). Post-mount: use live signal values.
  const liveMenuGroupsWithLinks = menuGroupsWithLinksSignal.value;
  const menuGroupsWithLinks = useMemo(
    () => (isMounted ? liveMenuGroupsWithLinks : []),
    [isMounted, liveMenuGroupsWithLinks],
  );
  const isLoading = !isMounted || menuGroupsWithLinksIsLoadingSignal.value;
  const canCreate = isMounted ? canAccessPath("create", pathname) : true;
  const canUpdate = isMounted ? canAccessPath("update", pathname) : true;

  const lang = localeSignal.value;

  const menus = useMemo(() => {
    const groupMap = new Map<string, MenuItem>();

    menuGroupsWithLinks.forEach((group) => {
      if (group.id === 'ROOT' || !group.id) {
        const rootId = 'ROOT_GROUP';
        if (!groupMap.has(rootId)) {
          groupMap.set(rootId, {
            id: rootId,
            name: pickMenuName(group.nameLang, group.name, lang) || 'Root',
            nameLang: group.nameLang,
            icon: (group.icon as IconName) || 'LayoutGrid',
            subMenuCount: 0,
            subMenus: [],
            priority: group.priority || 0,
            active: group.active,
            persona: group.persona || personaSignal.value,
          });
        }
        const rootGroup = groupMap.get(rootId)!;
        if (group.links && Array.isArray(group.links)) {
          group.links.forEach((link) => {
            rootGroup.subMenus.push({
              id: link.id,
              name: pickMenuName(link.nameLang, link.name, lang),
              path: link.href,
              menuGroupId: 'ROOT',
              priority: link.priority,
              active: link.active,
              persona: link.persona,
              icon: link.icon,
              nameLang: link.nameLang,
            });
          });
        }
        rootGroup.subMenuCount = rootGroup.subMenus.length;
      } else if (isAdminRootMenu(group.id)) {
        // ADMIN_ROOT is not shown; each of its links becomes its own parent row.
        (group.links ?? []).forEach((link) => {
          const subMenu: SubMenuItem = {
            id: link.id,
            name: pickMenuName(link.nameLang, link.name, lang),
            path: link.href,
            menuGroupId: group.id,
            priority: link.priority,
            active: link.active,
            persona: link.persona,
            icon: link.icon,
            nameLang: link.nameLang,
          };
          groupMap.set(link.id, {
            id: link.id,
            name: subMenu.name,
            nameLang: link.nameLang,
            icon: (link.icon as IconName) || '',
            subMenuCount: 0,
            subMenus: [],
            priority: link.priority,
            active: link.active,
            persona: link.persona || personaSignal.value,
            link: subMenu,
          });
        });
      } else {
        groupMap.set(group.id, {
          id: group.id,
          name: pickMenuName(group.nameLang, group.name, lang) || 'Unknown',
          nameLang: group.nameLang,
          icon: (group.icon as IconName) || '',
          subMenuCount: group.links ? group.links.length : 0,
          subMenus: group.links
            ? group.links.map((link) => ({
                id: link.id,
              name: pickMenuName(link.nameLang, link.name, lang),
                path: link.href,
                menuGroupId: group.id,
                priority: link.priority,
                active: link.active,
                persona: link.persona,
                icon: link.icon,
              nameLang: link.nameLang,
              }))
            : [],
          priority: group.priority,
          active: group.active,
          persona: group.persona || personaSignal.value,
        });
      }
    });

    return Array.from(groupMap.values()).sort((a, b) => (a.priority || 0) - (b.priority || 0));
  }, [menuGroupsWithLinks, lang]);

  const effectiveSelectedMenu = useMemo(() => {
    if (!selectedMenu && menus.length > 0) {
      return menus[0];
    }
    if (selectedMenu) {
      const found = menus.find((m) => m.id === selectedMenu.id);
      if (found) return found;
      if (selectedMenu.id === 'ROOT_GROUP') {
        const root = menus.find((m) => m.id === 'ROOT_GROUP');
        if (root) return root;
      }
    }
    return selectedMenu;
  }, [menus, selectedMenu]);

  const handleAddGroup = useCallback(() => {
    setScreenRoute('create', undefined, { mode: undefined, parent: undefined });
  }, []);

  const handleAddLink = useCallback((parentId: string) => {
    setScreenRoute('create', undefined, { mode: 'link', parent: parentId });
  }, []);

  const handleEditGroup = useCallback(
    (menuId: string) => {
      if (menuId === 'ROOT_GROUP') return;
      const menu = menus.find((m) => m.id === menuId);
      if (menu?.link) {
        setScreenRoute('edit', menu.link.id, { mode: undefined, parent: undefined });
      } else {
        setScreenRoute('edit', menuId, { mode: undefined, parent: undefined });
      }
    },
    [menus],
  );

  const handleEditLink = useCallback((subMenuId: string, currentMenu: MenuItem) => {
    if (currentMenu.subMenus.some((subMenu) => subMenu.id === subMenuId)) {
      setScreenRoute('edit', subMenuId, { mode: undefined, parent: undefined });
    }
  }, []);

  const handleCloseDrawer = useCallback(() => {
    setScreenRoute(undefined, undefined, { mode: undefined, parent: undefined });
  }, []);

  const routeMenu = menus.find((menu) => menu.id === routeId);
  const routeLinkOwner = menus.find((menu) =>
    menu.subMenus.some((item) => item.id === routeId),
  );
  const routeLink = routeLinkOwner?.subMenus.find((item) => item.id === routeId);
  const isCreatingLink = routeAction === 'create' && searchParams.get('mode') === 'link';
  const drawerMode: MenuDrawerMode =
    routeAction === 'create'
      ? isCreatingLink ? 'create-link' : 'create-group'
      : routeLink || routeMenu?.link
        ? 'edit-link'
        : 'edit-group';
  const drawerData = routeAction === 'create'
    ? undefined
    : routeLink || routeMenu?.link || routeMenu;
  const drawerParentId = isCreatingLink
    ? searchParams.get('parent') || ''
    : routeLink?.menuGroupId || routeMenu?.link?.menuGroupId || '';
  const isDrawerOpen =
    routeAction === 'create' ||
    ((routeAction === 'edit' || routeAction === 'view') && Boolean(drawerData));

  const addMenuButtonProps = useMemo(
    () => ({
      name: 'Plus' as IconName,
      size: 20,
      onClick: handleAddGroup,
      className: 'text-primary cursor-pointer hover:opacity-80 transition-opacity',
    }),
    [handleAddGroup],
  );

  // const addSubMenuButtonProps = useMemo(
  //   () => ({
  //     name: 'Plus' as IconName,
  //     action: 'primary' as const,
  //     size: 20,
  //     onClick: () => {
  //       if (effectiveSelectedMenu) {
  //         handleAddLink(effectiveSelectedMenu.id === 'ROOT_GROUP' ? 'ROOT' : effectiveSelectedMenu.id);
  //       }
  //     },
  //     className: 'text-primary cursor-pointer hover:opacity-80 transition-opacity',
  //   }),
  //   [effectiveSelectedMenu, handleAddLink],
  // );

  const filteredSubMenus = useMemo(() => {
    if (!effectiveSelectedMenu) return [];
    if (subMenuStatusFilter === 'active') {
      return effectiveSelectedMenu.subMenus.filter((s) => s.active !== false);
    }
    if (subMenuStatusFilter === 'inactive') {
      return effectiveSelectedMenu.subMenus.filter((s) => s.active === false);
    }
    return effectiveSelectedMenu.subMenus;
  }, [effectiveSelectedMenu, subMenuStatusFilter]);

  // const subMenuStatusFilterProps = useMemo(
  //   () => ({
  //     name: 'subMenuStatus',
  //     value: subMenuStatusFilter,
  //     onChange: (val: string) => setSubMenuStatusFilter((val || 'all') as SubMenuStatusFilter),
  //     options: [
  //       { label: t('all'), value: 'all', key: 'all' },
  //       { label: t('active'), value: 'active', key: 'active' },
  //       { label: t('inactive'), value: 'inactive', key: 'inactive' },
  //     ],
  //     className: 'w-28 sm:w-32 [&_select]:select-sm [&_select]:text-xs',
  //   }),
  //   [subMenuStatusFilter, t]
  // );

  return {
    menus,
    selectedMenu: effectiveSelectedMenu,
    filteredSubMenus,
    subMenuStatusFilter,
    setSubMenuStatusFilter,
    // subMenuStatusFilterProps,
    setSelectedMenu,
    isDrawerOpen,
    drawerMode,
    drawerData,
    drawerParentId,
    addMenuButtonProps,
    // addSubMenuButtonProps,
    handleAddGroup,
    handleAddLink,
    handleEditGroup,
    handleEditLink,
    handleCloseDrawer,
    canCreate,
    canUpdate,
    isLoading,
  };
}

export type { MenuItem, SubMenuItem };
