import * as React from 'react';
import { useHistory, useParams } from 'react-router-dom';

import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { getAnnotation } from '@kubevirt-utils/resources/shared';
import { ANNOTATIONS } from '@kubevirt-utils/resources/template';
import { getTemplateVirtualMachineObject } from '@kubevirt-utils/resources/template/utils/selectors';

import { useWizardVMContext } from '../../../utils/WizardVMContext';
import { processTemplate } from '../../utils';

type useCustomizeFormSubmitType = [
  onSubmit: (event: any) => Promise<void>,
  loaded: boolean,
  error: any,
];

export const useCustomizeFormSubmit = (template: V1Template): useCustomizeFormSubmitType => {
  const { ns } = useParams<{ ns: string }>();
  const history = useHistory();
  const [templateLoaded, setTemplateLoaded] = React.useState(true);
  const [templateError, setTemplateError] = React.useState<any>();

  const { updateVM, loaded: vmLoaded, error: vmError } = useWizardVMContext();

  const onSubmit = async (event) => {
    event.preventDefault();
    setTemplateLoaded(false);
    try {
      const formData = new FormData(event.currentTarget as HTMLFormElement);

      const processedTemplate = await processTemplate(template, ns, formData);

      const vm = getTemplateVirtualMachineObject(processedTemplate);

      const displayName = getAnnotation(template, ANNOTATIONS.displayName);

      if (displayName) {
        vm.metadata.annotations[ANNOTATIONS.displayName] = displayName;
      }

      await updateVM(vm);
      history.push(
        `/k8s/ns/${ns || 'default'}/templatescatalog/review?name=${
          template.metadata.name
        }&namespace=${template.metadata.namespace}`,
      );
    } catch (error) {
      console.error(error);
      setTemplateError(error);
    } finally {
      setTemplateLoaded(true);
    }
  };

  return [onSubmit, templateLoaded && vmLoaded, templateError || vmError];
};