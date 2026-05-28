import {
  Cog6ToothIcon,
  DocumentMagnifyingGlassIcon,
  KeyIcon,
  PaperAirplaneIcon,
  ShieldExclamationIcon,
  UserPlusIcon,
  BanknotesIcon,
} from '@heroicons/react/24/outline';
import type { Team } from '@prisma/client';
import classNames from 'classnames';
import useCanAccess from 'hooks/useCanAccess';
import Link from 'next/link';
import { TeamFeature } from 'types';

interface TeamTabProps {
  activeTab: string;
  team: Team;
  heading?: string;
  teamFeatures: TeamFeature;
}

const TeamTab = ({ activeTab, team, heading, teamFeatures }: TeamTabProps) => {
  const { canAccess } = useCanAccess();

  const navigations = [
    {
      name: 'Settings',
      href: `/teams/${team.slug}/settings`,
      active: activeTab === 'settings',
      icon: Cog6ToothIcon,
    },
  ];

  if (canAccess('team_member', ['create', 'update', 'read', 'delete'])) {
    navigations.push({
      name: 'Members',
      href: `/teams/${team.slug}/members`,
      active: activeTab === 'members',
      icon: UserPlusIcon,
    });
  }

  if (
    teamFeatures.sso &&
    canAccess('team_sso', ['create', 'update', 'read', 'delete'])
  ) {
    navigations.push({
      name: 'Single Sign-On',
      href: `/teams/${team.slug}/sso`,
      active: activeTab === 'sso',
      icon: ShieldExclamationIcon,
    });
  }

  if (
    teamFeatures.dsync &&
    canAccess('team_dsync', ['create', 'update', 'read', 'delete'])
  ) {
    navigations.push({
      name: 'Directory Sync',
      href: `/teams/${team.slug}/directory-sync`,
      active: activeTab === 'directory-sync',
      icon: UserPlusIcon,
    });
  }

  if (
    teamFeatures.auditLog &&
    canAccess('team_audit_log', ['create', 'update', 'read', 'delete'])
  ) {
    navigations.push({
      name: 'Audit Logs',
      href: `/teams/${team.slug}/audit-logs`,
      active: activeTab === 'audit-logs',
      icon: DocumentMagnifyingGlassIcon,
    });
  }

  if (
    teamFeatures.payments &&
    canAccess('team_payments', ['create', 'update', 'read', 'delete'])
  ) {
    navigations.push({
      name: 'Billing',
      href: `/teams/${team.slug}/billing`,
      active: activeTab === 'payments',
      icon: BanknotesIcon,
    });
  }

  if (
    teamFeatures.webhook &&
    canAccess('team_webhook', ['create', 'update', 'read', 'delete'])
  ) {
    navigations.push({
      name: 'Webhooks',
      href: `/teams/${team.slug}/webhooks`,
      active: activeTab === 'webhooks',
      icon: PaperAirplaneIcon,
    });
  }

  if (
    teamFeatures.apiKey &&
    canAccess('team_api_key', ['create', 'update', 'read', 'delete'])
  ) {
    navigations.push({
      name: 'API Keys',
      href: `/teams/${team.slug}/api-keys`,
      active: activeTab === 'api-keys',
      icon: KeyIcon,
    });
  }

  return (
    <div className="flex flex-col pb-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white bg-gradient-to-r from-gray-950 to-gray-700 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
            {heading ? heading : team.name}
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Manage your workspace preferences, members, integration tools and security settings.
          </p>
        </div>
      </div>

      <nav
        className="flex flex-wrap gap-2 p-1.5 bg-gray-50/80 dark:bg-zinc-900/60 backdrop-blur-md rounded-2xl border border-gray-200/80 dark:border-zinc-800/80"
        aria-label="Tabs"
      >
        {navigations.map((menu) => {
          const Icon = menu.icon;
          return (
            <Link
              href={menu.href}
              key={menu.href}
              className={classNames(
                'inline-flex items-center px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-300 gap-2 group',
                menu.active
                  ? 'bg-orange-500/10 text-orange-600 border border-orange-500/20 dark:bg-orange-500/15 dark:text-orange-400 dark:border-orange-500/30 shadow-sm shadow-orange-500/5'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-200/50 dark:hover:bg-zinc-800/50 border border-transparent'
              )}
            >
              <Icon
                className={classNames(
                  'h-4 w-4 transition-transform duration-300 group-hover:scale-110',
                  menu.active
                    ? 'text-orange-500 dark:text-orange-400 stroke-[2]'
                    : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-200 stroke-[1.5]'
                )}
              />
              <span>{menu.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default TeamTab;

