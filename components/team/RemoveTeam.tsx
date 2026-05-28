import { Card } from '@/components/shared';
import { Team } from '@prisma/client';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { Button } from 'react-daisyui';
import toast from 'react-hot-toast';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

import ConfirmationDialog from '../shared/ConfirmationDialog';
import { defaultHeaders } from '@/lib/common';
import type { ApiResponse } from 'types';

interface RemoveTeamProps {
  team: Team;
  allowDelete: boolean;
}

const RemoveTeam = ({ team, allowDelete }: RemoveTeamProps) => {
  const router = useRouter();
  const { t } = useTranslation('common');
  const [loading, setLoading] = useState(false);
  const [askConfirmation, setAskConfirmation] = useState(false);

  const removeTeam = async () => {
    setLoading(true);

    const response = await fetch(`/api/teams/${team.slug}`, {
      method: 'DELETE',
      headers: defaultHeaders,
    });

    setLoading(false);

    if (!response.ok) {
      const json = (await response.json()) as ApiResponse;
      toast.error(json.error.message);
      return;
    }

    toast.success(t('team-removed-successfully'));
    router.push('/teams');
  };

  return (
    <>
      <div className="border border-red-500/25 dark:border-red-500/15 rounded-3xl overflow-hidden shadow-sm shadow-red-500/[0.01] bg-red-50/10 dark:bg-red-950/[0.02]">
        <Card>
          <Card.Body>
            <Card.Header>
              <Card.Title>
                <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                  <ExclamationTriangleIcon className="h-5 w-5 stroke-[2] shrink-0" />
                  <span>{t('remove-team')}</span>
                </div>
              </Card.Title>
              <Card.Description>
                <span className="text-gray-600 dark:text-gray-400">
                  {allowDelete
                    ? t('remove-team-warning')
                    : t('remove-team-restricted')}
                </span>
              </Card.Description>
            </Card.Header>
          </Card.Body>
          {allowDelete && (
            <Card.Footer>
              <Button
                onClick={() => setAskConfirmation(true)}
                loading={loading}
                size="md"
                className="px-5 py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl border-none shadow-md shadow-red-500/10 hover:shadow-lg hover:shadow-red-500/20 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              >
                {t('remove-team')}
              </Button>
            </Card.Footer>
          )}
        </Card>
      </div>
      {allowDelete && (
        <ConfirmationDialog
          visible={askConfirmation}
          title={t('remove-team')}
          onCancel={() => setAskConfirmation(false)}
          onConfirm={removeTeam}
        >
          {t('remove-team-confirmation')}
        </ConfirmationDialog>
      )}
    </>
  );
};

export default RemoveTeam;

