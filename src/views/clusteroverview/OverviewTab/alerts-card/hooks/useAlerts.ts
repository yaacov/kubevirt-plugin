import React from 'react';

import { SimplifiedAlerts } from '@kubevirt-utils/components/AlertsCard/utils/types';
import { createAlertKey } from '@kubevirt-utils/components/AlertsCard/utils/utils';
import useKubevirtAlerts from '@kubevirt-utils/hooks/useKubevirtAlerts';
import { Alert } from '@openshift-console/dynamic-plugin-sdk-internal/lib/api/common-types';
import { labelsToParams } from '@virtualmachines/details/tabs/overview/utils/utils';

import { AlertResource } from '../../status-card/utils/utils';

const getAlertURL = (alert: Alert) =>
  `${AlertResource.plural}/${alert?.rule?.id}?${labelsToParams(alert.labels)}`;

const useAlerts = (): SimplifiedAlerts => {
  const [alerts] = useKubevirtAlerts();

  return React.useMemo(() => {
    const data = { critical: [], warning: [], info: [] };
    return (
      alerts.reduce((acc, alert) => {
        acc[alert?.labels?.severity] = [
          ...(acc?.[alert?.labels?.severity] || []),
          {
            time: alert?.activeAt,
            alertName: alert?.labels?.alertname,
            description: alert?.annotations?.description || alert?.annotations?.summary,
            link: getAlertURL(alert),
            key: createAlertKey(alert?.activeAt, alert?.labels),
            isVMAlert: alert?.labels?.name || alert?.labels?.vmName,
          },
        ];
        return acc;
      }, data) || data
    );
  }, [alerts]);
};

export default useAlerts;
