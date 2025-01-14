import React from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { SimplifiedAlerts } from '@kubevirt-utils/components/AlertsCard/utils/types';
import { createAlertKey } from '@kubevirt-utils/components/AlertsCard/utils/utils';
import { KUBEVIRT } from '@kubevirt-utils/constants/constants';
import {
  PrometheusEndpoint,
  RuleStates,
  usePrometheusPoll,
} from '@openshift-console/dynamic-plugin-sdk';

import {
  generateAlertId,
  labelsToParams,
  MONITORING_URL_BASE,
  PrometheusRulesResponse,
} from '../utils';

type UseVMAlerts = (vm: V1VirtualMachine) => SimplifiedAlerts;

const useVMAlerts: UseVMAlerts = (vm: V1VirtualMachine) => {
  const [query] = usePrometheusPoll({
    endpoint: PrometheusEndpoint?.RULES,
  });

  const vmAlerts = React.useMemo(() => {
    const data = { critical: [], warning: [], info: [] };
    const vmName = vm?.metadata?.name;
    return (
      (query as PrometheusRulesResponse)?.data?.groups?.reduce((acc, ruleGroup) => {
        ruleGroup?.rules?.forEach((rule) => {
          if (
            rule?.state === RuleStates.Firing &&
            rule?.labels?.kubernetes_operator_part_of === KUBEVIRT
          ) {
            rule?.alerts?.forEach((alert) => {
              const alertPodName = alert?.labels?.pod;
              const metricName = alert?.labels?.name;
              // NOTE: in 4.11 the alerts are missing a vmName label,
              // in 4.12 we will replace the following check with alertLabelVMName === vmName
              if (
                alertPodName?.includes(vmName) ||
                (metricName && vmName && metricName === vmName)
              ) {
                acc[alert?.labels?.severity] = [
                  ...(acc?.[alert?.labels?.severity] || []),
                  {
                    time: alert?.activeAt,
                    alertName: alert?.labels?.alertname,
                    description: alert?.annotations?.summary,
                    link: `${MONITORING_URL_BASE}/${generateAlertId(
                      ruleGroup,
                      rule,
                    )}?${labelsToParams(alert?.labels)}`,
                    key: createAlertKey(alert?.activeAt, alert?.labels),
                    isVMAlert: true,
                  },
                ];
              }
            });
          }
        });

        return acc;
      }, data) || data
    );
  }, [query, vm]);

  return vmAlerts;
};

export default useVMAlerts;
