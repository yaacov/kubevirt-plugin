import * as React from 'react';

import { produceVMDisks } from '@catalog/utils/WizardVMContext';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import ConfirmActionMessage from '@kubevirt-utils/components/ConfirmActionMessage/ConfirmActionMessage';
import EditDiskModal from '@kubevirt-utils/components/DiskModal/EditDiskModal';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getContentScrollableElement } from '@kubevirt-utils/utils/utils';
import {
  ButtonVariant,
  Dropdown,
  DropdownItem,
  DropdownPosition,
  KebabToggle,
} from '@patternfly/react-core';

import { useEditDiskStates } from '../hooks/useEditDiskState';

type DiskRowActionsProps = {
  diskName: string;
  vm: V1VirtualMachine;
  onUpdate: (updatedVM: V1VirtualMachine) => Promise<void>;
  isDisabled?: boolean;
};

const DiskRowActions: React.FC<DiskRowActionsProps> = ({ diskName, vm, onUpdate, isDisabled }) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const deleteBtnText = t('Detach');

  const { initialDiskState, initialDiskSourceState } = useEditDiskStates(vm, diskName);

  const onDelete = React.useCallback(() => {
    const vmWithDeletedDisk = produceVMDisks(vm, (draftVM) => {
      const volumeToDelete = draftVM.spec.template.spec.volumes.find(
        (volume) => volume.name === diskName,
      );

      if (volumeToDelete?.dataVolume?.name) {
        draftVM.spec.dataVolumeTemplates = draftVM.spec.dataVolumeTemplates.filter(
          (dataVolume) => dataVolume.metadata.name !== volumeToDelete.dataVolume.name,
        );
      }

      draftVM.spec.template.spec.volumes = draftVM.spec.template.spec.volumes.filter(
        (volume) => volume.name !== diskName,
      );
      draftVM.spec.template.spec.domain.devices.disks =
        draftVM.spec.template.spec.domain.devices.disks.filter((disk) => disk.name !== diskName);
    });

    return onUpdate(vmWithDeletedDisk);
  }, [diskName, onUpdate, vm]);

  const onDeleteModalToggle = () => {
    createModal(({ isOpen, onClose }) => (
      <TabModal<V1VirtualMachine>
        onClose={onClose}
        isOpen={isOpen}
        obj={vm}
        onSubmit={onDelete}
        headerText={t('Detach disk?')}
        submitBtnText={deleteBtnText}
        submitBtnVariant={ButtonVariant.danger}
      >
        <ConfirmActionMessage
          obj={{ metadata: { name: diskName, namespace: vm?.metadata?.namespace } }}
          action="detach"
        />
      </TabModal>
    ));
  };

  const onEditModalToggle = () => {
    createModal(({ isOpen, onClose }) => (
      <EditDiskModal
        vm={vm}
        isOpen={isOpen}
        onClose={onClose}
        headerText={t('Edit disk')}
        onSubmit={onUpdate}
        initialDiskState={initialDiskState}
        initialDiskSourceState={initialDiskSourceState}
        createOwnerReference={false}
      />
    ));
  };

  return (
    <Dropdown
      menuAppendTo={getContentScrollableElement}
      onSelect={() => setIsDropdownOpen(false)}
      toggle={
        <KebabToggle onToggle={setIsDropdownOpen} id="toggle-id-disk" isDisabled={isDisabled} />
      }
      isOpen={isDropdownOpen}
      isPlain
      dropdownItems={[
        <DropdownItem onClick={onEditModalToggle} key="disk-edit">
          {t('Edit')}
        </DropdownItem>,
        <DropdownItem onClick={onDeleteModalToggle} key="disk-delete">
          {deleteBtnText}
        </DropdownItem>,
      ]}
      position={DropdownPosition.right}
    />
  );
};

export default DiskRowActions;
