import React, { FC, useMemo } from 'react';
import { useParams } from 'react-router-dom';

import {
  modelToGroupVersionKind,
  TemplateModel,
  V1Template,
} from '@kubevirt-ui/kubevirt-api/console';
import { useURLParams } from '@kubevirt-utils/hooks/useURLParams';
import useVMTemplateGeneratedParams from '@kubevirt-utils/resources/template/hooks/useVMTemplateGeneratedParams';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

import { CustomizeError } from './components/CustomizeError';
import { CustomizeForm } from './components/CustomizeForms/CustomizeForm';
import CustomizeFormWithStorage from './components/CustomizeForms/CustomizeFormWithStorage';
import { CustomizeVirtualMachineHeader } from './components/CustomizeVirtualMachineHeader';
import { CustomizeVirtualMachineSkeleton } from './components/CustomizeVirtualMachineSkeleton';
import { RightHeader } from './components/RightHeading';
import { hasCustomizableSource } from './utils';

import './CustomizeVirtualMachine.scss';

const CustomizeVirtualMachine: FC = () => {
  const { ns } = useParams<{ ns: string }>();
  const { params } = useURLParams();
  const name = params.get('name');
  const templateNamespace = params.get('namespace');
  const isBootSourceAvailable = params.get('defaultSourceExists') === 'true';

  const [template, loaded, error] = useK8sWatchResource<V1Template>({
    groupVersionKind: modelToGroupVersionKind(TemplateModel),
    isList: false,
    namespaced: true,
    name,
    namespace: templateNamespace,
  });

  const [templateWithGeneratedValues, processError] = useVMTemplateGeneratedParams(
    loaded ? template : null,
  );

  const Form = useMemo(() => {
    const withDiskSource = hasCustomizableSource(template);

    if (withDiskSource) {
      return CustomizeFormWithStorage;
    } else {
      return CustomizeForm;
    }
  }, [template]);

  if (error || processError) return <CustomizeError />;

  if (!loaded || !templateWithGeneratedValues) return <CustomizeVirtualMachineSkeleton />;

  return (
    <>
      <CustomizeVirtualMachineHeader namespace={ns} />

      <div className="co-m-pane__body co-m-pane__body--no-top-margin customize-vm">
        <div className="row">
          <div className="col-md-7 col-md-push-5 co-catalog-item-info">
            <RightHeader template={templateWithGeneratedValues} />
          </div>
          <div className="col-md-5 col-md-pull-7">
            {template && (
              <Form
                template={templateWithGeneratedValues}
                isBootSourceAvailable={isBootSourceAvailable}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default CustomizeVirtualMachine;
