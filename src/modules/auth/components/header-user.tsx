import { useSignals } from "@preact/signals-react/runtime";
import { UserMenu, type UserMenuItem, authUserSignal, endSession as endSharedSession } from 'shared-lib-web';


const userMenuItems: UserMenuItem[] = [
  { id: "settings", labelKey: "nav.settings", icon: "Settings", path: "/app-settings" },
];

/** "asha@example.com" -> "asha". */
function readNameFromEmail(email: string): string {
  const emailParts = email.split("@");
  return emailParts[0] ?? email;
}

export interface HeaderUserProps {
  /** Sidebar look (full-width row with name and email). */
  isInSidebar?: boolean;
}

export function endSession(): void {
  endSharedSession();
}

export function HeaderUser(props: HeaderUserProps) {
  useSignals();
  const user = authUserSignal.value;
  const email = user?.email || "";
  const name = user?.name || readNameFromEmail(email);

  return (
    <UserMenu
      name={name}
      email={email}
      avatarUrl="/avatar.svg"
      items={userMenuItems}
      onLogout={endSession}
      isInSidebar={props.isInSidebar}
    />
  );
}
