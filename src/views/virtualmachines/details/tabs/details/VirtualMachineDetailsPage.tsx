import * as React from 'react';
import { RouteComponentProps } from 'react-router';

import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import SidebarEditor from '@kubevirt-utils/components/SidebarEditor/SidebarEditor';
import { k8sUpdate } from '@openshift-console/dynamic-plugin-sdk';
import { Divider, PageSection } from '@patternfly/react-core';

import DetailsSection from './components/sections/DetailsSection';
import ServicesSection from './components/sections/ServicesSection';
import ActiveUserListSection from './components/sections/UserList/ActiveUserListSection';

type VirtualMachineDetailsPageProps = RouteComponentProps<{
  ns: string;
  name: string;
}> & {
  obj?: V1VirtualMachine;
};

const VirtualMachineDetailsPage: React.FC<VirtualMachineDetailsPageProps> = ({ obj: vm }) => {
  const onChangeResource = React.useCallback(
    (updatedVM: V1VirtualMachine) =>
      k8sUpdate({
        model: VirtualMachineModel,
        data: updatedVM,
        ns: updatedVM?.metadata?.namespace,
        name: updatedVM?.metadata?.name,
      }),
    [],
  );

  return (
    <div>
      <PageSection>
        <SidebarEditor resource={vm} onResourceUpdate={onChangeResource}>
          {(resource) => <DetailsSection vm={resource} pathname={location?.pathname} />}
        </SidebarEditor>
      </PageSection>
      <Divider />
      <PageSection>
        <ServicesSection vm={vm} pathname={location?.pathname} />
      </PageSection>
      <Divider />
      <PageSection>
        <ActiveUserListSection vm={vm} pathname={location?.pathname} />
      </PageSection>
    </div>
  );
};

export default VirtualMachineDetailsPage;
