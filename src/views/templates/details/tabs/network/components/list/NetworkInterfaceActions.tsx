import * as React from 'react';
import produce from 'immer';

import { TemplateModel, V1Template } from '@kubevirt-ui/kubevirt-api/console';
import ConfirmActionMessage from '@kubevirt-utils/components/ConfirmActionMessage/ConfirmActionMessage';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getTemplateVirtualMachineObject } from '@kubevirt-utils/resources/template';
import { NetworkPresentation } from '@kubevirt-utils/resources/vm/utils/network/constants';
import { getContentScrollableElement } from '@kubevirt-utils/utils/utils';
import { k8sUpdate } from '@openshift-console/dynamic-plugin-sdk';
import {
  ButtonVariant,
  Dropdown,
  DropdownItem,
  DropdownPosition,
  KebabToggle,
} from '@patternfly/react-core';

import useEditTemplateAccessReview from '../../../../hooks/useIsTemplateEditable';
import EditNetworkInterfaceModal from '../modal/EditNetworkInterfaceModal';

type NetworkInterfaceActionsProps = {
  nicName: string;
  nicPresentation: NetworkPresentation;
  template: V1Template;
};

const NetworkInterfaceActions: React.FC<NetworkInterfaceActionsProps> = ({
  nicName,
  nicPresentation,
  template,
}) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();
  const { isTemplateEditable } = useEditTemplateAccessReview(template);

  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const label = t('Delete NIC?');
  const editBtnText = t('Edit');
  const submitBtnText = t('Delete');

  const onEditModalOpen = () => {
    createModal(({ isOpen, onClose }) => (
      <EditNetworkInterfaceModal
        template={template}
        isOpen={isOpen}
        onClose={onClose}
        nicPresentation={nicPresentation}
      />
    ));

    setIsDropdownOpen(false);
  };

  const onDelete = React.useCallback(async () => {
    const updatedTemplate = produce(template, (draftTemplate) => {
      const vm = getTemplateVirtualMachineObject(draftTemplate);
      vm.spec.template.spec.networks = vm.spec.template.spec.networks.filter(
        ({ name }) => name !== nicName,
      );
      vm.spec.template.spec.domain.devices.interfaces =
        vm.spec.template.spec.domain.devices.interfaces.filter(({ name }) => name !== nicName);
    });

    return await k8sUpdate({
      model: TemplateModel,
      data: updatedTemplate,
      ns: updatedTemplate?.metadata?.namespace,
      name: updatedTemplate?.metadata?.name,
    });
  }, [nicName, template]);

  const onDeleteModalToggle = () => {
    createModal(({ isOpen, onClose }) => (
      <TabModal<V1Template>
        isOpen={isOpen}
        onClose={onClose}
        obj={template}
        onSubmit={onDelete}
        headerText={label}
        submitBtnText={submitBtnText}
        submitBtnVariant={ButtonVariant.danger}
      >
        <ConfirmActionMessage
          obj={{ metadata: { name: nicName, namespace: template?.metadata?.namespace } }}
        />
      </TabModal>
    ));
    setIsDropdownOpen(false);
  };

  const items = [
    <DropdownItem onClick={onEditModalOpen} key="network-interface-edit">
      {editBtnText}
    </DropdownItem>,
    <DropdownItem onClick={onDeleteModalToggle} key="network-interface-delete">
      {submitBtnText}
    </DropdownItem>,
  ];

  return (
    <Dropdown
      menuAppendTo={getContentScrollableElement}
      onSelect={() => setIsDropdownOpen(false)}
      toggle={
        <KebabToggle
          onToggle={setIsDropdownOpen}
          id="toggle-id-6"
          isDisabled={!isTemplateEditable}
        />
      }
      isOpen={isDropdownOpen}
      isPlain
      dropdownItems={items}
      position={DropdownPosition.right}
    />
  );
};

export default NetworkInterfaceActions;
