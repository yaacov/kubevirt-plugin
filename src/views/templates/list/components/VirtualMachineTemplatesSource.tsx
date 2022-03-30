import * as React from 'react';

import { V1Template } from '@kubevirt-utils/models';
import { useVmTemplateSource } from '@kubevirt-utils/resources/template/hooks';
import { CheckIcon } from '@patternfly/react-icons';

type VirtualMachineTemplatesSourceProps = {
  template: V1Template;
};

// Component for VM Template's Boot source availability column
const VirtualMachineTemplatesSource: React.FC<VirtualMachineTemplatesSourceProps> = ({
  template,
}) => {
  const { isBootSourceAvailable, loaded } = useVmTemplateSource(template);

  return loaded && isBootSourceAvailable && <CheckIcon />;
};

export default VirtualMachineTemplatesSource;